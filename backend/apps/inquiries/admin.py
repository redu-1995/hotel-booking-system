from django.contrib import admin
from .models import Inquiry


@admin.register(Inquiry)
class InquiryAdmin(admin.ModelAdmin):
    list_display = ("name", "source", "status", "check_in_date", "check_out_date", "assigned_to", "created_at")
    list_filter = ("status", "source", "preferred_room_type", "assigned_to")
    search_fields = ("name", "message")
    autocomplete_fields = ("guest", "preferred_room_type", "assigned_to")
