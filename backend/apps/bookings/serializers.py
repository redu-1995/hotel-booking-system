from decimal import Decimal
from datetime import timedelta

from django.core.exceptions import ValidationError as DjangoValidationError
from django.db import transaction
from django.db.models import Q
from django.utils import timezone
from rest_framework import serializers

from apps.guests.models import Guest
from apps.rooms.models import Room

from .services import expire_booking_holds
from .models import Booking


class GuestSummarySerializer(serializers.ModelSerializer):
    class Meta:
        model = Guest
        fields = ("id", "full_name", "phone", "email")


class RoomSummarySerializer(serializers.ModelSerializer):
    room_type_id = serializers.IntegerField(read_only=True)
    room_type_name = serializers.CharField(source="room_type.name", read_only=True)
    max_guests = serializers.IntegerField(source="room_type.max_guests", read_only=True)
    base_price = serializers.DecimalField(
        source="room_type.base_price",
        max_digits=10,
        decimal_places=2,
        read_only=True,
    )

    class Meta:
        model = Room
        fields = (
            "id",
            "room_number",
            "status",
            "room_type_id",
            "room_type_name",
            "max_guests",
            "base_price",
        )


class BookingSerializer(serializers.ModelSerializer):
    guest_details = GuestSummarySerializer(source="guest", read_only=True)
    room_details = RoomSummarySerializer(source="room", read_only=True)
    nights = serializers.ReadOnlyField()
    total_paid = serializers.ReadOnlyField()
    balance_due = serializers.ReadOnlyField()
    is_fully_paid = serializers.ReadOnlyField()

    class Meta:
        model = Booking
        fields = (
            "id",
            "booking_reference",
            "guest",
            "guest_details",
            "room",
            "room_details",
            "check_in_date",
            "check_out_date",
            "number_of_guests",
            "booking_source",
            "booking_status",
            "hold_expires_at",
            "total_amount",
            "advance_amount",
            "created_by",
            "actual_check_in",
            "actual_check_out",
            "created_at",
            "nights",
            "total_paid",
            "balance_due",
            "is_fully_paid",
        )
        read_only_fields = (
            "id",
            "booking_reference",
            "booking_status",
            "total_amount",
            "created_by",
            "actual_check_in",
            "actual_check_out",
            "created_at",
            "nights",
            "total_paid",
            "balance_due",
            "is_fully_paid",
            "guest_details",
            "room_details",
        )


class BookingCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Booking
        fields = (
            "guest",
            "room",
            "check_in_date",
            "check_out_date",
            "number_of_guests",
            "booking_source",
            "advance_amount",
        )

    def validate(self, attrs):
        check_in = attrs.get("check_in_date", getattr(self.instance, "check_in_date", None))
        check_out = attrs.get("check_out_date", getattr(self.instance, "check_out_date", None))
        if check_out <= check_in:
            raise serializers.ValidationError(
                {"check_out_date": "Check-out date must be strictly after check-in date."}
            )
        if check_in < timezone.localdate():
            raise serializers.ValidationError(
                {"check_in_date": "Check-in date cannot be in the past."}
            )

        room = attrs.get("room", getattr(self.instance, "room", None))
        if room.status != Room.Status.AVAILABLE:
            raise serializers.ValidationError(
                {"room": "This room is not operationally available."}
            )
        number_of_guests = attrs.get(
            "number_of_guests",
            getattr(self.instance, "number_of_guests", 1),
        )
        if number_of_guests < 1:
            raise serializers.ValidationError(
                {"number_of_guests": "At least one guest is required."}
            )
        if number_of_guests > room.room_type.max_guests:
            raise serializers.ValidationError(
                {
                    "number_of_guests": (
                        f"Selected room allows a maximum of {room.room_type.max_guests} guests."
                    )
                }
            )

        nights = (check_out - check_in).days
        total_amount = room.room_type.base_price * nights
        advance_amount = attrs.get(
            "advance_amount",
            getattr(self.instance, "advance_amount", Decimal("0.00")),
        )
        if advance_amount < 0:
            raise serializers.ValidationError(
                {"advance_amount": "Advance amount cannot be negative."}
            )
        if advance_amount > total_amount:
            raise serializers.ValidationError(
                {"advance_amount": "Advance amount cannot exceed the total amount."}
            )
        attrs["total_amount"] = total_amount
        return attrs

    def create(self, validated_data):
        user = self.context["request"].user
        created_by = user if user.is_authenticated and user.is_staff else None
        try:
            with transaction.atomic():
                expire_booking_holds()
                room = Room.objects.select_for_update().select_related("room_type").get(
                    pk=validated_data["room"].pk
                )
                if room.status != Room.Status.AVAILABLE:
                    raise serializers.ValidationError(
                        {"room": "This room is not operationally available."}
                    )

                now = timezone.now()
                active_bookings = Booking.objects.filter(
                    room=room,
                    check_in_date__lt=validated_data["check_out_date"],
                    check_out_date__gt=validated_data["check_in_date"],
                ).filter(
                    Q(booking_status__in=(
                        Booking.BookingStatus.CONFIRMED,
                        Booking.BookingStatus.CHECKED_IN,
                    ))
                    | Q(
                        booking_status=Booking.BookingStatus.HOLD,
                        hold_expires_at__gt=now,
                    )
                    | Q(
                        booking_status=Booking.BookingStatus.HOLD,
                        hold_expires_at__isnull=True,
                    )
                )
                if active_bookings.exists():
                    raise serializers.ValidationError(
                        {"room": "This room is no longer available for the selected dates."}
                    )

                validated_data["room"] = room
                validated_data["hold_expires_at"] = now + timedelta(minutes=15)
                validated_data["booking_status"] = Booking.BookingStatus.HOLD
                validated_data["booking_source"] = Booking.BookingSource.DIRECT
                return Booking.objects.create(created_by=created_by, **validated_data)
        except DjangoValidationError as exc:
            raise serializers.ValidationError(exc.message_dict if hasattr(exc, "message_dict") else exc.messages)


class BookingUpdateSerializer(BookingCreateSerializer):
    class Meta(BookingCreateSerializer.Meta):
        extra_kwargs = {
            field: {"required": False}
            for field in BookingCreateSerializer.Meta.fields
        }

    def update(self, instance, validated_data):
        total_amount = validated_data.pop("total_amount", instance.total_amount)
        for field, value in validated_data.items():
            setattr(instance, field, value)
        instance.total_amount = total_amount
        try:
            instance.save()
        except DjangoValidationError as exc:
            raise serializers.ValidationError(exc.message_dict if hasattr(exc, "message_dict") else exc.messages)
        return instance