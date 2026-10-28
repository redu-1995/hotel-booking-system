import type { BookingStatus, PaymentStatus } from "@/lib/api/bookings";

const bookingStyles: Record<BookingStatus, string> = {
	HOLD: "border-[#ead6a4] bg-[#fff8e6] text-[#815f19]",
	CONFIRMED: "border-[#c9ddca] bg-[#eef7ee] text-[#3d6841]",
	CHECKED_IN: "border-[#c6d9d4] bg-[#edf6f3] text-[#315d50]",
	CHECKED_OUT: "border-[#cdd9e7] bg-[#f0f5fa] text-[#48627d]",
	CANCELLED: "border-[#e5c7c3] bg-[#fbf0ee] text-[#8a5048]",
	NO_SHOW: "border-[#d8d2cf] bg-[#f5f2f0] text-[#70615a]",
};

const paymentStyles: Record<PaymentStatus, string> = {
	PENDING: "border-[#ead6a4] bg-[#fff8e6] text-[#815f19]",
	COMPLETED: "border-[#c9ddca] bg-[#eef7ee] text-[#3d6841]",
	FAILED: "border-[#e5c7c3] bg-[#fbf0ee] text-[#8a5048]",
	REFUNDED: "border-[#cdd9e7] bg-[#f0f5fa] text-[#48627d]",
};

function readable(value: string) {
	return value.toLowerCase().replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function BookingStatusBadge({ status }: { status: BookingStatus }) {
	return <span className={`inline-flex border px-2 py-1 text-xs font-semibold ${bookingStyles[status]}`}>{readable(status)}</span>;
}

export function PaymentStatusBadge({ status }: { status: PaymentStatus | null }) {
	if (!status) return <span className="text-xs text-[#7b857d]">No payment</span>;
	return <span className={`inline-flex border px-2 py-1 text-xs font-semibold ${paymentStyles[status]}`}>{readable(status)}</span>;
}