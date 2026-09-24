from rest_framework import permissions


class IsStaffBookingUser(permissions.IsAuthenticated):
    def has_permission(self, request, view):
        if request.method == "POST" and view.action == "create":
            return True
        return super().has_permission(request, view) and request.user.is_staff