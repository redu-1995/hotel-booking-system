from django.db import models


class Guest(models.Model):
    """
    Guest customer entity matching 'guests' table in database diagram.
    """

    full_name = models.CharField(max_length=150, db_index=True)
    phone = models.CharField(
        max_length=30,
        db_index=True,
        help_text="Primary phone with country code",
    )
    email = models.EmailField(
        max_length=255,
        blank=True,
        null=True,
        db_index=True,
        help_text="Optional guest email for invoice and confirmations",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "guests"
        verbose_name = "Guest"
        verbose_name_plural = "Guests"
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["phone"]),
            models.Index(fields=["email"]),
        ]

    def __str__(self) -> str:
        if self.email:
            return f"{self.full_name} ({self.phone} | {self.email})"
        return f"{self.full_name} ({self.phone})"

    @property
    def total_bookings_count(self) -> int:
        return self.bookings.count()
