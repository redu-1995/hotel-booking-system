import hashlib
import hmac
import logging
import secrets
import uuid
from datetime import timedelta
from urllib.parse import urlencode

from django.conf import settings
from django.core.mail import send_mail
from django.db import transaction
from django.urls import reverse
from django.utils import timezone
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.payments.chapa import ChapaError, initialize_transaction
from apps.payments.models import Payment

from .models import Booking, BookingAccessChallenge

logger = logging.getLogger(__name__)

CODE_TTL = timedelta(minutes=10)
CODE_RESEND_COOLDOWN = timedelta(seconds=60)
CODE_REQUEST_WINDOW = timedelta(hours=1)
CODE_REQUEST_LIMIT = 3
CODE_ATTEMPT_LIMIT = 5
ACCESS_TTL = timedelta(minutes=30)
PAYMENT_REQUEST_WINDOW = timedelta(hours=1)
PAYMENT_REQUEST_LIMIT = 3
ACCESS_COOKIE_NAME = "booking_access"

GENERIC_CODE_RESPONSE = {
	"detail": "If those details match a booking, a verification code has been sent to the email on file."
}
INVALID_CODE_RESPONSE = {"detail": "The verification code is invalid or expired."}


def _code_digest(booking_id, code):
	message = f"booking-access:{booking_id}:{code}".encode("utf-8")
	return hmac.new(settings.SECRET_KEY.encode("utf-8"), message, hashlib.sha256).hexdigest()


def _token_digest(token):
	return hashlib.sha256(token.encode("utf-8")).hexdigest()


def _booking_for_contact(booking_reference, email, *, lock=False):
	queryset = Booking.objects.select_related("guest")
	if lock:
		queryset = queryset.select_for_update()
	return queryset.filter(
		booking_reference=booking_reference,
		guest__email__iexact=email,
	).first()


def _send_access_code(booking, code):
	try:
		send_mail(
			subject=f"Your booking access code - {booking.booking_reference}",
			message=(
				f"Your verification code is {code}. It expires in 10 minutes.\n\n"
				f"Booking reference: {booking.booking_reference}\n\n"
				"If you did not request this code, you can ignore this message."
			),
			from_email=settings.DEFAULT_FROM_EMAIL,
			recipient_list=[booking.guest.email],
			fail_silently=False,
		)
	except Exception:
		logger.exception("Unable to send booking access code for booking %s", booking.booking_reference)


def _access_challenge(request, *, lock=False):
	token = request.COOKIES.get(ACCESS_COOKIE_NAME, "").strip()
	if not token:
		return None
	queryset = BookingAccessChallenge.objects.select_related(
		"booking__guest", "booking__room__room_type"
	).filter(
		access_token_digest=_token_digest(token),
		access_expires_at__gt=timezone.now(),
	)
	if lock:
		queryset = queryset.select_for_update()
	return queryset.first()


def _booking_details(booking, now=None):
	now = now or timezone.now()
	latest_payment = booking.payments.order_by("-submitted_at").first()
	pending_payment = booking.payments.filter(
		payment_method=Payment.PaymentMethod.CHAPA,
		status=Payment.Status.PENDING,
	).order_by("-submitted_at").first()
	hold_active = bool(
		booking.booking_status == Booking.BookingStatus.HOLD
		and booking.hold_expires_at
		and booking.hold_expires_at > now
	)
	can_retry = bool(
		hold_active
		and booking.balance_due > 0
		and (pending_payment is None or pending_payment.provider_checkout_url)
	)

	if can_retry:
		retry_message = None
	elif booking.balance_due <= 0:
		retry_message = "This booking is fully paid."
	elif booking.booking_status == Booking.BookingStatus.HOLD and not hold_active:
		retry_message = "This booking hold has expired. Check availability and make a new booking."
	else:
		retry_message = "This booking is no longer eligible for another payment."

	return {
		"booking_reference": booking.booking_reference,
		"booking_status": booking.booking_status,
		"room_name": booking.room.room_type.name,
		"room_number": booking.room.room_number,
		"check_in_date": booking.check_in_date,
		"check_out_date": booking.check_out_date,
		"nights": booking.nights,
		"number_of_guests": booking.number_of_guests,
		"total_amount": booking.total_amount,
		"advance_amount": booking.advance_amount,
		"amount_paid": booking.total_paid,
		"amount_due": booking.balance_due,
		"payment_status": latest_payment.status if latest_payment else None,
		"transaction_reference": latest_payment.transaction_reference if latest_payment else None,
		"hold_expires_at": booking.hold_expires_at,
		"created_at": booking.created_at,
		"can_retry_payment": can_retry,
		"retry_message": retry_message,
	}


class BookingAccessRequestCodeView(APIView):
	permission_classes = (permissions.AllowAny,)

	def post(self, request):
		booking_reference = request.data.get("booking_reference", "")
		email = request.data.get("email", "")
		if not isinstance(booking_reference, str) or not isinstance(email, str):
			return Response(GENERIC_CODE_RESPONSE)
		booking_reference = booking_reference.strip()
		email = email.strip()
		if not booking_reference or not email:
			return Response(GENERIC_CODE_RESPONSE)

		now = timezone.now()
		code = None
		booking = None
		with transaction.atomic():
			booking = _booking_for_contact(booking_reference, email, lock=True)
			if booking is None or not booking.guest.email:
				return Response(GENERIC_CODE_RESPONSE)

			challenge, _ = BookingAccessChallenge.objects.select_for_update().get_or_create(
				booking=booking,
				defaults={"request_window_started_at": now},
			)
			window_expired = (
				challenge.request_window_started_at is None
				or now - challenge.request_window_started_at >= CODE_REQUEST_WINDOW
			)
			if window_expired:
				challenge.request_window_started_at = now
				challenge.requests_in_window = 0
			if challenge.requests_in_window >= CODE_REQUEST_LIMIT:
				challenge.save(update_fields=("request_window_started_at", "updated_at"))
				return Response(GENERIC_CODE_RESPONSE)
			if (
				challenge.last_code_sent_at
				and now - challenge.last_code_sent_at < CODE_RESEND_COOLDOWN
			):
				return Response(GENERIC_CODE_RESPONSE)

			code = f"{secrets.randbelow(1_000_000):06d}"
			challenge.code_digest = _code_digest(booking.pk, code)
			challenge.code_expires_at = now + CODE_TTL
			challenge.code_attempts = 0
			challenge.last_code_sent_at = now
			challenge.requests_in_window += 1
			challenge.access_token_digest = ""
			challenge.access_expires_at = None
			challenge.save()

		_send_access_code(booking, code)
		return Response(GENERIC_CODE_RESPONSE)


class BookingAccessVerifyCodeView(APIView):
	permission_classes = (permissions.AllowAny,)

	def post(self, request):
		booking_reference = request.data.get("booking_reference", "")
		email = request.data.get("email", "")
		code = request.data.get("code", "")
		if not all(isinstance(value, str) for value in (booking_reference, email, code)):
			return Response(INVALID_CODE_RESPONSE, status=status.HTTP_400_BAD_REQUEST)
		booking_reference = booking_reference.strip()
		email = email.strip()
		code = code.strip()
		now = timezone.now()

		with transaction.atomic():
			booking = _booking_for_contact(booking_reference, email, lock=True)
			if booking is None:
				return Response(INVALID_CODE_RESPONSE, status=status.HTTP_400_BAD_REQUEST)
			try:
				challenge = BookingAccessChallenge.objects.select_for_update().get(booking=booking)
			except BookingAccessChallenge.DoesNotExist:
				return Response(INVALID_CODE_RESPONSE, status=status.HTTP_400_BAD_REQUEST)

			if (
				not challenge.code_digest
				or not challenge.code_expires_at
				or challenge.code_expires_at <= now
				or challenge.code_attempts >= CODE_ATTEMPT_LIMIT
			):
				return Response(INVALID_CODE_RESPONSE, status=status.HTTP_400_BAD_REQUEST)

			expected_digest = _code_digest(booking.pk, code)
			if not hmac.compare_digest(challenge.code_digest, expected_digest):
				challenge.code_attempts += 1
				challenge.save(update_fields=("code_attempts", "updated_at"))
				return Response(INVALID_CODE_RESPONSE, status=status.HTTP_400_BAD_REQUEST)

			access_token = secrets.token_urlsafe(32)
			access_expires_at = now + ACCESS_TTL
			challenge.code_digest = ""
			challenge.code_expires_at = None
			challenge.access_token_digest = _token_digest(access_token)
			challenge.access_expires_at = access_expires_at
			challenge.save(update_fields=(
				"code_digest",
				"code_expires_at",
				"access_token_digest",
				"access_expires_at",
				"updated_at",
			))

		response = Response({"expires_at": access_expires_at})
		response.set_cookie(
			ACCESS_COOKIE_NAME,
			access_token,
			max_age=int(ACCESS_TTL.total_seconds()),
			path="/api/booking-access/",
			httponly=True,
			secure=not settings.DEBUG,
			samesite="Lax",
		)
		return response


class BookingAccessDetailsView(APIView):
	permission_classes = (permissions.AllowAny,)

	def get(self, request):
		challenge = _access_challenge(request)
		if challenge is None:
			return Response({"detail": "Booking access has expired. Verify your email again."}, status=401)
		return Response(_booking_details(challenge.booking))


class BookingAccessRetryPaymentView(APIView):
	permission_classes = (permissions.AllowAny,)

	def post(self, request):
		if not settings.CHAPA_SECRET_KEY:
			return Response(
				{"detail": "Chapa checkout is not configured."},
				status=status.HTTP_503_SERVICE_UNAVAILABLE,
			)

		with transaction.atomic():
			challenge = _access_challenge(request, lock=True)
			if challenge is None:
				return Response({"detail": "Booking access has expired. Verify your email again."}, status=401)
			booking = Booking.objects.select_for_update().select_related(
				"guest", "room__room_type"
			).get(pk=challenge.booking_id)
			now = timezone.now()
			if booking.balance_due <= 0:
				return Response({"already_paid": True, "booking": _booking_details(booking, now)})
			if (
				booking.booking_status != Booking.BookingStatus.HOLD
				or not booking.hold_expires_at
				or booking.hold_expires_at <= now
			):
				return Response(
					{"detail": "This booking hold has expired or is no longer payable. Check availability before booking again."},
					status=status.HTTP_409_CONFLICT,
				)

			window_expired = (
				challenge.payment_window_started_at is None
				or now - challenge.payment_window_started_at >= PAYMENT_REQUEST_WINDOW
			)
			if window_expired:
				challenge.payment_window_started_at = now
				challenge.payments_in_window = 0
			if challenge.payments_in_window >= PAYMENT_REQUEST_LIMIT:
				challenge.save(update_fields=("payment_window_started_at", "updated_at"))
				return Response(
					{"detail": "Payment retry limit reached. Please try again later or contact the hotel."},
					status=status.HTTP_429_TOO_MANY_REQUESTS,
				)

			pending_payment = Payment.objects.select_for_update().filter(
				booking=booking,
				payment_method=Payment.PaymentMethod.CHAPA,
				status=Payment.Status.PENDING,
			).order_by("-submitted_at").first()
			if pending_payment:
				if pending_payment.provider_checkout_url:
					return Response({"checkout_url": pending_payment.provider_checkout_url, "reused": True})
				return Response(
					{"detail": "A payment attempt is already being initialized. Please try again shortly."},
					status=status.HTTP_409_CONFLICT,
				)

			payment = Payment.objects.create(
				booking=booking,
				amount=booking.balance_due,
				transaction_reference=f"{booking.booking_reference}-{uuid.uuid4().hex[:24]}",
				payment_method=Payment.PaymentMethod.CHAPA,
				status=Payment.Status.PENDING,
			)
			challenge.payments_in_window += 1
			challenge.save(update_fields=(
				"payment_window_started_at",
				"payments_in_window",
				"updated_at",
			))

		callback_url = settings.CHAPA_CALLBACK_URL or request.build_absolute_uri(reverse("chapa-callback"))
		return_url = (
			f"{settings.FRONTEND_URL}/booking/confirmation/{booking.booking_reference}?"
			f"{urlencode({'tx_ref': payment.transaction_reference})}"
		)
		try:
			checkout_url = initialize_transaction(
				payment,
				callback_url=callback_url,
				return_url=return_url,
			)
		except ChapaError:
			Payment.objects.filter(pk=payment.pk, status=Payment.Status.PENDING).update(
				status=Payment.Status.FAILED
			)
			return Response(
				{"detail": "Unable to start Chapa checkout. Please retry or contact the hotel."},
				status=status.HTTP_502_BAD_GATEWAY,
			)

		payment.provider_checkout_url = checkout_url
		payment.save(update_fields=("provider_checkout_url",))
		return Response({"checkout_url": checkout_url, "reused": False})