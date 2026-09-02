from django.contrib import admin
from .models import Payment


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "booking",
        "amount",
        "payment_method",
        "status",
        "transaction_reference",
        "submitted_at",
        "verified_by",
    )
    list_filter = ("status", "payment_method", "submitted_at")
    search_fields = ("transaction_reference", "booking__booking_reference", "notes")
    autocomplete_fields = ("booking", "verified_by")
