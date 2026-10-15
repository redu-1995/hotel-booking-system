"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AlertCircle, RefreshCw } from "lucide-react";

import { ApiError, API_URL } from "@/lib/api/client";
import { getInquiries, Inquiry } from "@/lib/api/inquiries";

function formatDate(value: string | null): string {
	if (!value) return "Dates not specified";
	return new Intl.DateTimeFormat("en", {
		day: "numeric",
		month: "short",
		year: "numeric",
	}).format(new Date(`${value}T00:00:00`));
}

function formatTimestamp(value: string): string {
	return new Intl.DateTimeFormat("en", {
		dateStyle: "medium",
		timeStyle: "short",
	}).format(new Date(value));
}

function statusStyle(status: Inquiry["status"]): string {
	switch (status) {
		case "CONTACTED":
			return "bg-sky-50 text-sky-800";
		case "QUOTED":
			return "bg-amber-50 text-amber-800";
		case "CONVERTED":
			return "bg-emerald-50 text-emerald-800";
		case "CANCELLED":
			return "bg-rose-50 text-rose-800";
		default:
			return "bg-slate-100 text-slate-700";
	}
}

export default function DashboardInquiriesPage() {
	const [inquiries, setInquiries] = useState<Inquiry[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [needsStaffLogin, setNeedsStaffLogin] = useState(false);
	const [refreshKey, setRefreshKey] = useState(0);

	useEffect(() => {
		let isActive = true;

		getInquiries()
			.then((records) => {
				if (isActive) setInquiries(records);
			})
			.catch((requestError: unknown) => {
				if (!isActive) return;
				if (requestError instanceof ApiError && [401, 403].includes(requestError.status)) {
					setNeedsStaffLogin(true);
					setError("Staff access is required to view inquiries. Sign in with an authorized hotel account, then refresh.");
					return;
				}
				setError(requestError instanceof Error ? requestError.message : "Unable to load inquiries.");
			})
			.finally(() => {
				if (isActive) setIsLoading(false);
			});

		return () => {
			isActive = false;
		};
	}, [refreshKey]);

	const handleRefresh = () => {
		setError(null);
		setNeedsStaffLogin(false);
		setIsLoading(true);
		setRefreshKey((current) => current + 1);
	};

	return (
		<main className="min-h-screen bg-[#eef0ea] p-6 md:p-12">
			<div className="mx-auto max-w-7xl">
				<Link href="/dashboard" className="text-sm text-[var(--muted)] hover:text-[#12355B]">
					← Dashboard
				</Link>
				<div className="mt-10 flex flex-wrap items-end justify-between gap-4 border-b border-[#d8ded5] pb-6">
					<div>
						<p className="eyebrow">Operations</p>
						<h1 className="display mt-2 text-5xl">Inquiries</h1>
						<p className="mt-2 text-sm text-[var(--muted)]">
							{isLoading ? "Loading inquiries…" : `${inquiries.length} ${inquiries.length === 1 ? "inquiry" : "inquiries"}`}
						</p>
					</div>
					<button
						type="button"
						onClick={handleRefresh}
						disabled={isLoading}
						className="inline-flex items-center gap-2 border border-[#cbd3c9] bg-white px-4 py-2 text-sm font-medium text-[#24332a] hover:bg-[#f7f8f3] disabled:cursor-wait disabled:opacity-60"
					>
						<RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
						Refresh
					</button>
				</div>

				{error && (
					<div role="alert" className="mt-6 flex items-start gap-3 border border-rose-200 bg-rose-50 p-4 text-sm text-rose-900">
						<AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
						<div>
							<p>{error}</p>
							{needsStaffLogin && (
								<a className="mt-2 inline-block font-semibold underline" href={`${API_URL.replace(/\/api\/?$/, "")}/admin/`}>
									Open staff sign-in
								</a>
							)}
						</div>
					</div>
				)}

				{!error && !isLoading && inquiries.length === 0 && (
					<div className="mt-8 border border-dashed border-[#cbd3c9] bg-white/70 px-6 py-16 text-center">
						<h2 className="font-serif text-xl font-semibold text-[#24332a]">No inquiries yet</h2>
						<p className="mt-2 text-sm text-[var(--muted)]">New guest inquiries will appear here after submission.</p>
					</div>
				)}

				{!error && inquiries.length > 0 && (
					<div className="mt-6 overflow-x-auto border border-[#d8ded5] bg-white">
						<table className="w-full min-w-[900px] border-collapse text-left text-sm">
							<thead className="bg-[#f7f8f3] text-xs uppercase text-[var(--muted)]">
								<tr>
									<th className="px-5 py-3 font-semibold">Inquiry</th>
									<th className="px-5 py-3 font-semibold">Guest</th>
									<th className="px-5 py-3 font-semibold">Stay</th>
									<th className="px-5 py-3 font-semibold">Status</th>
									<th className="px-5 py-3 font-semibold">Received</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-[#e5e9e2]">
								{inquiries.map((inquiry) => (
									<tr key={inquiry.id} className="align-top hover:bg-[#fbfcf9]">
										<td className="max-w-md px-5 py-4">
											<p className="font-semibold text-[#24332a]">{inquiry.subject}</p>
											<p className="mt-1 line-clamp-2 text-[var(--muted)]">{inquiry.message}</p>
											<p className="mt-2 text-xs text-[var(--muted)]">#{inquiry.id} · {inquiry.source}</p>
										</td>
										<td className="px-5 py-4">
											<p className="font-medium text-[#24332a]">{inquiry.name}</p>
											<a className="mt-1 block text-[#315a70] hover:underline" href={`mailto:${inquiry.email}`}>
												{inquiry.email}
											</a>
											<a className="mt-1 block text-[#315a70] hover:underline" href={`tel:${inquiry.phone}`}>
												{inquiry.phone}
											</a>
										</td>
										<td className="px-5 py-4 text-[#435047]">
											<p>{formatDate(inquiry.check_in_date)}{inquiry.check_out_date ? ` – ${formatDate(inquiry.check_out_date)}` : ""}</p>
											<p className="mt-1 text-xs text-[var(--muted)]">
												{inquiry.preferred_room_type_name || "Room type not specified"} · {inquiry.number_of_guests} guest{inquiry.number_of_guests === 1 ? "" : "s"}
											</p>
										</td>
										<td className="px-5 py-4">
											<span className={`inline-flex px-2.5 py-1 text-xs font-semibold ${statusStyle(inquiry.status)}`}>
												{inquiry.status}
											</span>
										</td>
										<td className="whitespace-nowrap px-5 py-4 text-[var(--muted)]">
											{formatTimestamp(inquiry.created_at)}
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				)}
			</div>
		</main>
	);
}