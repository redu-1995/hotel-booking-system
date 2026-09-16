from rest_framework import permissions


class IsAuthenticatedStaff(permissions.IsAuthenticated):
    def has_permission(self, request, view):
        return super().has_permission(request, view) and request.user.is_staff


class IsAdminRole(permissions.BasePermission):
    def has_permission(self, request, view):
        user = request.user
        return bool(
            user.is_authenticated
            and user.is_staff
            and (user.is_superuser or user.role == user.Role.ADMIN)
        )