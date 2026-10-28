"use client";

import { useEffect, useState } from "react";
import { RefreshCw, Search } from "lucide-react";

import { PaymentStatusBadge } from "@/components/dashboard/BookingStatusBadge";
import { ApiError } from "@/lib/api/client";
import { getPayments, type Payment, type PaymentStatus } from "@/lib/api/payments";

const paymentStatuses = ["PENDING", "COMPLETED", "FAILED", "REFUNDED"] as const;
const paymentMethods = ["CREDIT_CARD", "DEBIT_CARD", "CASH", "BANK_TRANSFER", "STRIPE", "PAYPAL", "CHAPA"] as const;

function formatDate(value: string) {
	return new Intl.DateTimeFormat("en", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

function formatAmount(value: string) {
	return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(Number(value));
}

export default function AdminPaymentsPage() {
	const [payments, setPayments] = useState<Payment[]>([]);
	const [searchText, setSearchText] = useState("");
	const [search, setSearch] = useState("");
	const [status, setStatus] = useState("");
	const [method, setMethod] = useState("");
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [refreshKey, setRefreshKey] = useState(0);

	useEffect(() => {
		let active = true;
		const params = new URLSearchParams();
		if (search) params.set("search", search);
		if (status) params.set("status", status);
		if (method) params.set("payment_method", method);
		getPayments(params.toString())
			.then((records) => { if (active) setPayments(records); })
			.catch((requestError: unknown) => {
				if (!active) return;
				setError(requestError instanceof ApiError && [401, 403].includes(requestError.status)
					? "Your staff role is not permitted to view payment records."
					: requestError instanceof Error ? requestError.message : "Unable to load payments.");
			})
			.finally(() => { if (active) setLoading(false); });
		return () => { active = false; };
	}, [search, status, method, refreshKey]);

	function submitSearch(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setLoading(true);
		setError(null);
		setSearch(searchText.trim());
	}

	function changeFilter(setter: (value: string) => void, value: string) {
		setLoading(true);
		setError(null);
		setter(value);
	}

	return (
		<section>
			<div className="flex flex-wrap items-end justify-between gap-4 border-b border-[#d8dfd7] pb-6">
				<div><p className="text-xs font-semibold uppercase tracking-[0.13em] text-[#788279]">Transactions</p><h1 className="mt-2 font-serif text-4xl text-[#263a31]">Payments</h1><p className="mt-2 text-sm text-[#778179]">{loading ? "Loading payment records…" : `${payments.length} payments`}</p></div>
				<button type="button" onClick={() => { setError(null); setLoading(true); setRefreshKey((key) => key + 1); }} disabled={loading} aria-label="Refresh payments" className="grid h-10 w-10 place-items-center border border-[#ccd5cb] bg-white text-[#526258] hover:bg-[#f8faf6] disabled:opacity-50"><RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /></button>
			</div>
			<form onSubmit={submitSearch} className="mt-6 grid gap-3 border border-[#dce2da] bg-white p-4 md:grid-cols-[minmax(220px,1fr)_190px_200px_auto] md:items-end">
				<label className="grid gap-1.5 text-xs font-semibold text-[#667168]">Search transaction, booking, or guest<span className="relative"><Search aria-hidden="true" className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#879188]" /><input value={searchText} onChange={(event) => setSearchText(event.target.value)} placeholder="Reference or guest name" className="h-10 w-full border border-[#d3dbd1] pl-9 pr-3 text-sm font-normal text-[#263a31] outline-none focus:border-[#637e68]" /></span></label>
				<label className="grid gap-1.5 text-xs font-semibold text-[#667168]">Payment status<select value={status} onChange={(event) => changeFilter(setStatus, event.target.value)} className="h-10 border border-[#d3dbd1] bg-white px-3 text-sm font-normal text-[#263a31] outline-none focus:border-[#637e68]"><option value="">All statuses</option>{paymentStatuses.map((value) => <option key={value} value={value}>{value}</option>)}</select></label>
				<label className="grid gap-1.5 text-xs font-semibold text-[#667168]">Method<select value={method} onChange={(event) => changeFilter(setMethod, event.target.value)} className="h-10 border border-[#d3dbd1] bg-white px-3 text-sm font-normal text-[#263a31] outline-none focus:border-[#637e68]"><option value="">All methods</option>{paymentMethods.map((value) => <option key={value} value={value}>{value.replaceAll("_", " ")}</option>)}</select></label>
				<button type="submit" className="inline-flex h-10 items-center justify-center gap-2 bg-[#29443a] px-4 text-sm font-semibold text-white hover:bg-[#20382f]"><Search className="h-4 w-4" />Search</button>
			</form>
			{error && <div role="alert" className="mt-5 border border-[#e7c2b9] bg-[#fff5f1] p-4 text-sm text-[#884637]">{error}</div>}
			<div className="mt-5 overflow-hidden border border-[#dce2da] bg-white">
				{loading ? <div className="grid gap-3 p-5" aria-label="Loading payments"><div className="h-10 animate-pulse bg-[#edf1eb]" /><div className="h-14 animate-pulse bg-[#f3f5f1]" /><div className="h-14 animate-pulse bg-[#f3f5f1]" /></div> : !error && payments.length === 0 ? <div className="px-6 py-16 text-center"><h2 className="font-serif text-xl text-[#263a31]">No payments found</h2><p className="mt-2 text-sm text-[#778179]">Try another search or filter.</p></div> : !error && <div className="overflow-x-auto"><table className="w-full min-w-[1000px] border-collapse text-left text-sm">
					<thead className="bg-[#f7f9f5] text-[11px] uppercase tracking-wide text-[#778179]"><tr><th className="px-4 py-3 font-semibold">Transaction</th><th className="px-4 py-3 font-semibold">Booking / Guest</th><th className="px-4 py-3 font-semibold">Amount</th><th className="px-4 py-3 font-semibold">Method</th><th className="px-4 py-3 font-semibold">Status</th><th className="px-4 py-3 font-semibold">Submitted</th><th className="px-4 py-3 font-semibold">Verified by</th></tr></thead>
					<tbody className="divide-y divide-[#e7ebe5]">{payments.map((payment) => <tr key={payment.id} className="hover:bg-[#fbfcfa]"><td className="px-4 py-4"><p className="max-w-[220px] break-all font-medium text-[#38483e]">{payment.transaction_reference || "No transaction reference"}</p><p className="mt-1 text-xs text-[#7b857d]">Payment #{payment.id}</p></td><td className="px-4 py-4"><p className="font-semibold text-[#315c4d]">{payment.booking_details.booking_reference}</p><p className="mt-1 text-xs text-[#68766c]">{payment.booking_details.guest_name}</p></td><td className="whitespace-nowrap px-4 py-4 font-medium text-[#38483e]">{formatAmount(payment.amount)}</td><td className="px-4 py-4 text-[#526057]">{payment.payment_method.replaceAll("_", " ")}</td><td className="px-4 py-4"><PaymentStatusBadge status={payment.status as PaymentStatus} /></td><td className="whitespace-nowrap px-4 py-4 text-[#526057]">{formatDate(payment.submitted_at)}</td><td className="px-4 py-4 text-[#526057]">{payment.verified_by_name || "Not verified"}</td></tr>)}</tbody>
				</table></div>}
			</div>
		</section>
	);
}