from datetime import date, timedelta
from decimal import Decimal

from django.contrib.auth import get_user_model
from django.core import mail
from django.test import TestCase, override_settings
from django.utils import timezone
from rest_framework.test import APIClient

from apps.bookings.models import Booking
from apps.guests.models import Guest
from apps.notifications.models import Notification
from apps.rooms.models import Room, RoomType
from .models import Payment


@override_settings(MAILERS={"default": {"BACKEND": "django.core.mail.backends.locmem.EmailBackend"}})
class PaymentVerificationTests(TestCase):
    def setUp(self):
        room_type = RoomType.objects.create(name="Payment Test Room", base_price=Decimal("100.00"))
        room = Room.objects.create(room_type=room_type, room_number="PAY-1")
        guest = Guest.objects.create(
            full_name="Payment Guest",
            phone="+10000000000",
            email="guest@example.com",
        )
        check_in = date.today() + timedelta(days=30)
        self.booking = Booking.objects.create(
            guest=guest,
            room=room,
            check_in_date=check_in,
            check_out_date=check_in + timedelta(days=1),
            number_of_guests=1,
            total_amount=Decimal("100.00"),
            hold_expires_at=timezone.now() + timedelta(minutes=15),
        )
        self.payment = Payment.objects.create(
            booking=self.booking,
            amount=Decimal("100.00"),
            transaction_reference="TXN-PAY-1",
        )
        self.staff_user = get_user_model().objects.create_user(
            username="payment-verifier",
            email="verifier@example.com",
            password="test-password",
            is_staff=True,
            role="ADMIN",
        )
        self.client = APIClient()
        self.client.force_authenticate(self.staff_user)

    def test_new_payment_defaults_to_pending_and_verification_confirms_paid_hold(self):
        self.assertEqual(self.payment.status, Payment.Status.PENDING)

        with self.captureOnCommitCallbacks(execute=True):
            response = self.client.post(f"/api/payments/{self.payment.id}/verify/")

        self.assertEqual(response.status_code, 200)
        self.payment.refresh_from_db()
        self.booking.refresh_from_db()
        self.assertEqual(self.payment.status, Payment.Status.COMPLETED)
        self.assertEqual(self.booking.booking_status, Booking.BookingStatus.CONFIRMED)
        self.assertIsNone(self.booking.hold_expires_at)
        confirmation = self.client.get(
            "/api/bookings/payment-details/",
            {"booking_reference": self.booking.booking_reference},
        )
        self.assertEqual(confirmation.status_code, 200)
        self.assertEqual(confirmation.data["payment_method"], "Credit Card")
        self.assertEqual(confirmation.data["transaction_reference"], "TXN-PAY-1")
        self.assertEqual(
            Notification.objects.filter(booking=self.booking).count(),
            2,
        )
        self.assertTrue(
            Notification.objects.filter(
                booking=self.booking,
                recipient_guest=self.booking.guest,
                notification_type=Notification.Type.BOOKING_CONFIRMED,
            ).exists()
        )
        self.assertEqual(len(mail.outbox), 1)
        self.assertIn("Payment method: Credit Card", mail.outbox[0].body)
        self.assertIn("Transaction reference: TXN-PAY-1", mail.outbox[0].body)
        self.assertIn("Hotel contact:", mail.outbox[0].body)
        self.assertTrue(
            Notification.objects.filter(
                booking=self.booking,
                recipient_user=self.staff_user,
                notification_type=Notification.Type.BOOKING_CONFIRMED,
            ).exists()
        )

        from apps.payments.services import verify_manual_payment

        verify_manual_payment(self.payment, self.staff_user)
        self.assertEqual(Notification.objects.filter(booking=self.booking).count(), 2)
        self.assertEqual(len(mail.outbox), 1)

    def test_staff_notification_list_and_unread_count_are_scoped_to_current_user(self):
        response = self.client.post(f"/api/payments/{self.payment.id}/verify/")
        self.assertEqual(response.status_code, 200)

        notifications = self.client.get("/api/notifications/")
        unread_count = self.client.get("/api/notifications/unread-count/")

        self.assertEqual(notifications.status_code, 200)
        self.assertEqual(len(notifications.data), 1)
        self.assertEqual(unread_count.data, {"count": 1})

        mark_read = self.client.post(
            f"/api/notifications/{notifications.data[0]['id']}/mark_read/"
        )
        self.assertEqual(mark_read.status_code, 200)
        self.assertTrue(mark_read.data["is_read"])
        self.assertEqual(self.client.get("/api/notifications/unread-count/").data, {"count": 0})

    def test_partial_verified_payment_does_not_confirm_hold(self):
        self.payment.amount = Decimal("50.00")
        self.payment.save(update_fields=("amount",))

        response = self.client.post(f"/api/payments/{self.payment.id}/verify/")

        self.assertEqual(response.status_code, 200)
        self.booking.refresh_from_db()
        self.assertEqual(self.booking.booking_status, Booking.BookingStatus.HOLD)