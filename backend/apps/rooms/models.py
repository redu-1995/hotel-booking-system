from django.db import models


class RoomType(models.Model):
    """
    Room category definition matching 'room_types' table in database diagram.
    """

    class BedType(models.TextChoices):
        KING = "KING", "1 King Bed"
        QUEEN = "QUEEN", "1 Queen Bed"
        TWIN = "TWIN", "2 Twin Beds"
        DOUBLE = "DOUBLE", "2 Double Beds"
        SUITE_MASTER = "SUITE_MASTER", "Master King + Sofa Bed"

    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True, null=True)
    max_guests = models.PositiveIntegerField(default=2, help_text="Maximum allowed guest occupancy")
    bed_type = models.CharField(
        max_length=50,
        choices=BedType.choices,
        default=BedType.KING,
    )
    base_price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        help_text="Standard nightly rate in USD/local currency",
    )
    amenities = models.TextField(
        blank=True,
        help_text="Comma-separated amenities (e.g. WiFi, Smart TV, Balcony, Minibar)",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "room_types"
        verbose_name = "Room Type"
        verbose_name_plural = "Room Types"
        ordering = ["base_price"]

    def __str__(self) -> str:
        return f"{self.name} - ${self.base_price}/night (Max {self.max_guests} guests)"

    @property
    def amenities_list(self) -> list[str]:
        if not self.amenities:
            return []
        return [item.strip() for item in self.amenities.split(",") if item.strip()]


from django.db import models
from .models import RoomType  # or in same file


class Room(models.Model):
    """
    Individual hotel room matching 'rooms' table in database diagram.
    """

    class Status(models.TextChoices):
        AVAILABLE = "AVAILABLE", "Available"
        OCCUPIED = "OCCUPIED", "Occupied"
        RESERVED = "RESERVED", "Reserved"
        DIRTY = "DIRTY", "Dirty (Needs Housekeeping)"
        MAINTENANCE = "MAINTENANCE", "Under Maintenance"

    room_type = models.ForeignKey(
        "RoomType",
        on_delete=models.PROTECT,
        related_name="rooms",
        help_text="Category and pricing rules for this room",
    )
    room_number = models.CharField(
        max_length=20,
        unique=True,
        help_text="Unique room number or suite code",
    )
    status = models.CharField(
        max_length=50,
        choices=Status.choices,
        default=Status.AVAILABLE,
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "rooms"
        verbose_name = "Room"
        verbose_name_plural = "Rooms"
        ordering = ["room_number"]

    def __str__(self) -> str:
        return f"Room {self.room_number} ({self.room_type.name}) - {self.get_status_display()}"

    @property
    def is_available(self) -> bool:
        return self.status == self.Status.AVAILABLE
