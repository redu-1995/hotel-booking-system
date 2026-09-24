"use client";

import React, { useState } from 'react';
import { BookingSearchState } from '../../types/types';
import { DatePickerInput, SelectDropdown } from '../ui/FormInputs';
import { Button } from '../ui/Button';
import { Search, ShieldCheck, Check } from 'lucide-react';

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
  const [searchError, setSearchError] = useState<string | null>(null);

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

    if (!searchState.checkIn || !searchState.checkOut) {
      setSearchError('Please choose both check-in and check-out dates.');
      return;
    }

    if (new Date(searchState.checkOut) <= new Date(searchState.checkIn)) {
      setSearchError('Check-out must be after check-in.');
      return;
    }

    setSearchError(null);
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
          <span>Find Your Stay</span>
        </div>

        <div className="flex items-center gap-4 text-xs text-[#6B7280]">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-[#16A34A]" />
            Best direct rate
          </span>
          <span className="hidden md:flex items-center gap-1">
            <Check className="w-3.5 h-3.5 text-[#12355B]" />
            Flexible booking
          </span>
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

        {searchError && (
          <div className="rounded-[8px] border border-[#FECACA] bg-[#FEF2F2] px-3 py-2 text-sm text-[#991B1B]" role="alert">
            {searchError}
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
