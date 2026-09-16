from django.db import transaction
from django.db.models import Q
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from apps.bookings.models import Booking
from apps.bookings.serializers import BookingSerializer
from apps.rooms.models import Room

from .models import Inquiry
from .permissions import InquiryPermission
from .serializers import (
	InquiryAssignmentSerializer,
	InquiryCreateSerializer,
	InquirySerializer,
	InquiryStatusSerializer,
)


class InquiryViewSet(viewsets.ModelViewSet):
	queryset = Inquiry.objects.all()
	permission_classes = (InquiryPermission,)

	def get_serializer_class(self):
		if self.action == "create":
			return InquiryCreateSerializer
		if self.action == "assign":
			return InquiryAssignmentSerializer
		if self.action == "set_status":
			return InquiryStatusSerializer
		return InquirySerializer

	def get_queryset(self):
		queryset = super().get_queryset().select_related(
			"guest", "preferred_room_type", "assigned_to"
		)
		params = self.request.query_params
		for parameter in (
			"status",
			"source",
			"assigned_to",
			"preferred_room_type",
			"check_in_date",
			"check_out_date",
		):
			value = params.get(parameter)
			if value:
				field = parameter
				queryset = queryset.filter(
					**{field: value.upper() if parameter in ("status", "source") else value}
				)

		search = params.get("search")
		if search:
			queryset = queryset.filter(
				Q(name__icontains=search)
				| Q(message__icontains=search)
				| Q(guest__full_name__icontains=search)
				| Q(guest__phone__icontains=search)
				| Q(guest__email__icontains=search)
			)
		return queryset

	def perform_create(self, serializer):
		if self.request.user.is_authenticated and self.request.user.is_staff:
			serializer.save()
		else:
			serializer.save(source=Inquiry.Source.WEBSITE)

	def destroy(self, request, *args, **kwargs):
		return Response(
			{"detail": "Inquiries are preserved as history; cancel the inquiry instead."},
			status=status.HTTP_405_METHOD_NOT_ALLOWED,
		)

	@action(detail=True, methods=["post"])
	def assign(self, request, pk=None):
		inquiry = self.get_object()
		serializer = InquiryAssignmentSerializer(data=request.data)
		serializer.is_valid(raise_exception=True)
		inquiry.assigned_to = serializer.validated_data["assigned_to"]
		inquiry.save(update_fields=("assigned_to",))
		return Response(InquirySerializer(inquiry).data)

	@action(detail=True, methods=["post"], url_path="status")
	def set_status(self, request, pk=None):
		inquiry = self.get_object()
		serializer = InquiryStatusSerializer(data=request.data)
		serializer.is_valid(raise_exception=True)
		new_status = serializer.validated_data["status"]
		allowed = {
			Inquiry.Status.PENDING: {
				Inquiry.Status.CONTACTED,
				Inquiry.Status.CANCELLED,
			},
			Inquiry.Status.CONTACTED: {
				Inquiry.Status.QUOTED,
				Inquiry.Status.CANCELLED,
			},
			Inquiry.Status.QUOTED: {
				Inquiry.Status.CONVERTED,
				Inquiry.Status.CANCELLED,
			},
		}
		if new_status not in allowed.get(inquiry.status, set()):
			return Response(
				{"detail": f"Cannot change status from {inquiry.status} to {new_status}."},
				status=status.HTTP_400_BAD_REQUEST,
			)
		inquiry.status = new_status
		inquiry.save(update_fields=("status",))
		return Response(InquirySerializer(inquiry).data)

	def _transition(self, request, pk, target, allowed):
		inquiry = self.get_object()
		if inquiry.status not in allowed:
			return Response(
				{"detail": f"This inquiry cannot be marked {target.lower()}."},
				status=status.HTTP_400_BAD_REQUEST,
			)
		inquiry.status = target
		inquiry.save(update_fields=("status",))
		return Response(InquirySerializer(inquiry).data)

	@action(detail=True, methods=["post"])
	def contact(self, request, pk=None):
		return self._transition(request, pk, Inquiry.Status.CONTACTED, {Inquiry.Status.PENDING})

	@action(detail=True, methods=["post"])
	def quote(self, request, pk=None):
		return self._transition(request, pk, Inquiry.Status.QUOTED, {Inquiry.Status.CONTACTED})

	@action(detail=True, methods=["post"])
	def cancel(self, request, pk=None):
		return self._transition(
			request,
			pk,
			Inquiry.Status.CANCELLED,
			{Inquiry.Status.PENDING, Inquiry.Status.CONTACTED, Inquiry.Status.QUOTED},
		)

	@action(detail=True, methods=["post"])
	def convert(self, request, pk=None):
		inquiry = self.get_object()
		if inquiry.status != Inquiry.Status.QUOTED:
			return Response(
				{"detail": "Only quoted inquiries can be converted."},
				status=status.HTTP_400_BAD_REQUEST,
			)
		if not inquiry.guest or not inquiry.preferred_room_type:
			return Response(
				{"detail": "A guest and preferred room type are required for conversion."},
				status=status.HTTP_400_BAD_REQUEST,
			)

		active_statuses = (
			Booking.BookingStatus.HOLD,
			Booking.BookingStatus.CONFIRMED,
			Booking.BookingStatus.CHECKED_IN,
		)
		with transaction.atomic():
			room = Room.objects.select_for_update().filter(
				room_type=inquiry.preferred_room_type,
				status=Room.Status.AVAILABLE,
			).exclude(
				bookings__booking_status__in=active_statuses,
				bookings__check_in_date__lt=inquiry.check_out_date,
				bookings__check_out_date__gt=inquiry.check_in_date,
			).first()
			if room is None:
				return Response(
					{"detail": "No room is available for the requested dates."},
					status=status.HTTP_400_BAD_REQUEST,
				)
			booking = Booking(
				guest=inquiry.guest,
				room=room,
				check_in_date=inquiry.check_in_date,
				check_out_date=inquiry.check_out_date,
				number_of_guests=inquiry.number_of_guests,
				booking_source=Booking.BookingSource.DIRECT,
				total_amount=room.room_type.base_price * inquiry.nights_count,
				created_by=request.user,
			)
			booking.save()
			inquiry.status = Inquiry.Status.CONVERTED
			inquiry.save(update_fields=("status",))
		return Response(BookingSerializer(booking).data, status=status.HTTP_201_CREATED)
