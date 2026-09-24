import { apiFetch, apiList } from "./client";

export type Booking = {
  id: number;
  booking_reference: string;
  guest: number;
  room: number;
  check_in_date: string;
  check_out_date: string;
  number_of_guests: number;
  booking_source: string;
  booking_status: string;
  total_amount: string;
  advance_amount: string;
  nights: number;
  balance_due: string;
  created_at: string;
};

export type BookingPayload = {
  guest: number;
  room: number;
  check_in_date: string;
  check_out_date: string;
  number_of_guests: number;
  booking_source?: string;
  hold_expires_at?: string | null;
  advance_amount?: string | number;
};

export type AvailableRoom = {
  id: number;
  room_number: string;
  status: string;
  room_type_name: string;
  max_guests: number;
  base_price: string;
};

export function getBookings(query = "") { return apiList<Booking>(`/bookings/${query ? `?${query}` : ""}`); }
export function getBooking(id: number) { return apiFetch<Booking>(`/bookings/${id}/`); }
export function createBooking(payload: BookingPayload) { return apiFetch<Booking>("/bookings/", { method: "POST", body: payload }); }
export function getAvailability(checkIn: string, checkOut: string, guests: number) {
  const params = new URLSearchParams({ check_in_date: checkIn, check_out_date: checkOut, number_of_guests: String(guests) });
  return apiList<AvailableRoom>(`/bookings/availability/?${params}`);
}
export function confirmBooking(id: number) { return apiFetch<Booking>(`/bookings/${id}/confirm/`, { method: "POST" }); }
export function cancelBooking(id: number) { return apiFetch<Booking>(`/bookings/${id}/cancel/`, { method: "POST" }); }
