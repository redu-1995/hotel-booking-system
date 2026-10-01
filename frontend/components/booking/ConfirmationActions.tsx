'use client';

import Link from 'next/link';
import type { BookingPaymentDetails } from '../../lib/api/bookings';

export function ConfirmationActions({ booking }: { booking: BookingPaymentDetails }) {
  function downloadConfirmation() {
    const content = [
      'The Grandview Hotel & Suites',
      'Booking Confirmation and Payment Receipt',
      '',
      `Booking reference: ${booking.booking_reference}`,
      `Room: ${booking.room_name}`,
      `Check-in: ${booking.check_in_date}`,
      `Check-out: ${booking.check_out_date}`,
      `Guests: ${booking.number_of_guests}`,
      `Nights: ${booking.nights}`,
      `Amount paid: ETB ${booking.amount_paid}`,
      'Payment status: COMPLETED',
      `Payment method: ${booking.payment_method ?? 'Not provided'}`,
      `Transaction reference: ${booking.transaction_reference ?? 'Not provided'}`,
      `Provider reference: ${booking.provider_reference ?? 'Not provided'}`,
      `Hotel contact: ${booking.hotel_contact_email} | ${booking.hotel_contact_phone}`,
    ].join('\n');
    const url = URL.createObjectURL(new Blob([content], { type: 'text/plain;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `booking-${booking.booking_reference}.txt`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  return (
    <div className="mt-6 flex flex-wrap gap-3">
      <Link
        href="#booking-details"
        className="inline-flex min-h-11 items-center justify-center border border-[#12355B] px-5 text-sm font-semibold text-[#12355B] hover:bg-[#12355B]/5"
      >
        View booking
      </Link>
      <button
        type="button"
        onClick={downloadConfirmation}
        className="inline-flex min-h-11 items-center justify-center border border-[#D9D5CD] px-5 text-sm font-semibold text-[#1F2937] hover:bg-white"
      >
        Download confirmation
      </button>
    </div>
  );
}