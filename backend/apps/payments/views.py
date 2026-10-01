import json
import uuid
from urllib.parse import urlencode

from django.conf import settings
from django.db.models import Q
from django.db import transaction
from django.http import JsonResponse
from django.urls import reverse
from django.utils import timezone
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_GET, require_POST
from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from apps.bookings.models import Booking
from apps.bookings.services import expire_booking_holds

from .chapa import ChapaError, initialize_transaction, verify_webhook_signature
from .models import Payment
from .permissions import IsPaymentStaff, IsPaymentVerifier
from .serializers import PaymentCreateSerializer, PaymentSerializer
from .services import verify_chapa_payment, verify_manual_payment


def _settle_chapa_reference(transaction_reference):
	try:
		payment = Payment.objects.get(
			transaction_reference=transaction_reference,
			payment_method=Payment.PaymentMethod.CHAPA,
		)
	except Payment.DoesNotExist:
		return None, status.HTTP_404_NOT_FOUND

	try:
		payment, confirmed = verify_chapa_payment(payment)
	except ChapaError:
		return None, status.HTTP_502_BAD_GATEWAY
	return {
		"booking_reference": payment.booking.booking_reference,
		"payment_status": payment.status,
		"booking_status": payment.booking.booking_status,
		"confirmed": confirmed,
	}, status.HTTP_200_OK


@csrf_exempt
@require_POST
def chapa_webhook(request):
	if not settings.CHAPA_WEBHOOK_SECRET:
		return JsonResponse({"detail": "Chapa webhook verification is not configured."}, status=503)
	if not verify_webhook_signature(request.body, request.headers):
		return JsonResponse({"detail": "Invalid Chapa webhook signature."}, status=403)
	try:
		payload = json.loads(request.body)
	except (TypeError, ValueError):
		return JsonResponse({"detail": "Invalid JSON payload."}, status=400)
	if payload.get("type") == "Payout":
		return JsonResponse({"received": True})
	transaction_reference = payload.get("tx_ref") or payload.get("trx_ref")
	if not transaction_reference:
		return JsonResponse({"detail": "Transaction reference is required."}, status=400)
	result, response_status = _settle_chapa_reference(transaction_reference)
	if result is None:
		return JsonResponse({"detail": "Unable to verify Chapa transaction."}, status=response_status)
	return JsonResponse({"received": True, **result})


@csrf_exempt
@require_GET
def chapa_callback(request):
	transaction_reference = request.GET.get("trx_ref") or request.GET.get("tx_ref")
	if not transaction_reference and request.body:
		try:
			payload = json.loads(request.body)
			transaction_reference = payload.get("trx_ref") or payload.get("tx_ref")
		except (TypeError, ValueError):
			pass
	if not transaction_reference:
		return JsonResponse({"detail": "Transaction reference is required."}, status=400)
	result, response_status = _settle_chapa_reference(transaction_reference)
	if result is None:
		return JsonResponse({"detail": "Unable to verify Chapa transaction."}, status=response_status)
	return JsonResponse(result)


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
		booking = payment.booking
		if booking.booking_status == Booking.BookingStatus.CANCELLED:
			return Response(
				{"detail": "A cancelled booking cannot be confirmed by payment verification."},
				status=status.HTTP_400_BAD_REQUEST,
			)
		try:
			payment, booking = verify_manual_payment(payment, request.user)
		except ChapaError as exc:
			return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)
		return Response(PaymentSerializer(payment).data)

	@action(
		detail=False,
		methods=["post"],
		permission_classes=[permissions.AllowAny],
		url_path="chapa-initiate",
	)
	def chapa_initiate(self, request):
		if not settings.CHAPA_SECRET_KEY:
			return Response(
				{"detail": "Chapa checkout is not configured."},
				status=status.HTTP_503_SERVICE_UNAVAILABLE,
			)
		booking_reference = request.data.get("booking_reference", "").strip()
		guest_email = request.data.get("email", "").strip()
		if not booking_reference or not guest_email:
			return Response(
				{"detail": "booking_reference and guest email are required."},
				status=status.HTTP_400_BAD_REQUEST,
			)

		expire_booking_holds()
		try:
			booking = Booking.objects.select_related("guest").get(
				booking_reference=booking_reference
			)
		except Booking.DoesNotExist:
			return Response({"detail": "Booking not found."}, status=status.HTTP_404_NOT_FOUND)
		if not booking.guest.email or booking.guest.email.casefold() != guest_email.casefold():
			return Response({"detail": "Guest email does not match this booking."}, status=400)

		with transaction.atomic():
			booking = Booking.objects.select_for_update().select_related("guest").get(pk=booking.pk)
			if (
				booking.booking_status != Booking.BookingStatus.HOLD
				or not booking.hold_expires_at
				or booking.hold_expires_at <= timezone.now()
			):
				return Response({"detail": "This booking hold has expired or is no longer payable."}, status=409)
			if booking.balance_due <= 0:
				return Response({"detail": "This booking has no outstanding balance."}, status=409)
			pending_payment = Payment.objects.filter(
				booking=booking,
				payment_method=Payment.PaymentMethod.CHAPA,
				status=Payment.Status.PENDING,
			).first()
			if pending_payment:
				if pending_payment.provider_checkout_url:
					return Response({"checkout_url": pending_payment.provider_checkout_url})
				return Response({"detail": "A payment attempt is already being initialized."}, status=409)
			payment = Payment.objects.create(
				booking=booking,
				amount=booking.balance_due,
				transaction_reference=f"{booking.booking_reference}-{uuid.uuid4().hex[:24]}",
				payment_method=Payment.PaymentMethod.CHAPA,
				status=Payment.Status.PENDING,
			)

		callback_url = settings.CHAPA_CALLBACK_URL or request.build_absolute_uri(reverse("chapa-callback"))
		return_url = (
			f"{settings.FRONTEND_URL}/booking/confirmation/{booking.booking_reference}?"
			f"{urlencode({'tx_ref': payment.transaction_reference})}"
		)
		try:
			checkout_url = initialize_transaction(
				payment,
				callback_url=callback_url,
				return_url=return_url,
			)
		except ChapaError:
			payment.status = Payment.Status.FAILED
			payment.save(update_fields=("status",))
			return Response(
				{"detail": "Unable to start Chapa checkout. Please retry or contact the hotel."},
				status=status.HTTP_502_BAD_GATEWAY,
			)
		payment.provider_checkout_url = checkout_url
		payment.save(update_fields=("provider_checkout_url",))
		return Response({"checkout_url": checkout_url})

	@action(
		detail=False,
		methods=["post"],
		permission_classes=[permissions.AllowAny],
		url_path="chapa-verify-return",
	)
	def chapa_verify_return(self, request):
		transaction_reference = request.data.get("tx_ref", "").strip()
		if not transaction_reference:
			return Response({"detail": "tx_ref is required."}, status=400)
		result, response_status = _settle_chapa_reference(transaction_reference)
		if result is None:
			return Response({"detail": "Unable to verify Chapa transaction."}, status=response_status)
		return Response(result)

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
