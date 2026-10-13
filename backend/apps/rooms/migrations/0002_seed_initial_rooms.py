from django.db import migrations


ROOM_TYPES = [
    {
        "name": "Standard King",
        "description": "Comfortable room with a king bed, work area, and modern bathroom.",
        "max_guests": 2,
        "bed_type": "KING",
        "base_price": "89.00",
        "amenities": "WiFi, Smart TV, Work Desk, Air Conditioning, Safe",
        "rooms": ["101", "102", "103", "104"],
    },
    {
        "name": "Deluxe Queen",
        "description": "Bright deluxe room with a queen bed and a relaxed sitting area.",
        "max_guests": 2,
        "bed_type": "QUEEN",
        "base_price": "109.00",
        "amenities": "WiFi, Smart TV, Air Conditioning, Minibar, Safe, Coffee Maker",
        "rooms": ["201", "202", "203", "204"],
    },
    {
        "name": "Twin Room",
        "description": "Flexible room with two twin beds, suitable for friends or colleagues.",
        "max_guests": 2,
        "bed_type": "TWIN",
        "base_price": "99.00",
        "amenities": "WiFi, Smart TV, Work Desk, Air Conditioning, Safe",
        "rooms": ["301", "302", "303", "304"],
    },
    {
        "name": "Family Double",
        "description": "Spacious room with two double beds for families or small groups.",
        "max_guests": 4,
        "bed_type": "DOUBLE",
        "base_price": "139.00",
        "amenities": "WiFi, Smart TV, Minibar, Air Conditioning, Safe, Seating Area",
        "rooms": ["401", "402", "403", "404"],
    },
    {
        "name": "Master Suite",
        "description": "Premium suite with a master king bed, sofa bed, and separate lounge area.",
        "max_guests": 4,
        "bed_type": "SUITE_MASTER",
        "base_price": "229.00",
        "amenities": "WiFi, Smart TV, Balcony, Minibar, Safe, Coffee Maker, Lounge Area, Bathrobe",
        "rooms": ["501", "502", "503", "504"],
    },
]


def seed_rooms(apps, schema_editor):
    RoomType = apps.get_model("rooms", "RoomType")
    Room = apps.get_model("rooms", "Room")
    database = schema_editor.connection.alias

    for data in ROOM_TYPES:
        room_type, _ = RoomType.objects.using(database).get_or_create(
            name=data["name"],
            defaults={key: value for key, value in data.items() if key != "rooms"},
        )
        for room_number in data["rooms"]:
            Room.objects.using(database).get_or_create(
                room_number=room_number,
                defaults={"room_type_id": room_type.pk, "status": "AVAILABLE"},
            )


def unseed_rooms(apps, schema_editor):
    # Keep seeded catalog data when reversing; rooms may have bookings by then.
    pass


class Migration(migrations.Migration):
    dependencies = [("rooms", "0001_initial")]

    operations = [migrations.RunPython(seed_rooms, unseed_rooms)]



