"use client";

import Link from "next/link";

export function BookingModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  return <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 grid place-items-center bg-[#062c53]/70 p-6"><div className="max-w-md bg-white p-7 text-[#152c43]"><button type="button" onClick={onClose} className="float-right text-xl" aria-label="Close booking dialog">×</button><p className="eyebrow">Start your booking</p><h2 className="mt-2 font-serif text-3xl font-bold">Choose your dates</h2><p className="mt-3 text-sm text-[#718092]">Continue to the booking page to check dates and guest details.</p><Link href="/booking" onClick={onClose} className="mt-6 inline-block bg-[#062c53] px-5 py-3 text-sm font-bold text-white">Open booking</Link></div></div>;
}
