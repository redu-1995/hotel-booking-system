import { apiFetch, apiList } from "./client";

export type Guest = {
  id: number;
  full_name: string;
  phone: string;
  email: string | null;
  created_at: string;
  total_bookings_count: number;
};

export type GuestPayload = Pick<Guest, "full_name" | "phone" | "email">;

export function getGuests(query = "") { return apiList<Guest>(`/guests/${query ? `?${query}` : ""}`); }
export function getGuest(id: number) { return apiFetch<Guest>(`/guests/${id}/`); }
export function createGuest(payload: GuestPayload) { return apiFetch<Guest>("/guests/", { method: "POST", body: payload }); }