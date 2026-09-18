import type { Room, RoomType } from "@/types";
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api";
export async function getRooms(): Promise<Room[]> {
  try { const response = await fetch(`${API_URL}/rooms/`, { next: { revalidate: 60 } }); if (!response.ok) throw new Error(); return response.json(); } catch { return fallbackRooms; }
}
export async function getRoomTypes(): Promise<RoomType[]> {
  try { const response = await fetch(`${API_URL}/room-types/`, { next: { revalidate: 60 } }); if (!response.ok) throw new Error(); return response.json(); } catch { return fallbackRooms.map((room) => room.room_type_details); }
}
const makeType = (id: number, name: string, description: string, price: string, amenities: string[]): RoomType => ({ id, name, description, max_guests: 2, bed_type: "King bed", base_price: price, amenities_list: amenities });
export const fallbackRooms: Room[] = [
  { id: 1, room_number: "A01", status: "available", is_available: true, room_type_details: makeType(1, "The Garden Room", "A sunlit retreat with a private terrace and views into our old frangipani garden.", "185.00", ["Private terrace", "Rain shower", "Breakfast included"]) },
  { id: 2, room_number: "B04", status: "available", is_available: true, room_type_details: makeType(2, "The Atelier Suite", "A generous suite for slow mornings, with hand-finished furniture and a deep soaking tub.", "260.00", ["Living room", "Soaking tub", "Late checkout"]) },
  { id: 3, room_number: "C12", status: "available", is_available: true, room_type_details: makeType(3, "The Courtyard King", "A calm, textural room opening onto a leafy shared courtyard at the center of the house.", "220.00", ["Courtyard access", "King bed", "Daily minibar"]) },
];