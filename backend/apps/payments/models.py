from django.conf import settings
from django.db import models
from django.utils import timezone


class Payment(models.Model):
    """
    Payment transaction record matching 'payments' table in database diagram.
    """

    class PaymentMethod(models.TextChoices):
        CREDIT_CARD = "CREDIT_CARD", "Credit Card"
        DEBIT_CARD = "DEBIT_CARD", "Debit Card"
        CASH = "CASH", "Cash"
        BANK_TRANSFER = "BANK_TRANSFER", "Bank Transfer"
        STRIPE = "STRIPE", "Stripe"
        PAYPAL = "PAYPAL", "PayPal"
        CHAPA = "CHAPA", "Chapa"

    class Status(models.TextChoices):
        PENDING = "PENDING", "Pending"
        COMPLETED = "COMPLETED", "Completed"
        FAILED = "FAILED", "Failed"
        REFUNDED = "REFUNDED", "Refunded"

    booking = models.ForeignKey(
        "bookings.Booking",
        on_delete=models.CASCADE,
        related_name="payments",
        help_text="Booking reservation for this payment",
    )
    amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        help_text="Monetary amount in standard currency",
    )
    transaction_reference = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        unique=True,
        help_text="Payment gateway transaction ID or receipt #",
    )
    provider_reference = models.CharField(max_length=100, blank=True, null=True)
    provider_checkout_url = models.URLField(max_length=1000, blank=True, null=True)
    payment_method = models.CharField(
        max_length=50,
        choices=PaymentMethod.choices,
        default=PaymentMethod.CREDIT_CARD,
    )
    status = models.CharField(
        max_length=50,
        choices=Status.choices,
        default=Status.PENDING,
    )
    submitted_at = models.DateTimeField(auto_now_add=True)
    verified_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="verified_payments",
        help_text="Staff user who verified or accepted this payment",
    )
    verified_at = models.DateTimeField(null=True, blank=True)
    notes = models.TextField(blank=True, null=True)

    class Meta:
        db_table = "payments"
        verbose_name = "Payment"
        verbose_name_plural = "Payments"
        ordering = ["-submitted_at"]
        indexes = [
            models.Index(fields=["transaction_reference"]),
            models.Index(fields=["status"]),
        ]

    def __str__(self) -> str:
        return f"Payment ${self.amount} ({self.get_payment_method_display()}) for {self.booking.booking_reference}"

    def mark_as_verified(self, user):
        """Audits payment by setting verified_by and verified_at timestamp."""
        self.verified_by = user
        self.verified_at = timezone.now()
        self.status = self.Status.COMPLETED
        self.save()
