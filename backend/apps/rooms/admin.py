from django.contrib import admin
from .models import RoomType


@admin.register(RoomType)
class RoomTypeAdmin(admin.ModelAdmin):
    list_display = ("name", "bed_type", "max_guests", "base_price", "created_at")
    list_filter = ("bed_type", "max_guests")
    search_fields = ("name", "description", "amenities")
    ordering = ("base_price",)


from django.contrib import admin
from .models import Room


@admin.register(Room)
class RoomAdmin(admin.ModelAdmin):
    list_display = ("room_number", "room_type", "status", "created_at")
    list_filter = ("status", "room_type")
    search_fields = ("room_number", "room_type__name")
    list_editable = ("status",)
    autocomplete_fields = ("room_type",)
