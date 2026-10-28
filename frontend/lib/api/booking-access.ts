import { apiFetch } from "./client";

export type ManagedBooking = {
	booking_reference: string;
	booking_status: string;
	room_name: string;
	room_number: string;
	check_in_date: string;
	check_out_date: string;
	nights: number;
	number_of_guests: number;
	total_amount: string;
	advance_amount: string;
	amount_paid: string;
	amount_due: string;
	payment_status: string | null;
	transaction_reference: string | null;
	hold_expires_at: string | null;
	created_at: string;
	can_retry_payment: boolean;
	retry_message: string | null;
};

export function requestBookingAccessCode(bookingReference: string, email: string) {
	return apiFetch<{ detail: string }>("/booking-access/request-code/", {
		method: "POST",
		body: { booking_reference: bookingReference, email },
	});
}

export function verifyBookingAccessCode(bookingReference: string, email: string, code: string) {
	return apiFetch<{ expires_at: string }>("/booking-access/verify-code/", {
		method: "POST",
		body: { booking_reference: bookingReference, email, code },
	});
}

export function getManagedBooking() {
	return apiFetch<ManagedBooking>("/booking-access/booking/");
}

export function retryManagedBookingPayment() {
	return apiFetch<{
		checkout_url?: string;
		reused?: boolean;
		already_paid?: boolean;
		booking?: ManagedBooking;
	}>("/booking-access/retry-payment/", { method: "POST", body: {} });
}