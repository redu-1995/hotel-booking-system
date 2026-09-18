import React, { useState } from 'react';
import { BookingSearchState } from '../../types/types';
import { DatePickerInput, SelectDropdown } from '../ui/FormInputs';
import { Button } from '../ui/Button';
import { Search, Sparkles, ShieldCheck, Check } from 'lucide-react';

interface BookingSearchBarProps {
  searchState: BookingSearchState;
  onSearchChange: (newState: Partial<BookingSearchState>) => void;
  onSearchSubmit: () => void;
  isSearching?: boolean;
}

export const BookingSearchBar: React.FC<BookingSearchBarProps> = ({
  searchState,
  onSearchChange,
  onSearchSubmit,
  isSearching = false,
}) => {
  const [promoCode, setPromoCode] = useState('');
  const [showPromoInput, setShowPromoInput] = useState(false);

  const guestOptions = [
    { value: 1, label: '1 Guest', sublabel: 'Solo' },
    { value: 2, label: '2 Guests', sublabel: 'Couple / Standard' },
    { value: 3, label: '3 Guests', sublabel: 'Family / Small Group' },
    { value: 4, label: '4 Guests', sublabel: 'Suite / Executive' },
  ];

  const roomOptions = [
    { value: 1, label: '1 Room' },
    { value: 2, label: '2 Rooms' },
    { value: 3, label: '3 Rooms' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearchSubmit();
  };

  return (
    <div
      id="booking-search-card"
      className="w-full max-w-6xl mx-auto bg-white rounded-[12px] shadow-lg border border-[#E5E7EB] p-5 sm:p-7 relative z-20 transition-all duration-200"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-5 border-b border-[#E5E7EB]">
        <div className="flex items-center gap-2 text-sm font-semibold text-[#12355B]">
          <span className="w-2 h-2 rounded-full bg-[#D4A853]" />
          <span>Direct Hotel Booking Engine</span>
          <span className="hidden sm:inline-block text-xs font-normal text-[#6B7280]">
            — Official Rates & Instant Confirmation
          </span>
        </div>

        <div className="flex items-center gap-4 text-xs text-[#6B7280]">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-[#16A34A]" />
            Best Price Guarantee
          </span>
          <span className="hidden md:flex items-center gap-1">
            <Check className="w-3.5 h-3.5 text-[#12355B]" />
            Free Cancellation up to 24h
          </span>
          <button
            type="button"
            onClick={() => setShowPromoInput(!showPromoInput)}
            className="text-[#12355B] font-medium hover:underline flex items-center gap-1 cursor-pointer"
          >
            <Sparkles className="w-3 h-3 text-[#D4A853]" />
            {showPromoInput ? 'Hide Promo' : 'Have a Promo Code?'}
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Check-in Date */}
          <DatePickerInput
            id="search-check-in-date"
            label="Check-In"
            value={searchState.checkIn}
            min={new Date().toISOString().split('T')[0]}
            onChange={(e) => onSearchChange({ checkIn: e.target.value })}
            required
          />

          {/* Check-out Date */}
          <DatePickerInput
            id="search-check-out-date"
            label="Check-Out"
            value={searchState.checkOut}
            min={searchState.checkIn || new Date().toISOString().split('T')[0]}
            onChange={(e) => onSearchChange({ checkOut: e.target.value })}
            required
          />

          {/* Guests Select */}
          <SelectDropdown
            id="search-guests-select"
            label="Guests"
            options={guestOptions}
            value={searchState.guests}
            onChange={(e) => onSearchChange({ guests: Number(e.target.value) })}
          />

          {/* Rooms Select */}
          <SelectDropdown
            id="search-rooms-select"
            label="Rooms"
            options={roomOptions}
            value={searchState.rooms}
            onChange={(e) => onSearchChange({ rooms: Number(e.target.value) })}
          />
        </div>

        {/* Promo code drawer */}
        {showPromoInput && (
          <div className="pt-2 flex items-center gap-3 animate-in fade-in duration-200">
            <input
              type="text"
              placeholder="Enter special promo code (e.g. DIRECT10)"
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value)}
              className="max-w-xs bg-white border border-[#E5E7EB] text-[#1F2937] placeholder-[#6B7280] text-sm rounded-[8px] py-2 px-3 focus:outline-none focus:border-[#12355B]"
            />
            <span className="text-xs text-[#16A34A] font-medium">
              Direct bookings receive 10% auto-applied member credit
            </span>
          </div>
        )}

        {/* Action Row */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-[#6B7280] text-center sm:text-left">
            No credit card fee • Complimentary welcome drink upon check-in
          </div>
          <Button
            id="search-availability-btn"
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isSearching}
            leftIcon={<Search className="w-4 h-4" />}
            className="w-full sm:w-auto px-8"
          >
            Search Availability
          </Button>
        </div>
      </form>
    </div>
  );
};
