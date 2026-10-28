from django.urls import path
from rest_framework.routers import DefaultRouter

from .access import (
	BookingAccessDetailsView,
	BookingAccessRequestCodeView,
	BookingAccessRetryPaymentView,
	BookingAccessVerifyCodeView,
)
from .views import BookingViewSet

router = DefaultRouter()
router.register("bookings", BookingViewSet, basename="booking")

urlpatterns = [
	path("booking-access/request-code/", BookingAccessRequestCodeView.as_view(), name="booking-access-request-code"),
	path("booking-access/verify-code/", BookingAccessVerifyCodeView.as_view(), name="booking-access-verify-code"),
	path("booking-access/booking/", BookingAccessDetailsView.as_view(), name="booking-access-booking"),
	path("booking-access/retry-payment/", BookingAccessRetryPaymentView.as_view(), name="booking-access-retry-payment"),
] + router.urls