export type RoomType = { id: number; name: string; description: string; max_guests: number; bed_type: string; base_price: string; amenities_list: string[] };
export type Room = { id: number; room_number: string; status: string; is_available: boolean; room_type_details: RoomType };
export type StatusType = "pending" | "confirmed" | "cancelled" | "completed" | "responded";
export type RoomAvailability = "available" | "limited" | "unavailable";