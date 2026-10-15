from datetime import date
from decimal import Decimal

from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework.test import APITestCase

from apps.bookings.models import Booking
from apps.guests.models import Guest
from apps.rooms.models import Room, RoomType

from .models import Inquiry

User = get_user_model()


class InquiryWorkflowTests(APITestCase):
	def setUp(self):
		self.room_type = RoomType.objects.create(
			name="Standard Room",
			max_guests=2,
			base_price=Decimal("120.00"),
		)
		self.room = Room.objects.create(
			room_type=self.room_type,
			room_number="A101",
			status=Room.Status.AVAILABLE,
		)
		self.staff = User.objects.create_user(
			username="receptionist",
			email="receptionist@example.com",
			password="test-password",
			is_staff=True,
			role=User.Role.RECEPTIONIST,
		)
		self.payload = {
			"name": "Jordan Guest",
			"email": "Jordan@Example.com",
			"phone": "+1 (555) 123-4567",
			"subject": "Room availability",
			"message": "Please let me know whether a room is available.",
			"preferred_room_type": self.room_type.pk,
		}
		self.list_url = reverse("inquiry-list")

	def test_public_submission_saves_pending_inquiry_without_booking_or_guest(self):
		response = self.client.post(self.list_url, self.payload, format="json")

		self.assertEqual(response.status_code, 201)
		self.assertEqual(response.data["status"], Inquiry.Status.PENDING)
		self.assertEqual(response.data["email"], "jordan@example.com")
		self.assertEqual(response.data["phone"], "+15551234567")
		self.assertIsNone(response.data["check_in_date"])
		self.assertIsNone(response.data["check_out_date"])
		inquiry = Inquiry.objects.get(pk=response.data["id"])
		self.assertIsNone(inquiry.guest)
		self.assertEqual(Booking.objects.count(), 0)
		self.assertEqual(Guest.objects.count(), 0)

	def test_public_submission_rejects_invalid_contact_message_and_partial_dates(self):
		invalid_payload = {
			**self.payload,
			"email": "not-an-email",
			"phone": "123",
			"subject": "   ",
			"message": "short",
			"check_in_date": "2030-01-01",
		}

		response = self.client.post(self.list_url, invalid_payload, format="json")

		self.assertEqual(response.status_code, 400)
		for field in ("email", "phone", "subject", "message"):
			self.assertIn(field, response.data)

		partial_date_response = self.client.post(
			self.list_url,
			{**self.payload, "check_in_date": "2030-01-01"},
			format="json",
		)
		self.assertEqual(partial_date_response.status_code, 400)
		self.assertIn("check_out_date", partial_date_response.data)

	def test_public_submission_cannot_set_guest_or_staff_fields(self):
		existing_guest = Guest.objects.create(
			full_name="Existing Guest",
			phone="+15550000000",
			email="existing@example.com",
		)
		response = self.client.post(
			self.list_url,
			{
				**self.payload,
				"guest": existing_guest.pk,
				"assigned_to": self.staff.pk,
				"status": Inquiry.Status.CONVERTED,
				"internal_notes": "not public input",
			},
			format="json",
		)

		self.assertEqual(response.status_code, 201)
		inquiry = Inquiry.objects.get(pk=response.data["id"])
		self.assertEqual(inquiry.status, Inquiry.Status.PENDING)
		self.assertIsNone(inquiry.guest)
		self.assertIsNone(inquiry.assigned_to)

	def test_inquiry_listing_and_updates_require_authorized_staff(self):
		response = self.client.post(self.list_url, self.payload, format="json")
		inquiry_url = reverse("inquiry-detail", args=[response.data["id"]])

		self.assertIn(self.client.get(self.list_url).status_code, (401, 403))
		self.assertIn(
			self.client.patch(inquiry_url, {"subject": "Updated"}, format="json").status_code,
			(401, 403),
		)

		self.client.force_authenticate(self.staff)
		self.assertEqual(self.client.get(self.list_url).status_code, 200)
		update_response = self.client.patch(
			inquiry_url,
			{"subject": "Updated room request"},
			format="json",
		)
		self.assertEqual(update_response.status_code, 200)
		self.assertEqual(update_response.data["subject"], "Updated room request")

	def test_staff_can_advance_inquiry_status_in_order(self):
		response = self.client.post(self.list_url, self.payload, format="json")
		status_url = f"{self.list_url}{response.data['id']}/status/"
		self.client.force_authenticate(self.staff)

		contacted = self.client.post(
			status_url,
			{"status": Inquiry.Status.CONTACTED},
			format="json",
		)
		quoted = self.client.post(
			status_url,
			{"status": Inquiry.Status.QUOTED},
			format="json",
		)
		invalid_transition = self.client.post(
			status_url,
			{"status": Inquiry.Status.PENDING},
			format="json",
		)

		self.assertEqual(contacted.status_code, 200)
		self.assertEqual(quoted.status_code, 200)
		self.assertEqual(quoted.data["status"], Inquiry.Status.QUOTED)
		self.assertEqual(invalid_transition.status_code, 400)

	def test_staff_cannot_mark_inquiry_converted_without_creating_booking(self):
		response = self.client.post(self.list_url, self.payload, format="json")
		status_url = f"{self.list_url}{response.data['id']}/status/"
		self.client.force_authenticate(self.staff)

		conversion_response = self.client.post(
			status_url,
			{"status": Inquiry.Status.CONVERTED},
			format="json",
		)

		self.assertEqual(conversion_response.status_code, 400)
		self.assertEqual(Booking.objects.count(), 0)
		self.assertEqual(
			Inquiry.objects.get(pk=response.data["id"]).status,
			Inquiry.Status.PENDING,
		)

	def test_staff_can_assign_inquiry(self):
		response = self.client.post(self.list_url, self.payload, format="json")
		self.client.force_authenticate(self.staff)

		assignment_response = self.client.post(
			reverse("inquiry-assign", args=[response.data["id"]]),
			{"assigned_to": self.staff.pk},
			format="json",
		)

		self.assertEqual(assignment_response.status_code, 200)
		self.assertEqual(assignment_response.data["assigned_to"], self.staff.pk)

	def test_conversion_reuses_matching_guest_and_marks_converted_after_booking(self):
		guest = Guest.objects.create(
			full_name="Jordan Guest",
			phone="+15551234567",
			email="jordan@example.com",
		)
		inquiry = Inquiry.objects.create(
			**{
				**self.payload,
				"phone": "+15551234567",
				"email": "jordan@example.com",
				"preferred_room_type": self.room_type,
			},
			check_in_date=date(2030, 1, 10),
			check_out_date=date(2030, 1, 12),
			number_of_guests=2,
			status=Inquiry.Status.QUOTED,
		)
		self.client.force_authenticate(self.staff)

		response = self.client.post(
			reverse("inquiry-convert", args=[inquiry.pk]),
			format="json",
		)

		self.assertEqual(response.status_code, 201)
		self.assertEqual(Booking.objects.count(), 1)
		self.assertEqual(Booking.objects.get().guest_id, guest.pk)
		self.assertEqual(Guest.objects.count(), 1)
		inquiry.refresh_from_db()
		self.assertEqual(inquiry.status, Inquiry.Status.CONVERTED)

	def test_conversion_failure_does_not_create_guest_booking_or_convert(self):
		inquiry = Inquiry.objects.create(
			**{
				**self.payload,
				"phone": "+15551234567",
				"email": "jordan@example.com",
				"preferred_room_type": self.room_type,
			},
			check_in_date=date(2030, 1, 10),
			check_out_date=date(2030, 1, 12),
			status=Inquiry.Status.QUOTED,
		)
		self.room.status = Room.Status.OCCUPIED
		self.room.save(update_fields=("status",))
		self.client.force_authenticate(self.staff)

		response = self.client.post(
			reverse("inquiry-convert", args=[inquiry.pk]),
			format="json",
		)

		self.assertEqual(response.status_code, 400)
		self.assertEqual(Booking.objects.count(), 0)
		self.assertEqual(Guest.objects.count(), 0)
		inquiry.refresh_from_db()
		self.assertEqual(inquiry.status, Inquiry.Status.QUOTED)
