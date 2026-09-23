from django.urls import path
from rest_framework.routers import DefaultRouter

from .views import (
    CurrentUserView,
    CsrfTokenView,
    LoginView,
    LogoutView,
    PasswordChangeView,
    UserViewSet,
)

router = DefaultRouter()
router.register("users", UserViewSet, basename="user")

urlpatterns = [
    path("auth/csrf/", CsrfTokenView.as_view(), name="csrf-token"),
    path("auth/login/", LoginView.as_view(), name="login"),
    path("auth/logout/", LogoutView.as_view(), name="logout"),
    path("auth/me/", CurrentUserView.as_view(), name="current-user"),
    path("auth/change-password/", PasswordChangeView.as_view(), name="change-password"),
]
urlpatterns += router.urls