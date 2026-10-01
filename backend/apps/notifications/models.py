from django.conf import settings
from django.db import models


class Notification(models.Model):
    class Type(models.TextChoices):
        BOOKING_CONFIRMED = "BOOKING_CONFIRMED", "Booking confirmed"

    recipient_user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="notifications",
    )
    recipient_guest = models.ForeignKey(
        "guests.Guest",
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="notifications",
    )
    booking = models.ForeignKey(
        "bookings.Booking",
        on_delete=models.CASCADE,
        related_name="notifications",
    )
    notification_type = models.CharField(max_length=40, choices=Type.choices)
    title = models.CharField(max_length=150)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ("-created_at",)
        constraints = [
            models.UniqueConstraint(
                fields=("recipient_user", "booking", "notification_type"),
                condition=models.Q(recipient_user__isnull=False),
                name="unique_user_booking_notification",
            ),
            models.UniqueConstraint(
                fields=("recipient_guest", "booking", "notification_type"),
                condition=models.Q(recipient_guest__isnull=False),
                name="unique_guest_booking_notification",
            ),
        ]

    def __str__(self):
        return f"{self.title}: {self.booking.booking_reference}"