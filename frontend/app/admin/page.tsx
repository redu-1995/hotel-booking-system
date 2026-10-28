"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowDownRight, ArrowUpRight, BedDouble, CalendarDays, Check, Clock3, RefreshCw } from "lucide-react";

import { BookingStatusBadge, PaymentStatusBadge } from "@/components/dashboard/BookingStatusBadge";
import { ApiError } from "@/lib/api/client";
import { getAdminBookings, getBookingSummary, type Booking, type BookingSummary } from "@/lib/api/bookings";

const roomSegments = [
	{ key: "available_rooms", label: "Available", color: "bg-[#5f8c68]" },
	{ key: "occupied_rooms", label: "Occupied", color: "bg-[#466d59]" },
	{ key: "reserved_rooms", label: "Reserved", color: "bg-[#c2934d]" },
	{ key: "dirty_rooms", label: "Needs cleaning", color: "bg-[#bb7857]" },
	{ key: "maintenance_rooms", label: "Maintenance", color: "bg-[#8c7770]" },
] as const;

function amount(value: string) {
	return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(Number(value));
}

function formatDate(value: string) {
	return new Intl.DateTimeFormat("en", { day: "numeric", month: "short" }).format(new Date(`${value}T00:00:00`));
}

export default function AdminOverviewPage() {
	const [summary, setSummary] = useState<BookingSummary | null>(null);
	const [recentBookings, setRecentBookings] = useState<Booking[]>([]);
	const [arrivals, setArrivals] = useState<Booking[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [refreshKey, setRefreshKey] = useState(0);

	useEffect(() => {
		let active = true;
		getBookingSummary()
			.then(async (result) => {
				const [recent, todaysArrivals] = await Promise.all([
					getAdminBookings({ booking_source: "DIRECT", page_size: 6 }),
					getAdminBookings({ booking_status: "CONFIRMED", check_in_date: result.date, page_size: 6 }),
				]);
				if (active) {
					setSummary(result);
					setRecentBookings(recent.results);
					setArrivals(todaysArrivals.results);
				}
			})
			.catch((requestError: unknown) => {
				if (!active) return;
				setError(requestError instanceof ApiError && [401, 403].includes(requestError.status)
					? "Your staff session is no longer authorized. Sign in again to continue."
					: requestError instanceof Error ? requestError.message : "Unable to load the operational summary.");
			})
			.finally(() => { if (active) setLoading(false); });
		return () => { active = false; };
	}, [refreshKey]);

	return (
		<section className="space-y-6">
			<div className="flex flex-wrap items-end justify-between gap-3">
				<div>
					<p className="text-xs font-semibold uppercase tracking-[0.13em] text-[#788279]">{summary ? new Intl.DateTimeFormat("en", { weekday: "short", month: "short", day: "numeric", year: "numeric" }).format(new Date(`${summary.date}T00:00:00`)) : "Daily operations"}</p>
					<p className="mt-1 text-sm text-[#778179]">Live reservations, arrivals, and property status.</p>
				</div>
				<div className="flex items-center gap-2">
					<Link href="/admin/bookings" className="inline-flex h-10 items-center gap-2 bg-[#26322c] px-4 text-sm font-semibold text-white hover:bg-[#344239]"><CalendarDays className="h-4 w-4" />All bookings</Link>
					<button type="button" onClick={() => { setError(null); setLoading(true); setRefreshKey((key) => key + 1); }} disabled={loading} aria-label="Refresh front desk overview" title="Refresh overview" className="grid h-10 w-10 place-items-center border border-[#ccd5cb] bg-white text-[#526258] hover:bg-[#f8faf6] disabled:opacity-50"><RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /></button>
				</div>
			</div>

			{error && <div role="alert" className="border border-[#e7c2b9] bg-[#fff5f1] p-4 text-sm text-[#884637]">{error}</div>}

			<div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
				<div className="border border-[#e0e3dc] bg-white p-4 sm:p-5">
					<p className="text-xs font-semibold uppercase tracking-wide text-[#778179]">Total bookings</p>
					<div className="mt-4 flex items-end justify-between"><p className="font-serif text-4xl text-[#263a31]">{loading ? "—" : summary?.total_bookings ?? "Unavailable"}</p><CalendarDays className="mb-1 h-5 w-5 text-[#52715d]" /></div>
					<p className="mt-2 text-xs text-[#778179]">{loading ? "Loading" : `${summary?.confirmed_bookings ?? 0} confirmed`}</p>
				</div>
				<div className="border border-[#e0e3dc] bg-white p-4 sm:p-5">
					<p className="text-xs font-semibold uppercase tracking-wide text-[#778179]">Today’s arrivals</p>
					<div className="mt-4 flex items-end justify-between"><p className="font-serif text-4xl text-[#263a31]">{loading ? "—" : summary?.todays_arrivals ?? "Unavailable"}</p><ArrowDownRight className="mb-1 h-5 w-5 text-[#a16435]" /></div>
					<p className="mt-2 text-xs text-[#778179]">Confirmed check-ins</p>
				</div>
				<div className="border border-[#e0e3dc] bg-white p-4 sm:p-5">
					<p className="text-xs font-semibold uppercase tracking-wide text-[#778179]">Today’s departures</p>
					<div className="mt-4 flex items-end justify-between"><p className="font-serif text-4xl text-[#263a31]">{loading ? "—" : summary?.todays_departures ?? "Unavailable"}</p><ArrowUpRight className="mb-1 h-5 w-5 text-[#526a83]" /></div>
					<p className="mt-2 text-xs text-[#778179]">Checked-in bookings due out</p>
				</div>
				<div className="border border-[#e0e3dc] bg-white p-4 sm:p-5">
					<p className="text-xs font-semibold uppercase tracking-wide text-[#778179]">In house</p>
					<div className="mt-4 flex items-end justify-between"><p className="font-serif text-4xl text-[#263a31]">{loading ? "—" : summary?.checked_in_bookings ?? "Unavailable"}</p><Check className="mb-1 h-5 w-5 text-[#52715d]" /></div>
					<p className="mt-2 text-xs text-[#778179]">Checked-in bookings</p>
				</div>
				<div className="border border-[#e0e3dc] bg-white p-4 sm:p-5">
					<p className="text-xs font-semibold uppercase tracking-wide text-[#778179]">Occupancy</p>
					<div className="mt-4 flex items-end justify-between"><p className="font-serif text-4xl text-[#263a31]">{loading ? "—" : `${summary?.occupancy_rate ?? 0}%`}</p><BedDouble className="mb-1 h-5 w-5 text-[#315c4d]" /></div>
					<p className="mt-2 text-xs text-[#778179]">{summary ? `${summary.occupied_rooms} of ${summary.total_rooms} rooms` : "Current room inventory"}</p>
				</div>
			</div>

			<div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1.7fr)_minmax(290px,0.8fr)]">
				<section className="min-w-0 border border-[#e0e3dc] bg-white">
					<div className="flex flex-wrap items-end justify-between gap-3 border-b border-[#e7ebe5] px-4 py-4 sm:px-5">
						<div><p className="text-xs font-semibold uppercase tracking-wide text-[#778179]">Direct channel</p><h3 className="mt-1 font-serif text-xl text-[#263a31]">Recent direct bookings</h3><p className="mt-1 text-xs text-[#778179]">{loading ? "Loading reservations…" : `${recentBookings.length} recent reservations`}</p></div>
						<Link href="/admin/bookings" className="text-sm font-semibold text-[#315c4d] hover:underline">View all</Link>
					</div>
					{loading ? <div className="grid gap-3 p-5"><div className="h-12 animate-pulse bg-[#edf1eb]" /><div className="h-12 animate-pulse bg-[#f3f5f1]" /><div className="h-12 animate-pulse bg-[#f3f5f1]" /></div> : !error && recentBookings.length === 0 ? <p className="px-5 py-12 text-center text-sm text-[#778179]">No direct bookings found.</p> : !error && <div className="overflow-x-auto"><table className="w-full min-w-[790px] border-collapse text-left text-sm">
						<thead className="bg-[#f7f9f5] text-[10px] uppercase tracking-wide text-[#778179]"><tr><th className="px-4 py-3 font-semibold">Booking / Guest</th><th className="px-4 py-3 font-semibold">Room</th><th className="px-4 py-3 font-semibold">Stay</th><th className="px-4 py-3 font-semibold">Status</th><th className="px-4 py-3 font-semibold">Payment</th><th className="px-4 py-3 text-right font-semibold">Total</th></tr></thead>
						<tbody className="divide-y divide-[#edf0eb]">{recentBookings.map((booking) => <tr key={booking.id} className="hover:bg-[#fbfcfa]"><td className="px-4 py-3"><Link href={`/admin/bookings/${booking.id}`} className="font-semibold text-[#315c4d] hover:underline">{booking.booking_reference}</Link><p className="mt-1 text-xs text-[#526057]">{booking.guest_details.full_name}</p></td><td className="px-4 py-3"><p className="font-medium text-[#38483e]">#{booking.room_details.room_number}</p><p className="mt-1 text-xs text-[#778179]">{booking.room_details.room_type_name}</p></td><td className="whitespace-nowrap px-4 py-3 text-xs text-[#526057]">{formatDate(booking.check_in_date)} – {formatDate(booking.check_out_date)}<p className="mt-1 text-[#778179]">{booking.nights} night{booking.nights === 1 ? "" : "s"} · {booking.number_of_guests} guest{booking.number_of_guests === 1 ? "" : "s"}</p></td><td className="px-4 py-3"><BookingStatusBadge status={booking.booking_status} /></td><td className="px-4 py-3"><PaymentStatusBadge status={booking.latest_payment?.status ?? null} /></td><td className="whitespace-nowrap px-4 py-3 text-right font-medium text-[#38483e]">{amount(booking.total_amount)}</td></tr>)}</tbody>
						</table></div>}
				</section>

				<div className="grid gap-6">
					<section className="border border-[#e0e3dc] bg-white">
						<div className="flex items-start justify-between border-b border-[#e7ebe5] px-4 py-4 sm:px-5"><div><p className="text-xs font-semibold uppercase tracking-wide text-[#778179]">Front desk schedule</p><h3 className="mt-1 font-serif text-xl text-[#263a31]">Today’s arrivals</h3></div><span className="text-sm font-semibold text-[#526057]">{loading ? "—" : arrivals.length}</span></div>
						{loading ? <div className="grid gap-3 p-5"><div className="h-14 animate-pulse bg-[#edf1eb]" /><div className="h-14 animate-pulse bg-[#f3f5f1]" /></div> : !error && arrivals.length === 0 ? <p className="px-5 py-8 text-sm text-[#778179]">No confirmed arrivals scheduled today.</p> : !error && <ul className="divide-y divide-[#edf0eb]">{arrivals.map((booking) => <li key={booking.id} className="flex items-center justify-between gap-3 px-4 py-3.5 sm:px-5"><div className="min-w-0"><p className="truncate text-sm font-semibold text-[#38483e]">{booking.guest_details.full_name}</p><p className="mt-1 truncate text-xs text-[#778179]">Room {booking.room_details.room_number} · {booking.room_details.room_type_name}</p></div><Link href={`/admin/bookings/${booking.id}`} title={`Open ${booking.booking_reference}`} className="shrink-0 text-xs font-semibold text-[#315c4d] hover:underline">Details</Link></li>)}</ul>}
					</section>

					<section className="border border-[#e0e3dc] bg-white">
						<div className="border-b border-[#e7ebe5] px-4 py-4 sm:px-5"><p className="text-xs font-semibold uppercase tracking-wide text-[#778179]">Property operations</p><h3 className="mt-1 font-serif text-xl text-[#263a31]">Occupancy & housekeeping</h3></div>
						<div className="p-4 sm:p-5">
							<div className="flex items-end justify-between"><p className="font-serif text-3xl text-[#263a31]">{loading ? "—" : `${summary?.occupancy_rate ?? 0}%`}</p><p className="text-xs text-[#778179]">{summary ? `${summary.total_rooms} total rooms` : "Inventory"}</p></div>
							<div className="mt-3 flex h-2 overflow-hidden bg-[#edf0eb]" aria-label="Room status distribution">
								{summary && summary.total_rooms > 0 && roomSegments.map(({ key, color }) => <span key={key} className={color} style={{ width: `${summary[key] / summary.total_rooms * 100}%` }} />)}
							</div>
							<div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3">{roomSegments.map(({ key, label, color }) => <div key={key} className="flex items-center justify-between gap-2 text-xs"><span className="flex min-w-0 items-center gap-2 text-[#667168]"><span className={`size-2 shrink-0 ${color}`} />{label}</span><span className="font-semibold text-[#38483e]">{loading ? "—" : summary?.[key] ?? "Unavailable"}</span></div>)}</div>
							{(summary?.dirty_rooms ?? 0) > 0 && <Link href="/admin/rooms" className="mt-5 inline-flex items-center gap-2 text-xs font-semibold text-[#9a5c3c] hover:underline"><Clock3 className="h-3.5 w-3.5" />Review rooms needing cleaning</Link>}
							<Link href="/admin/rooms" className="mt-5 block border-t border-[#edf0eb] pt-4 text-sm font-semibold text-[#315c4d] hover:underline">Open room inventory</Link>
						</div>
					</section>
				</div>
			</div>
		</section>
	);
}