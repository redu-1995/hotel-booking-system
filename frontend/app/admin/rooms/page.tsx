"use client";

import { useEffect, useState } from "react";
import { BedDouble, RefreshCw, Search } from "lucide-react";

import { ApiError, getAdminRooms } from "@/lib/api/client";
import type { Room } from "@/types";

const roomStatuses = ["AVAILABLE", "OCCUPIED", "RESERVED", "DIRTY", "MAINTENANCE"] as const;
type RoomStatus = (typeof roomStatuses)[number];

const statusStyles: Record<RoomStatus, string> = {
	AVAILABLE: "border-[#c9ddca] bg-[#eef7ee] text-[#3d6841]",
	OCCUPIED: "border-[#c6d9d4] bg-[#edf6f3] text-[#315d50]",
	RESERVED: "border-[#ead6a4] bg-[#fff8e6] text-[#815f19]",
	DIRTY: "border-[#e8d0b3] bg-[#fbf4e9] text-[#8b6133]",
	MAINTENANCE: "border-[#e5c7c3] bg-[#fbf0ee] text-[#8a5048]",
};

function amount(value: string) {
	return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(Number(value));
}

export default function AdminRoomsPage() {
	const [rooms, setRooms] = useState<Room[]>([]);
	const [searchText, setSearchText] = useState("");
	const [search, setSearch] = useState("");
	const [status, setStatus] = useState("");
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [refreshKey, setRefreshKey] = useState(0);

	useEffect(() => {
		let active = true;
		getAdminRooms({ search, status })
			.then((records) => { if (active) setRooms(records); })
			.catch((requestError: unknown) => {
				if (!active) return;
				setError(requestError instanceof ApiError && [401, 403].includes(requestError.status)
					? "Your staff session is no longer authorized. Sign in again to continue."
					: requestError instanceof Error ? requestError.message : "Unable to load rooms.");
			})
			.finally(() => { if (active) setLoading(false); });
		return () => { active = false; };
	}, [search, status, refreshKey]);

	function submitSearch(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setLoading(true);
		setError(null);
		setSearch(searchText.trim());
	}

	function changeStatus(value: string) {
		setLoading(true);
		setError(null);
		setStatus(value);
	}

	return (
		<section>
			<div className="flex flex-wrap items-end justify-between gap-4 border-b border-[#d8dfd7] pb-6">
				<div>
					<p className="text-xs font-semibold uppercase tracking-[0.13em] text-[#788279]">Inventory</p>
					<h1 className="mt-2 font-serif text-4xl text-[#263a31]">Rooms</h1>
					<p className="mt-2 text-sm text-[#778179]">{loading ? "Loading room inventory…" : `${rooms.length} rooms`}</p>
				</div>
				<button type="button" onClick={() => { setError(null); setLoading(true); setRefreshKey((key) => key + 1); }} disabled={loading} aria-label="Refresh rooms" className="grid h-10 w-10 place-items-center border border-[#ccd5cb] bg-white text-[#526258] hover:bg-[#f8faf6] disabled:opacity-50">
					<RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
				</button>
			</div>

			<form onSubmit={submitSearch} className="mt-6 grid gap-3 border border-[#dce2da] bg-white p-4 sm:grid-cols-[minmax(220px,1fr)_200px_auto] sm:items-end">
				<label className="grid gap-1.5 text-xs font-semibold text-[#667168]">Search room number
					<span className="relative"><Search aria-hidden="true" className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#879188]" /><input value={searchText} onChange={(event) => setSearchText(event.target.value)} placeholder="Room number" className="h-10 w-full border border-[#d3dbd1] pl-9 pr-3 text-sm font-normal text-[#263a31] outline-none focus:border-[#637e68]" /></span>
				</label>
				<label className="grid gap-1.5 text-xs font-semibold text-[#667168]">Room status
					<select value={status} onChange={(event) => changeStatus(event.target.value)} className="h-10 border border-[#d3dbd1] bg-white px-3 text-sm font-normal text-[#263a31] outline-none focus:border-[#637e68]"><option value="">All statuses</option>{roomStatuses.map((value) => <option key={value} value={value}>{value.replaceAll("_", " ")}</option>)}</select>
				</label>
				<button type="submit" className="inline-flex h-10 items-center justify-center gap-2 bg-[#29443a] px-4 text-sm font-semibold text-white hover:bg-[#20382f]"><Search className="h-4 w-4" />Search</button>
			</form>

			{error && <div role="alert" className="mt-5 border border-[#e7c2b9] bg-[#fff5f1] p-4 text-sm text-[#884637]">{error}</div>}
			<div className="mt-5 overflow-hidden border border-[#dce2da] bg-white">
				{loading ? <div className="grid gap-3 p-5" aria-label="Loading rooms"><div className="h-10 animate-pulse bg-[#edf1eb]" /><div className="h-14 animate-pulse bg-[#f3f5f1]" /><div className="h-14 animate-pulse bg-[#f3f5f1]" /></div> : !error && rooms.length === 0 ? <div className="px-6 py-16 text-center"><BedDouble aria-hidden="true" className="mx-auto h-6 w-6 text-[#748177]" /><h2 className="mt-3 font-serif text-xl text-[#263a31]">No rooms found</h2><p className="mt-2 text-sm text-[#778179]">Try another room number or status.</p></div> : !error && (
					<div className="overflow-x-auto">
						<table className="w-full min-w-[700px] border-collapse text-left text-sm">
							<thead className="bg-[#f7f9f5] text-[11px] uppercase tracking-wide text-[#778179]"><tr><th className="px-5 py-3 font-semibold">Room</th><th className="px-5 py-3 font-semibold">Room type</th><th className="px-5 py-3 font-semibold">Capacity</th><th className="px-5 py-3 font-semibold">Nightly rate</th><th className="px-5 py-3 font-semibold">Room status</th></tr></thead>
							<tbody className="divide-y divide-[#e7ebe5]">{rooms.map((room) => <tr key={room.id} className="hover:bg-[#fbfcfa]"><td className="px-5 py-4 font-semibold text-[#38483e]">{room.room_number}</td><td className="px-5 py-4 text-[#526057]">{room.room_type_details.name}</td><td className="px-5 py-4 text-[#526057]">{room.room_type_details.max_guests} guests</td><td className="px-5 py-4 text-[#526057]">{amount(room.room_type_details.base_price)}</td><td className="px-5 py-4"><span className={`inline-flex border px-2 py-1 text-xs font-semibold ${statusStyles[room.status as RoomStatus] ?? "border-[#d8d2cf] bg-[#f5f2f0] text-[#70615a]"}`}>{room.status.replaceAll("_", " ")}</span></td></tr>)}</tbody>
						</table>
					</div>
				)}
			</div>
		</section>
	);
}