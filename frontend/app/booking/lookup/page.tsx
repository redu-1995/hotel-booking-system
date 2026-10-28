"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, Clock3, CreditCard, Mail, RefreshCw, ShieldCheck } from "lucide-react";

import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { ApiError } from "@/lib/api/client";
import {
	getManagedBooking,
	requestBookingAccessCode,
	retryManagedBookingPayment,
	verifyBookingAccessCode,
	type ManagedBooking,
} from "@/lib/api/booking-access";

type Step = "lookup" | "verify" | "manage";

function displayDate(value: string) {
	return new Intl.DateTimeFormat("en", { day: "numeric", month: "long", year: "numeric" }).format(new Date(`${value}T12:00:00`));
}

function displayTimestamp(value: string | null) {
	if (!value) return "Not available";
	return new Intl.DateTimeFormat("en", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

function displayAmount(value: string) {
	return new Intl.NumberFormat("en-US", { style: "currency", currency: "ETB", maximumFractionDigits: 2 }).format(Number(value));
}

function readable(value: string | null) {
	return value ? value.toLowerCase().replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase()) : "No payment recorded";
}

export default function BookingLookupPage() {
	const [step, setStep] = useState<Step>("lookup");
	const [bookingReference, setBookingReference] = useState("");
	const [email, setEmail] = useState("");
	const [code, setCode] = useState("");
	const [booking, setBooking] = useState<ManagedBooking | null>(null);
	const [loading, setLoading] = useState(true);
	const [submitting, setSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [notice, setNotice] = useState<string | null>(null);
	const [codeExpiresAt, setCodeExpiresAt] = useState<number | null>(null);
	const [resendAvailableAt, setResendAvailableAt] = useState<number | null>(null);
	const [secondsLeft, setSecondsLeft] = useState(0);
	const [resendSecondsLeft, setResendSecondsLeft] = useState(0);

	useEffect(() => {
		let active = true;
		getManagedBooking()
			.then((currentBooking) => {
				if (active) {
					setBooking(currentBooking);
					setBookingReference(currentBooking.booking_reference);
					setStep("manage");
				}
			})
			.catch(() => undefined)
			.finally(() => { if (active) setLoading(false); });
		return () => { active = false; };
	}, []);

	useEffect(() => {
		if (!codeExpiresAt && !resendAvailableAt) return;
		const updateCountdowns = () => {
			const now = Date.now();
			setSecondsLeft(codeExpiresAt ? Math.max(0, Math.ceil((codeExpiresAt - now) / 1000)) : 0);
			setResendSecondsLeft(resendAvailableAt ? Math.max(0, Math.ceil((resendAvailableAt - now) / 1000)) : 0);
		};
		updateCountdowns();
		const timer = window.setInterval(updateCountdowns, 1000);
		return () => window.clearInterval(timer);
	}, [codeExpiresAt, resendAvailableAt]);

	async function sendCode() {
		setSubmitting(true);
		setError(null);
		setNotice(null);
		try {
			const response = await requestBookingAccessCode(bookingReference.trim(), email.trim());
			setNotice(response.detail);
			setStep("verify");
			setCode("");
			setCodeExpiresAt(Date.now() + 10 * 60 * 1000);
			setResendAvailableAt(Date.now() + 60 * 1000);
		} catch (requestError) {
			setError(requestError instanceof Error ? requestError.message : "Unable to request a verification code.");
		} finally {
			setSubmitting(false);
		}
	}

	async function verifyCode(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setSubmitting(true);
		setError(null);
		try {
			await verifyBookingAccessCode(bookingReference.trim(), email.trim(), code.trim());
			const authorizedBooking = await getManagedBooking();
			setBooking(authorizedBooking);
			setStep("manage");
			setNotice(null);
		} catch (requestError) {
			setError(requestError instanceof Error ? requestError.message : "The code is invalid or has expired.");
		} finally {
			setSubmitting(false);
		}
	}

	async function retryPayment() {
		setSubmitting(true);
		setError(null);
		setNotice(null);
		try {
			const result = await retryManagedBookingPayment();
			if (result.checkout_url) {
				window.location.assign(result.checkout_url);
				return;
			}
			if (result.already_paid) {
				setBooking(result.booking ?? await getManagedBooking());
				setNotice("This booking is already paid.");
			}
		} catch (requestError) {
			if (requestError instanceof ApiError && requestError.status === 401) {
				setBooking(null);
				setStep("lookup");
				setError("Your booking access expired. Verify your email again to continue.");
			} else {
				setError(requestError instanceof Error ? requestError.message : "Unable to start payment.");
			}
		} finally {
			setSubmitting(false);
		}
	}

	const statusColor = booking?.booking_status === "CONFIRMED"
		? "border-[#c9ddca] bg-[#eef7ee] text-[#3d6841]"
		: booking?.booking_status === "HOLD"
			? "border-[#ead6a4] bg-[#fff8e6] text-[#815f19]"
			: "border-[#e5c7c3] bg-[#fbf0ee] text-[#8a5048]";

	return (
		<div className="flex min-h-screen flex-col bg-[#F8F7F4] text-[#1F2937]">
			<Header currentPage="booking" />
			<main className="flex-1 px-4 py-10 sm:px-6 sm:py-14">
				<div className="mx-auto max-w-3xl">
					<Link href="/" className="inline-flex items-center gap-2 text-sm text-[#526258] hover:text-[#12355B]"><ArrowLeft className="h-4 w-4" />Return to hotel</Link>
					<section className="mt-7 border-y border-[#D9D5CD] py-7 sm:py-9">
						<div className="flex flex-wrap items-start justify-between gap-5">
							<div>
								<p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#6B7280]">Booking access</p>
								<h1 className="mt-2 font-serif text-3xl font-semibold text-[#12355B] sm:text-4xl">Find your booking</h1>
								<p className="mt-2 max-w-xl text-sm leading-6 text-[#5B6064]">Review your reservation or continue payment using the email address you booked with.</p>
							</div>
							<ShieldCheck aria-hidden="true" className="mt-1 h-6 w-6 text-[#557460]" />
						</div>

						{loading ? <div className="mt-8 h-20 animate-pulse bg-white" aria-label="Checking for an active booking session" /> : (
							<>
								<div className="mt-7 grid grid-cols-3 border-y border-[#E5E1D9] text-xs sm:text-sm">
									{(["lookup", "verify", "manage"] as Step[]).map((value, index) => (
										<div key={value} className={`border-b-2 px-2 py-3 text-center ${step === value ? "border-[#12355B] font-semibold text-[#12355B]" : "border-transparent text-[#7B8185]"}`}>
											<span className="mr-1.5">0{index + 1}</span>{value === "lookup" ? "Find" : value === "verify" ? "Verify" : "Manage"}
										</div>
									))}
								</div>

								{error && <p role="alert" className="mt-5 border border-[#e7c2b9] bg-[#fff5f1] p-3.5 text-sm text-[#884637]">{error}</p>}
								{notice && <p role="status" className="mt-5 border border-[#c9ddca] bg-[#eef7ee] p-3.5 text-sm text-[#3d6841]">{notice}</p>}

								{step === "lookup" && (
									<form onSubmit={(event) => { event.preventDefault(); void sendCode(); }} className="mt-7 max-w-xl space-y-5">
										<label className="grid gap-1.5 text-sm font-medium text-[#35463d]">Booking reference
											<input required autoComplete="off" value={bookingReference} onChange={(event) => setBookingReference(event.target.value.toUpperCase())} placeholder="BK-XXXXXXXX" className="h-12 border border-[#cfd7ce] bg-white px-3 font-mono text-sm uppercase outline-none focus:border-[#536f5d] focus:ring-2 focus:ring-[#536f5d]/15" />
										</label>
										<label className="grid gap-1.5 text-sm font-medium text-[#35463d]">Email address used for booking
											<input required type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" className="h-12 border border-[#cfd7ce] bg-white px-3 text-sm outline-none focus:border-[#536f5d] focus:ring-2 focus:ring-[#536f5d]/15" />
										</label>
										<p className="flex items-start gap-2 text-xs leading-5 text-[#6B7280]"><Mail className="mt-0.5 h-4 w-4 shrink-0" />If the details match a booking, we’ll email a six-digit verification code to the address on file.</p>
										<button type="submit" disabled={submitting} className="inline-flex min-h-11 items-center justify-center gap-2 bg-[#12355B] px-5 text-sm font-semibold text-white hover:bg-[#0D2948] disabled:cursor-wait disabled:opacity-60">{submitting ? "Sending…" : "Find My Booking"}<ArrowRight className="h-4 w-4" /></button>
									</form>
								)}

								{step === "verify" && (
									<form onSubmit={verifyCode} className="mt-7 max-w-xl space-y-5">
										<div className="border border-[#dce2da] bg-white p-4 text-sm leading-6 text-[#526057]">Enter the code sent to the registered email address if the booking details match.</div>
										<label className="grid gap-1.5 text-sm font-medium text-[#35463d]">Six-digit code
											<input required autoComplete="one-time-code" inputMode="numeric" pattern="[0-9]{6}" maxLength={6} value={code} onChange={(event) => setCode(event.target.value.replace(/\D/g, "").slice(0, 6))} placeholder="000000" className="h-14 border border-[#cfd7ce] bg-white px-3 text-center font-mono text-2xl tracking-[0.3em] outline-none focus:border-[#536f5d] focus:ring-2 focus:ring-[#536f5d]/15" />
										</label>
										<p className="flex items-center gap-2 text-xs text-[#6B7280]"><Clock3 className="h-4 w-4" />Code expires in {Math.floor(secondsLeft / 60)}:{String(secondsLeft % 60).padStart(2, "0")}</p>
										<div className="flex flex-wrap gap-3">
											<button type="submit" disabled={submitting || code.length !== 6 || secondsLeft === 0} className="inline-flex min-h-11 items-center justify-center gap-2 bg-[#12355B] px-5 text-sm font-semibold text-white hover:bg-[#0D2948] disabled:cursor-not-allowed disabled:opacity-50">{submitting ? "Verifying…" : "Verify Code"}<ArrowRight className="h-4 w-4" /></button>
											<button type="button" disabled={submitting || resendSecondsLeft > 0} onClick={() => void sendCode()} className="inline-flex min-h-11 items-center justify-center gap-2 border border-[#cfd7ce] px-4 text-sm font-semibold text-[#35463d] hover:bg-white disabled:cursor-not-allowed disabled:opacity-50">{resendSecondsLeft > 0 ? `Resend in ${resendSecondsLeft}s` : "Resend code"}<RefreshCw className="h-4 w-4" /></button>
										</div>
										<button type="button" onClick={() => { setError(null); setNotice(null); setStep("lookup"); }} className="block text-sm text-[#526057] underline underline-offset-2">Use different booking details</button>
									</form>
								)}

								{step === "manage" && booking && (
									<div className="mt-7">
										<div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E5E1D9] pb-5">
											<div><p className="text-xs font-semibold uppercase tracking-wide text-[#6B7280]">Booking reference</p><p className="mt-1 font-mono text-lg font-bold text-[#12355B]">{booking.booking_reference}</p></div>
											<span className={`inline-flex border px-2.5 py-1 text-xs font-semibold ${statusColor}`}>{readable(booking.booking_status)}</span>
										</div>
										<dl className="divide-y divide-[#E5E1D9] text-sm">
											<div className="flex flex-wrap justify-between gap-2 py-4"><dt className="text-[#6B7280]">Room</dt><dd className="font-medium text-[#1F2937]">{booking.room_name} · Room {booking.room_number}</dd></div>
											<div className="flex flex-wrap justify-between gap-2 py-4"><dt className="text-[#6B7280]">Stay dates</dt><dd className="text-right font-medium text-[#1F2937]">{displayDate(booking.check_in_date)} – {displayDate(booking.check_out_date)}<span className="block text-xs font-normal text-[#6B7280]">{booking.nights} nights · {booking.number_of_guests} guests</span></dd></div>
											<div className="flex flex-wrap justify-between gap-2 py-4"><dt className="text-[#6B7280]">Payment status</dt><dd className="font-medium text-[#1F2937]">{readable(booking.payment_status)}</dd></div>
											<div className="flex flex-wrap justify-between gap-2 py-4"><dt className="text-[#6B7280]">Total / paid</dt><dd className="text-right font-medium">{displayAmount(booking.total_amount)} / {displayAmount(booking.amount_paid)}</dd></div>
											<div className="flex flex-wrap justify-between gap-2 py-4"><dt className="font-semibold text-[#12355B]">Amount due</dt><dd className="font-serif text-xl font-bold text-[#12355B]">{displayAmount(booking.amount_due)}</dd></div>
											<div className="flex flex-wrap justify-between gap-2 py-4"><dt className="text-[#6B7280]">Hold expires</dt><dd className="text-right font-medium text-[#1F2937]">{displayTimestamp(booking.hold_expires_at)}</dd></div>
										</dl>
										{booking.can_retry_payment ? (
											<button type="button" onClick={() => void retryPayment()} disabled={submitting} className="mt-6 inline-flex min-h-12 items-center justify-center gap-2 bg-[#12355B] px-6 text-sm font-semibold text-white hover:bg-[#0D2948] disabled:cursor-wait disabled:opacity-60">{submitting ? "Opening secure checkout…" : "Retry Payment"}<CreditCard className="h-4 w-4" /></button>
										) : <p className="mt-5 border border-[#dce2da] bg-white p-4 text-sm leading-6 text-[#526057]">{booking.retry_message || "This booking cannot be paid online right now."}</p>}
										{booking.transaction_reference && <p className="mt-4 break-all text-xs text-[#7B8185]">Latest transaction: {booking.transaction_reference}</p>}
									</div>
								)}
							</>
						)}
					</section>
				</div>
			</main>
			<Footer />
		</div>
	);
}