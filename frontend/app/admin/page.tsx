"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowDownRight, ArrowUpRight, BedDouble, CalendarCheck2, CalendarDays, RefreshCw } from "lucide-react";

import { ApiError } from "@/lib/api/client";
import { getBookingSummary, type BookingSummary } from "@/lib/api/bookings";

const metrics = [
	{ key: "total_bookings", label: "Total bookings", icon: CalendarDays, tone: "text-[#315c4d]" },
	{ key: "confirmed_bookings", label: "Confirmed", icon: CalendarCheck2, tone: "text-[#42734e]" },
	{ key: "todays_arrivals", label: "Arrivals today", icon: ArrowDownRight, tone: "text-[#a16435]" },
	{ key: "todays_departures", label: "Departures today", icon: ArrowUpRight, tone: "text-[#526a83]" },
	{ key: "occupied_rooms", label: "Occupied rooms", icon: BedDouble, tone: "text-[#9a5646]" },
] as const;

export default function AdminOverviewPage() {
	const [summary, setSummary] = useState<BookingSummary | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [refreshKey, setRefreshKey] = useState(0);

	useEffect(() => {
		let active = true;
		getBookingSummary()
			.then((result) => { if (active) setSummary(result); })
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
		<section>
			<div className="flex flex-wrap items-end justify-between gap-4 border-b border-[#d8dfd7] pb-6">
				<div>
					<p className="text-xs font-semibold uppercase tracking-[0.13em] text-[#788279]">Daily operations</p>
					<h1 className="mt-2 font-serif text-4xl text-[#263a31]">The house at a glance</h1>
					<p className="mt-2 text-sm text-[#778179]">{summary ? new Intl.DateTimeFormat("en", { dateStyle: "full" }).format(new Date(`${summary.date}T00:00:00`)) : "Live hotel activity"}</p>
				</div>
				<button type="button" onClick={() => { setError(null); setLoading(true); setRefreshKey((key) => key + 1); }} disabled={loading} aria-label="Refresh overview" className="grid h-10 w-10 place-items-center border border-[#ccd5cb] bg-white text-[#526258] hover:bg-[#f8faf6] disabled:opacity-50">
					<RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
				</button>
			</div>

			{error && <div role="alert" className="mt-6 border border-[#e7c2b9] bg-[#fff5f1] p-4 text-sm text-[#884637]">{error}</div>}

			<div className="mt-7 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
				{metrics.map(({ key, label, icon: Icon, tone }) => (
					<div key={key} className="min-h-36 border border-[#dce2da] bg-white p-5">
						<div className="flex items-center justify-between">
							<p className="text-sm text-[#6f7a72]">{label}</p>
							<Icon aria-hidden="true" className={`h-4 w-4 ${tone}`} />
						</div>
						{loading ? <div className="mt-7 h-8 w-16 animate-pulse bg-[#edf1eb]" aria-label={`Loading ${label}`} /> : error ? <p className="mt-6 text-sm text-[#8a756d]">Unavailable</p> : <p className="mt-6 font-serif text-3xl text-[#263a31]">{summary?.[key] ?? "Not implemented"}</p>}
					</div>
				))}
			</div>

			<div className="mt-8 border-y border-[#d8dfd7] py-5 sm:flex sm:items-center sm:justify-between">
				<div>
					<h2 className="font-serif text-xl text-[#263a31]">Reservations</h2>
					<p className="mt-1 text-sm text-[#778179]">Review guest details, payment progress, and today’s arrivals.</p>
				</div>
				<Link href="/admin/bookings" className="mt-4 inline-flex h-10 items-center justify-center bg-[#29443a] px-4 text-sm font-semibold text-white hover:bg-[#20382f] sm:mt-0">Open bookings</Link>
			</div>
		</section>
	);
}