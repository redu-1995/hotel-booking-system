from django.db.models import Q
from django.utils import timezone
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import Payment
from .permissions import IsPaymentStaff, IsPaymentVerifier
from .serializers import PaymentCreateSerializer, PaymentSerializer


class PaymentViewSet(viewsets.ModelViewSet):
	queryset = Payment.objects.all()
	permission_classes = (IsPaymentStaff,)

	def get_queryset(self):
		queryset = super().get_queryset().select_related(
			"booking__guest", "verified_by"
		)
		params = self.request.query_params
		for parameter in ("booking", "status", "payment_method"):
			value = params.get(parameter)
			if value:
				field = "booking_id" if parameter == "booking" else parameter
				queryset = queryset.filter(
					**{field: value.upper() if parameter in ("status", "payment_method") else value}
				)

		search = params.get("search")
		if search:
			queryset = queryset.filter(
				Q(transaction_reference__icontains=search)
				| Q(booking__booking_reference__icontains=search)
				| Q(booking__guest__full_name__icontains=search)
			)
		return queryset

	def get_serializer_class(self):
		return PaymentCreateSerializer if self.action == "create" else PaymentSerializer

	@action(detail=True, methods=["post"], permission_classes=[IsPaymentVerifier])
	def verify(self, request, pk=None):
		payment = self.get_object()
		if payment.status != Payment.Status.PENDING:
			return Response(
				{"detail": "Only pending payments can be verified."},
				status=status.HTTP_400_BAD_REQUEST,
			)
		payment.mark_as_verified(request.user)
		return Response(PaymentSerializer(payment).data)

	@action(detail=True, methods=["post"], permission_classes=[IsPaymentVerifier])
	def fail(self, request, pk=None):
		payment = self.get_object()
		if payment.status != Payment.Status.PENDING:
			return Response(
				{"detail": "Only pending payments can be marked failed."},
				status=status.HTTP_400_BAD_REQUEST,
			)
		payment.status = Payment.Status.FAILED
		payment.save(update_fields=("status",))
		return Response(PaymentSerializer(payment).data)

	@action(detail=True, methods=["post"], permission_classes=[IsPaymentVerifier])
	def refund(self, request, pk=None):
		payment = self.get_object()
		if payment.status != Payment.Status.COMPLETED:
			return Response(
				{"detail": "Only completed payments can be refunded."},
				status=status.HTTP_400_BAD_REQUEST,
			)
		payment.status = Payment.Status.REFUNDED
		payment.save(update_fields=("status",))
		return Response(PaymentSerializer(payment).data)
