"use client";

import React, { useState, useMemo } from 'react';
import { Header, NavPage } from '../../components/layout/Header';
import { Footer } from '../../components/layout/Footer';
import { RoomCard } from '../../components/rooms/RoomCard';
import { RoomDetailsModal } from '../../components/rooms/RoomDetailsModal';
import { BookingModal } from '../../components/booking/BookingModal';
import { BookingSearchBar } from '../../components/home/BookingSearchBar';
import { Button } from '../../components/ui/Button';
import { ROOMS_DATA } from '../../data/hotelData';
import { Room, BookingSearchState, Reservation } from '../../types/types';
import {
  SlidersHorizontal,
  RotateCcw,
  Sparkles,
  HelpCircle,
  Phone,
  Mail,
  SearchX,
  Check,
  Bed,
  Users,
  ChevronRight,
  ShieldCheck,
  Calendar
} from 'lucide-react';

interface RoomsPageProps {
  onNavigate: (page: NavPage) => void;
  onOpenInquiry: (roomName?: string) => void;
  onOpenDesignSystem?: () => void;
  initialSearchState?: BookingSearchState;
  onConfirmReservation?: (reservation: Reservation) => void;
}

export const RoomsPage: React.FC<RoomsPageProps> = ({
  onNavigate,
  onOpenInquiry,
  onOpenDesignSystem,
  initialSearchState,
  onConfirmReservation,
}) => {
  // Tomorrow and 3 days later default dates
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
  const threeDaysLater = new Date(Date.now() + 86400000 * 4).toISOString().split('T')[0];

  const [searchState, setSearchState] = useState<BookingSearchState>(
    initialSearchState || {
      checkIn: tomorrow,
      checkOut: threeDaysLater,
      guests: 2,
      rooms: 1,
    }
  );
  const [isSearching, setIsSearching] = useState(false);
  const [searchNotification, setSearchNotification] = useState<string | null>(null);

  // Filters state
  const [selectedType, setSelectedType] = useState<string>('All');
  const [selectedCapacity, setSelectedCapacity] = useState<string>('All');
  const [priceSort, setPriceSort] = useState<'default' | 'low-high' | 'high-low'>('default');
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [selectedAvailability, setSelectedAvailability] = useState<string>('All');

  // Modal states
  const [selectedRoomForDetails, setSelectedRoomForDetails] = useState<Room | null>(null);
  const [selectedRoomForBooking, setSelectedRoomForBooking] = useState<Room | null>(null);

  const availableAmenityOptions = [
    'High-Speed Wi-Fi',
    'Air Conditioning',
    'Breakfast Included',
    'Private Balcony',
  ];

  const handleSearchChange = (changes: Partial<BookingSearchState>) => {
    setSearchState((prev) => ({ ...prev, ...changes }));
  };

  const handleSearchSubmit = () => {
    setIsSearching(true);
    setTimeout(() => {
      setIsSearching(false);
      setSearchNotification(
        `Availability updated for ${searchState.guests} guest${
          searchState.guests > 1 ? 's' : ''
        }, from ${searchState.checkIn} to ${searchState.checkOut}.`
      );

      // Smooth scroll down to rooms section
      const listingEl = document.getElementById('room-listing-section');
      if (listingEl) {
        const offset = 90;
        const bodyRect = document.body.getBoundingClientRect().top;
        const elementRect = listingEl.getBoundingClientRect().top;
        const elementPosition = elementRect - bodyRect;
        window.scrollTo({
          top: elementPosition - offset,
          behavior: 'smooth',
        });
      }
    }, 400);
  };

  const toggleAmenity = (amenity: string) => {
    setSelectedAmenities((prev) =>
      prev.includes(amenity)
        ? prev.filter((item) => item !== amenity)
        : [...prev, amenity]
    );
  };

  const resetAllFilters = () => {
    setSelectedType('All');
    setSelectedCapacity('All');
    setPriceSort('default');
    setSelectedAmenities([]);
    setSelectedAvailability('All');
  };

  const hasActiveFilters =
    selectedType !== 'All' ||
    selectedCapacity !== 'All' ||
    priceSort !== 'default' ||
    selectedAmenities.length > 0 ||
    selectedAvailability !== 'All';

  // Filter and Sort Rooms
  const filteredRooms = useMemo(() => {
    let result = [...ROOMS_DATA];

    // Room Type Filter
    if (selectedType !== 'All') {
      result = result.filter(
        (room) => room.category.toLowerCase() === selectedType.toLowerCase()
      );
    }

    // Guest Capacity Filter
    if (selectedCapacity === '1') {
      result = result.filter((room) => room.capacityGuests === 1);
    } else if (selectedCapacity === '2') {
      result = result.filter((room) => room.capacityGuests === 2);
    } else if (selectedCapacity === '3+') {
      result = result.filter((room) => room.capacityGuests >= 3);
    }

    // Availability Filter
    if (selectedAvailability === 'Available') {
      result = result.filter((room) => room.availability === 'available');
    } else if (selectedAvailability === 'Limited') {
      result = result.filter((room) => room.availability === 'limited');
    }

    // Amenities Filter (every selected amenity must be present)
    if (selectedAmenities.length > 0) {
      result = result.filter((room) => {
        const roomAmenities = (room.allAmenities || room.keyAmenities).map((a) =>
          a.toLowerCase()
        );
        return selectedAmenities.every((amenity) => {
          if (amenity === 'High-Speed Wi-Fi') {
            return roomAmenities.some((a) => a.includes('wi-fi') || a.includes('wifi'));
          }
          if (amenity === 'Air Conditioning') {
            return roomAmenities.some((a) => a.includes('air conditioning') || a.includes('ac'));
          }
          if (amenity === 'Breakfast Included') {
            return roomAmenities.some((a) => a.includes('breakfast'));
          }
          if (amenity === 'Private Balcony') {
            return roomAmenities.some((a) => a.includes('balcony'));
          }
          return roomAmenities.some((a) => a.includes(amenity.toLowerCase()));
        });
      });
    }

    // Price Sorting
    if (priceSort === 'low-high') {
      result.sort((a, b) => a.pricePerNight - b.pricePerNight);
    } else if (priceSort === 'high-low') {
      result.sort((a, b) => b.pricePerNight - a.pricePerNight);
    }

    return result;
  }, [selectedType, selectedCapacity, selectedAvailability, selectedAmenities, priceSort]);

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F7F4] text-[#1F2937]">
      {/* 1. Header with 'Rooms' highlighted */}
      <Header
        currentPage="rooms"
        onNavigate={onNavigate}
        onBookNowClick={() => setSelectedRoomForBooking(ROOMS_DATA[1])}
        onOpenInquiryClick={() => onOpenInquiry()}
        onOpenDesignSystemClick={onOpenDesignSystem}
      />

      <main className="flex-grow">
        {/* 2. Page Introduction (Hero) */}
        <section
          id="rooms-hero-intro"
          className="relative bg-[#F8F7F4] pt-12 sm:pt-16 pb-20 sm:pb-24 border-b border-[#E5E7EB] overflow-hidden"
        >
          {/* Subtle architectural background texture accent */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#12355B_1px,transparent_1px)] [background-size:16px_16px]" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-xs text-[#6B7280] mb-5">
              <button
                onClick={() => onNavigate('home')}
                className="hover:text-[#12355B] transition-colors cursor-pointer"
              >
                Home
              </button>
              <ChevronRight className="w-3.5 h-3.5 text-[#9CA3AF]" />
              <span className="font-semibold text-[#12355B]">Rooms & Suites</span>
            </nav>

            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-[#E5E7EB] shadow-2xs text-[#12355B] text-xs font-semibold uppercase tracking-wider mb-4">
                <Sparkles className="w-3.5 h-3.5 text-[#D4A853]" />
                Direct Booking Catalog
              </div>
              <h1
                id="rooms-page-title"
                className="text-4xl sm:text-5xl lg:text-[52px] font-serif font-bold text-[#12355B] leading-[1.15] tracking-tight mb-4"
              >
                Find Your Perfect Room
              </h1>
              <p className="text-lg sm:text-xl text-[#4B5563] leading-relaxed max-w-2xl">
                Explore our comfortable rooms and choose the perfect space for your stay.
                Every reservation includes direct booking privileges, high-speed Wi-Fi, and personalized concierge service.
              </p>

              {/* Trust micro-badges */}
              <div className="mt-6 flex flex-wrap items-center gap-4 sm:gap-6 text-xs text-[#6B7280]">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-[#16A34A]" />
                  <span>Guaranteed Direct Rates (ETB / USD)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-[#12355B]" />
                  <span>Flexible Date Modification</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-[#D4A853]" />
                  <span>Instant Confirmation</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3. Availability Search Card */}
        <section id="rooms-search-section" className="relative -mt-10 sm:-mt-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto z-20">
          <BookingSearchBar
            searchState={searchState}
            onSearchChange={handleSearchChange}
            onSearchSubmit={handleSearchSubmit}
            isSearching={isSearching}
          />

          {searchNotification && (
            <div className="mt-4 p-3.5 rounded-[8px] bg-[#DCFCE7] border border-[#BBF7D0] text-[#15803D] text-sm flex items-center justify-between shadow-2xs animate-in fade-in duration-200">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 shrink-0 font-bold" />
                <span>{searchNotification}</span>
              </div>
              <button
                onClick={() => setSearchNotification(null)}
                className="text-xs font-semibold underline hover:no-underline cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          )}
        </section>

        {/* 4. Filter Options Bar */}
        <section id="rooms-filter-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-14 pb-4">
          <div className="bg-white rounded-[12px] border border-[#E5E7EB] p-5 sm:p-6 shadow-2xs">
            <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#E5E7EB]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-[6px] bg-[#12355B]/10 text-[#12355B] flex items-center justify-center">
                  <SlidersHorizontal className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-[#1F2937]">Filter & Refine Rooms</h3>
                  <p className="text-xs text-[#6B7280]">Select criteria to match your accommodation preference</p>
                </div>
              </div>

              {hasActiveFilters && (
                <button
                  onClick={resetAllFilters}
                  id="clear-all-filters-btn"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#12355B] hover:text-[#0e2a4a] bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-[6px] transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Clear Filters
                </button>
              )}
            </div>

            {/* Filter controls row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 pt-4">
              {/* Room Type */}
              <div className="space-y-1.5">
                <label htmlFor="filter-room-type" className="block text-xs font-semibold uppercase tracking-wider text-[#4B5563]">
                  Room Type
                </label>
                <select
                  id="filter-room-type"
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="w-full bg-white border border-[#E5E7EB] text-[#1F2937] text-sm rounded-[8px] p-2.5 focus:outline-none focus:border-[#12355B] transition-colors cursor-pointer"
                >
                  <option value="All">All Room Types</option>
                  <option value="Standard">Standard</option>
                  <option value="Deluxe">Deluxe</option>
                  <option value="Suite">Suite</option>
                </select>
              </div>

              {/* Guest Capacity */}
              <div className="space-y-1.5">
                <label htmlFor="filter-guest-capacity" className="block text-xs font-semibold uppercase tracking-wider text-[#4B5563]">
                  Guest Capacity
                </label>
                <select
                  id="filter-guest-capacity"
                  value={selectedCapacity}
                  onChange={(e) => setSelectedCapacity(e.target.value)}
                  className="w-full bg-white border border-[#E5E7EB] text-[#1F2937] text-sm rounded-[8px] p-2.5 focus:outline-none focus:border-[#12355B] transition-colors cursor-pointer"
                >
                  <option value="All">All Capacities</option>
                  <option value="1">1 Guest (Solo)</option>
                  <option value="2">2 Guests (Couple / Pair)</option>
                  <option value="3+">3+ Guests (Family / Suite)</option>
                </select>
              </div>

              {/* Price Sort */}
              <div className="space-y-1.5">
                <label htmlFor="filter-price-sort" className="block text-xs font-semibold uppercase tracking-wider text-[#4B5563]">
                  Price Order
                </label>
                <select
                  id="filter-price-sort"
                  value={priceSort}
                  onChange={(e) => setPriceSort(e.target.value as 'default' | 'low-high' | 'high-low')}
                  className="w-full bg-white border border-[#E5E7EB] text-[#1F2937] text-sm rounded-[8px] p-2.5 focus:outline-none focus:border-[#12355B] transition-colors cursor-pointer"
                >
                  <option value="default">Featured / Default</option>
                  <option value="low-high">Price: Low to High</option>
                  <option value="high-low">Price: High to Low</option>
                </select>
              </div>

              {/* Availability Filter */}
              <div className="space-y-1.5">
                <label htmlFor="filter-availability" className="block text-xs font-semibold uppercase tracking-wider text-[#4B5563]">
                  Availability Status
                </label>
                <select
                  id="filter-availability"
                  value={selectedAvailability}
                  onChange={(e) => setSelectedAvailability(e.target.value)}
                  className="w-full bg-white border border-[#E5E7EB] text-[#1F2937] text-sm rounded-[8px] p-2.5 focus:outline-none focus:border-[#12355B] transition-colors cursor-pointer"
                >
                  <option value="All">All Availability</option>
                  <option value="Available">Available Only</option>
                  <option value="Limited">Limited Availability Only</option>
                </select>
              </div>
            </div>

            {/* Amenities Multi-Select Chips */}
            <div className="pt-4 mt-4 border-t border-[#E5E7EB]/70">
              <span className="block text-xs font-semibold uppercase tracking-wider text-[#4B5563] mb-2.5">
                Include Key Amenities
              </span>
              <div className="flex flex-wrap items-center gap-2">
                {availableAmenityOptions.map((amenity) => {
                  const isSelected = selectedAmenities.includes(amenity);
                  return (
                    <button
                      key={amenity}
                      type="button"
                      onClick={() => toggleAmenity(amenity)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#12355B] text-white shadow-2xs'
                          : 'bg-gray-100 text-[#4B5563] hover:bg-gray-200 border border-gray-200'
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5 text-[#D4A853]" />}
                      <span>{amenity}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* 5. Room Listing Section */}
        <section id="room-listing-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          {/* Section Heading & Results Counter */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#12355B] tracking-tight">
                Available Rooms
              </h2>
              <p className="text-sm sm:text-base text-[#6B7280] mt-1">
                Choose the room that best suits your stay.
              </p>
            </div>
            <div className="text-sm text-[#4B5563] font-medium bg-white px-3.5 py-1.5 rounded-[8px] border border-[#E5E7EB] self-start sm:self-auto shadow-2xs">
              Showing <span className="font-bold text-[#12355B]">{filteredRooms.length}</span> of {ROOMS_DATA.length} rooms
            </div>
          </div>

          {/* Room Grid */}
          {filteredRooms.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {filteredRooms.map((room) => (
                <RoomCard
                  key={room.id}
                  room={room}
                  onViewDetails={() => setSelectedRoomForDetails(room)}
                  onBookRoom={() => setSelectedRoomForBooking(room)}
                  onSendInquiry={() => onOpenInquiry(room.name)}
                />
              ))}
            </div>
          ) : (
            /* 6. No Rooms Available State */
            <div
              id="no-rooms-available-state"
              className="w-full bg-white rounded-[12px] border border-[#E5E7EB] p-8 sm:p-14 text-center shadow-sm max-w-2xl mx-auto my-6"
            >
              <div className="w-16 h-16 rounded-full bg-amber-50 text-[#D4A853] flex items-center justify-center mx-auto mb-5 border border-amber-200">
                <SearchX className="w-8 h-8 text-[#12355B]" />
              </div>
              <h3 className="text-2xl font-serif font-bold text-[#12355B] mb-2">
                No Rooms Available
              </h3>
              <p className="text-sm sm:text-base text-[#6B7280] max-w-md mx-auto mb-6 leading-relaxed">
                We couldn't find any rooms matching your selected dates and filter criteria. Please try adjusting your filters or send an inquiry for custom arrangements.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Button
                  id="reset-filters-cta-btn"
                  variant="primary"
                  size="md"
                  onClick={resetAllFilters}
                  leftIcon={<RotateCcw className="w-4 h-4" />}
                >
                  Reset All Filters
                </Button>
                <Button
                  id="no-rooms-inquiry-btn"
                  variant="secondary"
                  size="md"
                  onClick={() => onOpenInquiry()}
                  leftIcon={<Mail className="w-4 h-4" />}
                >
                  Send an Inquiry
                </Button>
              </div>
            </div>
          )}
        </section>

        {/* 7. Inquiry Call to Action */}
        <section
          id="rooms-inquiry-cta"
          className="bg-[#12355B] text-white py-14 sm:py-18 px-4 sm:px-6 lg:px-8 relative overflow-hidden"
        >
          {/* Subtle gold accent circle in background */}
          <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-[#D4A853]/10 blur-2xl pointer-events-none" />

          <div className="max-w-4xl mx-auto text-center relative z-10">
            <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-4 text-[#D4A853]">
              <HelpCircle className="w-6 h-6" />
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold text-white mb-3 tracking-tight">
              Need Help Finding the Right Room?
            </h2>
            <p className="text-base sm:text-lg text-white/80 max-w-xl mx-auto mb-8 leading-relaxed">
              Send us an inquiry and our team will help you find the best option for your stay.
              We also cater to special group reservations, airport shuttles, and long-term business packages.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5">
              <Button
                id="cta-send-inquiry-btn"
                variant="primary"
                size="lg"
                onClick={() => onOpenInquiry()}
                className="w-full sm:w-auto bg-[#D4A853] hover:bg-[#c49843] text-[#12355B] font-bold border-none shadow-md"
                leftIcon={<Mail className="w-4 h-4 text-[#12355B]" />}
              >
                Send an Inquiry
              </Button>
              <Button
                id="cta-contact-us-btn"
                variant="secondary"
                size="lg"
                onClick={() => {
                  onNavigate('home');
                  setTimeout(() => {
                    const contactEl = document.getElementById('contact-footer');
                    if (contactEl) {
                      contactEl.scrollIntoView({ behavior: 'smooth' });
                    }
                  }, 100);
                }}
                className="w-full sm:w-auto bg-white/10 hover:bg-white text-white hover:text-[#12355B] border-white/30"
                leftIcon={<Phone className="w-4 h-4" />}
              >
                Contact Us
              </Button>
            </div>
          </div>
        </section>
      </main>

      {/* 8. Footer */}
      <Footer
        onOpenBooking={() => setSelectedRoomForBooking(ROOMS_DATA[1])}
        onOpenInquiry={() => onOpenInquiry()}
        onOpenDesignSystem={onOpenDesignSystem}
        onNavigate={onNavigate}
      />

      {/* Modal 1: Room Details Modal (without navigating away) */}
      <RoomDetailsModal
        room={selectedRoomForDetails}
        isOpen={!!selectedRoomForDetails}
        onClose={() => setSelectedRoomForDetails(null)}
        searchState={searchState}
        onBookRoom={(room) => {
          setSelectedRoomForDetails(null);
          setSelectedRoomForBooking(room);
        }}
        onSendInquiry={(room) => {
          setSelectedRoomForDetails(null);
          onOpenInquiry(room.name);
        }}
      />

      {/* Modal 2: Direct Booking Modal */}
      {selectedRoomForBooking && (
        <BookingModal
          isOpen={!!selectedRoomForBooking}
          onClose={() => setSelectedRoomForBooking(null)}
          selectedRoom={selectedRoomForBooking}
          allRooms={ROOMS_DATA}
          searchState={searchState}
          onConfirmReservation={(res) => {
            if (onConfirmReservation) {
              onConfirmReservation(res);
            }
            setSelectedRoomForBooking(null);
          }}
        />
      )}
    </div>
  );
};

export default RoomsPage;
