from datetime import date, timedelta
from decimal import Decimal

from rest_framework.test import APITestCase

from apps.guests.models import Guest
from apps.rooms.models import Room, RoomType
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
