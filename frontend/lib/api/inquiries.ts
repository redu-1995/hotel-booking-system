import { apiFetch, apiList } from "./client";

export type InquiryPayload = {
  name: string;
  email: string;
  phone: string;
  subject: string;
  preferred_room_type?: number | null;
  check_in_date?: string | null;
  check_out_date?: string | null;
  number_of_guests?: number;
  message: string;
  source?: string;
};

export type InquiryStatus = "PENDING" | "CONTACTED" | "QUOTED" | "CONVERTED" | "CANCELLED";

export type Inquiry = {
  id: number;
  name: string;
  email: string;
  phone: string;
  subject: string;
  preferred_room_type: number | null;
  preferred_room_type_name: string | null;
  check_in_date: string | null;
  check_out_date: string | null;
  number_of_guests: number;
  message: string | null;
  source: string;
  status: InquiryStatus;
  created_at: string;
  nights_count: number;
};

export function getInquiries(query = "") { return apiList<Inquiry>(`/inquiries/${query ? `?${query}` : ""}`); }
export function createInquiry(payload: InquiryPayload) { return apiFetch<Inquiry>("/inquiries/", { method: "POST", body: payload }); }
export function updateInquiryStatus(id: number, status: string) { return apiFetch(`/inquiries/${id}/status/`, { method: "POST", body: { status } }); }
