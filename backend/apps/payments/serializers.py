from decimal import Decimal

from rest_framework import serializers

from apps.bookings.models import Booking

from .models import Payment


class BookingPaymentSummarySerializer(serializers.ModelSerializer):
    guest_name = serializers.CharField(source="guest.full_name", read_only=True)
    balance_due = serializers.ReadOnlyField()

    class Meta:
        model = Booking
        fields = (
            "id",
            "booking_reference",
            "guest_name",
            "total_amount",
            "balance_due",
            "booking_status",
        )


class PaymentSerializer(serializers.ModelSerializer):
    booking_details = BookingPaymentSummarySerializer(source="booking", read_only=True)
    verified_by_name = serializers.CharField(
        source="verified_by.get_full_name", read_only=True
    )

    class Meta:
        model = Payment
        fields = (
            "id",
            "booking",
            "booking_details",
            "amount",
            "transaction_reference",
            "payment_method",
            "status",
            "submitted_at",
            "verified_by",
            "verified_by_name",
            "verified_at",
            "notes",
        )
        read_only_fields = (
            "id",
            "status",
            "submitted_at",
            "verified_by",
            "verified_by_name",
            "verified_at",
            "booking_details",
        )


class PaymentCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = (
            "booking",
            "amount",
            "transaction_reference",
            "payment_method",
            "notes",
        )

    def validate_amount(self, value):
        if value <= Decimal("0.00"):
            raise serializers.ValidationError("Payment amount must be greater than zero.")
        return value

    def validate(self, attrs):
        booking = attrs["booking"]
        if booking.booking_status in (
            Booking.BookingStatus.CANCELLED,
            Booking.BookingStatus.CHECKED_OUT,
        ):
            raise serializers.ValidationError(
                {"booking": "Payments cannot be added to this booking."}
            )
        if attrs["amount"] > booking.balance_due:
            raise serializers.ValidationError(
                {"amount": "Payment amount cannot exceed the booking balance due."}
            )
        return attrs

    def create(self, validated_data):
        return Payment.objects.create(status=Payment.Status.PENDING, **validated_data)