"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, LogIn, LogOut, RefreshCw } from "lucide-react";

import { BookingStatusBadge, PaymentStatusBadge } from "@/components/dashboard/BookingStatusBadge";
import { ApiError } from "@/lib/api/client";
import { checkInBooking, checkOutBooking, getBooking, type Booking } from "@/lib/api/bookings";

function formatTimestamp(value: string | null) {
	if (!value) return "Not recorded";
	return new Intl.DateTimeFormat("en", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

function formatDate(value: string) {
	return new Intl.DateTimeFormat("en", { day: "numeric", month: "long", year: "numeric" }).format(new Date(`${value}T00:00:00`));
}

function formatAmount(value: string) {
	return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(Number(value));
}

export default function AdminBookingDetails({ id }: { id: number }) {
	const [booking, setBooking] = useState<Booking | null>(null);
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		let active = true;
		getBooking(id)
			.then((result) => { if (active) setBooking(result); })
			.catch((requestError: unknown) => {
				if (!active) return;
				setError(requestError instanceof ApiError && requestError.status === 404
					? "This booking could not be found. It may have been removed or the ID is incorrect."
					: requestError instanceof ApiError && [401, 403].includes(requestError.status)
						? "Your staff session is no longer authorized. Sign in again to continue."
						: requestError instanceof Error ? requestError.message : "Unable to load this booking.");
			})
			.finally(() => { if (active) setLoading(false); });
		return () => { active = false; };
	}, [id]);

	async function updateStay(action: "check_in" | "check_out") {
		if (!booking) return;
		const verb = action === "check_in" ? "check in" : "check out";
		if (!window.confirm(`Confirm ${verb} for ${booking.guest_details.full_name}, booking ${booking.booking_reference}?`)) return;
		setSaving(true);
		setError(null);
		try {
			const updated = action === "check_in" ? await checkInBooking(booking.id) : await checkOutBooking(booking.id);
			setBooking(updated);
		} catch (requestError) {
			setError(requestError instanceof Error ? requestError.message : `Unable to ${verb} this booking.`);
		} finally {
			setSaving(false);
		}
	}

	return (
		<section>
			<Link href="/admin/bookings" className="inline-flex items-center gap-2 text-sm font-medium text-[#53665a] hover:text-[#29443a]"><ArrowLeft className="h-4 w-4" />Back to bookings</Link>
			{loading ? <div className="mt-7 grid gap-3"><div className="h-10 animate-pulse bg-[#e6ebe4]" /><div className="h-56 animate-pulse bg-white" /></div> : error && !booking ? <div role="alert" className="mt-7 border border-[#e7c2b9] bg-[#fff5f1] p-5 text-sm text-[#884637]">{error}</div> : booking && (
				<>
					<div className="mt-6 flex flex-wrap items-start justify-between gap-4 border-b border-[#d8dfd7] pb-6">
						<div>
							<p className="text-xs font-semibold uppercase tracking-[0.13em] text-[#788279]">Booking details</p>
							<h1 className="mt-2 font-serif text-3xl text-[#263a31]">{booking.booking_reference}</h1>
							<p className="mt-2 text-sm text-[#778179]">Created {formatTimestamp(booking.created_at)}</p>
						</div>
						<BookingStatusBadge status={booking.booking_status} />
					</div>
					{error && <div role="alert" className="mt-5 border border-[#e7c2b9] bg-[#fff5f1] p-4 text-sm text-[#884637]">{error}</div>}
					<div className="mt-6 grid gap-5 xl:grid-cols-[1.4fr_1fr]">
						<div className="grid content-start gap-5">
							<section className="border border-[#dce2da] bg-white p-5 sm:p-6">
								<h2 className="font-serif text-xl text-[#263a31]">Guest and stay</h2>
								<dl className="mt-5 grid gap-x-6 gap-y-4 sm:grid-cols-2">
									<div><dt className="text-xs text-[#7b857d]">Guest</dt><dd className="mt-1 font-medium">{booking.guest_details.full_name}</dd></div>
									<div><dt className="text-xs text-[#7b857d]">Guests</dt><dd className="mt-1 font-medium">{booking.number_of_guests}</dd></div>
									<div><dt className="text-xs text-[#7b857d]">Email</dt><dd className="mt-1 break-all font-medium">{booking.guest_details.email || "Not provided"}</dd></div>
									<div><dt className="text-xs text-[#7b857d]">Phone</dt><dd className="mt-1 font-medium">{booking.guest_details.phone || "Not provided"}</dd></div>
									<div><dt className="text-xs text-[#7b857d]">Check-in</dt><dd className="mt-1 font-medium">{formatDate(booking.check_in_date)}</dd></div>
									<div><dt className="text-xs text-[#7b857d]">Check-out</dt><dd className="mt-1 font-medium">{formatDate(booking.check_out_date)}</dd></div>
									<div><dt className="text-xs text-[#7b857d]">Actual check-in</dt><dd className="mt-1 font-medium">{formatTimestamp(booking.actual_check_in)}</dd></div>
									<div><dt className="text-xs text-[#7b857d]">Actual check-out</dt><dd className="mt-1 font-medium">{formatTimestamp(booking.actual_check_out)}</dd></div>
								</dl>
							</section>
							<section className="border border-[#dce2da] bg-white p-5 sm:p-6">
								<h2 className="font-serif text-xl text-[#263a31]">Room</h2>
								<dl className="mt-5 grid gap-x-6 gap-y-4 sm:grid-cols-2">
									<div><dt className="text-xs text-[#7b857d]">Room number</dt><dd className="mt-1 font-medium">{booking.room_details.room_number}</dd></div>
									<div><dt className="text-xs text-[#7b857d]">Room type</dt><dd className="mt-1 font-medium">{booking.room_details.room_type_name}</dd></div>
									<div><dt className="text-xs text-[#7b857d]">Room status</dt><dd className="mt-1 font-medium">{booking.room_details.status.replaceAll("_", " ")}</dd></div>
									<div><dt className="text-xs text-[#7b857d]">Booking source</dt><dd className="mt-1 font-medium">{booking.booking_source.replaceAll("_", " ")}</dd></div>
								</dl>
							</section>
						</div>
						<div className="grid content-start gap-5">
							<section className="border border-[#dce2da] bg-white p-5 sm:p-6">
								<h2 className="font-serif text-xl text-[#263a31]">Payment</h2>
								<div className="mt-5 flex items-center justify-between gap-4"><span className="text-sm text-[#6f7a72]">Latest payment</span><PaymentStatusBadge status={booking.latest_payment?.status ?? null} /></div>
								<dl className="mt-5 grid gap-4">
									<div className="flex justify-between gap-3 border-b border-[#edf0eb] pb-3"><dt className="text-sm text-[#6f7a72]">Total amount</dt><dd className="font-medium">{formatAmount(booking.total_amount)}</dd></div>
									<div className="flex justify-between gap-3 border-b border-[#edf0eb] pb-3"><dt className="text-sm text-[#6f7a72]">Paid</dt><dd className="font-medium">{formatAmount(booking.total_paid)}</dd></div>
									<div className="flex justify-between gap-3 border-b border-[#edf0eb] pb-3"><dt className="text-sm text-[#6f7a72]">Balance due</dt><dd className="font-medium">{formatAmount(booking.balance_due)}</dd></div>
									<div className="flex justify-between gap-3 border-b border-[#edf0eb] pb-3"><dt className="text-sm text-[#6f7a72]">Advance amount</dt><dd className="font-medium">{formatAmount(booking.advance_amount)}</dd></div>
									<div><dt className="text-xs text-[#7b857d]">Method / transaction</dt><dd className="mt-1 break-all text-sm font-medium">{booking.latest_payment ? `${booking.latest_payment.payment_method.replaceAll("_", " ")} · ${booking.latest_payment.transaction_reference || "No transaction reference"}` : "No payment recorded"}</dd></div>
									{booking.latest_payment && <div><dt className="text-xs text-[#7b857d]">Payment submitted</dt><dd className="mt-1 text-sm font-medium">{formatTimestamp(booking.latest_payment.submitted_at)}</dd></div>}
								</dl>
							</section>
							<section className="border border-[#dce2da] bg-white p-5 sm:p-6">
								<h2 className="font-serif text-xl text-[#263a31]">Stay actions</h2>
								<p className="mt-2 text-sm leading-6 text-[#778179]">Booking and room statuses are updated together by the staff API.</p>
								<div className="mt-5 flex flex-wrap gap-2">
									{booking.booking_status === "CONFIRMED" && <button type="button" disabled={saving} onClick={() => updateStay("check_in")} className="inline-flex h-10 items-center gap-2 bg-[#315c4d] px-4 text-sm font-semibold text-white hover:bg-[#274c3f] disabled:opacity-50"><LogIn className="h-4 w-4" />{saving ? "Updating…" : "Check in"}</button>}
									{booking.booking_status === "CHECKED_IN" && <button type="button" disabled={saving} onClick={() => updateStay("check_out")} className="inline-flex h-10 items-center gap-2 bg-[#315c4d] px-4 text-sm font-semibold text-white hover:bg-[#274c3f] disabled:opacity-50"><LogOut className="h-4 w-4" />{saving ? "Updating…" : "Check out"}</button>}
									<button type="button" disabled={loading || saving} onClick={() => { setError(null); setLoading(true); getBooking(id).then(setBooking).catch((requestError: unknown) => setError(requestError instanceof Error ? requestError.message : "Unable to refresh booking.")).finally(() => setLoading(false)); }} aria-label="Refresh booking details" title="Refresh booking details" className="grid h-10 w-10 place-items-center border border-[#ccd5cb] text-[#526258] hover:bg-[#f5f8f3] disabled:opacity-50"><RefreshCw className="h-4 w-4" /></button>
								</div>
							</section>
						</div>
					</div>
				</>
			)}
		</section>
	);
}