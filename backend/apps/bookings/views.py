from datetime import date

from django.db.models import Q
from django.utils import timezone
from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from apps.rooms.models import Room

from .models import Booking
from .permissions import IsStaffBookingUser
from .serializers import (
	BookingCreateSerializer,
	BookingSerializer,
	BookingUpdateSerializer,
	RoomSummarySerializer,
)


class BookingViewSet(viewsets.ModelViewSet):
	queryset = Booking.objects.all()
	permission_classes = (IsStaffBookingUser,)

	def get_queryset(self):
		queryset = super().get_queryset().select_related(
			"guest", "room__room_type", "created_by"
		).prefetch_related("payments")
		params = self.request.query_params

		filters = {
			"booking_status": "booking_status",
			"room": "room_id",
			"guest": "guest_id",
			"booking_source": "booking_source",
			"check_in_date": "check_in_date",
			"check_out_date": "check_out_date",
		}
		for parameter, field in filters.items():
			value = params.get(parameter)
			if value:
				queryset = queryset.filter(**{field: value.upper() if parameter in ("booking_status", "booking_source") else value})

		search = params.get("search")
		if search:
			queryset = queryset.filter(
				Q(booking_reference__icontains=search)
				| Q(guest__full_name__icontains=search)
				| Q(guest__email__icontains=search)
				| Q(room__room_number__icontains=search)
			)
		return queryset

	def get_serializer_class(self):
		if self.action == "create":
			return BookingCreateSerializer
		if self.action in ("update", "partial_update"):
			return BookingUpdateSerializer
		return BookingSerializer

	def create(self, request, *args, **kwargs):
		serializer = self.get_serializer(data=request.data)
		serializer.is_valid(raise_exception=True)
		self.perform_create(serializer)
		headers = self.get_success_headers(serializer.data)
		return Response(
			BookingSerializer(serializer.instance).data,
			status=status.HTTP_201_CREATED,
			headers=headers,
		)

	def perform_update(self, serializer):
		serializer.save()

	@action(detail=False, methods=["get"], permission_classes=[permissions.AllowAny])
	def availability(self, request):
		check_in = request.query_params.get("check_in_date")
		check_out = request.query_params.get("check_out_date")
		guests = request.query_params.get("number_of_guests", "1")
		if not check_in or not check_out:
			return Response(
				{"detail": "check_in_date and check_out_date are required."},
				status=status.HTTP_400_BAD_REQUEST,
			)
		try:
			check_in_date = date.fromisoformat(check_in)
			check_out_date = date.fromisoformat(check_out)
			number_of_guests = int(guests)
		except (TypeError, ValueError):
			return Response(
				{"detail": "Use ISO dates and a positive number_of_guests."},
				status=status.HTTP_400_BAD_REQUEST,
			)
		if check_out_date <= check_in_date or number_of_guests < 1:
			return Response(
				{"detail": "Check-out must be after check-in and guests must be positive."},
				status=status.HTTP_400_BAD_REQUEST,
			)

		active_statuses = (
			Booking.BookingStatus.HOLD,
			Booking.BookingStatus.CONFIRMED,
			Booking.BookingStatus.CHECKED_IN,
		)
		booked_room_ids = Booking.objects.filter(
			booking_status__in=active_statuses,
			check_in_date__lt=check_out_date,
			check_out_date__gt=check_in_date,
		).values("room_id")
		rooms = Room.objects.filter(
			status=Room.Status.AVAILABLE,
			room_type__max_guests__gte=number_of_guests,
		).exclude(id__in=booked_room_ids).select_related("room_type")
		return Response(RoomSummarySerializer(rooms, many=True).data)

	@action(detail=True, methods=["post"])
	def confirm(self, request, pk=None):
		booking = self.get_object()
		if booking.booking_status != Booking.BookingStatus.HOLD:
			return Response({"detail": "Only held bookings can be confirmed."}, status=400)
		booking.booking_status = Booking.BookingStatus.CONFIRMED
		booking.save(update_fields=("booking_status",))
		return Response(BookingSerializer(booking).data)

	@action(detail=True, methods=["post"])
	def cancel(self, request, pk=None):
		booking = self.get_object()
		if booking.booking_status in (
			Booking.BookingStatus.CHECKED_OUT,
			Booking.BookingStatus.CANCELLED,
		):
			return Response({"detail": "This booking cannot be cancelled."}, status=400)
		booking.booking_status = Booking.BookingStatus.CANCELLED
		booking.save(update_fields=("booking_status",))
		return Response(BookingSerializer(booking).data)

	@action(detail=True, methods=["post"])
	def check_in(self, request, pk=None):
		booking = self.get_object()
		if booking.booking_status != Booking.BookingStatus.CONFIRMED:
			return Response({"detail": "Only confirmed bookings can be checked in."}, status=400)
		booking.booking_status = Booking.BookingStatus.CHECKED_IN
		booking.actual_check_in = timezone.now()
		booking.room.status = Room.Status.OCCUPIED
		booking.room.save(update_fields=("status",))
		booking.save(update_fields=("booking_status", "actual_check_in"))
		return Response(BookingSerializer(booking).data)

	@action(detail=True, methods=["post"])
	def check_out(self, request, pk=None):
		booking = self.get_object()
		if booking.booking_status != Booking.BookingStatus.CHECKED_IN:
			return Response({"detail": "Only checked-in bookings can be checked out."}, status=400)
		booking.booking_status = Booking.BookingStatus.CHECKED_OUT
		booking.actual_check_out = timezone.now()
		booking.room.status = Room.Status.DIRTY
		booking.room.save(update_fields=("status",))
		booking.save(update_fields=("booking_status", "actual_check_out"))
		return Response(BookingSerializer(booking).data)
