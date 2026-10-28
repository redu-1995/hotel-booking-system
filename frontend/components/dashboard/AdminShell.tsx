"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
	BedDouble,
	CalendarDays,
	ChartNoAxesColumnIncreasing,
	ChevronRight,
	DoorOpen,
	LogOut,
	Menu,
	MessageSquareText,
	Users,
	X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { ApiError } from "@/lib/api/client";
import { getCurrentUser, login, logout, type User } from "@/lib/api/auth";

const navigation: { href: string; label: string; icon: LucideIcon }[] = [
	{ href: "/admin", label: "Overview", icon: ChartNoAxesColumnIncreasing },
	{ href: "/admin/bookings", label: "Bookings", icon: CalendarDays },
	{ href: "/dashboard/inquiries", label: "Inquiries", icon: MessageSquareText },
	{ href: "/admin/rooms", label: "Rooms", icon: BedDouble },
	{ href: "/admin/guests", label: "Guests", icon: Users },
	{ href: "/admin/payments", label: "Payments", icon: DoorOpen },
];

type Props = Readonly<{ children: React.ReactNode }>;

export default function AdminShell({ children }: Props) {
	const pathname = usePathname();
	const [user, setUser] = useState<User | null>(null);
	const [checkingSession, setCheckingSession] = useState(true);
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		let active = true;
		getCurrentUser()
			.then((currentUser) => { if (active) setUser(currentUser); })
			.catch((requestError: unknown) => {
				if (!active) return;
				setError(requestError instanceof ApiError && [401, 403].includes(requestError.status)
					? "Sign in with an authorized hotel staff account to continue."
					: requestError instanceof Error ? requestError.message : "Unable to verify your staff session.");
			})
			.finally(() => { if (active) setCheckingSession(false); });
		return () => { active = false; };
	}, []);

	async function handleLogin(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setIsSubmitting(true);
		setError(null);
		try {
			await login(username, password);
			const currentUser = await getCurrentUser();
			setUser(currentUser);
			setPassword("");
		} catch (requestError) {
			setError(requestError instanceof Error ? requestError.message : "Unable to sign in.");
		} finally {
			setIsSubmitting(false);
		}
	}

	async function handleLogout() {
		try {
			await logout();
		} finally {
			setUser(null);
			setPassword("");
		}
	}

	if (checkingSession) {
		return <main className="grid min-h-screen place-items-center bg-[#f2f4ef] text-sm text-[#526258]">Checking staff session…</main>;
	}

	if (!user) {
		return (
			<main className="grid min-h-screen place-items-center bg-[#f2f4ef] px-5 py-12">
				<section className="w-full max-w-md border border-[#d9dfd7] bg-white p-7 sm:p-9">
					<Link href="/" className="font-serif text-lg font-semibold tracking-wide text-[#29443a]">ASTERIA HOUSE</Link>
					<p className="mt-10 text-xs font-semibold uppercase tracking-[0.12em] text-[#777f78]">Staff access</p>
					<h1 className="mt-2 font-serif text-3xl text-[#263a31]">Sign in to operations</h1>
					<p className="mt-2 text-sm leading-6 text-[#68736b]">Use your hotel staff account to manage arrivals and reservations.</p>
					{error && <p role="alert" className="mt-5 border border-[#e7c2b9] bg-[#fff5f1] p-3 text-sm text-[#884637]">{error}</p>}
					<form onSubmit={handleLogin} className="mt-6 grid gap-4">
						<label className="grid gap-1.5 text-sm font-medium text-[#35463d]">
							Username or email
							<input autoComplete="username" required value={username} onChange={(event) => setUsername(event.target.value)} className="h-11 border border-[#cfd7ce] px-3 outline-none focus:border-[#536f5d] focus:ring-2 focus:ring-[#536f5d]/15" />
						</label>
						<label className="grid gap-1.5 text-sm font-medium text-[#35463d]">
							Password
							<input type="password" autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)} className="h-11 border border-[#cfd7ce] px-3 outline-none focus:border-[#536f5d] focus:ring-2 focus:ring-[#536f5d]/15" />
						</label>
						<button disabled={isSubmitting} className="mt-2 inline-flex h-11 items-center justify-center bg-[#29443a] px-4 text-sm font-semibold text-white hover:bg-[#20382f] disabled:cursor-wait disabled:opacity-60">
							{isSubmitting ? "Signing in…" : "Continue"}
						</button>
					</form>
				</section>
			</main>
		);
	}

	const activeLink = (href: string) => href === "/admin"
		? pathname === href
		: pathname === href || pathname.startsWith(`${href}/`);

	return (
		<div className="min-h-screen bg-[#f2f4ef] text-[#263a31]">
			<aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-[#d8dfd7] bg-[#fafbf8] px-5 py-6 lg:flex">
				<Link href="/admin" className="font-serif text-xl font-semibold tracking-wide text-[#29443a]">ASTERIA HOUSE</Link>
				<p className="mt-12 px-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#858d84]">Hotel operations</p>
				<nav aria-label="Admin navigation" className="mt-3 grid gap-1">
					{navigation.map(({ href, label, icon: Icon }) => (
						<Link key={href} href={href} className={`flex h-10 items-center gap-3 px-3 text-sm transition-colors ${activeLink(href) ? "bg-[#e9eee7] font-semibold text-[#29443a]" : "text-[#5e6a61] hover:bg-[#f0f3ed] hover:text-[#29443a]"}`}>
							<Icon aria-hidden="true" className="h-4 w-4" />{label}
						</Link>
					))}
				</nav>
				<div className="mt-auto border-t border-[#e1e5df] pt-4">
					<p className="truncate px-3 text-sm font-medium">{user.first_name || user.username}</p>
					<p className="px-3 pt-1 text-xs text-[#7b857d]">{user.role.replaceAll("_", " ")}</p>
					<button type="button" onClick={handleLogout} className="mt-4 flex h-10 w-full items-center gap-3 px-3 text-sm text-[#6c756e] hover:bg-[#f0f3ed] hover:text-[#29443a]">
						<LogOut aria-hidden="true" className="h-4 w-4" />Log out
					</button>
				</div>
			</aside>

			<div className="lg:pl-64">
				<header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-[#d8dfd7] bg-[#fafbf8]/95 px-4 backdrop-blur sm:px-7">
					<Link href="/admin" className="font-serif text-lg font-semibold tracking-wide text-[#29443a] lg:hidden">ASTERIA HOUSE</Link>
					<div className="hidden text-xs text-[#788279] sm:block">Front desk <ChevronRight className="mx-1 inline h-3 w-3" /> Operations</div>
					<div className="ml-auto flex items-center gap-3">
						<span className="hidden text-sm text-[#59665d] sm:inline">{user.first_name || user.username}</span>
						<button type="button" onClick={() => setMobileMenuOpen((open) => !open)} aria-label={mobileMenuOpen ? "Close navigation" : "Open navigation"} aria-expanded={mobileMenuOpen} className="grid h-9 w-9 place-items-center text-[#526258] hover:bg-[#edf1ea] lg:hidden">
							{mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
						</button>
					</div>
				</header>
				{mobileMenuOpen && (
					<nav aria-label="Mobile admin navigation" className="absolute inset-x-0 top-14 z-20 border-b border-[#d8dfd7] bg-[#fafbf8] p-3 shadow-md lg:hidden">
						{navigation.map(({ href, label, icon: Icon }) => (
							<Link key={href} href={href} onClick={() => setMobileMenuOpen(false)} className={`flex h-11 items-center gap-3 px-3 text-sm ${activeLink(href) ? "bg-[#e9eee7] font-semibold text-[#29443a]" : "text-[#5e6a61]"}`}>
								<Icon aria-hidden="true" className="h-4 w-4" />{label}
							</Link>
						))}
						<button type="button" onClick={handleLogout} className="flex h-11 w-full items-center gap-3 px-3 text-sm text-[#5e6a61]"><LogOut className="h-4 w-4" />Log out</button>
					</nav>
					)}
				<main className="mx-auto w-full max-w-[1440px] px-4 py-7 sm:px-7 sm:py-9">{children}</main>
			</div>
		</div>
	);
}