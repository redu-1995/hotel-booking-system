from rest_framework import serializers

from .models import Notification


class NotificationSerializer(serializers.ModelSerializer):
    booking_reference = serializers.CharField(source="booking.booking_reference", read_only=True)

    class Meta:
        model = Notification
        fields = (
            "id",
            "booking_reference",
            "notification_type",
            "title",
            "message",
            "is_read",
            "created_at",
        )
        read_only_fields = fields