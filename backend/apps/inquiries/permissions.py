from rest_framework import permissions


class InquiryPermission(permissions.BasePermission):
    staff_roles = {"ADMIN", "MANAGER", "RECEPTIONIST"}

    def has_permission(self, request, view):
        if view.action == "create" and request.method == "POST":
            return True
        user = request.user
        return bool(
            user.is_authenticated
            and user.is_staff
            and (user.is_superuser or user.role in self.staff_roles)
        )