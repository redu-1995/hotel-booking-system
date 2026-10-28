"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Eye, RefreshCw, Search } from "lucide-react";

import { BookingStatusBadge, PaymentStatusBadge } from "@/components/dashboard/BookingStatusBadge";
import { ApiError } from "@/lib/api/client";
import { getAdminBookings, type BookingFilters, type BookingPage, type BookingStatus, type PaymentStatus } from "@/lib/api/bookings";

const bookingStatuses: BookingStatus[] = ["HOLD", "CONFIRMED", "CHECKED_IN", "CHECKED_OUT", "CANCELLED", "NO_SHOW"];
const paymentStatuses: PaymentStatus[] = ["PENDING", "COMPLETED", "FAILED", "REFUNDED"];

function formatDate(value: string) {
	return new Intl.DateTimeFormat("en", { day: "numeric", month: "short", year: "numeric" }).format(new Date(`${value}T00:00:00`));
}

function formatAmount(value: string) {
	return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(Number(value));
}

export default function AdminBookingsPage() {
	const [searchInput, setSearchInput] = useState("");
	const [filters, setFilters] = useState<BookingFilters>({ page: 1, page_size: 20 });
	const [data, setData] = useState<BookingPage | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [refreshKey, setRefreshKey] = useState(0);

	useEffect(() => {
		let active = true;
		getAdminBookings(filters)
			.then((result) => { if (active) setData(result); })
			.catch((requestError: unknown) => {
				if (!active) return;
				setError(requestError instanceof ApiError && [401, 403].includes(requestError.status)
					? "Your staff session is no longer authorized. Sign in again to continue."
					: requestError instanceof Error ? requestError.message : "Unable to load bookings.");
			})
			.finally(() => { if (active) setLoading(false); });
		return () => { active = false; };
	}, [filters, refreshKey]);

	function updateFilter<K extends keyof BookingFilters>(key: K, value: BookingFilters[K]) {
		setLoading(true);
		setFilters((current) => ({ ...current, [key]: value || undefined, page: 1 }));
		setError(null);
	}

	function submitSearch(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
		updateFilter("search", searchInput.trim() || undefined);
	}

	const pageNumber = filters.page ?? 1;
	const firstRow = data && data.count > 0 ? (pageNumber - 1) * (filters.page_size ?? 20) + 1 : 0;
	const lastRow = data ? Math.min(pageNumber * (filters.page_size ?? 20), data.count) : 0;

	return (
		<section>
			<div className="flex flex-wrap items-end justify-between gap-4 border-b border-[#d8dfd7] pb-6">
				<div>
					<p className="text-xs font-semibold uppercase tracking-[0.13em] text-[#788279]">Front desk</p>
					<h1 className="mt-2 font-serif text-4xl text-[#263a31]">Bookings</h1>
					<p className="mt-2 text-sm text-[#778179]">{loading ? "Loading reservations…" : `${data?.count ?? 0} reservations`}</p>
				</div>
				<button type="button" onClick={() => { setError(null); setLoading(true); setRefreshKey((key) => key + 1); }} disabled={loading} aria-label="Refresh bookings" className="grid h-10 w-10 place-items-center border border-[#ccd5cb] bg-white text-[#526258] hover:bg-[#f8faf6] disabled:opacity-50">
					<RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
				</button>
			</div>

			<form onSubmit={submitSearch} className="mt-6 grid gap-3 border border-[#dce2da] bg-white p-4 md:grid-cols-[minmax(220px,1fr)_190px_190px_180px_auto] md:items-end">
				<label className="grid gap-1.5 text-xs font-semibold text-[#667168]">
					Search reference or guest
					<span className="relative">
						<Search aria-hidden="true" className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#879188]" />
						<input value={searchInput} onChange={(event) => setSearchInput(event.target.value)} placeholder="e.g. BK-… or guest name" className="h-10 w-full border border-[#d3dbd1] pl-9 pr-3 text-sm font-normal text-[#263a31] outline-none focus:border-[#637e68]" />
					</span>
				</label>
				<label className="grid gap-1.5 text-xs font-semibold text-[#667168]">Booking status
					<select value={filters.booking_status ?? ""} onChange={(event) => updateFilter("booking_status", (event.target.value || undefined) as BookingStatus | undefined)} className="h-10 border border-[#d3dbd1] bg-white px-3 text-sm font-normal text-[#263a31] outline-none focus:border-[#637e68]">
						<option value="">All statuses</option>{bookingStatuses.map((status) => <option key={status} value={status}>{status.replaceAll("_", " ")}</option>)}
					</select>
				</label>
				<label className="grid gap-1.5 text-xs font-semibold text-[#667168]">Payment status
					<select value={filters.payment_status ?? ""} onChange={(event) => updateFilter("payment_status", (event.target.value || undefined) as PaymentStatus | undefined)} className="h-10 border border-[#d3dbd1] bg-white px-3 text-sm font-normal text-[#263a31] outline-none focus:border-[#637e68]">
						<option value="">All payments</option>{paymentStatuses.map((status) => <option key={status} value={status}>{status}</option>)}
					</select>
				</label>
				<label className="grid gap-1.5 text-xs font-semibold text-[#667168]">Check-in date
					<input type="date" value={filters.check_in_date ?? ""} onChange={(event) => updateFilter("check_in_date", event.target.value || undefined)} className="h-10 border border-[#d3dbd1] bg-white px-3 text-sm font-normal text-[#263a31] outline-none focus:border-[#637e68]" />
				</label>
				<button type="submit" className="inline-flex h-10 items-center justify-center gap-2 bg-[#29443a] px-4 text-sm font-semibold text-white hover:bg-[#20382f]"><Search className="h-4 w-4" />Search</button>
			</form>

			{error && <div role="alert" className="mt-5 border border-[#e7c2b9] bg-[#fff5f1] p-4 text-sm text-[#884637]">{error}</div>}

			<div className="mt-5 overflow-hidden border border-[#dce2da] bg-white">
				{loading ? (
					<div className="grid gap-3 p-5" aria-label="Loading bookings"><div className="h-10 animate-pulse bg-[#edf1eb]" /><div className="h-14 animate-pulse bg-[#f3f5f1]" /><div className="h-14 animate-pulse bg-[#f3f5f1]" /><div className="h-14 animate-pulse bg-[#f3f5f1]" /></div>
				) : !error && data?.results.length === 0 ? (
					<div className="px-6 py-16 text-center"><h2 className="font-serif text-xl text-[#263a31]">No bookings match these filters</h2><p className="mt-2 text-sm text-[#778179]">Try another search or clear one of the selected filters.</p></div>
				) : !error && (
					<div className="overflow-x-auto">
						<table className="w-full min-w-[1050px] border-collapse text-left text-sm">
							<thead className="bg-[#f7f9f5] text-[11px] uppercase tracking-wide text-[#778179]"><tr>
								<th className="px-4 py-3 font-semibold">Reference / Guest</th><th className="px-4 py-3 font-semibold">Room</th><th className="px-4 py-3 font-semibold">Stay</th><th className="px-4 py-3 font-semibold">Guests</th><th className="px-4 py-3 font-semibold">Total</th><th className="px-4 py-3 font-semibold">Payment</th><th className="px-4 py-3 font-semibold">Booking</th><th className="px-4 py-3 font-semibold">Details</th>
							</tr></thead>
							<tbody className="divide-y divide-[#e7ebe5]">
								{data?.results.map((booking) => (
									<tr key={booking.id} className="hover:bg-[#fbfcfa]">
										<td className="px-4 py-3.5"><Link href={`/admin/bookings/${booking.id}`} className="font-semibold text-[#315c4d] hover:underline">{booking.booking_reference}</Link><p className="mt-1 font-medium text-[#38483e]">{booking.guest_details.full_name}</p><p className="mt-0.5 text-xs text-[#7b857d]">{booking.guest_details.phone || booking.guest_details.email}</p></td>
										<td className="px-4 py-3.5"><p className="font-medium text-[#38483e]">{booking.room_details.room_number}</p><p className="mt-1 text-xs text-[#7b857d]">{booking.room_details.room_type_name}</p></td>
										<td className="whitespace-nowrap px-4 py-3.5 text-[#526057]">{formatDate(booking.check_in_date)}<p className="mt-1 text-xs text-[#7b857d]">to {formatDate(booking.check_out_date)}</p></td>
										<td className="px-4 py-3.5 text-[#526057]">{booking.number_of_guests}</td>
										<td className="whitespace-nowrap px-4 py-3.5 font-medium text-[#38483e]">{formatAmount(booking.total_amount)}</td>
										<td className="px-4 py-3.5"><PaymentStatusBadge status={booking.latest_payment?.status ?? null} /></td>
										<td className="px-4 py-3.5"><BookingStatusBadge status={booking.booking_status} /></td>
										<td className="px-4 py-3.5"><Link href={`/admin/bookings/${booking.id}`} aria-label={`View ${booking.booking_reference}`} title="View booking details" className="grid h-8 w-8 place-items-center text-[#526258] hover:bg-[#edf1ea] hover:text-[#29443a]"><Eye className="h-4 w-4" /></Link></td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				)}
				{!loading && !error && data && data.count > 0 && <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#e3e8e1] px-4 py-3 text-sm text-[#69756c]">
					<p>Showing {firstRow}–{lastRow} of {data.count}</p>
					<div className="flex gap-2">
						<button type="button" disabled={!data.previous} onClick={() => setFilters((current) => ({ ...current, page: Math.max(1, (current.page ?? 1) - 1) }))} className="h-9 border border-[#ccd5cb] px-3 hover:bg-[#f5f8f3] disabled:cursor-not-allowed disabled:opacity-40">Previous</button>
						<button type="button" disabled={!data.next} onClick={() => setFilters((current) => ({ ...current, page: (current.page ?? 1) + 1 }))} className="h-9 border border-[#ccd5cb] px-3 hover:bg-[#f5f8f3] disabled:cursor-not-allowed disabled:opacity-40">Next</button>
					</div>
				</div>}
			</div>
		</section>
	);
}