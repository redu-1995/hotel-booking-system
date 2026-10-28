from datetime import date, timedelta
from decimal import Decimal
from uuid import uuid4

from django.utils import timezone
from rest_framework.test import APITestCase

from apps.accounts.models import User
from apps.guests.models import Guest
from apps.payments.models import Payment
from apps.rooms.models import Room, RoomType
from apps.bookings.serializers import BookingCreateSerializer
from .models import Booking


class AvailabilityTests(APITestCase):
	def setUp(self):
		self.suffix = uuid4().hex[:10]
		self.phone_suffix = f"{uuid4().int % 1000000000:09d}"
		self.room_type = RoomType.objects.create(
			name=f"Standard Room {self.suffix}",
			max_guests=2,
			base_price=Decimal("100.00"),
		)
		self.first_room = Room.objects.create(room_type=self.room_type, room_number=f"A{self.suffix}")
		self.second_room = Room.objects.create(room_type=self.room_type, room_number=f"B{self.suffix}")
		self.guest = Guest.objects.create(
			full_name=f"Test Guest {self.suffix}",
			phone=f"+1555{self.phone_suffix}",
			email=f"guest-{self.suffix}@example.com",
		)
		self.check_in = date.today() + timedelta(days=30)
		self.check_out = self.check_in + timedelta(days=2)

	def test_returns_only_rooms_without_overlaps_and_with_capacity(self):
		Booking.objects.create(
			guest=self.guest,
			room=self.first_room,
			check_in_date=self.check_in,
			check_out_date=self.check_out,
			number_of_guests=2,
			total_amount=Decimal("200.00"),
		)

		response = self.client.get(
			"/api/bookings/availability/",
			{
				"check_in_date": self.check_in.isoformat(),
				"check_out_date": self.check_out.isoformat(),
				"number_of_guests": 2,
			},
		)

		self.assertEqual(response.status_code, 200)
		returned_ids = [room["id"] for room in response.data]
		self.assertIn(self.second_room.id, returned_ids)
		self.assertNotIn(self.first_room.id, returned_ids)
		second_room_data = next(room for room in response.data if room["id"] == self.second_room.id)
		self.assertEqual(second_room_data["room_type_id"], self.room_type.id)

	def test_excludes_rooms_that_cannot_fit_guest_count(self):
		response = self.client.get(
			"/api/bookings/availability/",
			{
				"check_in_date": self.check_in.isoformat(),
				"check_out_date": self.check_out.isoformat(),
				"number_of_guests": 3,
			},
		)

		self.assertEqual(response.status_code, 200)
		returned_ids = [room["id"] for room in response.data]
		self.assertNotIn(self.first_room.id, returned_ids)
		self.assertNotIn(self.second_room.id, returned_ids)

	def test_booking_create_rechecks_availability_and_creates_fifteen_minute_hold(self):
		from django.contrib.auth.models import AnonymousUser
		from django.test import RequestFactory
		from django.utils import timezone
		from rest_framework.exceptions import ValidationError

		request = RequestFactory().post("/api/bookings/")
		request.user = AnonymousUser()
		payload = {
			"guest": self.guest.id,
			"room": self.first_room.id,
			"check_in_date": self.check_in,
			"check_out_date": self.check_out,
			"number_of_guests": 2,
			"booking_source": "DIRECT",
			"advance_amount": Decimal("0.00"),
		}
		serializer = BookingCreateSerializer(data=payload, context={"request": request})
		self.assertTrue(serializer.is_valid(), serializer.errors)
		booking = serializer.save()

		self.assertEqual(booking.booking_status, Booking.BookingStatus.HOLD)
		self.assertEqual(booking.booking_source, Booking.BookingSource.DIRECT)
		self.assertGreaterEqual(
			booking.hold_expires_at,
			timezone.now() + timedelta(minutes=14, seconds=55),
		)
		self.assertLessEqual(
			booking.hold_expires_at,
			timezone.now() + timedelta(minutes=15, seconds=5),
		)

		duplicate = BookingCreateSerializer(data=payload, context={"request": request})
		self.assertTrue(duplicate.is_valid(), duplicate.errors)
		with self.assertRaises(ValidationError):
			duplicate.save()

	def test_expired_hold_is_cancelled_and_releases_room(self):
		from django.utils import timezone

		expired_booking = Booking.objects.create(
			guest=self.guest,
			room=self.first_room,
			check_in_date=self.check_in,
			check_out_date=self.check_out,
			number_of_guests=2,
			total_amount=Decimal("200.00"),
			hold_expires_at=timezone.now() - timedelta(seconds=1),
		)

		response = self.client.get(
			"/api/bookings/availability/",
			{
				"check_in_date": self.check_in.isoformat(),
				"check_out_date": self.check_out.isoformat(),
				"number_of_guests": 2,
			},
		)

		expired_booking.refresh_from_db()
		self.assertEqual(expired_booking.booking_status, Booking.BookingStatus.CANCELLED)
		self.assertIn(self.first_room.id, [room["id"] for room in response.data])

	def test_public_booking_post_rejects_room_that_became_unavailable(self):
		Booking.objects.create(
			guest=self.guest,
			room=self.first_room,
			check_in_date=self.check_in,
			check_out_date=self.check_out,
			number_of_guests=2,
			total_amount=Decimal("200.00"),
		)

		response = self.client.post(
			"/api/bookings/",
			{
				"guest": self.guest.id,
				"room": self.first_room.id,
				"check_in_date": self.check_in.isoformat(),
				"check_out_date": self.check_out.isoformat(),
				"number_of_guests": 2,
				"booking_source": "DIRECT",
				"advance_amount": "0.00",
			},
		)

		self.assertEqual(response.status_code, 400)
		self.assertIn("room", response.data)

	def test_public_booking_post_creates_hold_and_payment_summary(self):
		response = self.client.post(
			"/api/bookings/",
			{
				"guest": self.guest.id,
				"room": self.first_room.id,
				"check_in_date": self.check_in.isoformat(),
				"check_out_date": self.check_out.isoformat(),
				"number_of_guests": 2,
				"booking_source": "DIRECT",
				"advance_amount": "0.00",
			},
		)

		self.assertEqual(response.status_code, 201)
		self.assertEqual(response.data["booking_status"], Booking.BookingStatus.HOLD)
		self.assertIsNotNone(response.data["hold_expires_at"])
		self.assertEqual(response.data["booking_source"], Booking.BookingSource.DIRECT)

		payment_details = self.client.get(
			"/api/bookings/payment-details/",
			{"booking_reference": response.data["booking_reference"]},
		)
		self.assertEqual(payment_details.status_code, 200)
		self.assertEqual(payment_details.data["room_name"], self.room_type.name)
		self.assertEqual(payment_details.data["room_rate"], Decimal("100.00"))
		self.assertEqual(payment_details.data["room_subtotal"], Decimal("200.00"))
		self.assertEqual(payment_details.data["total_amount"], Decimal("200.00"))
		self.assertNotIn("guest", payment_details.data)

	def test_public_booking_creates_guest_and_links_new_guest(self):
		response = self.client.post(
			"/api/bookings/",
			{
				"guest_info": {
					"full_name": "New Booking Guest",
					"phone": f"+1 (415) 555-{self.phone_suffix[:4]}",
					"email": f"NEW-{self.suffix}@example.com",
				},
				"room": self.first_room.id,
				"check_in_date": self.check_in.isoformat(),
				"check_out_date": self.check_out.isoformat(),
				"number_of_guests": 2,
			},
			format="json",
		)

		self.assertEqual(response.status_code, 201, response.data)
		guest = Guest.objects.get(email=f"new-{self.suffix}@example.com")
		self.assertEqual(guest.full_name, "New Booking Guest")
		self.assertEqual(guest.phone, f"+1415555{self.phone_suffix[:4]}")
		self.assertEqual(response.data["guest"], guest.id)
		self.assertEqual(response.data["booking_status"], Booking.BookingStatus.HOLD)

	def test_public_booking_reuses_existing_guest_by_email_or_phone(self):
		guest_count = Guest.objects.count()
		response = self.client.post(
			"/api/bookings/",
			{
				"guest_info": {
					"full_name": "Another Name",
					"phone": f"+1415555{self.phone_suffix[:4]}",
					"email": self.guest.email.upper(),
				},
				"room": self.first_room.id,
				"check_in_date": self.check_in.isoformat(),
				"check_out_date": self.check_out.isoformat(),
				"number_of_guests": 2,
			},
			format="json",
		)

		self.assertEqual(response.status_code, 201, response.data)
		self.assertEqual(response.data["guest"], self.guest.id)
		self.assertEqual(Guest.objects.count(), guest_count)

		phone_match = self.client.post(
			"/api/bookings/",
			{
				"guest_info": {
					"full_name": "Updated Contact Name",
					"phone": self.guest.phone,
					"email": f"different-{self.suffix}@example.com",
				},
				"room": self.second_room.id,
				"check_in_date": self.check_in.isoformat(),
				"check_out_date": self.check_out.isoformat(),
				"number_of_guests": 2,
			},
			format="json",
		)
		self.assertEqual(phone_match.status_code, 201, phone_match.data)
		self.assertEqual(phone_match.data["guest"], self.guest.id)
		self.assertEqual(Guest.objects.count(), guest_count)


class StaffBookingAPITests(APITestCase):
	def setUp(self):
		suffix = uuid4().hex[:10]
		self.room_type = RoomType.objects.create(
			name=f"Admin test room {suffix}",
			max_guests=2,
			base_price=Decimal("125.00"),
		)
		self.room = Room.objects.create(
			room_type=self.room_type,
			room_number=f"T{suffix}",
		)
		self.guest = Guest.objects.create(
			full_name="Admin Test Guest",
			phone=f"+1555{suffix}",
			email=f"admin-{suffix}@example.com",
		)
		self.staff = User.objects.create_user(
			username=f"staff-{suffix}",
			email=f"staff-{suffix}@example.com",
			password="test-password",
			is_staff=True,
		)
		self.client.force_authenticate(self.staff)
		self.booking = Booking.objects.create(
			guest=self.guest,
			room=self.room,
			check_in_date=timezone.localdate(),
			check_out_date=timezone.localdate() + timedelta(days=1),
			number_of_guests=2,
			total_amount=Decimal("125.00"),
			booking_status=Booking.BookingStatus.CONFIRMED,
		)

	def test_list_returns_page_and_filters_by_latest_payment_status(self):
		Payment.objects.create(
			booking=self.booking,
			amount=Decimal("25.00"),
			status=Payment.Status.FAILED,
		)
		latest_payment = Payment.objects.create(
			booking=self.booking,
			amount=Decimal("100.00"),
			status=Payment.Status.COMPLETED,
		)
		response = self.client.get("/api/bookings/", {"payment_status": "COMPLETED"})

		self.assertEqual(response.status_code, 200)
		self.assertEqual(response.data["count"], 1)
		self.assertEqual(response.data["results"][0]["id"], self.booking.id)
		self.assertEqual(response.data["results"][0]["latest_payment"]["status"], latest_payment.status)
		self.assertEqual(
			self.client.get("/api/bookings/", {"payment_status": "FAILED"}).data["count"],
			0,
		)

	def test_summary_uses_real_booking_and_room_counts(self):
		response = self.client.get("/api/bookings/summary/")

		self.assertEqual(response.status_code, 200)
		self.assertEqual(response.data["confirmed_bookings"], 1)
		self.assertEqual(response.data["todays_arrivals"], 1)
		self.assertEqual(response.data["occupied_rooms"], 0)

	def test_check_in_and_check_out_update_booking_and_room_together(self):
		check_in_response = self.client.post(f"/api/bookings/{self.booking.id}/check_in/")
		self.assertEqual(check_in_response.status_code, 200)
		self.booking.refresh_from_db()
		self.room.refresh_from_db()
		self.assertEqual(self.booking.booking_status, Booking.BookingStatus.CHECKED_IN)
		self.assertEqual(self.room.status, Room.Status.OCCUPIED)

		check_out_response = self.client.post(f"/api/bookings/{self.booking.id}/check_out/")
		self.assertEqual(check_out_response.status_code, 200)
		self.booking.refresh_from_db()
		self.room.refresh_from_db()
		self.assertEqual(self.booking.booking_status, Booking.BookingStatus.CHECKED_OUT)
		self.assertEqual(self.room.status, Room.Status.DIRTY)
		self.assertEqual(
			self.client.post(f"/api/bookings/{self.booking.id}/check_out/").status_code,
			400,
		)
