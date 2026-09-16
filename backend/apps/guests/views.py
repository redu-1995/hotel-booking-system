from django.db.models import Q
from django.db.models.deletion import ProtectedError
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import Guest
from .permissions import IsGuestStaff
from .serializers import GuestSerializer


class GuestViewSet(viewsets.ModelViewSet):
	queryset = Guest.objects.all()
	serializer_class = GuestSerializer
	permission_classes = (IsGuestStaff,)

	def get_queryset(self):
		queryset = super().get_queryset()
		params = self.request.query_params

		search = params.get("search")
		if search:
			queryset = queryset.filter(
				Q(full_name__icontains=search)
				| Q(phone__icontains=search)
				| Q(email__icontains=search)
			)

		for parameter in ("full_name", "phone", "email"):
			value = params.get(parameter)
			if value:
				queryset = queryset.filter(**{f"{parameter}__icontains": value})

		created_after = params.get("created_after")
		created_before = params.get("created_before")
		if created_after:
			queryset = queryset.filter(created_at__date__gte=created_after)
		if created_before:
			queryset = queryset.filter(created_at__date__lte=created_before)

		ordering = params.get("ordering")
		valid_ordering = []
		if ordering:
			allowed_fields = ("full_name", "phone", "email", "created_at")
			valid_ordering = [
				field
				for field in ordering.split(",")
				if field.lstrip("-") in allowed_fields
			]
		return queryset.order_by(*valid_ordering) if valid_ordering else queryset

	def destroy(self, request, *args, **kwargs):
		guest = self.get_object()
		try:
			guest.delete()
		except ProtectedError:
			return Response(
				{"detail": "Guests with bookings cannot be deleted."},
				status=status.HTTP_400_BAD_REQUEST,
			)
		return Response(status=status.HTTP_204_NO_CONTENT)

	@action(detail=True, methods=["get"])
	def bookings(self, request, pk=None):
		guest = self.get_object()
		from apps.bookings.serializers import BookingSerializer

		bookings = guest.bookings.select_related(
			"guest", "room__room_type", "created_by"
		).prefetch_related("payments")
		return Response(BookingSerializer(bookings, many=True).data)
