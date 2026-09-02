from django.contrib import admin
from .models import Booking


@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = (
        "booking_reference",
        "guest",
        "room",
        "check_in_date",
        "check_out_date",
        "booking_status",
        "total_amount",
        "advance_amount",
        "created_at",
    )
    list_filter = ("booking_status", "booking_source", "check_in_date", "check_out_date")
    search_fields = ("booking_reference", "guest__full_name", "guest__phone", "room__room_number")
    autocomplete_fields = ("guest", "room", "created_by")
    readonly_fields = ("created_at",)
