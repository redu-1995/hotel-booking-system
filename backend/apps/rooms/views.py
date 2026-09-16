from decimal import Decimal, InvalidOperation

from django.db.models import Q
from rest_framework import permissions, viewsets

from .models import Room, RoomType
from .serializers import RoomSerializer, RoomTypeSerializer


class StaffWritePermission(permissions.BasePermission):
	def has_permission(self, request, view):
		return request.method in permissions.SAFE_METHODS or (
			request.user.is_authenticated and request.user.is_staff
		)


class RoomTypeViewSet(viewsets.ModelViewSet):
	queryset = RoomType.objects.all()
	serializer_class = RoomTypeSerializer
	permission_classes = (StaffWritePermission,)

	def get_queryset(self):
		queryset = super().get_queryset().prefetch_related("rooms")
		params = self.request.query_params

		search = params.get("search")
		if search:
			queryset = queryset.filter(
				Q(name__icontains=search)
				| Q(description__icontains=search)
				| Q(amenities__icontains=search)
			)

		min_price = self._decimal_param(params.get("min_price"))
		max_price = self._decimal_param(params.get("max_price"))
		if min_price is not None:
			queryset = queryset.filter(base_price__gte=min_price)
		if max_price is not None:
			queryset = queryset.filter(base_price__lte=max_price)

		max_guests = params.get("max_guests")
		if max_guests and max_guests.isdigit():
			queryset = queryset.filter(max_guests__lte=int(max_guests))

		return self._apply_ordering(queryset, params.get("ordering"), ("name", "base_price", "max_guests"))

	@staticmethod
	def _decimal_param(value):
		if not value:
			return None
		try:
			return Decimal(value)
		except (InvalidOperation, TypeError):
			return None

	@staticmethod
	def _apply_ordering(queryset, ordering, allowed_fields):
		if not ordering:
			return queryset
		requested = ordering.split(",")
		valid = [
			field
			for field in requested
			if field.lstrip("-") in allowed_fields
		]
		return queryset.order_by(*valid) if valid else queryset


class RoomViewSet(viewsets.ModelViewSet):
	queryset = Room.objects.all()
	serializer_class = RoomSerializer
	permission_classes = (StaffWritePermission,)

	def get_queryset(self):
		queryset = super().get_queryset().select_related("room_type")
		params = self.request.query_params

		room_type = params.get("room_type")
		if room_type and room_type.isdigit():
			queryset = queryset.filter(room_type_id=int(room_type))

		status = params.get("status")
		if status:
			queryset = queryset.filter(status=status.upper())

		available = params.get("available", "").lower()
		if available in ("true", "1"):
			queryset = queryset.filter(status=Room.Status.AVAILABLE)
		elif available in ("false", "0"):
			queryset = queryset.exclude(status=Room.Status.AVAILABLE)

		search = params.get("search")
		if search:
			queryset = queryset.filter(room_number__icontains=search)

		ordering = params.get("ordering")
		if ordering:
			requested = ordering.split(",")
			valid = [
				field
				for field in requested
				if field.lstrip("-") in ("room_number", "status", "created_at")
			]
			if valid:
				queryset = queryset.order_by(*valid)

		return queryset
