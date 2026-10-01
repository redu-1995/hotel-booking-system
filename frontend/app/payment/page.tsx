import Link from 'next/link';
import { Header } from '../../components/layout/Header';
import { Footer } from '../../components/layout/Footer';
import { ChapaCheckout } from '../../components/booking/ChapaCheckout';
import { API_URL } from '../../lib/api/client';
import type { BookingPaymentDetails } from '../../lib/api/bookings';

type PaymentPageProps = {
  searchParams: Promise<{ reference?: string | string[] }>;
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(`${value}T12:00:00`));
}

export default async function PaymentPage({ searchParams }: PaymentPageProps) {
  const params = await searchParams;
  const reference = Array.isArray(params.reference) ? params.reference[0] : params.reference;
  let booking: BookingPaymentDetails | null = null;
  let errorMessage: string | null = null;

  if (reference) {
    try {
      const response = await fetch(
        `${API_URL}/bookings/payment-details/?booking_reference=${encodeURIComponent(reference)}`,
        { cache: 'no-store' },
      );
      const result = await response.json();
      if (!response.ok) {
        errorMessage = typeof result.detail === 'string' ? result.detail : 'Unable to load this booking.';
      } else {
        booking = result as BookingPaymentDetails;
      }
    } catch {
      errorMessage = 'The booking service is unavailable. Please try again shortly.';
    }
  } else {
    errorMessage = 'No booking reference was provided.';
  }

  const isHeld = booking?.booking_status === 'HOLD';
  const isConfirmed = booking?.booking_status === 'CONFIRMED';

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F7F4] text-[#1F2937]">
      <Header currentPage="booking" />
      <main className="flex-1 px-4 py-12 sm:px-6 sm:py-16">
        <section className="mx-auto max-w-2xl border-y border-[#D9D5CD] py-8 sm:py-10">
          {booking ? (
            <>
              <p className="text-xs font-semibold uppercase tracking-wider text-[#8A5A28]">
                {isHeld ? 'Payment step' : isConfirmed ? 'Booking complete' : 'Booking status'}
              </p>
              <h1 className="mt-3 font-serif text-3xl font-bold text-[#12355B] sm:text-4xl">
                {isHeld ? 'Booking held for payment' : isConfirmed ? 'Booking confirmed' : 'Booking is not awaiting payment'}
              </h1>
              <p className="mt-3 text-sm leading-6 text-[#5B6064]">
                {isHeld
                  ? 'Your room is held temporarily. Payment has not been made, and the booking is not yet confirmed.'
                  : isConfirmed
                    ? 'Chapa payment was verified by the hotel booking system.'
                    : `The current booking status is ${booking.booking_status.toLowerCase()}.`}
              </p>

              <dl className="mt-8 divide-y divide-[#E5E1D9] border-y border-[#E5E1D9] text-sm">
                <div className="flex flex-wrap justify-between gap-2 py-4">
                  <dt className="text-[#6B7280]">Booking reference</dt>
                  <dd className="font-mono font-semibold text-[#12355B]">{booking.booking_reference}</dd>
                </div>
                <div className="flex flex-wrap justify-between gap-2 py-4">
                  <dt className="text-[#6B7280]">Stay</dt>
                  <dd className="text-right font-medium text-[#1F2937]">{booking.room_name}</dd>
                </div>
                <div className="flex flex-wrap justify-between gap-2 py-4">
                  <dt className="text-[#6B7280]">Dates</dt>
                  <dd className="text-right font-medium text-[#1F2937]">
                    {formatDate(booking.check_in_date)} – {formatDate(booking.check_out_date)}
                  </dd>
                </div>
                <div className="flex flex-wrap justify-between gap-2 py-4">
                  <dt className="text-[#6B7280]">Duration</dt>
                  <dd className="text-right font-medium text-[#1F2937]">
                    {booking.nights} {booking.nights === 1 ? 'night' : 'nights'}
                  </dd>
                </div>
                <div className="flex flex-wrap justify-between gap-2 py-4">
                  <dt className="text-[#6B7280]">Guests</dt>
                  <dd className="text-right font-medium text-[#1F2937]">
                    {booking.number_of_guests} {booking.number_of_guests === 1 ? 'guest' : 'guests'}
                  </dd>
                </div>
                <div className="flex flex-wrap justify-between gap-2 py-4">
                  <dt className="text-[#6B7280]">Room rate</dt>
                  <dd className="text-right font-medium text-[#1F2937]">
                    ETB {Number(booking.room_rate).toLocaleString()} / night
                  </dd>
                </div>
                <div className="flex flex-wrap justify-between gap-2 py-4">
                  <dt className="text-[#6B7280]">Room subtotal · {booking.nights} nights</dt>
                  <dd className="text-right font-medium text-[#1F2937]">
                    ETB {Number(booking.room_subtotal).toLocaleString()}
                  </dd>
                </div>
                <div className="flex flex-wrap justify-between gap-2 py-4">
                  <dt className="font-semibold text-[#12355B]">{isConfirmed ? 'Amount paid' : 'Amount due'}</dt>
                  <dd className="font-serif text-xl font-bold text-[#12355B]">
                    ETB {Number(isConfirmed ? booking.amount_paid : booking.total_amount).toLocaleString()}
                  </dd>
                </div>
              </dl>

              {isHeld && booking.hold_expires_at && (
                <p className="mt-5 text-sm text-[#5B6064]">
                  Payment hold deadline: {new Intl.DateTimeFormat('en', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit',
                    timeZone: 'UTC',
                    timeZoneName: 'short',
                  }).format(new Date(booking.hold_expires_at))}.
                </p>
              )}

              {isHeld && booking.chapa_enabled ? (
                <ChapaCheckout bookingReference={booking.booking_reference} />
              ) : isHeld ? (
                <div className="mt-6 border-l-2 border-[#D1A75C] pl-4 text-sm leading-6 text-[#5B6064]">
                  Chapa checkout is not configured. No payment has been recorded. Contact the hotel to arrange payment before the hold expires.
                </div>
              ) : null}
            </>
          ) : (
            <>
              <p className="text-xs font-semibold uppercase tracking-wider text-[#8A5A28]">Payment step</p>
              <h1 className="mt-3 font-serif text-3xl font-bold text-[#12355B]">Booking details unavailable</h1>
              <p className="mt-3 text-sm leading-6 text-[#5B6064]">{errorMessage}</p>
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