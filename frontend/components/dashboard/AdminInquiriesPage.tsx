"use client";

import { useEffect, useState } from "react";
import { AlertCircle, RefreshCw, Search } from "lucide-react";

import { ApiError } from "@/lib/api/client";
import { getInquiries, type Inquiry, type InquiryStatus } from "@/lib/api/inquiries";

const inquiryStatuses: InquiryStatus[] = ["PENDING", "CONTACTED", "QUOTED", "CONVERTED", "CANCELLED"];

const statusStyles: Record<InquiryStatus, string> = {
	PENDING: "border-[#ead6a4] bg-[#fff8e6] text-[#815f19]",
	CONTACTED: "border-[#cdd9e7] bg-[#f0f5fa] text-[#48627d]",
	QUOTED: "border-[#e8d0b3] bg-[#fbf4e9] text-[#8b6133]",
	CONVERTED: "border-[#c9ddca] bg-[#eef7ee] text-[#3d6841]",
	CANCELLED: "border-[#e5c7c3] bg-[#fbf0ee] text-[#8a5048]",
};

function formatDate(value: string | null) {
	if (!value) return "Dates not specified";
	return new Intl.DateTimeFormat("en", { day: "numeric", month: "short", year: "numeric" }).format(new Date(`${value}T00:00:00`));
}

function formatTimestamp(value: string) {
	return new Intl.DateTimeFormat("en", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

export default function AdminInquiriesPage() {
	const [inquiries, setInquiries] = useState<Inquiry[]>([]);
	const [searchText, setSearchText] = useState("");
	const [search, setSearch] = useState("");
	const [status, setStatus] = useState("");
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [refreshKey, setRefreshKey] = useState(0);

	useEffect(() => {
		let active = true;
		const params = new URLSearchParams();
		if (search) params.set("search", search);
		if (status) params.set("status", status);
		getInquiries(params.toString())
			.then((records) => { if (active) setInquiries(records); })
			.catch((requestError: unknown) => {
				if (!active) return;
				setError(requestError instanceof ApiError && [401, 403].includes(requestError.status)
					? "Your staff role is not permitted to view inquiries."
					: requestError instanceof Error ? requestError.message : "Unable to load inquiries.");
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
				<div><p className="text-xs font-semibold uppercase tracking-[0.13em] text-[#788279]">Guest requests</p><h2 className="mt-2 font-serif text-4xl text-[#263a31]">Inquiries</h2><p className="mt-2 text-sm text-[#778179]">{loading ? "Loading inquiries…" : `${inquiries.length} inquiries`}</p></div>
				<button type="button" onClick={() => { setError(null); setLoading(true); setRefreshKey((key) => key + 1); }} disabled={loading} aria-label="Refresh inquiries" className="grid h-10 w-10 place-items-center border border-[#ccd5cb] bg-white text-[#526258] hover:bg-[#f8faf6] disabled:opacity-50"><RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /></button>
			</div>
			<form onSubmit={submitSearch} className="mt-6 grid gap-3 border border-[#dce2da] bg-white p-4 sm:grid-cols-[minmax(220px,1fr)_190px_auto] sm:items-end">
				<label className="grid gap-1.5 text-xs font-semibold text-[#667168]">Search guest, subject, or message<span className="relative"><Search aria-hidden="true" className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#879188]" /><input value={searchText} onChange={(event) => setSearchText(event.target.value)} placeholder="Search inquiries" className="h-10 w-full border border-[#d3dbd1] pl-9 pr-3 text-sm font-normal text-[#263a31] outline-none focus:border-[#637e68]" /></span></label>
				<label className="grid gap-1.5 text-xs font-semibold text-[#667168]">Inquiry status<select value={status} onChange={(event) => changeStatus(event.target.value)} className="h-10 border border-[#d3dbd1] bg-white px-3 text-sm font-normal text-[#263a31] outline-none focus:border-[#637e68]"><option value="">All statuses</option>{inquiryStatuses.map((value) => <option key={value} value={value}>{value.replaceAll("_", " ")}</option>)}</select></label>
				<button type="submit" className="inline-flex h-10 items-center justify-center gap-2 bg-[#29443a] px-4 text-sm font-semibold text-white hover:bg-[#20382f]"><Search className="h-4 w-4" />Search</button>
			</form>
			{error && <div role="alert" className="mt-5 flex items-start gap-3 border border-[#e7c2b9] bg-[#fff5f1] p-4 text-sm text-[#884637]"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /><p>{error}</p></div>}
			<div className="mt-5 overflow-hidden border border-[#dce2da] bg-white">
				{loading ? <div className="grid gap-3 p-5" aria-label="Loading inquiries"><div className="h-10 animate-pulse bg-[#edf1eb]" /><div className="h-14 animate-pulse bg-[#f3f5f1]" /><div className="h-14 animate-pulse bg-[#f3f5f1]" /></div> : !error && inquiries.length === 0 ? <div className="px-6 py-16 text-center"><h3 className="font-serif text-xl text-[#263a31]">No inquiries found</h3><p className="mt-2 text-sm text-[#778179]">New guest requests will appear here.</p></div> : !error && <div className="overflow-x-auto"><table className="w-full min-w-[900px] border-collapse text-left text-sm">
					<thead className="bg-[#f7f9f5] text-[11px] uppercase tracking-wide text-[#778179]"><tr><th className="px-4 py-3 font-semibold">Inquiry</th><th className="px-4 py-3 font-semibold">Guest</th><th className="px-4 py-3 font-semibold">Stay</th><th className="px-4 py-3 font-semibold">Status</th><th className="px-4 py-3 font-semibold">Received</th></tr></thead>
					<tbody className="divide-y divide-[#e7ebe5]">{inquiries.map((inquiry) => <tr key={inquiry.id} className="align-top hover:bg-[#fbfcfa]"><td className="max-w-md px-4 py-4"><p className="font-semibold text-[#38483e]">{inquiry.subject}</p><p className="mt-1 line-clamp-2 text-[#68766c]">{inquiry.message || "No message provided"}</p><p className="mt-2 text-xs text-[#7b857d]">#{inquiry.id} · {inquiry.source}</p></td><td className="px-4 py-4"><p className="font-medium text-[#38483e]">{inquiry.name}</p><a className="mt-1 block break-all text-xs text-[#315c4d] hover:underline" href={`mailto:${inquiry.email}`}>{inquiry.email}</a><a className="mt-1 block text-xs text-[#315c4d] hover:underline" href={`tel:${inquiry.phone}`}>{inquiry.phone}</a></td><td className="px-4 py-4 text-[#526057]"><p>{formatDate(inquiry.check_in_date)}{inquiry.check_out_date ? ` – ${formatDate(inquiry.check_out_date)}` : ""}</p><p className="mt-1 text-xs text-[#778179]">{inquiry.preferred_room_type_name || "Room type not specified"} · {inquiry.number_of_guests} guest{inquiry.number_of_guests === 1 ? "" : "s"}</p></td><td className="px-4 py-4"><span className={`inline-flex border px-2 py-1 text-xs font-semibold ${statusStyles[inquiry.status]}`}>{inquiry.status.replaceAll("_", " ")}</span></td><td className="whitespace-nowrap px-4 py-4 text-xs text-[#68766c]">{formatTimestamp(inquiry.created_at)}</td></tr>)}</tbody>
				</table></div>}
			</div>
		</section>
	);
}