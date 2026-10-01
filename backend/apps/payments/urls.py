from django.urls import path
from rest_framework.routers import DefaultRouter

from .views import PaymentViewSet, chapa_callback, chapa_webhook

router = DefaultRouter()
router.register("payments", PaymentViewSet, basename="payment")

urlpatterns = [
	path("payments/chapa/callback/", chapa_callback, name="chapa-callback"),
	path("payments/chapa/webhook/", chapa_webhook, name="chapa-webhook"),
] + router.urls