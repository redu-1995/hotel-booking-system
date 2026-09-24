import Link from "next/link";

export function InquiryCTA() {
  return (
    <section className="py-16 sm:py-18">
      <div className="container mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl rounded-[12px] border border-[#e2e5e7] bg-white p-8 text-center shadow-[0_1px_0_rgba(15,23,42,0.02)]">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#12355B]">Special requests</p>
        <h2 className="mt-3 font-serif text-4xl font-bold tracking-[-0.03em] text-[#12355B]">Planning a group stay or special event?</h2>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-[#718092]">
          Tell us your dates, guest count, and any preferences and our team will help arrange the right room and service for your stay.
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Link href="/booking" className="bg-[#062c53] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#0d2744]">Book Your Stay</Link>
          <Link href="/inquiry" className="border border-[#bfc9d2] px-6 py-3 text-sm font-bold text-[#12355B] transition hover:border-[#12355B]">Send an Inquiry</Link>
        </div>
      </div>
      </div>
    </section>
  );
}
