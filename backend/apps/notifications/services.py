from django.contrib.auth import get_user_model

from .models import Notification


def create_booking_confirmed_notifications(booking):
    title = "Booking Confirmed"
    booking_reference = booking.booking_reference
    Notification.objects.get_or_create(
        recipient_guest=booking.guest,
        booking=booking,
        notification_type=Notification.Type.BOOKING_CONFIRMED,
        defaults={
            "title": title,
            "message": f"Your booking {booking_reference} has been confirmed.",
        },
    )

    staff_users = get_user_model().objects.filter(is_staff=True, is_active=True)
    Notification.objects.bulk_create(
        [
            Notification(
                recipient_user=user,
                booking=booking,
                notification_type=Notification.Type.BOOKING_CONFIRMED,
                title=title,
                message=(
                    f"Booking {booking_reference} for {booking.guest.full_name} "
                    f"in {booking.room.room_type.name} is confirmed."
                ),
            )
            for user in staff_users
        ],
        ignore_conflicts=True,
    )