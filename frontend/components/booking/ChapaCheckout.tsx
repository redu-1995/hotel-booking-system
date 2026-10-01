"use client";

import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { initiateChapaPayment } from '../../lib/api/payments';

interface ChapaCheckoutProps {
  bookingReference: string;
}

export function ChapaCheckout({ bookingReference }: ChapaCheckoutProps) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      const { checkout_url } = await initiateChapaPayment(bookingReference, email.trim());
      window.location.assign(checkout_url);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to start payment.');
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-6 max-w-md space-y-4">
      <div>
        <label htmlFor="chapa-guest-email" className="mb-1.5 block text-sm font-medium text-[#1F2937]">
          Booking email
        </label>
        <input
          id="chapa-guest-email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="h-11 w-full border border-[#D5D0C7] bg-white px-3 text-sm outline-none focus:border-[#12355B] focus:ring-2 focus:ring-[#12355B]/15"
        />
      </div>
      {error && <p className="text-sm text-[#991B1B]" role="alert">{error}</p>}
      <Button type="submit" size="lg" disabled={isSubmitting} isLoading={isSubmitting}>
        Continue to Chapa
      </Button>
      <p className="text-xs leading-5 text-[#6B7280]">
        Chapa securely processes the payment. The booking is confirmed only after Django verifies the transaction.
      </p>
    </form>
  );
}