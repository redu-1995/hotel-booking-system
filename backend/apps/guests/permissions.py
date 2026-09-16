from rest_framework import permissions


class IsGuestStaff(permissions.BasePermission):
    allowed_roles = {"ADMIN", "MANAGER", "RECEPTIONIST"}

    def has_permission(self, request, view):
        user = request.user
        return bool(
            user.is_authenticated
            and user.is_staff
            and (user.is_superuser or user.role in self.allowed_roles)
        )