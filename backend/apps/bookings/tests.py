from datetime import date, timedelta
from decimal import Decimal

from rest_framework.test import APITestCase

from apps.guests.models import Guest
from apps.rooms.models import Room, RoomType
from apps.bookings.serializers import BookingCreateSerializer
from .models import Booking


class AvailabilityTests(APITestCase):
	def setUp(self):
		self.room_type = RoomType.objects.create(
			name="Standard Room",
			max_guests=2,
			base_price=Decimal("100.00"),
		)
		self.first_room = Room.objects.create(room_type=self.room_type, room_number="101")
		self.second_room = Room.objects.create(room_type=self.room_type, room_number="102")
		self.guest = Guest.objects.create(
			full_name="Test Guest",
			phone="+10000000000",
			email="guest@example.com",
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
		self.assertEqual([room["id"] for room in response.data], [self.second_room.id])
		self.assertEqual(response.data[0]["room_type_id"], self.room_type.id)

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
		self.assertEqual(response.data, [])

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
					"phone": "+1 (415) 555-0123",
					"email": "NEW.GUEST@example.com",
				},
				"room": self.first_room.id,
				"check_in_date": self.check_in.isoformat(),
				"check_out_date": self.check_out.isoformat(),
				"number_of_guests": 2,
			},
			format="json",
		)

		self.assertEqual(response.status_code, 201, response.data)
		guest = Guest.objects.get(email="new.guest@example.com")
		self.assertEqual(guest.full_name, "New Booking Guest")
		self.assertEqual(guest.phone, "+14155550123")
		self.assertEqual(response.data["guest"], guest.id)
		self.assertEqual(response.data["booking_status"], Booking.BookingStatus.HOLD)

	def test_public_booking_reuses_existing_guest_by_email_or_phone(self):
		guest_count = Guest.objects.count()
		response = self.client.post(
			"/api/bookings/",
			{
				"guest_info": {
					"full_name": "Another Name",
					"phone": "+14155550123",
					"email": "GUEST@example.com",
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
					"phone": "+10000000000",
					"email": "different@example.com",
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
