import type { Room, RoomType } from "@/types";
import { apiFetch, apiList, getRoomTypes, getRooms } from "./client";

export { getRooms, getRoomTypes };

export function getRoom(id: number) {
	return apiFetch<Room>(`/rooms/${id}/`);
}

export function getRoomTypesForStaff() {
	return apiList<RoomType>("/room-types/");
}

export function getAvailableRooms() {
	return apiList<Room>("/rooms/?available=true");
}
