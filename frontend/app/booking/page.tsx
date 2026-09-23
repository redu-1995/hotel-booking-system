"use client"
import React, { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Header, NavPage } from '../../components/layout/Header';
import { Footer } from '../../components/layout/Footer';
import { Button } from '../../components/ui/Button';
import { TextInput, DatePickerInput, SelectDropdown, TextArea } from '../../components/ui/FormInputs';
import { StatusBadge, AvailabilityBadge } from '../../components/ui/Badge';
import { RoomDetailsModal } from '../../components/rooms/RoomDetailsModal';
import { HOTEL_INFO } from '../../data/hotelData';
import { Room, BookingSearchState, Reservation, Inquiry } from '../../types/types';
import type { Room as ApiRoom } from '@/types';
import { getRooms } from '@/lib/api/client';
import {
  Calendar,
  MessageSquare,
  Sparkles,
  Users,
  Bed,
  CheckCircle2,
  ShieldCheck,
  Phone,
  Mail,
  MapPin,
  Clock,
  ArrowRight,
  ChevronRight,
  Info,
  Building2,
  Check,
  Copy,
  CalendarCheck,
  CreditCard,
  MessageCircle,
  HelpCircle,
  RotateCcw,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  Tag,
  Search,
  CheckCheck
} from 'lucide-react';

interface BookingInquiryPageProps {
  onNavigate: (page: NavPage) => void;
  onOpenDesignSystem?: () => void;
  initialRoomId?: string;
  onConfirmReservation?: (reservation: Reservation) => void;
  onAddInquiry?: (inquiry: Omit<Inquiry, 'id' | 'referenceNumber' | 'createdAt'>) => void;
}

function toUiRoom(room: ApiRoom): Room {
  const roomType = room.room_type_details;
  const name = roomType?.name || `Room ${room.room_number}`;
  const normalizedName = name.toLowerCase();
  const category: Room['category'] = normalizedName.includes('suite')
    ? 'suite'
    : normalizedName.includes('deluxe')
      ? 'deluxe'
      : 'standard';

  return {
    id: String(room.id),
    name,
    category,
    shortDescription: roomType?.description || `Room ${room.room_number} at The Grandview Hotel.`,
    fullDescription: roomType?.description || `Room ${room.room_number} at The Grandview Hotel.`,
    pricePerNight: Number(roomType?.base_price || 0),
    capacityGuests: roomType?.max_guests || 1,
    bedType: roomType?.bed_type || 'Standard bed',
    sizeSqM: 0,
    image: '',
    galleryImages: [],
    keyAmenities: roomType?.amenities_list || [],
    allAmenities: roomType?.amenities_list || [],
    rating: 0,
    reviewsCount: 0,
    availability: room.is_available ? 'available' : 'unavailable',
  };
}

export const BookingInquiryPage: React.FC<BookingInquiryPageProps> = ({
  onNavigate,
  onOpenDesignSystem,
  initialRoomId,
  onConfirmReservation,
  onAddInquiry,
}) => {
  // 1. Default dates setup (Tomorrow and 3 days later)
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
  const threeDaysLater = new Date(Date.now() + 86400000 * 4).toISOString().split('T')[0];

  // 2. Search availability state
  const [checkIn, setCheckIn] = useState<string>(tomorrow);
  const [checkOut, setCheckOut] = useState<string>(threeDaysLater);
  const [guestsCount, setGuestsCount] = useState<number>(2);
  const [roomsCount, setRoomsCount] = useState<number>(1);
  const [preferredCategory, setPreferredCategory] = useState<string>('all');
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [searchNotification, setSearchNotification] = useState<string | null>(null);

  // 3. Selected room for booking
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [roomsError, setRoomsError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    getRooms().then((apiRooms) => {
      if (!isMounted) return;
      if (apiRooms.length === 0) {
        setRoomsError('No rooms are currently configured in the hotel system.');
        return;
      }
      const loadedRooms = apiRooms.map(toUiRoom);
      setRooms(loadedRooms);
      setSelectedRoom((currentRoom) => {
        const matchingRoom = initialRoomId
          ? loadedRooms.find((room) => room.id === initialRoomId)
          : undefined;
        return matchingRoom || loadedRooms.find((room) => room.category === 'deluxe') || loadedRooms[0] || currentRoom;
      });
    }).catch(() => {
      if (isMounted) setRoomsError('Unable to load rooms from the hotel system.');
    });
    return () => {
      isMounted = false;
    };
  }, [initialRoomId]);

  // Modal for Room Details
  const [roomDetailsModalRoom, setRoomDetailsModalRoom] = useState<Room | null>(null);

  // 4. Booking Details Form State
  const [guestFullName, setGuestFullName] = useState<string>('');
  const [guestEmail, setGuestEmail] = useState<string>('');
  const [guestPhone, setGuestPhone] = useState<string>('');
  const [specialRequests, setSpecialRequests] = useState<string>('');
  const [bookingErrors, setBookingErrors] = useState<Record<string, string>>({});
  const [isSubmittingBooking, setIsSubmittingBooking] = useState<boolean>(false);
  const [bookingSuccessData, setBookingSuccessData] = useState<{
    referenceNumber: string;
    reservation: Reservation;
  } | null>(null);

  // 5. Inquiry Form State
  const [inquiryFullName, setInquiryFullName] = useState<string>('');
  const [inquiryEmail, setInquiryEmail] = useState<string>('');
  const [inquiryPhone, setInquiryPhone] = useState<string>('');
  const [inquiryType, setInquiryType] = useState<string>('Room Availability');
  const [inquirySubject, setInquirySubject] = useState<string>('');
  const [inquiryMessage, setInquiryMessage] = useState<string>('');
  const [showOptionalStayInfo, setShowOptionalStayInfo] = useState<boolean>(false);
  const [inquiryCheckIn, setInquiryCheckIn] = useState<string>('');
  const [inquiryCheckOut, setInquiryCheckOut] = useState<string>('');
  const [inquiryGuests, setInquiryGuests] = useState<number>(2);
  const [inquiryRoomType, setInquiryRoomType] = useState<string>('');
  const [inquiryErrors, setInquiryErrors] = useState<Record<string, string>>({});
  const [isSubmittingInquiry, setIsSubmittingInquiry] = useState<boolean>(false);
  const [inquirySuccessData, setInquirySuccessData] = useState<{
    referenceNumber: string;
    subject: string;
    email: string;
    inquiryType: string;
  } | null>(null);

  // 6. UI utility state
  const [copiedRef, setCopiedRef] = useState<string | null>(null);

  useEffect(() => {
    if (selectedRoom) setInquiryRoomType((currentRoomType) => currentRoomType || selectedRoom.name);
  }, [selectedRoom]);

  // Calculate nights
  const calculateNights = () => {
    try {
      const d1 = new Date(checkIn);
      const d2 = new Date(checkOut);
      const diffTime = d2.getTime() - d1.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return isNaN(diffDays) || diffDays < 1 ? 1 : diffDays;
    } catch {
      return 1;
    }
  };

  const nights = calculateNights();
  const subtotal = selectedRoom ? selectedRoom.pricePerNight * nights * roomsCount : 0;
  const directDiscount = Math.round(subtotal * 0.1); // 10% direct booking benefit
  const taxes = Math.round((subtotal - directDiscount) * 0.08); // 8% local hospitality tax
  const estimatedTotal = subtotal - directDiscount + taxes;

  // Format date helper: "12 June 2026"
  const formatDateFriendly = (dateStr: string) => {
    if (!dateStr) return '';
    try {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
        return d.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });
      }
      return dateStr;
    } catch {
      return dateStr;
    }
  };

  // Scroll to section helper
  const scrollToSection = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      const offset = 80;
      const elementPosition = el.getBoundingClientRect().top + window.pageYOffset;
      window.scrollTo({
        top: elementPosition - offset,
        behavior: 'smooth',
      });
    }
  };

  // Filter available rooms based on criteria
  const availableRoomsList = useMemo(() => {
    return rooms.filter((room) => {
      // Category filter
      if (preferredCategory !== 'all' && room.category !== preferredCategory) {
        return false;
      }
      // Capacity filter
      if (room.capacityGuests < guestsCount && guestsCount > 2) {
        return false;
      }
      return true;
    });
  }, [rooms, preferredCategory, guestsCount]);

  // Handle Availability Search
  const handleCheckAvailability = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSearching(true);
    setSearchNotification(null);

    setTimeout(() => {
      setIsSearching(false);
      setSearchNotification(
        `Found ${availableRoomsList.length} rooms matching your dates (${formatDateFriendly(checkIn)} - ${formatDateFriendly(checkOut)}) for ${guestsCount} guest(s).`
      );
      scrollToSection('available-rooms-results');
    }, 400);
  };

  // Handle Room Selection for Booking
  const handleSelectRoomForBooking = (room: Room) => {
    setSelectedRoom(room);
    scrollToSection('booking-details-section');
  };

  // Validate Booking Form
  const validateBookingForm = () => {
    const errors: Record<string, string> = {};
    if (!guestFullName.trim()) {
      errors.guestFullName = 'Please enter your full name.';
    } else if (guestFullName.trim().length < 3) {
      errors.guestFullName = 'Full name must be at least 3 characters.';
    }

    if (!guestEmail.trim()) {
      errors.guestEmail = 'Please enter your email address.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guestEmail.trim())) {
      errors.guestEmail = 'Please enter a valid email address (e.g. name@example.com).';
    }

    if (!guestPhone.trim()) {
      errors.guestPhone = 'Please enter a phone number.';
    } else if (guestPhone.trim().length < 6) {
      errors.guestPhone = 'Please enter a valid phone number with area code.';
    }

    if (!checkIn) {
      errors.checkIn = 'Please select a check-in date.';
    }
    if (!checkOut) {
      errors.checkOut = 'Please select a check-out date.';
    } else if (checkIn && new Date(checkOut) <= new Date(checkIn)) {
      errors.checkOut = 'Check-out date must be after check-in date.';
    }

    setBookingErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Submit Booking
  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRoom || !validateBookingForm()) {
      return;
    }

    setIsSubmittingBooking(true);

    setTimeout(() => {
      const refNumber = `HB-2026-${Math.floor(10000 + Math.random() * 90000)}`;
      const newReservation: Reservation = {
        id: `res-${Date.now()}`,
        referenceNumber: refNumber,
        roomId: selectedRoom.id,
        roomName: selectedRoom.name,
        guestName: guestFullName,
        email: guestEmail,
        phone: guestPhone,
        checkIn,
        checkOut,
        nights,
        guests: guestsCount,
        roomsCount,
        totalPrice: estimatedTotal,
        status: 'confirmed',
        specialRequests: specialRequests.trim() || undefined,
        createdAt: new Date().toISOString(),
      };

      if (onConfirmReservation) {
        onConfirmReservation(newReservation);
      }

      setIsSubmittingBooking(false);
      setBookingSuccessData({
        referenceNumber: refNumber,
        reservation: newReservation,
      });

      // Scroll to success container
      setTimeout(() => {
        scrollToSection('booking-details-section');
      }, 50);
    }, 650);
  };

  // Validate Inquiry Form
  const validateInquiryForm = () => {
    const errors: Record<string, string> = {};
    if (!inquiryFullName.trim()) {
      errors.inquiryFullName = 'Please enter your full name.';
    }
    if (!inquiryEmail.trim()) {
      errors.inquiryEmail = 'Please enter your email address.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inquiryEmail.trim())) {
      errors.inquiryEmail = 'Please enter a valid email address.';
    }
    if (!inquiryPhone.trim()) {
      errors.inquiryPhone = 'Please enter your phone number.';
    }
    if (!inquiryMessage.trim()) {
      errors.inquiryMessage = 'Please enter a message describing your inquiry.';
    } else if (inquiryMessage.trim().length < 10) {
      errors.inquiryMessage = 'Message must be at least 10 characters long.';
    }

    setInquiryErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Submit Inquiry
  const handleInquirySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRoom || !validateInquiryForm()) {
      return;
    }

    setIsSubmittingInquiry(true);

    setTimeout(() => {
      const refNumber = `INQ-2026-${Math.floor(10000 + Math.random() * 90000)}`;
      const finalMessage = `${inquirySubject ? `[Subject: ${inquirySubject}] ` : ''}${inquiryMessage}${
        showOptionalStayInfo && inquiryCheckIn
          ? ` (Preferred Stay: ${inquiryCheckIn} to ${inquiryCheckOut}, ${inquiryGuests} guests, Room: ${inquiryRoomType})`
          : ''
      }`;

      if (onAddInquiry) {
        onAddInquiry({
          guestName: inquiryFullName,
          email: inquiryEmail,
          phone: inquiryPhone,
          roomType: inquiryRoomType || selectedRoom.name,
          checkIn: inquiryCheckIn || checkIn,
          checkOut: inquiryCheckOut || checkOut,
          guests: inquiryGuests,
          status: 'pending',
          message: finalMessage,
        });
      }

      setIsSubmittingInquiry(false);
      setInquirySuccessData({
        referenceNumber: refNumber,
        subject: inquirySubject || inquiryType,
        email: inquiryEmail,
        inquiryType,
      });

      setTimeout(() => {
        scrollToSection('inquiry-section-anchor');
      }, 50);
    }, 600);
  };

  // Copy reference number to clipboard
  const handleCopyRef = (text: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedRef(text);
    setTimeout(() => setCopiedRef(null), 2500);
  };

  if (!selectedRoom) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F8F7F4] px-6 text-center">
        <div>
          <h1 className="font-serif text-3xl font-bold text-[#12355B]">
            {roomsError ? 'Rooms are temporarily unavailable' : 'Loading available rooms...'}
          </h1>
          <p className="mt-3 text-sm text-[#6B7280]">
            {roomsError || 'Connecting to the hotel booking system.'}
          </p>
        </div>
      </main>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F7F4] text-[#1F2937] antialiased">
      {/* 1. Header with 'booking' active */}
      <Header
        currentPage="booking"
        onNavigate={onNavigate}
        onBookNowClick={() => scrollToSection('direct-booking-section')}
        onOpenInquiryClick={() => scrollToSection('inquiry-section-anchor')}
        onOpenDesignSystemClick={onOpenDesignSystem}
      />

      <main className="flex-grow">
        {/* 2. PAGE HERO SECTION (Compact and Welcoming) */}
        <section
          id="booking-hero"
          className="relative pt-12 pb-14 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#F3EFEA] via-[#F8F7F4] to-[#F8F7F4] border-b border-[#E5E7EB]/80 overflow-hidden"
        >
          {/* Subtle architectural background motifs */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#D4A853]/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#12355B]/5 rounded-full blur-2xl pointer-events-none -ml-20 -mb-20" />

          <div className="max-w-5xl mx-auto text-center relative z-10">
            {/* Breadcrumb & Sub-badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#E5E7EB] shadow-2xs mb-5 text-xs font-medium text-[#12355B]">
              <Sparkles className="w-3.5 h-3.5 text-[#D4A853]" />
              <span>Official Direct Booking Channel</span>
              <span className="w-1 h-1 rounded-full bg-gray-300" />
              <span className="text-[#16A34A] font-semibold">Best Rate Guaranteed</span>
            </div>

            {/* Main Heading: 48-56px scale on desktop */}
            <h1 className="font-serif text-3xl sm:text-4xl lg:text-[48px] font-bold text-[#12355B] tracking-tight leading-[1.15] mb-4">
              Book Your Stay or Send an Inquiry
            </h1>

            {/* Supporting text */}
            <p className="max-w-2xl mx-auto text-base sm:text-lg text-[#6B7280] leading-relaxed mb-6">
              Check room availability and book directly with us, or send an inquiry if you need assistance planning your stay.
            </p>

            {/* Direct Booking Advantages Strip */}
            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 pt-2 text-xs sm:text-sm text-[#4B5563]">
              <span className="inline-flex items-center gap-1.5 font-medium">
                <CheckCircle2 className="w-4 h-4 text-[#16A34A]" />
                Zero Booking Fees
              </span>
              <span className="inline-flex items-center gap-1.5 font-medium">
                <ShieldCheck className="w-4 h-4 text-[#12355B]" />
                Instant Confirmation
              </span>
              <span className="inline-flex items-center gap-1.5 font-medium">
                <Sparkles className="w-4 h-4 text-[#D4A853]" />
                Complimentary Welcome Drink
              </span>
              <span className="inline-flex items-center gap-1.5 font-medium">
                <Clock className="w-4 h-4 text-[#12355B]" />
                Flexible 24h Prior Cancellation
              </span>
            </div>
          </div>
        </section>

        {/* 3. MAIN ACTION SECTION (Two Prominent Cards) */}
        <section id="main-actions-section" className="py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
            {/* Direct Booking Card (More Prominent with Gold Accent & Primary Button) */}
            <div
              id="action-card-booking"
              className="relative bg-white rounded-[16px] p-7 sm:p-8 border-2 border-[#12355B] shadow-md hover:shadow-lg transition-all flex flex-col justify-between overflow-hidden group"
            >
              {/* Highlight ribbon badge */}
              <div className="absolute top-4 right-4 inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#12355B]/10 text-[#12355B] text-xs font-semibold">
                <Sparkles className="w-3 h-3 text-[#D4A853]" />
                <span>Recommended Action</span>
              </div>

              <div>
                <div className="w-13 h-13 rounded-[12px] bg-[#12355B] text-white flex items-center justify-center mb-5 shadow-sm group-hover:scale-105 transition-transform">
                  <Calendar className="w-6 h-6 text-[#D4A853]" />
                </div>
                <h2 className="font-serif text-2xl sm:text-2xl font-bold text-[#12355B] mb-2.5">
                  Book Your Stay
                </h2>
                <p className="text-sm sm:text-base text-[#6B7280] leading-relaxed mb-6">
                  Check room availability, choose your preferred room, and reserve your stay directly with the hotel.
                </p>
              </div>

              <div className="pt-2">
                <Button
                  id="action-start-booking-btn"
                  variant="primary"
                  size="lg"
                  fullWidth
                  onClick={() => scrollToSection('direct-booking-section')}
                  className="shadow-sm font-medium"
                >
                  <CalendarCheck className="w-4 h-4 mr-2 text-[#D4A853]" />
                  Start Booking
                </Button>
              </div>
            </div>

            {/* Inquiry Card (Secondary Action) */}
            <div
              id="action-card-inquiry"
              className="bg-white rounded-[16px] p-7 sm:p-8 border border-[#E5E7EB] hover:border-[#12355B]/40 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="w-13 h-13 rounded-[12px] bg-[#F8F7F4] border border-[#E5E7EB] text-[#12355B] flex items-center justify-center mb-5 group-hover:bg-[#12355B]/5 transition-colors">
                  <MessageSquare className="w-6 h-6 text-[#12355B]" />
                </div>
                <h2 className="font-serif text-2xl sm:text-2xl font-bold text-[#12355B] mb-2.5">
                  Send an Inquiry
                </h2>
                <p className="text-sm sm:text-base text-[#6B7280] leading-relaxed mb-6">
                  Have a question or special request? Send us a message and our team will assist you.
                </p>
              </div>

              <div className="pt-2">
                <Button
                  id="action-send-inquiry-btn"
                  variant="secondary"
                  size="lg"
                  fullWidth
                  onClick={() => scrollToSection('inquiry-section-anchor')}
                  className="font-medium"
                >
                  <MessageCircle className="w-4 h-4 mr-2 text-[#12355B]" />
                  Send Inquiry
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* 4. DIRECT BOOKING SECTION (Check Room Availability) */}
        <section
          id="direct-booking-section"
          className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto"
        >
          <div className="bg-white rounded-[16px] border border-[#E5E7EB] p-6 sm:p-8 md:p-10 shadow-sm">
            {/* Section Header */}
            <div className="mb-8">
              <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-[#D4A853] font-bold mb-1.5">
                <CalendarCheck className="w-4 h-4" />
                <span>Step 1: Room Availability</span>
              </div>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#12355B] mb-2">
                Check Room Availability
              </h2>
              <p className="text-sm sm:text-base text-[#6B7280]">
                Enter your stay details to find available rooms.
              </p>
            </div>

            {/* Booking Form Grid */}
            <form onSubmit={handleCheckAvailability} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                {/* Check-in Date */}
                <div>
                  <DatePickerInput
                    id="booking-checkin-date"
                    label="Check-in Date"
                    value={checkIn}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={(e) => setCheckIn(e.target.value)}
                    required
                  />
                </div>

                {/* Check-out Date */}
                <div>
                  <DatePickerInput
                    id="booking-checkout-date"
                    label="Check-out Date"
                    value={checkOut}
                    min={checkIn || tomorrow}
                    onChange={(e) => setCheckOut(e.target.value)}
                    required
                  />
                </div>

                {/* Number of Guests */}
                <div>
                  <SelectDropdown
                    id="booking-guests-selector"
                    label="Number of Guests"
                    leftIcon={<Users className="w-4 h-4" />}
                    value={guestsCount}
                    onChange={(e) => setGuestsCount(Number(e.target.value))}
                    options={[
                      { value: 1, label: '1 Guest', sublabel: 'Solo' },
                      { value: 2, label: '2 Guests', sublabel: 'Standard' },
                      { value: 3, label: '3 Guests', sublabel: 'Family' },
                      { value: 4, label: '4 Guests', sublabel: 'Suite' },
                      { value: 6, label: '5+ Guests', sublabel: 'Executive' },
                    ]}
                  />
                </div>

                {/* Number of Rooms */}
                <div>
                  <SelectDropdown
                    id="booking-rooms-selector"
                    label="Number of Rooms"
                    leftIcon={<Building2 className="w-4 h-4" />}
                    value={roomsCount}
                    onChange={(e) => setRoomsCount(Number(e.target.value))}
                    options={[
                      { value: 1, label: '1 Room' },
                      { value: 2, label: '2 Rooms' },
                      { value: 3, label: '3 Rooms' },
                      { value: 4, label: '4+ Rooms (Group)' },
                    ]}
                  />
                </div>

                {/* Preferred Room Type (optional) */}
                <div>
                  <SelectDropdown
                    id="booking-room-type-filter"
                    label="Preferred Room Type"
                    leftIcon={<Bed className="w-4 h-4" />}
                    value={preferredCategory}
                    onChange={(e) => setPreferredCategory(e.target.value)}
                    options={[
                      { value: 'all', label: 'All Room Types' },
                      { value: 'standard', label: 'Standard Rooms' },
                      { value: 'deluxe', label: 'Deluxe Rooms' },
                      { value: 'suite', label: 'Suites & Penthouses' },
                    ]}
                    helperText="Optional filter"
                  />
                </div>
              </div>

              {/* Action Bar */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-[#E5E7EB]">
                <div className="text-xs sm:text-sm text-[#6B7280] flex items-center gap-2">
                  <Info className="w-4 h-4 text-[#12355B]" />
                  <span>
                    Selected stay: <strong className="text-[#1F2937]">{nights} night(s)</strong>,{' '}
                    <strong className="text-[#1F2937]">{guestsCount} guest(s)</strong> in{' '}
                    <strong className="text-[#1F2937]">{roomsCount} room(s)</strong>
                  </span>
                </div>

                <Button
                  id="check-availability-submit-btn"
                  variant="primary"
                  size="lg"
                  type="submit"
                  disabled={isSearching}
                  className="w-full sm:w-auto px-8"
                >
                  {isSearching ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Checking Availability...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Search className="w-4 h-4 text-[#D4A853]" />
                      Check Availability
                    </span>
                  )}
                </Button>
              </div>

              {searchNotification && (
                <div className="p-3.5 rounded-[8px] bg-[#EFF6FF] border border-[#BFDBFE] text-xs sm:text-sm text-[#1E40AF] flex items-center justify-between">
                  <span className="flex items-center gap-2 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-[#2563EB]" />
                    {searchNotification}
                  </span>
                  <button
                    type="button"
                    onClick={() => setSearchNotification(null)}
                    className="text-[#1E40AF] hover:text-[#1E3A8A] text-xs font-semibold"
                  >
                    Dismiss
                  </button>
                </div>
              )}
            </form>
          </div>
        </section>

        {/* 5. AVAILABLE ROOMS RESULTS */}
        <section
          id="available-rooms-results"
          className="py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto"
        >
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-[#D4A853] font-bold mb-1">
                <Bed className="w-4 h-4" />
                <span>Step 2: Choose Your Room</span>
              </div>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#12355B]">
                Available Rooms
              </h2>
              <p className="text-sm text-[#6B7280]">
                Showing {availableRoomsList.length} rooms available for your requested dates.
              </p>
            </div>

            {/* Currently selected room badge */}
            <div className="p-2.5 rounded-[8px] bg-white border border-[#E5E7EB] inline-flex items-center gap-2 text-xs">
              <span className="text-[#6B7280]">Currently Selected:</span>
              <strong className="text-[#12355B] font-semibold">{selectedRoom.name}</strong>
              <button
                type="button"
                onClick={() => scrollToSection('booking-details-section')}
                className="ml-1 text-xs text-[#2563EB] hover:underline font-medium"
              >
                Proceed to Details &rarr;
              </button>
            </div>
          </div>

          {/* Rooms Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {availableRoomsList.map((room) => {
              const isCurrentSelection = selectedRoom.id === room.id;
              const isUnavailable = room.availability === 'unavailable';

              return (
                <div
                  key={room.id}
                  id={`room-result-card-${room.id}`}
                  className={`bg-white rounded-[12px] overflow-hidden border transition-all duration-300 flex flex-col h-full shadow-xs hover:shadow-md ${
                    isCurrentSelection
                      ? 'border-[#12355B] ring-2 ring-[#12355B]/15 shadow-md'
                      : 'border-[#E5E7EB]'
                  }`}
                >
                  {/* Room Image */}
                  <div className="relative aspect-[16/10] w-full overflow-hidden bg-gray-100">
                    {room.image ? (
                      <img
                        src={room.image}
                        alt={room.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-sm font-semibold text-[#12355B]">
                        {room.name}
                      </div>
                    )}
                    {/* Status Badge */}
                    <div className="absolute top-3 left-3 z-10">
                      <AvailabilityBadge
                        availability={room.availability}
                        availableRoomsLeft={room.availableRoomsLeft}
                      />
                    </div>

                    {isCurrentSelection && (
                      <div className="absolute top-3 right-3 z-10 bg-[#12355B] text-white text-[11px] font-semibold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm">
                        <Check className="w-3 h-3 text-[#D4A853]" />
                        Selected
                      </div>
                    )}
                  </div>

                  {/* Card Content */}
                  <div className="p-5 sm:p-6 flex flex-col flex-grow justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <span className="text-[11px] uppercase tracking-wider text-[#D4A853] font-semibold">
                            {room.category}
                          </span>
                          <h3 className="font-serif font-bold text-xl text-[#12355B]">
                            {room.name}
                          </h3>
                        </div>
                        <div className="text-right">
                          <div className="text-lg sm:text-xl font-bold text-[#12355B]">
                            ETB {room.pricePerNight.toLocaleString()}
                          </div>
                          <span className="text-[11px] text-[#6B7280]">per night</span>
                        </div>
                      </div>

                      <p className="text-xs sm:text-sm text-[#6B7280] line-clamp-2 mb-4">
                        {room.shortDescription}
                      </p>

                      {/* Room Specs */}
                      <div className="flex items-center gap-4 text-xs text-[#4B5563] pb-4 mb-4 border-b border-[#E5E7EB]">
                        <span className="flex items-center gap-1">
                          <Users className="w-3.5 h-3.5 text-[#12355B]" />
                          Up to {room.capacityGuests} Guests
                        </span>
                        <span className="w-1 h-1 rounded-full bg-gray-300" />
                        <span className="flex items-center gap-1">
                          <Bed className="w-3.5 h-3.5 text-[#12355B]" />
                          {room.bedType}
                        </span>
                      </div>

                      {/* Main Amenities */}
                      <div className="mb-6">
                        <span className="text-[11px] uppercase tracking-wider text-[#6B7280] font-semibold block mb-2">
                          Main Amenities
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {room.keyAmenities.slice(0, 3).map((amenity, idx) => (
                            <span
                              key={idx}
                              className="text-[11px] px-2 py-0.5 rounded-[4px] bg-[#F8F7F4] text-[#4B5563] border border-[#E5E7EB]"
                            >
                              {amenity}
                            </span>
                          ))}
                          {room.keyAmenities.length > 3 && (
                            <span className="text-[11px] px-1.5 py-0.5 text-[#6B7280]">
                              +{room.keyAmenities.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <Button
                        id={`view-details-${room.id}`}
                        variant="secondary"
                        size="md"
                        onClick={() => setRoomDetailsModalRoom(room)}
                        className="w-full text-xs"
                      >
                        View Details
                      </Button>

                      <Button
                        id={`book-room-${room.id}`}
                        variant={isCurrentSelection ? 'secondary' : 'primary'}
                        size="md"
                        disabled={isUnavailable}
                        onClick={() => handleSelectRoomForBooking(room)}
                        className={`w-full text-xs ${
                          isCurrentSelection
                            ? 'bg-[#12355B]/10 border-[#12355B] text-[#12355B] font-bold'
                            : ''
                        }`}
                      >
                        {isCurrentSelection ? 'Selected Room' : 'Book This Room'}
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* 6. BOOKING DETAILS & 7. BOOKING SUMMARY SECTION (Responsive 2-column) */}
        <section
          id="booking-details-section"
          className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto"
        >
          {/* Booking Success Banner / View */}
          {bookingSuccessData ? (
            <div
              id="booking-success-state"
              className="bg-white rounded-[16px] border border-[#BBF7D0] p-8 sm:p-12 shadow-md text-center max-w-3xl mx-auto"
            >
              <div className="w-16 h-16 rounded-full bg-[#DCFCE7] text-[#15803D] flex items-center justify-center mx-auto mb-5">
                <CheckCircle2 className="w-9 h-9" />
              </div>

              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#DCFCE7] text-[#15803D] text-xs font-semibold mb-3">
                <StatusBadge status="confirmed" />
              </div>

              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#12355B] mb-2">
                Booking Request Submitted Successfully
              </h2>

              <p className="text-sm sm:text-base text-[#6B7280] max-w-xl mx-auto mb-6">
                Thank you for choosing our hotel. We will review your booking and contact you shortly.
              </p>

              {/* Reference Box */}
              <div className="p-4 sm:p-5 rounded-[12px] bg-[#F8F7F4] border border-[#E5E7EB] max-w-md mx-auto mb-8 text-left">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs uppercase tracking-wider text-[#6B7280] font-semibold">
                    Booking Reference
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopyRef(bookingSuccessData.referenceNumber)}
                    className="text-xs text-[#12355B] hover:text-[#D4A853] font-medium flex items-center gap-1 transition-colors"
                  >
                    {copiedRef === bookingSuccessData.referenceNumber ? (
                      <span className="text-[#16A34A] font-semibold flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> Copied
                      </span>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" /> Copy Code
                      </>
                    )}
                  </button>
                </div>
                <div className="font-mono text-xl sm:text-2xl font-bold text-[#12355B]">
                  {bookingSuccessData.referenceNumber}
                </div>
                <div className="mt-3 pt-3 border-t border-[#E5E7EB] text-xs text-[#6B7280] space-y-1">
                  <div className="flex justify-between">
                    <span>Room:</span>
                    <strong className="text-[#1F2937]">{bookingSuccessData.reservation.roomName}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Guest:</span>
                    <strong className="text-[#1F2937]">{bookingSuccessData.reservation.guestName}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Dates:</span>
                    <strong className="text-[#1F2937]">
                      {bookingSuccessData.reservation.checkIn} to {bookingSuccessData.reservation.checkOut} (
                      {bookingSuccessData.reservation.nights} nights)
                    </strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Estimated Total:</span>
                    <strong className="text-[#12355B] font-bold">
                      ETB {bookingSuccessData.reservation.totalPrice.toLocaleString()}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => onNavigate('rooms')}
                  className="w-full sm:w-auto"
                >
                  View Rooms
                </Button>
                <Button
                  variant="secondary"
                  size="md"
                  onClick={() => onNavigate('home')}
                  className="w-full sm:w-auto"
                >
                  Return Home
                </Button>
                <Button
                  variant="ghost"
                  size="md"
                  onClick={() => setBookingSuccessData(null)}
                  className="text-xs text-[#6B7280]"
                >
                  Make Another Booking
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* 6. BOOKING DETAILS SECTION (Form: 7 Columns on desktop) */}
              <div className="lg:col-span-7 bg-white rounded-[16px] border border-[#E5E7EB] p-6 sm:p-8 shadow-sm">
                <div className="mb-6">
                  <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-[#D4A853] font-bold mb-1">
                    <CalendarCheck className="w-4 h-4" />
                    <span>Step 3: Guest & Stay Details</span>
                  </div>
                  <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#12355B] mb-2">
                    Complete Your Booking
                  </h2>
                  <p className="text-sm text-[#6B7280]">
                    Please provide your contact details to reserve{' '}
                    <strong className="text-[#12355B]">{selectedRoom.name}</strong>.
                  </p>
                </div>

                <form onSubmit={handleBookingSubmit} className="space-y-6">
                  {/* Selected Room Pill Banner */}
                  <div className="p-4 rounded-[10px] bg-[#F8F7F4] border border-[#E5E7EB] flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-14 w-14 items-center justify-center rounded-[8px] border border-[#E5E7EB] bg-white text-center text-[10px] font-semibold text-[#12355B]">
                        {selectedRoom.name}
                      </div>
                      <div>
                        <div className="text-xs text-[#6B7280]">Selected Room</div>
                        <div className="font-serif font-bold text-[#12355B] text-base">
                          {selectedRoom.name}
                        </div>
                        <div className="text-xs text-[#12355B] font-semibold">
                          ETB {selectedRoom.pricePerNight.toLocaleString()} / night
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => scrollToSection('available-rooms-results')}
                      className="text-xs text-[#2563EB] hover:underline font-medium"
                    >
                      Change Room
                    </button>
                  </div>

                  {/* Personal Information Group */}
                  <div>
                    <h3 className="text-sm font-semibold text-[#12355B] uppercase tracking-wider mb-3">
                      Guest Information
                    </h3>
                    <div className="space-y-4">
                      {/* Full Name */}
                      <TextInput
                        id="booking-guest-fullname"
                        label="Full Name"
                        placeholder="e.g., Almaz Bekele"
                        value={guestFullName}
                        onChange={(e) => {
                          setGuestFullName(e.target.value);
                          if (bookingErrors.guestFullName) {
                            setBookingErrors((prev) => ({ ...prev, guestFullName: '' }));
                          }
                        }}
                        error={bookingErrors.guestFullName}
                        required
                      />

                      {/* Email Address */}
                      <TextInput
                        id="booking-guest-email"
                        type="email"
                        label="Email Address"
                        placeholder="e.g., almaz@example.com"
                        leftIcon={<Mail className="w-4 h-4" />}
                        value={guestEmail}
                        onChange={(e) => {
                          setGuestEmail(e.target.value);
                          if (bookingErrors.guestEmail) {
                            setBookingErrors((prev) => ({ ...prev, guestEmail: '' }));
                          }
                        }}
                        error={bookingErrors.guestEmail}
                        helperText="Booking confirmation and e-receipt will be sent to this address."
                        required
                      />

                      {/* Phone Number */}
                      <TextInput
                        id="booking-guest-phone"
                        type="tel"
                        label="Phone Number"
                        placeholder="e.g., +251 91 234 5678"
                        leftIcon={<Phone className="w-4 h-4" />}
                        value={guestPhone}
                        onChange={(e) => {
                          setGuestPhone(e.target.value);
                          if (bookingErrors.guestPhone) {
                            setBookingErrors((prev) => ({ ...prev, guestPhone: '' }));
                          }
                        }}
                        error={bookingErrors.guestPhone}
                        helperText="Used by hotel concierge for arrival coordination."
                        required
                      />
                    </div>
                  </div>

                  {/* Booking Stay Information Recap / Edit */}
                  <div>
                    <h3 className="text-sm font-semibold text-[#12355B] uppercase tracking-wider mb-3">
                      Stay Parameters
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <DatePickerInput
                        id="booking-confirm-checkin"
                        label="Check-in Date"
                        value={checkIn}
                        onChange={(e) => setCheckIn(e.target.value)}
                        error={bookingErrors.checkIn}
                      />
                      <DatePickerInput
                        id="booking-confirm-checkout"
                        label="Check-out Date"
                        value={checkOut}
                        onChange={(e) => setCheckOut(e.target.value)}
                        error={bookingErrors.checkOut}
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
                      <SelectDropdown
                        id="booking-confirm-guests"
                        label="Number of Guests"
                        value={guestsCount}
                        onChange={(e) => setGuestsCount(Number(e.target.value))}
                        options={[
                          { value: 1, label: '1 Guest' },
                          { value: 2, label: '2 Guests' },
                          { value: 3, label: '3 Guests' },
                          { value: 4, label: '4 Guests' },
                        ]}
                      />
                      <SelectDropdown
                        id="booking-confirm-rooms"
                        label="Number of Rooms"
                        value={roomsCount}
                        onChange={(e) => setRoomsCount(Number(e.target.value))}
                        options={[
                          { value: 1, label: '1 Room' },
                          { value: 2, label: '2 Rooms' },
                          { value: 3, label: '3 Rooms' },
                        ]}
                      />
                    </div>
                  </div>

                  {/* Special Requests (Optional TextArea) */}
                  <div>
                    <h3 className="text-sm font-semibold text-[#12355B] uppercase tracking-wider mb-2">
                      Special Requests
                    </h3>
                    <TextArea
                      id="booking-special-requests"
                      rows={3}
                      placeholder="E.g., early arrival, airport transfer, quiet high-floor room, king bed preference, or dietary restrictions..."
                      value={specialRequests}
                      onChange={(e) => setSpecialRequests(e.target.value)}
                      helperText="Special requests cannot be guaranteed but our staff will do their utmost to accommodate."
                    />
                  </div>

                  {/* Submit Button for Mobile / Alternate position */}
                  <div className="pt-2 lg:hidden">
                    <Button
                      id="mobile-confirm-booking-btn"
                      variant="primary"
                      size="lg"
                      type="submit"
                      fullWidth
                      disabled={isSubmittingBooking}
                    >
                      {isSubmittingBooking ? 'Submitting Reservation...' : 'Confirm Booking'}
                    </Button>
                  </div>
                </form>
              </div>

              {/* 7. BOOKING SUMMARY CARD (5 Columns on desktop, sticky) */}
              <div
                id="booking-summary-card"
                className="lg:col-span-5 bg-white rounded-[16px] border border-[#E5E7EB] p-6 sm:p-7 shadow-sm lg:sticky lg:top-28"
              >
                <div className="flex items-center justify-between pb-4 border-b border-[#E5E7EB] mb-5">
                  <h3 className="font-serif text-xl font-bold text-[#12355B]">
                    Booking Summary
                  </h3>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#12355B]/10 text-[#12355B] font-semibold">
                    Direct Rate
                  </span>
                </div>

                {/* Selected Room Visual */}
                <div className="flex gap-4 items-center mb-5 pb-5 border-b border-[#E5E7EB]">
                  <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-[10px] border border-[#E5E7EB] bg-[#F8F7F4] text-center text-[10px] font-semibold text-[#12355B]">
                    {selectedRoom.name}
                  </div>
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-[#D4A853] font-semibold block">
                      {selectedRoom.category}
                    </span>
                    <h4 className="font-serif font-bold text-lg text-[#12355B]">
                      {selectedRoom.name}
                    </h4>
                    <p className="text-xs text-[#6B7280]">
                      Capacity: {selectedRoom.capacityGuests} Guests &bull; {selectedRoom.bedType}
                    </p>
                    <p className="text-xs font-semibold text-[#12355B] mt-0.5">
                      ETB {selectedRoom.pricePerNight.toLocaleString()} / night
                    </p>
                  </div>
                </div>

                {/* Stay Dates Breakdown */}
                <div className="space-y-3 text-xs sm:text-sm text-[#4B5563] pb-5 border-b border-[#E5E7EB]">
                  <div className="flex justify-between items-center">
                    <span className="text-[#6B7280]">Check-in:</span>
                    <strong className="text-[#1F2937] font-semibold">
                      {formatDateFriendly(checkIn)}
                    </strong>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#6B7280]">Check-out:</span>
                    <strong className="text-[#1F2937] font-semibold">
                      {formatDateFriendly(checkOut)}
                    </strong>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#6B7280]">Duration:</span>
                    <strong className="text-[#1F2937] font-semibold">
                      {nights} {nights === 1 ? 'Night' : 'Nights'}
                    </strong>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#6B7280]">Guests & Rooms:</span>
                    <strong className="text-[#1F2937] font-semibold">
                      {guestsCount} Guest(s), {roomsCount} Room(s)
                    </strong>
                  </div>
                </div>

                {/* Price Breakdown */}
                <div className="py-4 space-y-2 text-xs sm:text-sm border-b border-[#E5E7EB]">
                  <div className="flex justify-between text-[#6B7280]">
                    <span>
                      ETB {selectedRoom.pricePerNight.toLocaleString()} &times; {nights} nights
                    </span>
                    <span className="text-[#1F2937]">ETB {subtotal.toLocaleString()}</span>
                  </div>

                  <div className="flex justify-between text-[#16A34A]">
                    <span className="flex items-center gap-1">
                      <Tag className="w-3.5 h-3.5" />
                      Direct Booking Advantage (10% Off)
                    </span>
                    <span>-ETB {directDiscount.toLocaleString()}</span>
                  </div>

                  <div className="flex justify-between text-[#6B7280]">
                    <span>Hospitality Tax & Service (8%)</span>
                    <span className="text-[#1F2937]">ETB {taxes.toLocaleString()}</span>
                  </div>
                </div>

                {/* Estimated Total Price: Example ETB 10,500 */}
                <div className="py-4 flex items-baseline justify-between mb-4">
                  <div>
                    <span className="text-xs text-[#6B7280] block">Estimated Total</span>
                    <span className="text-xs text-[#16A34A] font-medium">Taxes & fees included</span>
                  </div>
                  <div className="text-right">
                    <span className="font-serif text-2xl sm:text-3xl font-bold text-[#12355B]">
                      ETB {estimatedTotal.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Primary Button: Confirm Booking (Desktop) */}
                <Button
                  id="confirm-booking-btn"
                  variant="primary"
                  size="lg"
                  fullWidth
                  onClick={handleBookingSubmit}
                  disabled={isSubmittingBooking}
                  className="mb-4 shadow-sm font-semibold"
                >
                  {isSubmittingBooking ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Confirming Request...
                    </span>
                  ) : (
                    'Confirm Booking'
                  )}
                </Button>

                {/* Policy Notice */}
                <div className="p-3.5 rounded-[8px] bg-[#F8F7F4] border border-[#E5E7EB] text-[11px] text-[#6B7280] leading-relaxed">
                  <div className="flex items-center gap-1.5 font-semibold text-[#12355B] mb-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#D4A853]" />
                    <span>Booking Policy & Guarantee</span>
                  </div>
                  Please note: This room reservation request is held immediately and confirmed by our front desk within 2 hours. No upfront payment or credit card charge is required online.
                </div>
              </div>
            </div>
          )}
        </section>

        {/* 8. INQUIRY SECTION & 9. INQUIRY FORM */}
        <section
          id="inquiry-section-anchor"
          className="py-16 px-4 sm:px-6 lg:px-8 bg-white border-t border-b border-[#E5E7EB]"
        >
          <div className="max-w-4xl mx-auto">
            {/* Section Heading & Supporting Text */}
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#12355B]/5 text-[#12355B] text-xs font-semibold mb-2">
                <MessageSquare className="w-3.5 h-3.5 text-[#D4A853]" />
                <span>Guest Assistance & Custom Requests</span>
              </div>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#12355B] mb-3">
                Need Help or Have a Special Request?
              </h2>
              <p className="text-base text-[#6B7280] max-w-2xl mx-auto">
                Send us your inquiry and our hotel team will get back to you as soon as possible.
              </p>
            </div>

            {/* Inquiry Success State or Form */}
            {inquirySuccessData ? (
              <div
                id="inquiry-success-state"
                className="bg-[#F8F7F4] rounded-[16px] border border-[#BBF7D0] p-8 sm:p-12 shadow-sm text-center"
              >
                <div className="w-16 h-16 rounded-full bg-[#DCFCE7] text-[#15803D] flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-9 h-9" />
                </div>

                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#DCFCE7] text-[#15803D] text-xs font-semibold mb-3">
                  <StatusBadge status="responded" />
                </div>

                <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#12355B] mb-2">
                  Your Inquiry Has Been Sent
                </h3>

                <p className="text-sm sm:text-base text-[#6B7280] max-w-lg mx-auto mb-6">
                  Thank you for contacting us. Our team will respond as soon as possible via{' '}
                  <strong className="text-[#12355B]">{inquirySuccessData.email}</strong>.
                </p>

                {/* Inquiry Reference Number Box */}
                <div className="p-4 rounded-[10px] bg-white border border-[#E5E7EB] max-w-xs mx-auto mb-8 text-center">
                  <span className="text-xs uppercase tracking-wider text-[#6B7280] font-semibold block mb-1">
                    Inquiry Reference Number
                  </span>
                  <div className="font-mono text-lg sm:text-xl font-bold text-[#12355B]">
                    {inquirySuccessData.referenceNumber}
                  </div>
                  <span className="text-[11px] text-[#16A34A] font-medium block mt-1">
                    Logged in concierge queue
                  </span>
                </div>

                {/* Success Buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                  <Button
                    variant="primary"
                    size="md"
                    onClick={() => onNavigate('rooms')}
                    className="w-full sm:w-auto"
                  >
                    Explore Rooms
                  </Button>
                  <Button
                    variant="secondary"
                    size="md"
                    onClick={() => onNavigate('home')}
                    className="w-full sm:w-auto"
                  >
                    Return Home
                  </Button>
                  <Button
                    variant="ghost"
                    size="md"
                    onClick={() => {
                      setInquirySuccessData(null);
                      setInquiryMessage('');
                      setInquirySubject('');
                    }}
                    className="text-xs text-[#6B7280]"
                  >
                    Submit Another Inquiry
                  </Button>
                </div>
              </div>
            ) : (
              /* Clean White Card for Inquiry Form */
              <div
                id="inquiry-form-card"
                className="bg-white rounded-[16px] border border-[#E5E7EB] p-6 sm:p-10 shadow-xs"
              >
                <form onSubmit={handleInquirySubmit} className="space-y-6">
                  {/* Personal Information Group */}
                  <div>
                    <h3 className="text-sm font-semibold text-[#12355B] uppercase tracking-wider mb-4 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#D4A853]" />
                      Personal Information
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {/* Full Name */}
                      <div>
                        <TextInput
                          id="inquiry-fullname"
                          label="Full Name"
                          placeholder="Your Full Name"
                          value={inquiryFullName}
                          onChange={(e) => {
                            setInquiryFullName(e.target.value);
                            if (inquiryErrors.inquiryFullName) {
                              setInquiryErrors((prev) => ({ ...prev, inquiryFullName: '' }));
                            }
                          }}
                          error={inquiryErrors.inquiryFullName}
                          required
                        />
                      </div>

                      {/* Email Address */}
                      <div>
                        <TextInput
                          id="inquiry-email"
                          type="email"
                          label="Email Address"
                          placeholder="you@example.com"
                          leftIcon={<Mail className="w-4 h-4" />}
                          value={inquiryEmail}
                          onChange={(e) => {
                            setInquiryEmail(e.target.value);
                            if (inquiryErrors.inquiryEmail) {
                              setInquiryErrors((prev) => ({ ...prev, inquiryEmail: '' }));
                            }
                          }}
                          error={inquiryErrors.inquiryEmail}
                          required
                        />
                      </div>

                      {/* Phone Number */}
                      <div>
                        <TextInput
                          id="inquiry-phone"
                          type="tel"
                          label="Phone Number"
                          placeholder="+1 (555) 000-0000"
                          leftIcon={<Phone className="w-4 h-4" />}
                          value={inquiryPhone}
                          onChange={(e) => {
                            setInquiryPhone(e.target.value);
                            if (inquiryErrors.inquiryPhone) {
                              setInquiryErrors((prev) => ({ ...prev, inquiryPhone: '' }));
                            }
                          }}
                          error={inquiryErrors.inquiryPhone}
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Inquiry Details Group */}
                  <div>
                    <h3 className="text-sm font-semibold text-[#12355B] uppercase tracking-wider mb-4 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#D4A853]" />
                      Inquiry Details
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                      {/* Inquiry Type Options: Exactly 7 required items */}
                      <div>
                        <SelectDropdown
                          id="inquiry-type-selector"
                          label="Inquiry Type"
                          value={inquiryType}
                          onChange={(e) => setInquiryType(e.target.value)}
                          options={[
                            { value: 'Room Availability', label: 'Room Availability' },
                            { value: 'Pricing Information', label: 'Pricing Information' },
                            { value: 'Booking Assistance', label: 'Booking Assistance' },
                            { value: 'Special Request', label: 'Special Request' },
                            { value: 'Group Booking', label: 'Group Booking' },
                            { value: 'Event or Conference', label: 'Event or Conference' },
                            { value: 'General Inquiry', label: 'General Inquiry' },
                          ]}
                          required
                        />
                      </div>

                      {/* Subject */}
                      <div>
                        <TextInput
                          id="inquiry-subject"
                          label="Subject"
                          placeholder="Brief topic or question"
                          value={inquirySubject}
                          onChange={(e) => setInquirySubject(e.target.value)}
                        />
                      </div>
                    </div>

                    {/* Message Area */}
                    <div>
                      <TextArea
                        id="inquiry-message"
                        label="Message"
                        placeholder="Tell us how we can help you..."
                        rows={5}
                        value={inquiryMessage}
                        onChange={(e) => {
                          setInquiryMessage(e.target.value);
                          if (inquiryErrors.inquiryMessage) {
                            setInquiryErrors((prev) => ({ ...prev, inquiryMessage: '' }));
                          }
                        }}
                        error={inquiryErrors.inquiryMessage}
                        required
                      />
                    </div>
                  </div>

                  {/* Optional Stay Information Accordion / Toggle */}
                  <div className="border border-[#E5E7EB] rounded-[10px] overflow-hidden bg-[#F8F7F4]/50">
                    <button
                      type="button"
                      onClick={() => setShowOptionalStayInfo(!showOptionalStayInfo)}
                      className="w-full px-4 py-3 flex items-center justify-between text-left text-xs sm:text-sm font-semibold text-[#12355B] hover:bg-[#F8F7F4] transition-colors"
                    >
                      <span className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-[#D4A853]" />
                        <span>Include Optional Stay Information (Dates, Room Type, Guests)</span>
                      </span>
                      {showOptionalStayInfo ? (
                        <ChevronUp className="w-4 h-4 text-[#6B7280]" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-[#6B7280]" />
                      )}
                    </button>

                    {showOptionalStayInfo && (
                      <div className="p-4 sm:p-5 border-t border-[#E5E7EB] bg-white">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                          <DatePickerInput
                            id="inquiry-preferred-checkin"
                            label="Preferred Check-in"
                            value={inquiryCheckIn}
                            onChange={(e) => setInquiryCheckIn(e.target.value)}
                          />
                          <DatePickerInput
                            id="inquiry-preferred-checkout"
                            label="Preferred Check-out"
                            value={inquiryCheckOut}
                            onChange={(e) => setInquiryCheckOut(e.target.value)}
                          />
                          <SelectDropdown
                            id="inquiry-preferred-guests"
                            label="Number of Guests"
                            value={inquiryGuests}
                            onChange={(e) => setInquiryGuests(Number(e.target.value))}
                            options={[
                              { value: 1, label: '1 Guest' },
                              { value: 2, label: '2 Guests' },
                              { value: 3, label: '3-4 Guests' },
                              { value: 5, label: '5+ Guests' },
                            ]}
                          />
                          <SelectDropdown
                            id="inquiry-preferred-room-type"
                            label="Preferred Room Type"
                            value={inquiryRoomType}
                            onChange={(e) => setInquiryRoomType(e.target.value)}
                            options={rooms.map((r) => ({
                              value: r.name,
                              label: r.name,
                              sublabel: `ETB ${r.pricePerNight.toLocaleString()}`,
                            }))}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Primary Button: Send Inquiry */}
                  <div className="pt-2">
                    <Button
                      id="submit-inquiry-btn"
                      variant="primary"
                      size="lg"
                      type="submit"
                      disabled={isSubmittingInquiry}
                      className="w-full sm:w-auto px-10 shadow-sm"
                    >
                      {isSubmittingInquiry ? (
                        <span className="flex items-center gap-2">
                          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Sending Inquiry...
                        </span>
                      ) : (
                        'Send Inquiry'
                      )}
                    </Button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </section>

        {/* 12. CONTACT INFORMATION (Direct Communication Section) */}
        <section
          id="direct-contact-section"
          className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto"
        >
          <div className="text-center mb-10">
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#12355B] mb-3">
              Prefer to Contact Us Directly?
            </h2>
            <p className="text-sm sm:text-base text-[#6B7280] max-w-xl mx-auto">
              Our front desk and reservations staff are on-property 24/7 to answer questions, customize itineraries, and assist with immediate bookings.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Address Card */}
            <div className="bg-white rounded-[12px] p-6 border border-[#E5E7EB] hover:border-[#12355B]/40 transition-colors shadow-xs flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-[8px] bg-[#12355B]/5 text-[#12355B] flex items-center justify-center mb-4">
                  <MapPin className="w-5 h-5 text-[#D4A853]" />
                </div>
                <h3 className="font-serif font-bold text-lg text-[#12355B] mb-2">
                  Hotel Address
                </h3>
                <p className="text-xs sm:text-sm text-[#6B7280] leading-relaxed">
                  {HOTEL_INFO.address}
                </p>
              </div>
              <div className="pt-4 text-xs font-semibold text-[#12355B]">
                Coastal District &bull; Oceanfront
              </div>
            </div>

            {/* Phone Card */}
            <div className="bg-white rounded-[12px] p-6 border border-[#E5E7EB] hover:border-[#12355B]/40 transition-colors shadow-xs flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-[8px] bg-[#12355B]/5 text-[#12355B] flex items-center justify-center mb-4">
                  <Phone className="w-5 h-5 text-[#D4A853]" />
                </div>
                <h3 className="font-serif font-bold text-lg text-[#12355B] mb-2">
                  Phone Number
                </h3>
                <a
                  href={`tel:${HOTEL_INFO.phone}`}
                  className="text-xs sm:text-sm text-[#12355B] font-semibold hover:underline block mb-1"
                >
                  {HOTEL_INFO.phone}
                </a>
                <p className="text-xs text-[#6B7280]">Toll-free direct reservations line</p>
              </div>
              <div className="pt-4 text-xs text-[#16A34A] font-medium flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#16A34A] animate-pulse" />
                Live Front Desk Line
              </div>
            </div>

            {/* Email Card */}
            <div className="bg-white rounded-[12px] p-6 border border-[#E5E7EB] hover:border-[#12355B]/40 transition-colors shadow-xs flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-[8px] bg-[#12355B]/5 text-[#12355B] flex items-center justify-center mb-4">
                  <Mail className="w-5 h-5 text-[#D4A853]" />
                </div>
                <h3 className="font-serif font-bold text-lg text-[#12355B] mb-2">
                  Email Address
                </h3>
                <a
                  href={`mailto:${HOTEL_INFO.email}`}
                  className="text-xs sm:text-sm text-[#12355B] font-semibold hover:underline block truncate mb-1"
                >
                  {HOTEL_INFO.email}
                </a>
                <p className="text-xs text-[#6B7280]">Inquiries answered within 2 hours</p>
              </div>
              <div className="pt-4 text-xs text-[#6B7280]">
                General & Corporate Bookings
              </div>
            </div>

            {/* Reception Hours & WhatsApp Contact */}
            <div className="bg-white rounded-[12px] p-6 border border-[#E5E7EB] hover:border-[#12355B]/40 transition-colors shadow-xs flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-[8px] bg-[#12355B]/5 text-[#12355B] flex items-center justify-center mb-4">
                  <Clock className="w-5 h-5 text-[#D4A853]" />
                </div>
                <h3 className="font-serif font-bold text-lg text-[#12355B] mb-2">
                  Reception & Chat
                </h3>
                <p className="text-xs sm:text-sm text-[#4B5563] font-medium mb-1">
                  24/7 Front Desk & Concierge
                </p>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#25D366]/10 text-[#128C7E] text-xs font-semibold mt-1">
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>WhatsApp: +1 (800) 458-7299</span>
                </div>
              </div>
              <div className="pt-4 text-xs text-[#6B7280]">
                Always available for our guests
              </div>
            </div>
          </div>
        </section>

        {/* 13. FINAL CALL TO ACTION (Navy #12355B Background with White Text) */}
        <section
          id="final-booking-cta"
          className="bg-[#12355B] text-white py-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden"
        >
          {/* Subtle gold decorative ring */}
          <div className="absolute top-1/2 -left-20 -translate-y-1/2 w-64 h-64 border border-[#D4A853]/15 rounded-full pointer-events-none" />
          <div className="absolute top-1/2 -right-20 -translate-y-1/2 w-80 h-80 border border-[#D4A853]/10 rounded-full pointer-events-none" />

          <div className="max-w-4xl mx-auto text-center relative z-10">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/20 text-[#D4A853] text-xs font-semibold mb-4">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Direct Booking Guarantees</span>
            </div>

            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-4">
              Your Comfortable Stay Starts Here
            </h2>

            <p className="text-white/80 text-base sm:text-lg max-w-2xl mx-auto mb-8 leading-relaxed">
              Explore our rooms, check availability, and book directly with us.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                id="cta-explore-rooms-btn"
                variant="secondary"
                size="lg"
                onClick={() => onNavigate('rooms')}
                className="w-full sm:w-auto bg-white text-[#12355B] hover:bg-white/90 border-transparent shadow-md font-semibold"
              >
                Explore Rooms
              </Button>

              <Button
                id="cta-send-inquiry-btn"
                variant="secondary"
                size="lg"
                onClick={() => scrollToSection('inquiry-section-anchor')}
                className="w-full sm:w-auto border-white/30 text-white hover:bg-white/10"
              >
                Send an Inquiry
              </Button>
            </div>
          </div>
        </section>
      </main>

      {/* 14. FOOTER (Exact same footer as other pages) */}
      <Footer
        onNavigate={onNavigate}
        onOpenBooking={() => scrollToSection('direct-booking-section')}
        onOpenInquiry={() => scrollToSection('inquiry-section-anchor')}
        onOpenDesignSystem={onOpenDesignSystem}
      />

      {/* Room Details Modal */}
      <RoomDetailsModal
        room={roomDetailsModalRoom}
        isOpen={Boolean(roomDetailsModalRoom)}
        onClose={() => setRoomDetailsModalRoom(null)}
        onBookRoom={(room) => {
          setRoomDetailsModalRoom(null);
          handleSelectRoomForBooking(room);
        }}
        onSendInquiry={(room) => {
          setRoomDetailsModalRoom(null);
          setInquiryRoomType(room.name);
          setInquirySubject(`Inquiry regarding ${room.name}`);
          scrollToSection('inquiry-section-anchor');
        }}
        searchState={{
          checkIn,
          checkOut,
          guests: guestsCount,
          rooms: roomsCount,
        }}
      />
    </div>
  );
};

export default function Page() {
  const router = useRouter();

  const handleNavigate = (page: NavPage) => {
    const pathMap: Record<string, string> = {
      home: '/',
      rooms: '/rooms',
      about: '/about',
      inquiry: '/inquiry',
      booking: '/booking',
    };

    router.push(pathMap[page] || '/');
  };

  return (
    <BookingInquiryPage
      onNavigate={handleNavigate}
      onOpenDesignSystem={() => router.push('/')}
      onConfirmReservation={() => undefined}
      onAddInquiry={() => undefined}
    />
  );
}
