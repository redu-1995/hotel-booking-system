"use client";

import React, { useState } from 'react';
import { Room, BookingSearchState, Reservation } from '../../types/types';
import { Button } from '../ui/Button';
import { TextInput, DatePickerInput, SelectDropdown } from '../ui/FormInputs';
import { StatusBadge } from '../ui/Badge';
import { X, CheckCircle2, ShieldCheck, CreditCard, Sparkles, Calendar, User, Bed, Mail, Phone, Lock } from 'lucide-react';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedRoom: Room;
  allRooms: Room[];
  searchState: BookingSearchState;
  onConfirmReservation: (reservation: Reservation) => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  isOpen,
  onClose,
  selectedRoom: initialRoom,
  allRooms,
  searchState,
  onConfirmReservation,
}) => {
  if (!isOpen) return null;

  const [currentRoom, setCurrentRoom] = useState<Room>(initialRoom || allRooms[0]);
  const [checkIn, setCheckIn] = useState<string>(
    searchState.checkIn || new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0]
  );
  const [checkOut, setCheckOut] = useState<string>(
    searchState.checkOut || new Date(Date.now() + 86400000 * 6).toISOString().split('T')[0]
  );
  const [guests, setGuests] = useState<number>(searchState.guests || 2);
  const [roomsCount, setRoomsCount] = useState<number>(searchState.rooms || 1);

  // Guest details
  const [guestName, setGuestName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [specialRequests, setSpecialRequests] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmedReservation, setConfirmedReservation] = useState<Reservation | null>(null);

  // Calculate nights
  const calculateNights = () => {
    try {
      const d1 = new Date(checkIn);
      const d2 = new Date(checkOut);
      const diffTime = Math.abs(d2.getTime() - d1.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return isNaN(diffDays) || diffDays < 1 ? 1 : diffDays;
    } catch {
      return 1;
    }
  };

  const nights = calculateNights();
  const subtotal = currentRoom.pricePerNight * nights * roomsCount;
  const directDiscount = Math.round(subtotal * 0.1); // 10% direct booking benefit
  const taxes = Math.round((subtotal - directDiscount) * 0.08);
  const total = subtotal - directDiscount + taxes;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      const newReservation: Reservation = {
        id: `res-${Date.now()}`,
        referenceNumber: `GV-DIR-${Math.floor(10000 + Math.random() * 90000)}`,
        roomId: currentRoom.id,
        roomName: currentRoom.name,
        guestName,
        email,
        phone,
        checkIn,
        checkOut,
        nights,
        guests,
        roomsCount,
        totalPrice: total,
        status: 'confirmed',
        specialRequests,
        createdAt: new Date().toISOString(),
      };

      onConfirmReservation(newReservation);
      setConfirmedReservation(newReservation);
      setIsSubmitting(false);
    }, 800);
  };

  return (
    <div
      id="booking-modal-backdrop"
      className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        id="booking-modal"
        className="relative w-full max-w-3xl bg-white rounded-[12px] shadow-2xl border border-[#E5E7EB] overflow-hidden my-6 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-white/90 hover:bg-white text-[#1F2937] flex items-center justify-center shadow-md transition-colors cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {confirmedReservation ? (
          /* Confirmation Success Screen */
          <div className="p-8 sm:p-10 text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-[#DCFCE7] text-[#16A34A] flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div>
              <div className="mb-2">
                <StatusBadge status="confirmed" />
              </div>
              <h2 className="font-serif font-bold text-2xl sm:text-3xl text-[#12355B]">
                Your Reservation is Confirmed!
              </h2>
              <p className="text-sm text-[#6B7280] mt-2 max-w-lg mx-auto">
                Thank you for booking directly with <strong className="text-[#12355B]">The Grandview Hotel</strong>. A confirmation email with receipt and check-in instructions has been sent to <span className="font-medium text-[#1F2937]">{email}</span>.
              </p>
            </div>

            {/* Reservation Summary Card */}
            <div className="p-6 bg-[#F8F7F4] rounded-[12px] border border-[#E5E7EB] text-left max-w-lg mx-auto space-y-3">
              <div className="flex items-center justify-between pb-3 border-b border-[#E5E7EB]">
                <span className="text-xs uppercase text-[#6B7280] font-semibold">Booking Reference</span>
                <span className="font-mono font-bold text-base text-[#12355B]">
                  {confirmedReservation.referenceNumber}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs sm:text-sm">
                <div className="text-[#6B7280]">Guest Name:</div>
                <div className="font-medium text-right text-[#1F2937]">{confirmedReservation.guestName}</div>
                <div className="text-[#6B7280]">Room Reserved:</div>
                <div className="font-medium text-right text-[#1F2937]">{confirmedReservation.roomName}</div>
                <div className="text-[#6B7280]">Stay Dates:</div>
                <div className="font-medium text-right text-[#1F2937]">{confirmedReservation.checkIn} to {confirmedReservation.checkOut}</div>
                <div className="text-[#6B7280]">Duration:</div>
                <div className="font-medium text-right text-[#1F2937]">{confirmedReservation.nights} Nights, {confirmedReservation.guests} Guests</div>
                <div className="text-[#6B7280]">Total Paid at Check-in:</div>
                <div className="font-bold text-right text-[#12355B] text-base">${confirmedReservation.totalPrice} USD</div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Button
                variant="primary"
                size="md"
                onClick={onClose}
                className="w-full sm:w-auto px-8"
              >
                Return to Homepage
              </Button>
            </div>
          </div>
        ) : (
          /* Direct Booking Form */
          <div>
            {/* Header */}
            <div className="bg-[#12355B] text-white p-6 sm:p-7">
              <div className="flex items-center gap-2 text-xs text-[#D4A853] font-semibold uppercase tracking-wider mb-1">
                <Sparkles className="w-3.5 h-3.5" /> Direct Reservation Guarantee
              </div>
              <h2 className="font-serif font-bold text-2xl sm:text-3xl">
                Book Your Stay
              </h2>
              <p className="text-xs sm:text-sm text-white/80 mt-1">
                Instant confirmation • No booking fees • Complimentary room upgrade when available
              </p>
            </div>

            <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6 max-h-[70vh] overflow-y-auto">
              {/* Room Selection */}
              <div>
                <label className="block text-sm font-medium text-[#1F2937] mb-2">
                  Select Room
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {allRooms.map((room) => {
                    const isSelected = room.id === currentRoom.id;
                    return (
                      <button
                        type="button"
                        key={room.id}
                        onClick={() => setCurrentRoom(room)}
                        className={`p-3 rounded-[8px] border text-left transition-all cursor-pointer ${
                          isSelected
                            ? 'border-[#12355B] bg-[#12355B]/5 ring-1 ring-[#12355B]'
                            : 'border-[#E5E7EB] bg-white hover:border-[#12355B]/40'
                        }`}
                      >
                        <div className="font-serif font-semibold text-sm text-[#12355B] mb-0.5 truncate">
                          {room.name}
                        </div>
                        <div className="text-xs font-semibold text-[#D4A853]">
                          ${room.pricePerNight}/night
                        </div>
                        <div className="text-[11px] text-[#6B7280] mt-1 truncate">
                          {room.bedType}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Dates and Occupancy */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3.5">
                <DatePickerInput
                  id="modal-check-in"
                  label="Check-In"
                  value={checkIn}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setCheckIn(e.target.value)}
                  required
                />
                <DatePickerInput
                  id="modal-check-out"
                  label="Check-Out"
                  value={checkOut}
                  min={checkIn || new Date().toISOString().split('T')[0]}
                  onChange={(e) => setCheckOut(e.target.value)}
                  required
                />
                <SelectDropdown
                  id="modal-guests"
                  label="Guests"
                  value={guests}
                  onChange={(e) => setGuests(Number(e.target.value))}
                  options={[
                    { value: 1, label: '1 Guest' },
                    { value: 2, label: '2 Guests' },
                    { value: 3, label: '3 Guests' },
                    { value: 4, label: '4 Guests' },
                  ]}
                />
                <SelectDropdown
                  id="modal-rooms-count"
                  label="Rooms"
                  value={roomsCount}
                  onChange={(e) => setRoomsCount(Number(e.target.value))}
                  options={[
                    { value: 1, label: '1 Room' },
                    { value: 2, label: '2 Rooms' },
                    { value: 3, label: '3 Rooms' },
                  ]}
                />
              </div>

              {/* Guest Information */}
              <div className="pt-2 border-t border-[#E5E7EB]">
                <h4 className="font-serif font-semibold text-base text-[#12355B] mb-3">
                  Guest Contact Information
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <TextInput
                    id="modal-guest-name"
                    label="Primary Guest Name *"
                    placeholder="Full name as on ID/Passport"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    required
                    leftIcon={<User className="w-4 h-4" />}
                  />
                  <TextInput
                    id="modal-guest-email"
                    label="Email Address (for confirmation) *"
                    type="email"
                    placeholder="guest@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    leftIcon={<Mail className="w-4 h-4" />}
                  />
                  <TextInput
                    id="modal-guest-phone"
                    label="Mobile Phone *"
                    type="tel"
                    placeholder="+1 (555) 000-0000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    leftIcon={<Phone className="w-4 h-4" />}
                  />
                  <div>
                    <label htmlFor="modal-special-requests" className="block text-sm font-medium text-[#1F2937] mb-1.5">
                      Special Requests
                    </label>
                    <input
                      id="modal-special-requests"
                      placeholder="e.g. Quiet room, high floor, early arrival"
                      value={specialRequests}
                      onChange={(e) => setSpecialRequests(e.target.value)}
                      className="w-full bg-white border border-[#E5E7EB] text-[#1F2937] text-sm rounded-[8px] py-2.5 px-3 focus:outline-none focus:border-[#12355B]"
                    />
                  </div>
                </div>
              </div>

              {/* Price Summary Breakdown */}
              <div className="p-4 bg-[#F8F7F4] rounded-[8px] border border-[#E5E7EB] space-y-2 text-xs sm:text-sm">
                <div className="flex justify-between text-[#6B7280]">
                  <span>${currentRoom.pricePerNight} x {nights} night(s) x {roomsCount} room</span>
                  <span className="font-medium text-[#1F2937]">${subtotal}</span>
                </div>
                <div className="flex justify-between text-[#16A34A] font-medium">
                  <span className="flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" /> Direct Booking Perk (10% Off)
                  </span>
                  <span>-${directDiscount}</span>
                </div>
                <div className="flex justify-between text-[#6B7280]">
                  <span>Estimated Local Taxes & Tourism Fee (8%)</span>
                  <span className="font-medium text-[#1F2937]">${taxes}</span>
                </div>
                <div className="pt-2 border-t border-[#E5E7EB] flex justify-between items-center text-base font-bold text-[#12355B]">
                  <span>Total Due at Hotel</span>
                  <span className="text-xl font-serif">${total} USD</span>
                </div>
              </div>

              {/* Direct Booking Guarantee note */}
              <div className="flex items-center gap-2 text-xs text-[#6B7280]">
                <Lock className="w-3.5 h-3.5 text-[#16A34A]" />
                <span>Pay directly upon arrival. No upfront deposit required for Standard & Deluxe rooms.</span>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-end gap-3">
                <Button
                  variant="secondary"
                  size="md"
                  onClick={onClose}
                  className="w-full sm:w-auto"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  isLoading={isSubmitting}
                  className="w-full sm:w-auto px-8"
                >
                  Confirm Direct Reservation
                </Button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
