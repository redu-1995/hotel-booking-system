import { apiFetch, apiList } from "./client";

export type Payment = {
  id: number;
  booking: number;
  amount: string;
  transaction_reference: string;
  payment_method: string;
  status: string;
  submitted_at: string;
  notes: string;
};

export function getPayments() { return apiList<Payment>("/payments/", { next: { revalidate: 30 } }); }
export function createPayment(payload: Omit<Payment, "id" | "status" | "submitted_at">) { return apiFetch<Payment>("/payments/", { method: "POST", body: payload }); }
export function initiateChapaPayment(bookingReference: string, email: string) {
  return apiFetch<{ checkout_url: string }>("/payments/chapa-initiate/", {
    method: "POST",
    body: { booking_reference: bookingReference, email },
  });
}
export function verifyPayment(id: number) { return apiFetch<Payment>(`/payments/${id}/verify/`, { method: "POST" }); }
