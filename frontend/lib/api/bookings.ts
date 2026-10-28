import { apiFetch, apiList } from "./client";

export type BookingStatus = "HOLD" | "CONFIRMED" | "CHECKED_IN" | "CHECKED_OUT" | "CANCELLED" | "NO_SHOW";
export type PaymentStatus = "PENDING" | "COMPLETED" | "FAILED" | "REFUNDED";

export type BookingPage = {
  count: number;
  next: string | null;
  previous: string | null;
  results: Booking[];
};

export type BookingSummary = {
  date: string;
  total_bookings: number;
  confirmed_bookings: number;
  checked_in_bookings: number;
  todays_arrivals: number;
  todays_departures: number;
  occupied_rooms: number;
  total_rooms: number;
  available_rooms: number;
  reserved_rooms: number;
  dirty_rooms: number;
  maintenance_rooms: number;
  occupancy_rate: number;
};

export type BookingFilters = {
  search?: string;
  booking_status?: BookingStatus;
  payment_status?: PaymentStatus;
  booking_source?: string;
  check_in_date?: string;
  page?: number;
  page_size?: number;
};

export type Booking = {
  id: number;
  booking_reference: string;
  guest: number;
  guest_details: { id: number; full_name: string; phone: string; email: string };
  room: number;
  room_details: {
    id: number;
    room_number: string;
    status: string;
    room_type_id: number;
    room_type_name: string;
    max_guests: number;
    base_price: string;
  };
  check_in_date: string;
  check_out_date: string;
  number_of_guests: number;
  booking_source: string;
  booking_status: BookingStatus;
  total_amount: string;
  advance_amount: string;
  hold_expires_at: string | null;
  nights: number;
  total_paid: string;
  balance_due: string;
  is_fully_paid: boolean;
  created_by: number | null;
  actual_check_in: string | null;
  actual_check_out: string | null;
  created_at: string;
  latest_payment: {
    status: PaymentStatus;
    amount: string;
    transaction_reference: string | null;
    payment_method: string;
    submitted_at: string;
    verified_at: string | null;
  } | null;
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
export function getAdminBookings(filters: BookingFilters = {}) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== "") params.set(key, String(value));
  });
  const query = params.toString();
  return apiFetch<BookingPage>(`/bookings/${query ? `?${query}` : ""}`);
}
export function getBookingSummary() { return apiFetch<BookingSummary>("/bookings/summary/"); }
export function checkInBooking(id: number) { return apiFetch<Booking>(`/bookings/${id}/check_in/`, { method: "POST" }); }
export function checkOutBooking(id: number) { return apiFetch<Booking>(`/bookings/${id}/check_out/`, { method: "POST" }); }
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
