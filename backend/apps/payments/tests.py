from datetime import date, timedelta
from decimal import Decimal

from django.contrib.auth import get_user_model
from django.test import TestCase
from django.utils import timezone
from rest_framework.test import APIClient

from apps.bookings.models import Booking
from apps.guests.models import Guest
from apps.rooms.models import Room, RoomType
from .models import Payment


class PaymentVerificationTests(TestCase):
    def setUp(self):
        room_type = RoomType.objects.create(name="Payment Test Room", base_price=Decimal("100.00"))
        room = Room.objects.create(room_type=room_type, room_number="PAY-1")
        guest = Guest.objects.create(full_name="Payment Guest", phone="+10000000000")
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

        response = self.client.post(f"/api/payments/{self.payment.id}/verify/")

        self.assertEqual(response.status_code, 200)
        self.payment.refresh_from_db()
        self.booking.refresh_from_db()
        self.assertEqual(self.payment.status, Payment.Status.COMPLETED)
        self.assertEqual(self.booking.booking_status, Booking.BookingStatus.CONFIRMED)
        self.assertIsNone(self.booking.hold_expires_at)

    def test_partial_verified_payment_does_not_confirm_hold(self):
        self.payment.amount = Decimal("50.00")
        self.payment.save(update_fields=("amount",))

        response = self.client.post(f"/api/payments/{self.payment.id}/verify/")

        self.assertEqual(response.status_code, 200)
        self.booking.refresh_from_db()
        self.assertEqual(self.booking.booking_status, Booking.BookingStatus.HOLD)