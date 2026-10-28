"use client";

import { useEffect, useState } from "react";
import { RefreshCw, Search, Users } from "lucide-react";

import { ApiError } from "@/lib/api/client";
import { getGuests, type Guest } from "@/lib/api/guests";

function formatDate(value: string) {
	return new Intl.DateTimeFormat("en", { day: "numeric", month: "short", year: "numeric" }).format(new Date(value));
}

export default function AdminGuestsPage() {
	const [guests, setGuests] = useState<Guest[]>([]);
	const [searchText, setSearchText] = useState("");
	const [search, setSearch] = useState("");
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [refreshKey, setRefreshKey] = useState(0);

	useEffect(() => {
		let active = true;
		getGuests(search ? new URLSearchParams({ search }).toString() : "")
			.then((records) => { if (active) setGuests(records); })
			.catch((requestError: unknown) => {
				if (!active) return;
				setError(requestError instanceof ApiError && [401, 403].includes(requestError.status)
					? "Your staff role is not permitted to view guest records."
					: requestError instanceof Error ? requestError.message : "Unable to load guests.");
			})
			.finally(() => { if (active) setLoading(false); });
		return () => { active = false; };
	}, [search, refreshKey]);

	function submitSearch(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setLoading(true);
		setError(null);
		setSearch(searchText.trim());
	}

	return (
		<section>
			<div className="flex flex-wrap items-end justify-between gap-4 border-b border-[#d8dfd7] pb-6">
				<div><p className="text-xs font-semibold uppercase tracking-[0.13em] text-[#788279]">Guest directory</p><h1 className="mt-2 font-serif text-4xl text-[#263a31]">Guests</h1><p className="mt-2 text-sm text-[#778179]">{loading ? "Loading guest records…" : `${guests.length} guests`}</p></div>
				<button type="button" onClick={() => { setError(null); setLoading(true); setRefreshKey((key) => key + 1); }} disabled={loading} aria-label="Refresh guests" className="grid h-10 w-10 place-items-center border border-[#ccd5cb] bg-white text-[#526258] hover:bg-[#f8faf6] disabled:opacity-50"><RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /></button>
			</div>
			<form onSubmit={submitSearch} className="mt-6 grid gap-3 border border-[#dce2da] bg-white p-4 sm:grid-cols-[minmax(220px,1fr)_auto] sm:items-end">
				<label className="grid gap-1.5 text-xs font-semibold text-[#667168]">Search guest name, phone, or email<span className="relative"><Search aria-hidden="true" className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#879188]" /><input value={searchText} onChange={(event) => setSearchText(event.target.value)} placeholder="Search guests" className="h-10 w-full border border-[#d3dbd1] pl-9 pr-3 text-sm font-normal text-[#263a31] outline-none focus:border-[#637e68]" /></span></label>
				<button type="submit" className="inline-flex h-10 items-center justify-center gap-2 bg-[#29443a] px-4 text-sm font-semibold text-white hover:bg-[#20382f]"><Search className="h-4 w-4" />Search</button>
			</form>
			{error && <div role="alert" className="mt-5 border border-[#e7c2b9] bg-[#fff5f1] p-4 text-sm text-[#884637]">{error}</div>}
			<div className="mt-5 overflow-hidden border border-[#dce2da] bg-white">
				{loading ? <div className="grid gap-3 p-5" aria-label="Loading guests"><div className="h-10 animate-pulse bg-[#edf1eb]" /><div className="h-14 animate-pulse bg-[#f3f5f1]" /><div className="h-14 animate-pulse bg-[#f3f5f1]" /></div> : !error && guests.length === 0 ? <div className="px-6 py-16 text-center"><Users aria-hidden="true" className="mx-auto h-6 w-6 text-[#748177]" /><h2 className="mt-3 font-serif text-xl text-[#263a31]">No guests found</h2><p className="mt-2 text-sm text-[#778179]">Guest records will appear here when available.</p></div> : !error && <div className="overflow-x-auto"><table className="w-full min-w-[760px] border-collapse text-left text-sm">
					<thead className="bg-[#f7f9f5] text-[11px] uppercase tracking-wide text-[#778179]"><tr><th className="px-5 py-3 font-semibold">Guest</th><th className="px-5 py-3 font-semibold">Contact</th><th className="px-5 py-3 font-semibold">Bookings</th><th className="px-5 py-3 font-semibold">Added</th></tr></thead>
					<tbody className="divide-y divide-[#e7ebe5]">{guests.map((guest) => <tr key={guest.id} className="hover:bg-[#fbfcfa]"><td className="px-5 py-4"><p className="font-semibold text-[#38483e]">{guest.full_name}</p><p className="mt-1 text-xs text-[#7b857d]">Guest #{guest.id}</p></td><td className="px-5 py-4"><a href={`tel:${guest.phone}`} className="block text-[#526057] hover:underline">{guest.phone}</a>{guest.email ? <a href={`mailto:${guest.email}`} className="mt-1 block break-all text-xs text-[#68766c] hover:underline">{guest.email}</a> : <span className="mt-1 block text-xs text-[#929a93]">No email</span>}</td><td className="px-5 py-4 text-[#526057]">{guest.total_bookings_count}</td><td className="px-5 py-4 text-[#526057]">{formatDate(guest.created_at)}</td></tr>)}</tbody>
				</table></div>}
			</div>
		</section>
	);
}