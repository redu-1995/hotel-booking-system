from django.contrib.auth import get_user_model
from rest_framework import serializers

from apps.guests.models import Guest
from apps.rooms.models import Room, RoomType

from .models import Inquiry

User = get_user_model()


class InquirySerializer(serializers.ModelSerializer):
    guest_name = serializers.CharField(source="guest.full_name", read_only=True)
    preferred_room_type_name = serializers.CharField(
        source="preferred_room_type.name", read_only=True
    )
    assigned_to_name = serializers.CharField(
        source="assigned_to.get_full_name", read_only=True
    )
    nights_count = serializers.ReadOnlyField()

    class Meta:
        model = Inquiry
        fields = (
            "id",
            "name",
            "guest",
            "guest_name",
            "preferred_room_type",
            "preferred_room_type_name",
            "assigned_to",
            "assigned_to_name",
            "check_in_date",
            "check_out_date",
            "number_of_guests",
            "message",
            "source",
            "status",
            "created_at",
            "nights_count",
        )
        read_only_fields = (
            "id",
            "assigned_to",
            "assigned_to_name",
            "status",
            "created_at",
            "nights_count",
            "guest_name",
            "preferred_room_type_name",
        )

    def validate_name(self, value):
        value = " ".join(value.split())
        if not value:
            raise serializers.ValidationError("Name cannot be blank.")
        return value

    def validate_number_of_guests(self, value):
        if value < 1:
            raise serializers.ValidationError("Number of guests must be at least 1.")
        return value

    def validate(self, attrs):
        check_in = attrs.get("check_in_date", getattr(self.instance, "check_in_date", None))
        check_out = attrs.get("check_out_date", getattr(self.instance, "check_out_date", None))
        if check_out <= check_in:
            raise serializers.ValidationError(
                {"check_out_date": "Check-out date must be strictly after check-in date."}
            )

        room_type = attrs.get(
            "preferred_room_type",
            getattr(self.instance, "preferred_room_type", None),
        )
        number_of_guests = attrs.get(
            "number_of_guests",
            getattr(self.instance, "number_of_guests", 1),
        )
        if room_type and number_of_guests > room_type.max_guests:
            raise serializers.ValidationError(
                {
                    "number_of_guests": (
                        f"Selected room type allows a maximum of {room_type.max_guests} guests."
                    )
                }
            )
        return attrs


class InquiryCreateSerializer(InquirySerializer):
    class Meta(InquirySerializer.Meta):
        fields = tuple(
            field for field in InquirySerializer.Meta.fields
            if field not in ("assigned_to", "assigned_to_name", "status")
        )


class InquiryStatusSerializer(serializers.Serializer):
    status = serializers.ChoiceField(choices=Inquiry.Status.choices)


class InquiryAssignmentSerializer(serializers.Serializer):
    assigned_to = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.filter(is_active=True, is_staff=True),
        allow_null=True,
    )

    def validate_assigned_to(self, user):
        if user is not None and user.role == User.Role.HOUSEKEEPING:
            raise serializers.ValidationError(
                "Housekeeping staff cannot be assigned inquiries."
            )
        return user