import { apiFetch, apiList } from "./client";

export type InquiryPayload = {
  name: string;
  guest?: number | null;
  preferred_room_type?: number | null;
  check_in_date: string;
  check_out_date: string;
  number_of_guests: number;
  message: string;
  source?: string;
};

export type Inquiry = { id: number; created_at: string; status: string };

export function getInquiries(query = "") { return apiList(`/inquiries/${query ? `?${query}` : ""}`); }
export function createInquiry(payload: InquiryPayload) { return apiFetch<Inquiry>("/inquiries/", { method: "POST", body: payload }); }
export function updateInquiryStatus(id: number, status: string) { return apiFetch(`/inquiries/${id}/status/`, { method: "POST", body: { status } }); }
