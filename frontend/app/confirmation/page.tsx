import Link from 'next/link';
import { Header } from '../../components/layout/Header';
import { Footer } from '../../components/layout/Footer';
import { API_URL } from '../../lib/api/client';
import type { BookingPaymentDetails } from '../../lib/api/bookings';

type ConfirmationPageProps = {
  searchParams: Promise<{ reference?: string | string[]; tx_ref?: string | string[] }>;
};

function firstParam(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(`${value}T12:00:00`));
}

export default async function ConfirmationPage({ searchParams }: ConfirmationPageProps) {
  const params = await searchParams;
  const reference = firstParam(params.reference);
  const transactionReference = firstParam(params.tx_ref);
  let verificationError: string | null = null;
  let booking: BookingPaymentDetails | null = null;

  if (transactionReference) {
    try {
      const response = await fetch(`${API_URL}/payments/chapa-verify-return/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tx_ref: transactionReference }),
        cache: 'no-store',
      });
      const result = await response.json();
      if (!response.ok) {
        verificationError = typeof result.detail === 'string'
          ? result.detail
          : 'Unable to verify this payment yet.';
      }
    } catch {
      verificationError = 'The payment service is unavailable. Please refresh to check the latest status.';
    }
  } else {
    verificationError = 'No payment transaction was provided for verification.';
  }

  if (reference) {
    try {
      const response = await fetch(
        `${API_URL}/bookings/payment-details/?booking_reference=${encodeURIComponent(reference)}`,
        { cache: 'no-store' },
      );
      if (response.ok) booking = await response.json() as BookingPaymentDetails;
    } catch {
      verificationError ||= 'Unable to load the latest booking status.';
    }
  }

  const isConfirmed = Boolean(
    booking?.booking_status === 'CONFIRMED'
    && booking.payment_status === 'COMPLETED'
    && Number(booking.amount_paid) >= Number(booking.total_amount),
  );

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F7F4] text-[#1F2937]">
      <Header currentPage="booking" />
      <main className="flex-1 px-4 py-12 sm:px-6 sm:py-16">
        <section className="mx-auto max-w-2xl border-y border-[#D9D5CD] py-8 sm:py-10">
          {isConfirmed && booking ? (
            <>
              <p className="text-xs font-semibold uppercase tracking-wider text-[#27644A]">Payment verified</p>
              <h1 className="mt-3 font-serif text-3xl font-bold text-[#12355B] sm:text-4xl">Booking Confirmed</h1>
              <p className="mt-3 text-sm leading-6 text-[#5B6064]">
                Chapa confirmed your payment and the hotel booking is now confirmed.
              </p>
              <dl className="mt-8 divide-y divide-[#E5E1D9] border-y border-[#E5E1D9] text-sm">
                <div className="flex flex-wrap justify-between gap-2 py-4">
                  <dt className="text-[#6B7280]">Booking reference</dt>
                  <dd className="font-mono font-semibold text-[#12355B]">{booking.booking_reference}</dd>
                </div>
                <div className="flex flex-wrap justify-between gap-2 py-4">
                  <dt className="text-[#6B7280]">Room</dt>
                  <dd className="text-right font-medium text-[#1F2937]">{booking.room_name}</dd>
                </div>
                <div className="flex flex-wrap justify-between gap-2 py-4">
                  <dt className="text-[#6B7280]">Dates</dt>
                  <dd className="text-right font-medium text-[#1F2937]">
                    {formatDate(booking.check_in_date)} – {formatDate(booking.check_out_date)}
                  </dd>
                </div>
                <div className="flex flex-wrap justify-between gap-2 py-4">
                  <dt className="text-[#6B7280]">Stay</dt>
                  <dd className="text-right font-medium text-[#1F2937]">
                    {booking.nights} {booking.nights === 1 ? 'night' : 'nights'} · {booking.number_of_guests} {booking.number_of_guests === 1 ? 'guest' : 'guests'}
                  </dd>
                </div>
                <div className="flex flex-wrap justify-between gap-2 py-4">
                  <dt className="font-semibold text-[#12355B]">Amount paid</dt>
                  <dd className="font-serif text-xl font-bold text-[#12355B]">
                    ETB {Number(booking.amount_paid).toLocaleString()}
                  </dd>
                </div>
                <div className="flex flex-wrap justify-between gap-2 py-4">
                  <dt className="text-[#6B7280]">Payment</dt>
                  <dd className="font-semibold text-[#27644A]">Paid</dd>
                </div>
              </dl>
              <p className="mt-5 text-sm text-[#5B6064]">
                A booking confirmation has been sent to your booking email. Hotel staff have also been notified when a notification address is configured.
              </p>
            </>
          ) : (
            <>
              <p className="text-xs font-semibold uppercase tracking-wider text-[#8A5A28]">Payment status</p>
              <h1 className="mt-3 font-serif text-3xl font-bold text-[#12355B] sm:text-4xl">
                Payment not confirmed yet
              </h1>
              <p className="mt-3 text-sm leading-6 text-[#5B6064]">
                {verificationError || 'The backend has not verified a successful payment. Your booking will remain on hold until verification succeeds.'}
              </p>
              {booking && (
                <p className="mt-5 text-sm text-[#5B6064]">
                  Booking {booking.booking_reference} · {booking.booking_status.toLowerCase()} · ETB {Number(booking.total_amount).toLocaleString()} due
                </p>
              )}
              {reference && (
                <Link
                  href={`/payment?reference=${encodeURIComponent(reference)}`}
                  className="mt-6 inline-flex min-h-11 items-center justify-center border border-[#12355B] px-5 text-sm font-semibold text-[#12355B] hover:bg-[#12355B]/5"
                >
                  Return to payment
                </Link>
              )}
            </>
          )}

          <Link
            href="/"
            className="mt-8 inline-flex min-h-11 items-center justify-center bg-[#12355B] px-5 text-sm font-semibold text-white transition-colors hover:bg-[#0D2948]"
          >
            Return to hotel
          </Link>
        </section>
      </main>
      <Footer />
    </div>
  );
}