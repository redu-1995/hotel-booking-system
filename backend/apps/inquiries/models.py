from django.conf import settings
from django.db import models
from django.core.exceptions import ValidationError


class Inquiry(models.Model):
    """
    Lead / inquiry tracking matching 'inquiries' table in database diagram.
    """

    class Source(models.TextChoices):
        WEBSITE = "WEBSITE", "Website"
        PHONE = "PHONE", "Phone"
        EMAIL = "EMAIL", "Email"
        WALK_IN = "WALK_IN", "Walk-In"
        OTA = "OTA", "OTA / Partner"

    class Status(models.TextChoices):
        PENDING = "PENDING", "Pending"
        CONTACTED = "CONTACTED", "Contacted"
        QUOTED = "QUOTED", "Quoted"
        CONVERTED = "CONVERTED", "Converted to Booking"
        CANCELLED = "CANCELLED", "Cancelled"

    name = models.CharField(max_length=150)
    guest = models.ForeignKey(
        "guests.Guest",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="inquiries",
        help_text="Optional link to recognized guest profile",
    )
    preferred_room_type = models.ForeignKey(
        "rooms.RoomType",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="inquiries",
    )
    assigned_to = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="assigned_inquiries",
        help_text="Staff user assigned to follow up",
    )
    check_in_date = models.DateField()
    check_out_date = models.DateField()
    number_of_guests = models.PositiveIntegerField(default=1)
    message = models.TextField(blank=True, null=True)
    source = models.CharField(
        max_length=50,
        choices=Source.choices,
        default=Source.WEBSITE,
    )
    status = models.CharField(
        max_length=50,
        choices=Status.choices,
        default=Status.PENDING,
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "inquiries"
        verbose_name = "Inquiry"
        verbose_name_plural = "Inquiries"
        ordering = ["-created_at"]

    def clean(self):
        if self.check_out_date and self.check_in_date:
            if self.check_out_date <= self.check_in_date:
                raise ValidationError("Check-out date must be strictly after check-in date.")

    def __str__(self) -> str:
        return f"Inquiry #{self.id} - {self.name} ({self.check_in_date} to {self.check_out_date})"

    @property
    def nights_count(self) -> int:
        if self.check_out_date and self.check_in_date:
            return max(1, (self.check_out_date - self.check_in_date).days)
        return 1
