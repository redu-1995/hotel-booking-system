from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    """
    Custom user model for Hotel Booking System staff & admins.
    Mapped to 'users' table in database diagram.
    """

    class Role(models.TextChoices):
        ADMIN = "ADMIN", "Admin"
        MANAGER = "MANAGER", "Manager"
        RECEPTIONIST = "RECEPTIONIST", "Receptionist"
        HOUSEKEEPING = "HOUSEKEEPING", "Housekeeping"

    role = models.CharField(
        max_length=50,
        choices=Role.choices,
        default=Role.RECEPTIONIST,
        help_text="Hotel staff role permissions level",
    )
    email = models.EmailField(
        max_length=255,
        unique=True,
        help_text="Primary email for staff communications",
    )
    first_name = models.CharField(max_length=100, blank=True)
    last_name = models.CharField(max_length=100, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "users"
        verbose_name = "Staff User"
        verbose_name_plural = "Staff Users"
        ordering = ["-created_at"]

    def __str__(self) -> str:
        full_name = self.get_full_name()
        if full_name:
            return f"{full_name} ({self.get_role_display()})"
        return f"{self.username} ({self.get_role_display()})"

    @property
    def is_admin_role(self) -> bool:
        return self.role in [self.Role.ADMIN, self.Role.MANAGER] or self.is_superuser

    @property
    def is_receptionist_role(self) -> bool:
        return self.role == self.Role.RECEPTIONIST
