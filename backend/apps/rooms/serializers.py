from rest_framework import serializers

from .models import Room, RoomType


class RoomTypeSummarySerializer(serializers.ModelSerializer):
    amenities_list = serializers.ReadOnlyField()

    class Meta:
        model = RoomType
        fields = (
            "id",
            "name",
            "max_guests",
            "bed_type",
            "base_price",
            "amenities_list",
        )


class RoomSerializer(serializers.ModelSerializer):
    is_available = serializers.ReadOnlyField()
    room_type_details = RoomTypeSummarySerializer(source="room_type", read_only=True)

    class Meta:
        model = Room
        fields = (
            "id",
            "room_type",
            "room_type_details",
            "room_number",
            "status",
            "created_at",
            "is_available",
        )
        read_only_fields = ("id", "created_at", "is_available", "room_type_details")


class RoomTypeSerializer(serializers.ModelSerializer):
    amenities_list = serializers.ReadOnlyField()
    rooms = RoomSerializer(many=True, read_only=True)

    class Meta:
        model = RoomType
        fields = (
            "id",
            "name",
            "description",
            "max_guests",
            "bed_type",
            "base_price",
            "amenities",
            "amenities_list",
            "created_at",
            "rooms",
        )
        read_only_fields = ("id", "created_at", "amenities_list", "rooms")

    def validate_name(self, value):
        if not value.strip():
            raise serializers.ValidationError("Name cannot be blank.")
        return value.strip()

    def validate_max_guests(self, value):
        if value < 1:
            raise serializers.ValidationError("Maximum guests must be at least 1.")
        return value

    def validate_base_price(self, value):
        if value < 0:
            raise serializers.ValidationError("Base price cannot be negative.")
        return value