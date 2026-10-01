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
  hold_expires_at: string | null;
  nights: number;
  balance_due: string;
  created_at: string;
};

export type GuestRegistrationPayload = {
  full_name: string;
  phone: string;
  email?: string | null;
};

type BookingFields = {
  room: number;
  check_in_date: string;
  check_out_date: string;
  number_of_guests: number;
  booking_source?: string;
  hold_expires_at?: string | null;
  advance_amount?: string | number;
};

export type BookingPayload = BookingFields & (
  | { guest: number; guest_info?: never }
  | { guest_info: GuestRegistrationPayload; guest?: never }
);

export type AvailableRoom = {
  id: number;
  room_number: string;
  status: string;
  room_type_id: number;
  room_type_name: string;
  max_guests: number;
  base_price: string;
};

export type BookingPaymentDetails = {
  booking_reference: string;
  booking_status: string;
  room_name: string;
  check_in_date: string;
  check_out_date: string;
  nights: number;
  number_of_guests: number;
  room_rate: string;
  room_subtotal: string;
  total_amount: string;
  amount_paid: string;
  payment_status: string | null;
  payment_method: string | null;
  transaction_reference: string | null;
  provider_reference: string | null;
  hotel_contact_email: string;
  hotel_contact_phone: string;
  chapa_enabled: boolean;
  hold_expires_at: string | null;
};

export function getBookings(query = "") { return apiList<Booking>(`/bookings/${query ? `?${query}` : ""}`); }
export function getBooking(id: number) { return apiFetch<Booking>(`/bookings/${id}/`); }
export function createBooking(payload: BookingPayload) { return apiFetch<Booking>("/bookings/", { method: "POST", body: payload }); }
export function getAvailability(checkIn: string, checkOut: string, guests: number) {
  const params = new URLSearchParams({ check_in_date: checkIn, check_out_date: checkOut, number_of_guests: String(guests) });
  return apiList<AvailableRoom>(`/bookings/availability/?${params}`);
}
export function getBookingPaymentDetails(reference: string) {
  const params = new URLSearchParams({ booking_reference: reference });
  return apiFetch<BookingPaymentDetails>(`/bookings/payment-details/?${params}`);
}
export function confirmBooking(id: number) { return apiFetch<Booking>(`/bookings/${id}/confirm/`, { method: "POST" }); }
export function cancelBooking(id: number) { return apiFetch<Booking>(`/bookings/${id}/cancel/`, { method: "POST" }); }
