from django.contrib import admin

from .models import Notification


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ("title", "notification_type", "booking", "recipient_user", "recipient_guest", "is_read", "created_at")
    list_filter = ("notification_type", "is_read", "created_at")
    search_fields = ("booking__booking_reference", "title", "message")