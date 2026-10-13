import logging
from decimal import Decimal, InvalidOperation

from django.conf import settings
from django.core.mail import send_mail
from django.db import transaction
from django.utils import timezone

from apps.bookings.models import Booking
from apps.bookings.services import expire_booking_holds
from apps.notifications.services import create_booking_confirmed_notifications

from .chapa import ChapaError, verify_transaction
from .models import Payment

logger = logging.getLogger(__name__)


def send_booking_confirmation(booking, payment):
    if not booking.guest.email:
        logger.warning(
            "Unable to send confirmation for booking %s: guest has no email address",
            booking.booking_reference,
        )
        return False

    recipients = [booking.guest.email]
    if settings.HOTEL_NOTIFICATION_EMAIL:
        recipients.append(settings.HOTEL_NOTIFICATION_EMAIL)

    subject = f"Hotel Booking Confirmation - {booking.booking_reference}"
    check_in = (
        f"{booking.check_in_date.strftime('%B')} "
        f"{booking.check_in_date.day}, {booking.check_in_date.year}"
    )
    check_out = (
        f"{booking.check_out_date.strftime('%B')} "
        f"{booking.check_out_date.day}, {booking.check_out_date.year}"
    )
    body = "\n".join((
        "The Grandview Hotel & Suites",
        "",
        "Your Booking Is Confirmed!",
        "",
        f"Dear {booking.guest.full_name},",
        "Thank you for choosing our hotel. Your reservation has been confirmed successfully.",
        "",
        "Booking details",
        f"Booking reference: {booking.booking_reference}",
        f"Room: {booking.room.room_type.name}",
        f"Check-in: {check_in}",
        f"Check-out: {check_out}",
        f"Guests: {booking.number_of_guests}",
        f"Nights: {booking.nights}",
        f"Total amount: ETB {booking.total_amount}",
        "Payment status: Paid",
        f"Payment method: {payment.get_payment_method_display()}",
        f"Transaction reference: {payment.transaction_reference or 'Not provided'}",
        f"Provider reference: {payment.provider_reference or 'Not provided'}",
        "Please keep your booking reference for check-in at the hotel.",
        "We look forward to welcoming you!",
        "",
        "Hotel Management Team",
        f"Hotel contact: {settings.DEFAULT_FROM_EMAIL} | {settings.HOTEL_CONTACT_PHONE}",
    ))
    try:
        sent_count = send_mail(
            subject,
            body,
            settings.DEFAULT_FROM_EMAIL,
            recipients,
            fail_silently=False,
        )
    except Exception:
        logger.exception("Unable to send confirmation for booking %s", booking.booking_reference)
        return False
    if not sent_count:
        logger.error("Email backend did not send confirmation for booking %s", booking.booking_reference)
        return False
    return True


def _record_verified_payment(payment_id, provider_reference=None, verified_by=None):
    confirmed_booking = None
    confirmed_payment = None
    now = timezone.now()

    with transaction.atomic():
        payment = Payment.objects.select_for_update().select_related("booking").get(pk=payment_id)
        booking = Booking.objects.select_for_update().select_related(
            "guest", "room__room_type"
        ).get(pk=payment.booking_id)

        if payment.status == Payment.Status.COMPLETED:
            return payment, booking

        if payment.status != Payment.Status.PENDING:
            raise ChapaError("This payment is no longer pending.")

        expire_booking_holds(now)
        booking.refresh_from_db()
        payment.status = Payment.Status.COMPLETED
        payment.provider_reference = provider_reference or payment.provider_reference
        payment.verified_by = verified_by
        payment.verified_at = now
        payment.save(update_fields=("status", "provider_reference", "verified_by", "verified_at"))

        if (
            booking.booking_status == Booking.BookingStatus.HOLD
            and booking.hold_expires_at
            and booking.hold_expires_at > now
            and booking.is_fully_paid
        ):
            booking.booking_status = Booking.BookingStatus.CONFIRMED
            booking.hold_expires_at = None
            booking.save(update_fields=("booking_status", "hold_expires_at"))
            create_booking_confirmed_notifications(booking)
            confirmed_booking = booking
            confirmed_payment = payment

    if confirmed_booking:
        transaction.on_commit(
            lambda: send_booking_confirmation(confirmed_booking, confirmed_payment)
        )
    return payment, booking


def _record_failed_payment(payment_id):
    return Payment.objects.filter(
        pk=payment_id,
        status=Payment.Status.PENDING,
    ).update(status=Payment.Status.FAILED)


def verify_chapa_payment(payment):
    response = verify_transaction(payment.transaction_reference)
    data = response.get("data")
    if not isinstance(data, dict):
        raise ChapaError("Chapa returned an invalid verification response.")

    transaction_status = str(data.get("status", "")).lower()
    if transaction_status in {"failed", "cancelled", "canceled"}:
        _record_failed_payment(payment.pk)
        return Payment.objects.get(pk=payment.pk), False
    if transaction_status != "success":
        return Payment.objects.get(pk=payment.pk), False

    if data.get("tx_ref") != payment.transaction_reference:
        raise ChapaError("Chapa transaction reference did not match.")
    if str(data.get("currency", "")).upper() != "ETB":
        raise ChapaError("Chapa payment currency did not match the booking currency.")
    try:
        amount = Decimal(str(data.get("amount")))
    except (InvalidOperation, TypeError):
        raise ChapaError("Chapa returned an invalid payment amount.") from None
    if amount != payment.amount:
        raise ChapaError("Chapa payment amount did not match the booking amount.")

    settled_payment, booking = _record_verified_payment(
        payment.pk,
        provider_reference=data.get("ref_id") or data.get("reference"),
    )
    return settled_payment, booking.booking_status == Booking.BookingStatus.CONFIRMED


def verify_manual_payment(payment, user):
    settled_payment, booking = _record_verified_payment(payment.pk, verified_by=user)
    return settled_payment, booking