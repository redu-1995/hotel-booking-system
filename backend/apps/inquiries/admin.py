from django.contrib import admin
from .models import Inquiry


@admin.register(Inquiry)
class InquiryAdmin(admin.ModelAdmin):
    list_display = ("name", "email", "phone", "subject", "source", "status", "assigned_to", "created_at")
    list_filter = ("status", "source", "preferred_room_type", "assigned_to")
    search_fields = ("name", "email", "phone", "subject", "message")
    autocomplete_fields = ("guest", "preferred_room_type", "assigned_to")
