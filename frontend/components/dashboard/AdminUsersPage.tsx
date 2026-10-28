"use client";

import { useEffect, useState } from "react";
import { RefreshCw, Search, UserRoundCog } from "lucide-react";

import { ApiError } from "@/lib/api/client";
import { getStaffUsers, type User } from "@/lib/api/auth";

const roles = ["ADMIN", "MANAGER", "RECEPTIONIST", "HOUSEKEEPING"] as const;

function formatDate(value: string) {
	return new Intl.DateTimeFormat("en", { day: "numeric", month: "short", year: "numeric" }).format(new Date(value));
}

export default function AdminUsersPage() {
	const [users, setUsers] = useState<User[]>([]);
	const [searchText, setSearchText] = useState("");
	const [search, setSearch] = useState("");
	const [role, setRole] = useState("");
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [refreshKey, setRefreshKey] = useState(0);

	useEffect(() => {
		let active = true;
		const params = new URLSearchParams();
		if (search) params.set("search", search);
		if (role) params.set("role", role);
		getStaffUsers(params.toString())
			.then((records) => { if (active) setUsers(records); })
			.catch((requestError: unknown) => {
				if (!active) return;
				setError(requestError instanceof ApiError && [401, 403].includes(requestError.status)
					? "Your staff session is not permitted to view staff accounts."
					: requestError instanceof Error ? requestError.message : "Unable to load staff users.");
			})
			.finally(() => { if (active) setLoading(false); });
		return () => { active = false; };
	}, [search, role, refreshKey]);

	function submitSearch(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setLoading(true);
		setError(null);
		setSearch(searchText.trim());
	}

	function changeRole(value: string) {
		setLoading(true);
		setError(null);
		setRole(value);
	}

	return (
		<section>
			<div className="flex flex-wrap items-end justify-between gap-4 border-b border-[#d8dfd7] pb-6">
				<div><p className="text-xs font-semibold uppercase tracking-[0.13em] text-[#788279]">Staff directory</p><h1 className="mt-2 font-serif text-4xl text-[#263a31]">Users</h1><p className="mt-2 text-sm text-[#778179]">{loading ? "Loading staff accounts…" : `${users.length} staff accounts`}</p></div>
				<button type="button" onClick={() => { setError(null); setLoading(true); setRefreshKey((key) => key + 1); }} disabled={loading} aria-label="Refresh users" className="grid h-10 w-10 place-items-center border border-[#ccd5cb] bg-white text-[#526258] hover:bg-[#f8faf6] disabled:opacity-50"><RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /></button>
			</div>
			<form onSubmit={submitSearch} className="mt-6 grid gap-3 border border-[#dce2da] bg-white p-4 sm:grid-cols-[minmax(220px,1fr)_190px_auto] sm:items-end">
				<label className="grid gap-1.5 text-xs font-semibold text-[#667168]">Search name, username, or email<span className="relative"><Search aria-hidden="true" className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#879188]" /><input value={searchText} onChange={(event) => setSearchText(event.target.value)} placeholder="Search staff" className="h-10 w-full border border-[#d3dbd1] pl-9 pr-3 text-sm font-normal text-[#263a31] outline-none focus:border-[#637e68]" /></span></label>
				<label className="grid gap-1.5 text-xs font-semibold text-[#667168]">Staff role<select value={role} onChange={(event) => changeRole(event.target.value)} className="h-10 border border-[#d3dbd1] bg-white px-3 text-sm font-normal text-[#263a31] outline-none focus:border-[#637e68]"><option value="">All roles</option>{roles.map((value) => <option key={value} value={value}>{value.replaceAll("_", " ")}</option>)}</select></label>
				<button type="submit" className="inline-flex h-10 items-center justify-center gap-2 bg-[#29443a] px-4 text-sm font-semibold text-white hover:bg-[#20382f]"><Search className="h-4 w-4" />Search</button>
			</form>
			{error && <div role="alert" className="mt-5 border border-[#e7c2b9] bg-[#fff5f1] p-4 text-sm text-[#884637]">{error}</div>}
			<div className="mt-5 overflow-hidden border border-[#dce2da] bg-white">
				{loading ? <div className="grid gap-3 p-5" aria-label="Loading staff accounts"><div className="h-10 animate-pulse bg-[#edf1eb]" /><div className="h-14 animate-pulse bg-[#f3f5f1]" /><div className="h-14 animate-pulse bg-[#f3f5f1]" /></div> : !error && users.length === 0 ? <div className="px-6 py-16 text-center"><UserRoundCog aria-hidden="true" className="mx-auto h-6 w-6 text-[#748177]" /><h2 className="mt-3 font-serif text-xl text-[#263a31]">No staff accounts found</h2><p className="mt-2 text-sm text-[#778179]">Try a different name or role.</p></div> : !error && <div className="overflow-x-auto"><table className="w-full min-w-[780px] border-collapse text-left text-sm">
					<thead className="bg-[#f7f9f5] text-[11px] uppercase tracking-wide text-[#778179]"><tr><th className="px-5 py-3 font-semibold">Staff member</th><th className="px-5 py-3 font-semibold">Email</th><th className="px-5 py-3 font-semibold">Role</th><th className="px-5 py-3 font-semibold">Account status</th><th className="px-5 py-3 font-semibold">Created</th></tr></thead>
					<tbody className="divide-y divide-[#e7ebe5]">{users.map((user) => <tr key={user.id} className="hover:bg-[#fbfcfa]"><td className="px-5 py-4"><p className="font-semibold text-[#38483e]">{[user.first_name, user.last_name].filter(Boolean).join(" ") || user.username}</p><p className="mt-1 text-xs text-[#7b857d]">@{user.username} · Staff #{user.id}</p></td><td className="px-5 py-4"><a href={`mailto:${user.email}`} className="break-all text-[#526057] hover:underline">{user.email}</a></td><td className="px-5 py-4 text-[#526057]">{user.role.replaceAll("_", " ")}</td><td className="px-5 py-4"><span className={`inline-flex border px-2 py-1 text-xs font-semibold ${user.is_active ? "border-[#c9ddca] bg-[#eef7ee] text-[#3d6841]" : "border-[#e5c7c3] bg-[#fbf0ee] text-[#8a5048]"}`}>{user.is_active ? "Active" : "Inactive"}</span></td><td className="px-5 py-4 text-[#526057]">{formatDate(user.created_at)}</td></tr>)}</tbody>
				</table></div>}
			</div>
		</section>
	);
}