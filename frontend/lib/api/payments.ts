import { apiFetch, apiList } from "./client";

export type PaymentStatus = "PENDING" | "COMPLETED" | "FAILED" | "REFUNDED";

export type Payment = {
  id: number;
  booking: number;
  booking_details: {
    id: number;
    booking_reference: string;
    guest_name: string;
    total_amount: string;
    balance_due: string;
    booking_status: string;
  };
  amount: string;
  transaction_reference: string | null;
  payment_method: string;
  status: PaymentStatus;
  submitted_at: string;
  verified_by: number | null;
  verified_by_name: string | null;
  verified_at: string | null;
  notes: string;
};

export function getPayments(query = "") { return apiList<Payment>(`/payments/${query ? `?${query}` : ""}`); }
export type PaymentCreatePayload = {
  booking: number;
  amount: string;
  transaction_reference?: string | null;
  payment_method: string;
  notes?: string;
};
export function createPayment(payload: PaymentCreatePayload) { return apiFetch<Payment>("/payments/", { method: "POST", body: payload }); }
export function initiateChapaPayment(bookingReference: string, email: string) {
  return apiFetch<{ checkout_url: string }>("/payments/chapa-initiate/", {
    method: "POST",
    body: { booking_reference: bookingReference, email },
  });
}
export function verifyPayment(id: number) { return apiFetch<Payment>(`/payments/${id}/verify/`, { method: "POST" }); }
