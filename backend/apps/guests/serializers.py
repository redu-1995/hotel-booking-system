import re

from rest_framework import serializers

from .models import Guest


class GuestSerializer(serializers.ModelSerializer):
    total_bookings_count = serializers.ReadOnlyField()

    class Meta:
        model = Guest
        fields = (
            "id",
            "full_name",
            "phone",
            "email",
            "created_at",
            "total_bookings_count",
        )
        read_only_fields = ("id", "created_at", "total_bookings_count")

    def validate_full_name(self, value):
        value = " ".join(value.split())
        if not value:
            raise serializers.ValidationError("Full name cannot be blank.")
        return value

    def validate_phone(self, value):
        value = value.strip()
        normalized = re.sub(r"[\s().-]", "", value)
        if not re.fullmatch(r"\+?[0-9]{7,15}", normalized):
            raise serializers.ValidationError(
                "Enter a valid phone number with 7 to 15 digits."
            )
        return normalized

    def validate_email(self, value):
        return value.strip().lower() if value else None