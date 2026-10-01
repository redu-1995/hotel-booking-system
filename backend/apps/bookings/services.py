from django.utils import timezone

from .models import Booking


def expire_booking_holds(now=None):
    now = now or timezone.now()
    return Booking.objects.filter(
        booking_status=Booking.BookingStatus.HOLD,
        hold_expires_at__lte=now,
    ).update(booking_status=Booking.BookingStatus.CANCELLED)