import uuid
from decimal import Decimal
from django.conf import settings
from django.core.exceptions import ValidationError
from django.db import models


def generate_booking_reference() -> str:
    """Generates unique formatted booking reference like 'BK-A9F32B'."""
    return f"BK-{uuid.uuid4().hex[:8].upper()}"


class Booking(models.Model):
    """
    Hotel reservation record matching 'bookings' table in database diagram.
    """

    class BookingSource(models.TextChoices):
        DIRECT = "DIRECT", "Direct / Website"
        WALK_IN = "WALK_IN", "Front Desk Walk-In"
        BOOKING_COM = "BOOKING_COM", "Booking.com"
        EXPEDIA = "EXPEDIA", "Expedia"
        AIRBNB = "AIRBNB", "Airbnb"
        CORPORATE = "CORPORATE", "Corporate Partner"

    class BookingStatus(models.TextChoices):
        HOLD = "HOLD", "On Hold (Awaiting Payment)"
        CONFIRMED = "CONFIRMED", "Confirmed"
        CHECKED_IN = "CHECKED_IN", "Checked In"
        CHECKED_OUT = "CHECKED_OUT", "Checked Out"
        CANCELLED = "CANCELLED", "Cancelled"
        NO_SHOW = "NO_SHOW", "No Show"

    guest = models.ForeignKey(
        "guests.Guest",
        on_delete=models.PROTECT,
        related_name="bookings",
        help_text="Guest holding the reservation",
    )
    booking_reference = models.CharField(
        max_length=50,
        unique=True,
        default=generate_booking_reference,
        db_index=True,
    )
    room = models.ForeignKey(
        "rooms.Room",
        on_delete=models.PROTECT,
        related_name="bookings",
    )
    check_in_date = models.DateField(db_index=True)
    check_out_date = models.DateField(db_index=True)
    number_of_guests = models.PositiveIntegerField(default=1)

    booking_source = models.CharField(
        max_length=50,
        choices=BookingSource.choices,
        default=BookingSource.DIRECT,
    )
    booking_status = models.CharField(
        max_length=50,
        choices=BookingStatus.choices,
        default=BookingStatus.HOLD,
    )
    hold_expires_at = models.DateTimeField(
        null=True,
        blank=True,
        help_text="Auto-cancellation deadline for unpaid hold reservations",
    )

    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    advance_amount = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal("0.00"))

    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="created_bookings",
        help_text="Staff user who processed the reservation",
    )
    actual_check_in = models.DateTimeField(null=True, blank=True)
    actual_check_out = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "bookings"
        verbose_name = "Booking"
        verbose_name_plural = "Bookings"
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["booking_reference"]),
            models.Index(fields=["check_in_date", "check_out_date"]),
            models.Index(fields=["booking_status"]),
        ]

    def clean(self):
        # 1. Validate dates
        if self.check_in_date and self.check_out_date:
            if self.check_out_date <= self.check_in_date:
                raise ValidationError({"check_out_date": "Check-out date must be strictly after check-in date."})

        # 2. Check room guest capacity
        if self.room_id and hasattr(self.room, "room_type"):
            if self.number_of_guests > self.room.room_type.max_guests:
                raise ValidationError({
                    "number_of_guests": f"Selected room allows a maximum of {self.room.room_type.max_guests} guests."
                })

        # 3. Check overlapping bookings for the same room
        if self.room_id and self.check_in_date and self.check_out_date:
            active_statuses = [self.BookingStatus.HOLD, self.BookingStatus.CONFIRMED, self.BookingStatus.CHECKED_IN]
            overlap = Booking.objects.filter(
                room=self.room,
                booking_status__in=active_statuses,
                check_in_date__lt=self.check_out_date,
                check_out_date__gt=self.check_in_date,
            )
            if self.pk:
                overlap = overlap.exclude(pk=self.pk)

            if overlap.exists():
                raise ValidationError(f"Room {self.room.room_number} is already booked for the selected dates.")

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)

    def __str__(self) -> str:
        return f"[{self.booking_reference}] {self.guest.full_name} - Room {self.room.room_number} ({self.get_booking_status_display()})"

    @property
    def nights(self) -> int:
        return max(1, (self.check_out_date - self.check_in_date).days)

    @property
    def total_paid(self) -> Decimal:
        completed_payments = self.payments.filter(status="COMPLETED").aggregate(
            total=models.Sum("amount")
        )["total"]
        return completed_payments or Decimal("0.00")

    @property
    def balance_due(self) -> Decimal:
        return max(Decimal("0.00"), self.total_amount - self.total_paid)

    @property
    def is_fully_paid(self) -> bool:
        return self.total_paid >= self.total_amount
