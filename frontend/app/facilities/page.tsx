'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Header, NavPage } from '../../components/layout/Header';
import { Footer } from '../../components/layout/Footer';
import { Button } from '../../components/ui/Button';
import { FacilityStatusBadge, FacilityStatus } from '../../components/ui/Badge';
import { HOTEL_INFO, ROOMS_DATA } from '../../data/hotelData';
import { BookingModal } from '../../components/booking/BookingModal';
import { Reservation, Room } from '../../types/types';
import {
  Sparkles,
  Wifi,
  Utensils,
  Car,
  Waves,
  Users,
  PlaneTakeoff,
  Clock,
  ConciergeBell,
  Check,
  ChevronRight,
  ChevronLeft,
  X,
  Maximize2,
  CalendarCheck,
  Phone,
  Mail,
  ShieldCheck,
  Zap,
  Coffee,
  Bed,
  Luggage,
  Sparkle,
  Layers,
  ArrowRight,
  Info,
  Building2,
  Dumbbell
} from 'lucide-react';

interface FacilitiesPageProps {
  onNavigate: (page: NavPage) => void;
  onOpenInquiry: (facilityOrRoomName?: string) => void;
  onOpenDesignSystem?: () => void;
  onConfirmReservation?: (reservation: Reservation) => void;
}

interface FacilityDetailItem {
  id: string;
  name: string;
  category: 'wellness' | 'dining' | 'business' | 'convenience';
  status: FacilityStatus;
  description: string;
  longDescription: string;
  hours: string;
  location: string;
  highlights: string[];
  image: string;
  icon: React.ReactNode;
}

interface GalleryItem {
  id: string;
  title: string;
  category: string;
  categorySlug: 'all' | 'dining' | 'wellness' | 'business' | 'spaces';
  imageUrl: string;
  caption: string;
}

export const FacilitiesPage: React.FC<FacilitiesPageProps> = ({
  onNavigate,
  onOpenInquiry,
  onOpenDesignSystem,
  onConfirmReservation,
}) => {
  // Booking modal state
  const [selectedRoomForBooking, setSelectedRoomForBooking] = useState<Room | null>(null);

  // Gallery filter & lightbox state
  const [activeGalleryFilter, setActiveGalleryFilter] = useState<string>('all');
  const [activeLightboxImage, setActiveLightboxImage] = useState<GalleryItem | null>(null);

  // Filter for facilities grid
  const [facilityCategoryFilter, setFacilityCategoryFilter] = useState<string>('all');

  // Main Facilities Data (8 facilities strictly aligned with requirements)
  const MAIN_FACILITIES: FacilityDetailItem[] = [
    {
      id: 'wifi',
      name: 'Free Wi-Fi',
      category: 'convenience',
      status: 'Complimentary',
      description: 'Stay connected with reliable high-speed internet throughout the hotel.',
      longDescription: 'High-speed gigabit fiber internet engineered for ultra-fast downloads, seamless video conferencing, and 4K streaming. Available in every guestroom, suite, conference area, restaurant, and poolside terrace.',
      hours: '24/7 Continuous Access',
      location: 'Property-wide Coverage',
      highlights: [
        '1 Gbps symmetrical fiber bandwidth',
        'Unlimited connected personal devices',
        'No captive portal timeouts or bandwidth caps',
      ],
      image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80',
      icon: <Wifi className="w-5 h-5 text-[#D4A853]" />,
    },
    {
      id: 'restaurant',
      name: 'Restaurant',
      category: 'dining',
      status: 'Available',
      description: 'Enjoy freshly prepared meals and a welcoming dining experience.',
      longDescription: 'The Grand Bistro offers seasonal farm-to-table culinary creations crafted by our executive chef. Savor hearty morning breakfast buffets, light Mediterranean midday lunches, and elegant evening dinners accompanied by curated coastal wines.',
      hours: 'Breakfast: 7:00–10:30 AM | Lunch: 12:00–3:00 PM | Dinner: 6:30–10:30 PM',
      location: 'Ground Floor & Garden Terrace',
      highlights: [
        'Complimentary breakfast buffet for direct guests',
        'Organic, locally sourced seasonal ingredients',
        'Open-air terrace and private dining room',
      ],
      image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80',
      icon: <Utensils className="w-5 h-5 text-[#D4A853]" />,
    },
    {
      id: 'parking',
      name: 'Parking',
      category: 'convenience',
      status: 'Complimentary',
      description: 'Convenient and secure parking for hotel guests.',
      longDescription: 'Underground, secure, climate-controlled parking facility with 24-hour video surveillance and dedicated on-site attendant. Equipped with high-speed Level 2 EV charging stations compatible with all major electric vehicle models.',
      hours: '24/7 Monitored Access with Keycard',
      location: 'Sub-level 1 & 2 (Direct Elevator Access)',
      highlights: [
        'Complimentary private parking for direct booking guests',
        'Universal high-speed EV charging bays',
        'Direct elevator connection to guest floor lobbies',
      ],
      image: 'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=800&q=80',
      icon: <Car className="w-5 h-5 text-[#D4A853]" />,
    },
    {
      id: 'pool',
      name: 'Swimming Pool',
      category: 'wellness',
      status: 'Available',
      description: 'Relax and refresh in our comfortable swimming area.',
      longDescription: 'Our heated rooftop pool boasts stunning panoramic coastline views. Maintained at a gentle 28°C (82°F) year-round, it is framed by plush chaise lounges, shaded cabanas, fresh towel service, and a poolside beverage and light-snack bar.',
      hours: 'Daily: 6:30 AM – 10:00 PM (Adults twilight: 8:00–10:00 PM)',
      location: 'Rooftop Level 5 (Oceanfront)',
      highlights: [
        'Heated year-round with gentle ozone filtration',
        'Complimentary towels & citrus-infused water bar',
        'Comfortable cushioned daybeds & shaded pergolas',
      ],
      image: 'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?auto=format&fit=crop&w=800&q=80',
      icon: <Waves className="w-5 h-5 text-[#D4A853]" />,
    },
    {
      id: 'conference',
      name: 'Conference Room',
      category: 'business',
      status: 'Reservation Required',
      description: 'A professional space suitable for meetings, events, and business gatherings.',
      longDescription: 'An acoustically refined, modern executive boardroom and multi-purpose function space. Features 4K wireless presentation screens, conference audio array, ergonomic Herman Miller seating, and bespoke coffee-break catering options.',
      hours: '8:00 AM – 9:00 PM (Advance booking required)',
      location: 'Mezzanine Business Center (Level 2)',
      highlights: [
        'Configurable layouts accommodating up to 40 guests',
        'Integrated 4K dual-screen wireless hybrid AV',
        'Dedicated event coordinator and catering service',
      ],
      image: 'https://images.unsplash.com/photo-1517502884422-41eaead166d4?auto=format&fit=crop&w=800&q=80',
      icon: <Users className="w-5 h-5 text-[#D4A853]" />,
    },
    {
      id: 'transfer',
      name: 'Airport Transfer',
      category: 'convenience',
      status: 'Additional Charge',
      description: 'Convenient transportation services for a smoother arrival and departure.',
      longDescription: 'Travel with ease between The Grandview and the International Airport or central railway terminal. Our professional, uniformed chauffeurs operate executive hybrid sedans and spacious luxury vans with real-time flight tracking.',
      hours: '24/7 Available Upon Request (24h advance notice)',
      location: 'Hotel Portico Pick-Up & Drop-Off',
      highlights: [
        'Private meet-and-greet at arrivals terminal',
        'Real-time flight monitoring with complimentary waiting time',
        'Spacious luxury executive sedans & Mercedes Sprinter vans',
      ],
      image: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&w=800&q=80',
      icon: <PlaneTakeoff className="w-5 h-5 text-[#D4A853]" />,
    },
    {
      id: 'reception',
      name: '24/7 Reception',
      category: 'convenience',
      status: 'Available',
      description: 'Our team is available to assist guests at any time.',
      longDescription: 'Whether you arrive on a late red-eye flight or require assistance at dawn, our multilingual front desk and concierge team provide round-the-clock check-in, keycard management, restaurant reservations, and personalized itinerary guidance.',
      hours: '24 Hours Daily / 7 Days a Week',
      location: 'Main Lobby Atrium (Ground Floor)',
      highlights: [
        'Seamless express check-in and luggage assistance',
        'Multilingual staff (English, Spanish, French, Mandarin)',
        'Local tour booking, transport hailing, and dining reservations',
      ],
      image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80',
      icon: <Clock className="w-5 h-5 text-[#D4A853]" />,
    },
    {
      id: 'room-service',
      name: 'Room Service',
      category: 'dining',
      status: 'Available',
      description: 'Enjoy convenient service from the comfort of your room.',
      longDescription: 'Indulge in freshly prepared culinary delights delivered directly to your guestroom or suite door. Choose from hot breakfast platters, healthy light lunches, artisanal late-night bites, and sommelier-selected beverage service.',
      hours: 'Daily: 6:30 AM – 11:30 PM (Quick snacks 24/7)',
      location: 'Direct Delivery to All Guest Rooms',
      highlights: [
        'Convenient ordering via in-room telephone or smartphone QR',
        'Eco-friendly thermal cloche presentation to keep meals hot',
        'Special dietary options (gluten-free, vegan, allergy-safe)',
      ],
      image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80',
      icon: <ConciergeBell className="w-5 h-5 text-[#D4A853]" />,
    },
  ];

  // Filtered facilities
  const filteredFacilities = useMemo(() => {
    if (facilityCategoryFilter === 'all') return MAIN_FACILITIES;
    return MAIN_FACILITIES.filter((f) => f.category === facilityCategoryFilter);
  }, [facilityCategoryFilter]);

  // Gallery items
  const GALLERY_ITEMS: GalleryItem[] = [
    {
      id: 'gal-restaurant',
      title: 'The Grand Bistro & Dining Terrace',
      category: 'Dining & Social',
      categorySlug: 'dining',
      imageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80',
      caption: 'Warm ambiance, farm-to-table breakfast buffet, and evening coastal dining under ambient candlelight.',
    },
    {
      id: 'gal-pool',
      title: 'Rooftop Heated Swimming Pool',
      category: 'Wellness & Leisure',
      categorySlug: 'wellness',
      imageUrl: 'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?auto=format&fit=crop&w=1200&q=80',
      caption: 'Panoramic ocean vistas, temperature-controlled water, and peaceful sun loungers on the top deck.',
    },
    {
      id: 'gal-lobby',
      title: 'Main Reception & Marble Lobby',
      category: 'Hospitality Spaces',
      categorySlug: 'spaces',
      imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
      caption: 'An inviting entrance designed with natural stone, gentle lighting, and 24/7 dedicated concierge assistance.',
    },
    {
      id: 'gal-conference',
      title: 'Executive Boardroom & Meeting Hub',
      category: 'Business & Events',
      categorySlug: 'business',
      imageUrl: 'https://images.unsplash.com/photo-1517502884422-41eaead166d4?auto=format&fit=crop&w=1200&q=80',
      caption: 'High-tech hybrid conference setup featuring ergonomic seating and 4K digital presentation display.',
    },
    {
      id: 'gal-parking',
      title: 'Secure Covered Parking & EV Bays',
      category: 'Convenience',
      categorySlug: 'spaces',
      imageUrl: 'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=1200&q=80',
      caption: 'Brightly lit, monitored underground garage with universal rapid charging stations for electric vehicles.',
    },
    {
      id: 'gal-lounge',
      title: 'Quiet Reading Nook & Garden Courtyard',
      category: 'Hospitality Spaces',
      categorySlug: 'spaces',
      imageUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80',
      caption: 'A serene retreat overlooking lush flora, ideal for remote work, reading, or morning espresso.',
    },
  ];

  const filteredGallery = useMemo(() => {
    if (activeGalleryFilter === 'all') return GALLERY_ITEMS;
    return GALLERY_ITEMS.filter((item) => item.categorySlug === activeGalleryFilter);
  }, [activeGalleryFilter]);

  // Gallery lightbox navigation
  const handleNextLightbox = () => {
    if (!activeLightboxImage) return;
    const currentIndex = filteredGallery.findIndex((i) => i.id === activeLightboxImage.id);
    const nextIndex = (currentIndex + 1) % filteredGallery.length;
    setActiveLightboxImage(filteredGallery[nextIndex]);
  };

  const handlePrevLightbox = () => {
    if (!activeLightboxImage) return;
    const currentIndex = filteredGallery.findIndex((i) => i.id === activeLightboxImage.id);
    const prevIndex = (currentIndex - 1 + filteredGallery.length) % filteredGallery.length;
    setActiveLightboxImage(filteredGallery[prevIndex]);
  };

  return (
    <div className="min-h-screen bg-[#F8F7F4] text-[#1F2937] flex flex-col font-sans selection:bg-[#12355B]/10 selection:text-[#12355B]">
      {/* 1. HEADER (Facilities highlighted as active) */}
      <Header
        currentPage="facilities"
        onBookNowClick={() => onNavigate('booking')}
        onOpenInquiryClick={() => onOpenInquiry()}
        onOpenDesignSystemClick={onOpenDesignSystem}
        onNavigate={onNavigate}
      />

      <main className="flex-grow">
        {/* 2. FACILITIES HERO SECTION */}
        <section
          id="facilities-hero"
          className="relative bg-[#12355B] text-white py-20 lg:py-28 overflow-hidden"
        >
          {/* Background image with dark readability overlay */}
          <div className="absolute inset-0 z-0">
            <img
              src="https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?auto=format&fit=crop&w=1920&q=85"
              alt="The Grandview Hotel rooftop pool and relaxation terrace"
              className="w-full h-full object-cover object-center transform scale-105 transition-transform duration-1000 ease-out"
            />
            {/* Subtle dark gradient overlay for optimal text contrast */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#12355B]/95 via-[#12355B]/75 to-[#12355B]/50" />
            <div className="absolute inset-0 bg-[#12355B]/40 mix-blend-multiply" />
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Breadcrumb Navigation */}
            <nav
              aria-label="Breadcrumb"
              className="flex items-center gap-2 text-xs sm:text-sm text-white/80 mb-6 font-medium"
            >
              <button
                onClick={() => onNavigate('home')}
                className="hover:text-white transition-colors cursor-pointer"
              >
                Home
              </button>
              <ChevronRight className="w-3.5 h-3.5 text-[#D4A853]" />
              <span className="text-white font-semibold">Hotel Facilities</span>
            </nav>

            <div className="max-w-3xl">
              {/* Category pill */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[#D4A853] text-xs font-semibold uppercase tracking-wider mb-5 shadow-xs">
                <Sparkles className="w-3.5 h-3.5 text-[#D4A853]" />
                <span>Guest Services & Amenities</span>
              </div>

              {/* Page Hero Heading */}
              <h1 className="font-serif text-3xl sm:text-5xl lg:text-5xl font-bold tracking-tight text-white leading-tight mb-5">
                Everything You Need for a Comfortable Stay
              </h1>

              {/* Supporting Text */}
              <p className="text-base sm:text-lg text-white/90 leading-relaxed font-normal mb-8 max-w-2xl">
                Enjoy modern facilities, thoughtful services, and comfortable spaces designed to make your stay more enjoyable.
              </p>

              {/* Hero Action Buttons */}
              <div className="flex flex-wrap items-center gap-3.5 pt-2">
                <Button
                  id="hero-explore-rooms-btn"
                  variant="primary"
                  size="lg"
                  onClick={() => onNavigate('rooms')}
                  className="bg-[#D4A853] hover:bg-[#c29642] text-[#12355B] font-bold border-none shadow-md"
                >
                  <Bed className="w-4 h-4 mr-2" />
                  Explore Our Rooms
                </Button>

                <Button
                  id="hero-inquire-btn"
                  variant="secondary"
                  size="lg"
                  onClick={() => onOpenInquiry('Hotel Facilities')}
                  className="bg-white/10 hover:bg-white/20 text-white border-white/30 backdrop-blur-xs"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Ask a Question
                </Button>
              </div>

              {/* Trust Indicators */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-12 pt-8 border-t border-white/15 text-xs sm:text-sm text-white/90">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#D4A853]" />
                  <span>Complimentary Fiber Wi-Fi</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#D4A853]" />
                  <span>24/7 Multilingual Desk</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#D4A853]" />
                  <span>Heated Rooftop Pool</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3. FACILITIES INTRODUCTION */}
        <section id="facilities-intro" className="py-16 sm:py-20 bg-[#F8F7F4]">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#12355B]/5 border border-[#12355B]/15 text-[#12355B] text-xs font-semibold uppercase tracking-wider mb-4">
              <Sparkles className="w-3.5 h-3.5 text-[#D4A853]" />
              <span>Thoughtful Hospitality</span>
            </div>

            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#1F2937] tracking-tight mb-4">
              Designed Around Your Comfort
            </h2>

            <p className="text-base sm:text-lg text-[#6B7280] leading-relaxed max-w-2xl mx-auto mb-8">
              From comfortable accommodations to convenient services and relaxing spaces, our facilities are designed to make every stay simple and enjoyable.
            </p>

            {/* Micro feature pills for quick scanning */}
            <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3 text-xs sm:text-sm font-medium text-[#12355B]">
              <span className="px-3.5 py-1.5 rounded-full bg-white border border-[#E5E7EB] shadow-2xs flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-[#16A34A]" />
                Direct Elevator Access
              </span>
              <span className="px-3.5 py-1.5 rounded-full bg-white border border-[#E5E7EB] shadow-2xs flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-[#16A34A]" />
                EV Charging Bays
              </span>
              <span className="px-3.5 py-1.5 rounded-full bg-white border border-[#E5E7EB] shadow-2xs flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-[#16A34A]" />
                High-Speed Wi-Fi Everywhere
              </span>
              <span className="px-3.5 py-1.5 rounded-full bg-white border border-[#E5E7EB] shadow-2xs flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-[#16A34A]" />
                On-site Restaurant & Room Service
              </span>
            </div>
          </div>
        </section>

        {/* 4. MAIN FACILITIES GRID */}
        <section id="facilities-grid" className="py-12 sm:py-16 bg-white border-y border-[#E5E7EB]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 pb-4 border-b border-[#E5E7EB] gap-4">
              <div>
                <span className="text-xs font-semibold text-[#D4A853] uppercase tracking-wider block mb-1">
                  On-Site Amenities
                </span>
                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#1F2937]">
                  All Hotel Facilities
                </h2>
                <p className="text-sm text-[#6B7280] mt-1">
                  Explore our carefully maintained amenities available for all registered guests.
                </p>
              </div>

              {/* Category Filter Chips */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
                {[
                  { id: 'all', label: 'All (8)' },
                  { id: 'convenience', label: 'Convenience' },
                  { id: 'dining', label: 'Dining' },
                  { id: 'wellness', label: 'Wellness' },
                  { id: 'business', label: 'Business' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setFacilityCategoryFilter(tab.id)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
                      facilityCategoryFilter === tab.id
                        ? 'bg-[#12355B] text-white shadow-xs'
                        : 'bg-[#F8F7F4] text-[#6B7280] hover:text-[#12355B] hover:bg-gray-200/70'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 3 columns on Desktop, 2 on Tablet, 1 on Mobile */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {filteredFacilities.map((facility) => (
                <article
                  key={facility.id}
                  id={`facility-card-${facility.id}`}
                  className="bg-white rounded-[12px] border border-[#E5E7EB] shadow-xs hover:shadow-md transition-all duration-300 flex flex-col overflow-hidden group hover:border-[#12355B]/30"
                >
                  {/* Facility Image */}
                  <div className="relative aspect-[16/10] overflow-hidden bg-gray-100">
                    <img
                      src={facility.image}
                      alt={facility.name}
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-60" />

                    {/* Reusable Pill Status Badge */}
                    <div className="absolute top-3 right-3 z-10">
                      <FacilityStatusBadge status={facility.status} />
                    </div>

                    {/* Facility Icon Floating Chip */}
                    <div className="absolute bottom-3 left-3 w-9 h-9 rounded-full bg-white/95 backdrop-blur-xs border border-white/40 flex items-center justify-center shadow-sm text-[#12355B]">
                      {facility.icon}
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-5 sm:p-6 flex flex-col flex-grow justify-between">
                    <div>
                      {/* Facility Name (20–24px Playfair) */}
                      <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#1F2937] group-hover:text-[#12355B] transition-colors mb-2">
                        {facility.name}
                      </h3>

                      {/* Description */}
                      <p className="text-sm text-[#6B7280] leading-relaxed mb-4">
                        {facility.description}
                      </p>

                      {/* Key highlights bullet points */}
                      <ul className="space-y-1.5 mb-5 text-xs text-[#4B5563]">
                        {facility.highlights.map((item, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <Check className="w-3.5 h-3.5 text-[#D4A853] shrink-0 mt-0.5" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Bottom details & action */}
                    <div className="pt-4 border-t border-[#E5E7EB] flex items-center justify-between gap-2">
                      <span className="text-xs text-[#6B7280] flex items-center gap-1 truncate" title={facility.hours}>
                        <Clock className="w-3.5 h-3.5 text-[#D4A853] shrink-0" />
                        <span className="truncate">{facility.hours.split('|')[0]}</span>
                      </span>

                      <button
                        onClick={() => onOpenInquiry(`Facility: ${facility.name}`)}
                        className="text-xs font-semibold text-[#12355B] hover:text-[#0f2c4c] flex items-center gap-1 shrink-0 group/btn transition-colors cursor-pointer"
                        title={`Inquire about ${facility.name}`}
                      >
                        <span>Inquire</span>
                        <ChevronRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* 6. FEATURED FACILITY SECTION (Two-Column Layout) */}
        <section id="featured-facility" className="py-16 sm:py-24 bg-[#F8F7F4] overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
              {/* One Side: Large Facility Image */}
              <div className="lg:col-span-6 relative">
                <div className="relative rounded-[12px] overflow-hidden border border-[#E5E7EB] shadow-md group">
                  <img
                    src="https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?auto=format&fit=crop&w=1200&q=80"
                    alt="Rooftop heated swimming pool at The Grandview"
                    className="w-full h-[380px] sm:h-[460px] object-cover object-center group-hover:scale-102 transition-transform duration-700 ease-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

                  {/* Overlaid Badges */}
                  <div className="absolute top-4 left-4">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#12355B] text-white text-xs font-semibold shadow-sm border border-white/20">
                      <Sparkles className="w-3 h-3 text-[#D4A853]" />
                      Featured Guest Amenity
                    </span>
                  </div>

                  <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md p-4 rounded-[8px] border border-white/50 shadow-sm flex items-center justify-between">
                    <div>
                      <h4 className="font-serif font-bold text-sm text-[#1F2937]">
                        Rooftop Heated Oasis
                      </h4>
                      <p className="text-xs text-[#6B7280]">
                        Maintained at a comfortable 28°C (82°F) year-round
                      </p>
                    </div>
                    <span className="text-xs font-bold text-[#16A34A] bg-[#DCFCE7] border border-[#BBF7D0] px-2.5 py-1 rounded-full">
                      Complimentary Access
                    </span>
                  </div>
                </div>

                {/* Decorative background accent block */}
                <div className="hidden sm:block absolute -bottom-4 -right-4 w-40 h-40 bg-[#D4A853]/15 rounded-[12px] -z-10" />
              </div>

              {/* Other Side: Facility Title, Detailed Description, List of Benefits, Hours, CTA */}
              <div className="lg:col-span-6 flex flex-col justify-center">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#12355B]/10 text-[#12355B] text-xs font-semibold uppercase tracking-wider mb-3 w-fit">
                  <Waves className="w-3.5 h-3.5 text-[#D4A853]" />
                  <span>Featured Hotel Highlight</span>
                </div>

                {/* Section Heading */}
                <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#1F2937] leading-tight mb-4">
                  Relax and Enjoy Your Stay
                </h2>

                <p className="text-base text-[#6B7280] leading-relaxed mb-6">
                  Perched atop our coastal building, our temperature-regulated rooftop swimming pool offers a serene retreat from dawn to evening. Whether taking early morning laps or savoring sunset refreshments on plush daybeds, experience a refined escape designed for complete revitalization.
                </p>

                {/* List of Benefits */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mb-8">
                  <div className="flex items-start gap-2.5 bg-white p-3 rounded-[8px] border border-[#E5E7EB]">
                    <div className="w-6 h-6 rounded-full bg-[#DCFCE7] text-[#15803D] flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-[#1F2937]">Comfortable Seating</h4>
                      <p className="text-xs text-[#6B7280]">Plush daybeds & shaded cabanas</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 bg-white p-3 rounded-[8px] border border-[#E5E7EB]">
                    <div className="w-6 h-6 rounded-full bg-[#DCFCE7] text-[#15803D] flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-[#1F2937]">Relaxing Environment</h4>
                      <p className="text-xs text-[#6B7280]">Serene views & ambient acoustics</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 bg-white p-3 rounded-[8px] border border-[#E5E7EB]">
                    <div className="w-6 h-6 rounded-full bg-[#DCFCE7] text-[#15803D] flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-[#1F2937]">Complimentary Guest Access</h4>
                      <p className="text-xs text-[#6B7280]">Included with every room stay</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 bg-white p-3 rounded-[8px] border border-[#E5E7EB]">
                    <div className="w-6 h-6 rounded-full bg-[#DCFCE7] text-[#15803D] flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-[#1F2937]">Towel & Water Bar</h4>
                      <p className="text-xs text-[#6B7280]">Fresh towels & fruit-infused water</p>
                    </div>
                  </div>
                </div>

                {/* Operating Hours Box */}
                <div className="bg-white p-4 rounded-[8px] border-l-4 border-[#D4A853] border-t border-r border-b border-[#E5E7EB] mb-8 shadow-2xs">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#12355B] mb-1">
                    <Clock className="w-4 h-4 text-[#D4A853]" />
                    <span>Pool Operating Hours</span>
                  </div>
                  <p className="text-xs text-[#4B5563]">
                    <strong>Open Daily:</strong> 06:30 AM – 10:00 PM (Adults-only twilight hours: 08:00 PM – 10:00 PM)
                  </p>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap items-center gap-3">
                  <Button
                    id="featured-book-stay-btn"
                    variant="primary"
                    size="md"
                    onClick={() => onNavigate('booking')}
                    className="shadow-sm"
                  >
                    <CalendarCheck className="w-4 h-4 mr-2" />
                    Book Your Stay
                  </Button>

                  <Button
                    id="featured-inquire-btn"
                    variant="secondary"
                    size="md"
                    onClick={() => onOpenInquiry('Swimming Pool Access')}
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    Send an Inquiry
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 7. SERVICES AND CONVENIENCE SECTION */}
        <section id="guest-services" className="py-16 sm:py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-14">
              <span className="text-xs font-semibold text-[#D4A853] uppercase tracking-wider block mb-2">
                Guest Services
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#1F2937] tracking-tight mb-3">
                Services That Make Your Stay Easier
              </h2>
              <p className="text-base text-[#6B7280] leading-relaxed">
                Dedicated hospitality designed to anticipate your needs and ensure everyday ease throughout your visit.
              </p>
            </div>

            {/* Smaller cards / icon-based items: 24/7 Reception, Daily Housekeeping, Laundry Service, Airport Transfer, Luggage Storage, Room Service */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  id: 'serv-reception',
                  title: '24/7 Reception',
                  description: 'Our attentive front desk team is on hand 24 hours a day to assist with late arrivals, key replacements, wake-up calls, and local concierge advice.',
                  icon: <Clock className="w-5 h-5 text-[#12355B]" />,
                  badge: '24/7 On Site',
                },
                {
                  id: 'serv-housekeeping',
                  title: 'Daily Housekeeping',
                  description: 'Thorough eco-conscious daily room refresh, fresh linen changes, plush towel replenishments, and organic bath product restocking.',
                  icon: <Sparkle className="w-5 h-5 text-[#12355B]" />,
                  badge: 'Complimentary',
                },
                {
                  id: 'serv-laundry',
                  title: 'Laundry Service',
                  description: 'Same-day valet laundering, dry cleaning, and professional garment pressing so you remain crisp for meetings and formal dinners.',
                  icon: <Zap className="w-5 h-5 text-[#12355B]" />,
                  badge: 'Upon Request',
                },
                {
                  id: 'serv-transfer',
                  title: 'Airport Transfer',
                  description: 'Chauffeured private transport between The Grandview and major regional transit terminals with real-time flight synchronization.',
                  icon: <PlaneTakeoff className="w-5 h-5 text-[#12355B]" />,
                  badge: 'Advance Booking',
                },
                {
                  id: 'serv-luggage',
                  title: 'Luggage Storage',
                  description: 'Secure, temperature-controlled baggage storage before check-in or after checkout, allowing you to explore the coast bag-free.',
                  icon: <Luggage className="w-5 h-5 text-[#12355B]" />,
                  badge: 'Complimentary',
                },
                {
                  id: 'serv-roomservice',
                  title: 'Room Service',
                  description: 'Fresh, delicious breakfast dishes, hot entrees, and late-night snacks delivered swiftly to your private room or suite.',
                  icon: <ConciergeBell className="w-5 h-5 text-[#12355B]" />,
                  badge: 'Daily 6:30am–11:30pm',
                },
              ].map((service) => (
                <div
                  key={service.id}
                  className="bg-[#F8F7F4] rounded-[12px] p-6 border border-[#E5E7EB] hover:border-[#12355B]/30 hover:bg-white hover:shadow-xs transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-11 h-11 rounded-[8px] bg-white border border-[#E5E7EB] flex items-center justify-center shadow-2xs">
                        {service.icon}
                      </div>
                      <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-white border border-[#E5E7EB] text-[#12355B]">
                        {service.badge}
                      </span>
                    </div>

                    <h3 className="font-serif font-bold text-lg text-[#1F2937] mb-2">
                      {service.title}
                    </h3>

                    <p className="text-sm text-[#6B7280] leading-relaxed">
                      {service.description}
                    </p>
                  </div>

                  <div className="mt-5 pt-3 border-t border-[#E5E7EB]/60 flex items-center justify-between text-xs text-[#12355B] font-medium">
                    <span>Inquire with Concierge</span>
                    <button
                      onClick={() => onOpenInquiry(`Service: ${service.title}`)}
                      className="hover:underline font-semibold cursor-pointer"
                    >
                      Request Details →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 8. FACILITY AVAILABILITY INFORMATION */}
        <section id="facility-information" className="py-16 sm:py-20 bg-[#F8F7F4] border-t border-[#E5E7EB]">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <span className="text-xs font-semibold text-[#D4A853] uppercase tracking-wider block mb-2">
                Operating Schedules & Rules
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#1F2937] tracking-tight mb-3">
                Facility Information
              </h2>
              <p className="text-sm sm:text-base text-[#6B7280]">
                Important hours, guidelines, and access requirements for our hotel amenities.
              </p>
            </div>

            {/* Clean Information Card List */}
            <div className="bg-white rounded-[12px] border border-[#E5E7EB] shadow-xs overflow-hidden divide-y divide-[#E5E7EB]">
              {[
                {
                  facility: 'Swimming Pool',
                  details: 'Available daily during operating hours (06:30 AM – 10:00 PM). Keycard access required. Towel bar provided on the pool deck.',
                  status: 'Available' as FacilityStatus,
                  icon: <Waves className="w-4 h-4 text-[#D4A853]" />,
                },
                {
                  facility: 'Restaurant & Dining',
                  details: 'Breakfast buffet: 07:00 – 10:30 AM. Lunch: 12:00 – 03:00 PM. Dinner: 06:30 – 10:30 PM. Walk-ins welcome; dinner reservations recommended.',
                  status: 'Available' as FacilityStatus,
                  icon: <Utensils className="w-4 h-4 text-[#D4A853]" />,
                },
                {
                  facility: 'Conference Room',
                  details: 'Reservation required with a minimum of 48 hours notice. Audio-visual setup, custom layout, and catering menus coordinated on request.',
                  status: 'Reservation Required' as FacilityStatus,
                  icon: <Users className="w-4 h-4 text-[#D4A853]" />,
                },
                {
                  facility: 'Airport Transfer',
                  details: 'Chauffeured private pickup or drop-off. Advance booking recommended at least 24 hours prior to travel with flight number.',
                  status: 'Additional Charge' as FacilityStatus,
                  icon: <PlaneTakeoff className="w-4 h-4 text-[#D4A853]" />,
                },
                {
                  facility: 'Covered Parking',
                  details: 'Subject to space availability. Complimentary for direct booking hotel guests. EV charging stations available on Sub-level 1.',
                  status: 'Complimentary' as FacilityStatus,
                  icon: <Car className="w-4 h-4 text-[#D4A853]" />,
                },
                {
                  facility: 'Fitness & Gym Studio',
                  details: 'Open 24 hours daily with active room keycard. Cardiovascular equipment, free weights, stretching mats, and chilled towel station.',
                  status: 'Available' as FacilityStatus,
                  icon: <Dumbbell className="w-4 h-4 text-[#D4A853]" />,
                },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#F8F7F4]/60 transition-colors"
                >
                  <div className="flex items-start gap-3.5">
                    <div className="w-9 h-9 rounded-full bg-[#12355B]/5 border border-[#12355B]/10 flex items-center justify-center shrink-0 mt-0.5">
                      {item.icon}
                    </div>
                    <div>
                      <h4 className="font-serif font-bold text-base sm:text-lg text-[#1F2937]">
                        {item.facility}
                      </h4>
                      <p className="text-xs sm:text-sm text-[#6B7280] leading-relaxed mt-0.5">
                        {item.details}
                      </p>
                    </div>
                  </div>

                  <div className="sm:shrink-0 self-start sm:self-center pl-12 sm:pl-0">
                    <FacilityStatusBadge status={item.status} />
                  </div>
                </div>
              ))}
            </div>

            {/* Friendly Assistance Reassurance Box */}
            <div className="mt-8 p-4 rounded-[8px] bg-white border border-[#E5E7EB] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs sm:text-sm">
              <div className="flex items-center gap-2.5 text-[#4B5563]">
                <Info className="w-4 h-4 text-[#12355B] shrink-0" />
                <span>Need tailored event staging, special dietary coordination, or late-night transport?</span>
              </div>
              <button
                onClick={() => onOpenInquiry('Custom Facility Request')}
                className="font-bold text-[#12355B] hover:underline shrink-0 cursor-pointer"
              >
                Contact Concierge Team →
              </button>
            </div>
          </div>
        </section>

        {/* 9. IMAGE GALLERY (Experience More During Your Stay) */}
        <section id="facilities-gallery" className="py-16 sm:py-24 bg-white border-t border-[#E5E7EB]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-10">
              <span className="text-xs font-semibold text-[#D4A853] uppercase tracking-wider block mb-2">
                Photo Tour
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#1F2937] tracking-tight mb-3">
                Experience More During Your Stay
              </h2>
              <p className="text-base text-[#6B7280]">
                Explore images of our restaurant, swimming pool, lobby, conference rooms, parking, and relaxation spaces.
              </p>

              {/* Gallery Filter Tabs */}
              <div className="flex flex-wrap items-center justify-center gap-2 mt-6">
                {[
                  { id: 'all', label: 'All Spaces' },
                  { id: 'dining', label: 'Restaurant' },
                  { id: 'wellness', label: 'Swimming Pool' },
                  { id: 'business', label: 'Conference' },
                  { id: 'spaces', label: 'Lobby & Courtyard' },
                ].map((filter) => (
                  <button
                    key={filter.id}
                    onClick={() => setActiveGalleryFilter(filter.id)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                      activeGalleryFilter === filter.id
                        ? 'bg-[#12355B] text-white shadow-xs'
                        : 'bg-[#F8F7F4] text-[#6B7280] hover:text-[#12355B] hover:bg-gray-200/80 border border-[#E5E7EB]'
                    }`}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Gallery Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredGallery.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setActiveLightboxImage(item)}
                  className="group relative rounded-[12px] overflow-hidden border border-[#E5E7EB] bg-gray-100 cursor-pointer shadow-2xs hover:shadow-md transition-all duration-300 aspect-[4/3]"
                >
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
                    loading="lazy"
                  />
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />

                  {/* Caption & Category */}
                  <div className="absolute inset-0 p-5 flex flex-col justify-between text-white">
                    <div className="flex justify-between items-start">
                      <span className="text-2xs font-semibold px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/20 uppercase tracking-wider">
                        {item.category}
                      </span>
                      <div className="w-8 h-8 rounded-full bg-black/40 backdrop-blur-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Maximize2 className="w-3.5 h-3.5 text-white" />
                      </div>
                    </div>

                    <div>
                      <h4 className="font-serif font-bold text-lg text-white mb-1 leading-snug">
                        {item.title}
                      </h4>
                      <p className="text-xs text-white/80 line-clamp-2 leading-relaxed">
                        {item.caption}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 10. BOOKING AND INQUIRY CTA */}
        <section id="facilities-cta" className="py-16 sm:py-20 bg-[#12355B] text-white relative overflow-hidden">
          {/* Subtle decorative glow */}
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#D4A853]/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[#D4A853] text-xs font-semibold uppercase tracking-wider mb-4">
              <Sparkles className="w-3.5 h-3.5 text-[#D4A853]" />
              <span>Direct Booking Benefits</span>
            </div>

            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-4">
              Ready to Experience Our Hospitality?
            </h2>

            <p className="text-base sm:text-lg text-white/90 leading-relaxed max-w-2xl mx-auto mb-8">
              Explore our rooms and book your stay directly, or contact our team if you have any questions.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4">
              <Button
                id="cta-book-stay-btn"
                variant="primary"
                size="lg"
                onClick={() => onNavigate('booking')}
                className="bg-[#D4A853] hover:bg-[#c29642] text-[#12355B] font-bold border-none shadow-md px-8"
              >
                <CalendarCheck className="w-4 h-4 mr-2" />
                Book Your Stay
              </Button>

              <Button
                id="cta-send-inquiry-btn"
                variant="secondary"
                size="lg"
                onClick={() => onOpenInquiry('General Facilities Inquiry')}
                className="bg-transparent hover:bg-white/10 text-white border-white/30 px-8"
              >
                <Mail className="w-4 h-4 mr-2" />
                Send an Inquiry
              </Button>
            </div>

            {/* Direct perks badge list */}
            <div className="flex flex-wrap items-center justify-center gap-6 mt-10 pt-8 border-t border-white/15 text-xs text-white/80">
              <span className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-[#D4A853]" />
                Best Rate Guarantee
              </span>
              <span className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-[#D4A853]" />
                Complimentary High-Speed Wi-Fi
              </span>
              <span className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-[#D4A853]" />
                Free Covered Parking for Direct Bookings
              </span>
            </div>
          </div>
        </section>
      </main>

      {/* 11. FOOTER */}
      <Footer
        onOpenBooking={() => onNavigate('booking')}
        onOpenInquiry={() => onOpenInquiry()}
        onOpenDesignSystem={onOpenDesignSystem}
        onNavigate={onNavigate}
      />

      {/* Interactive Lightbox Modal */}
      {activeLightboxImage && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setActiveLightboxImage(null)}
        >
          <div
            className="relative max-w-5xl w-full bg-[#12355B] rounded-[12px] overflow-hidden border border-white/20 shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/15 text-white">
              <div>
                <span className="text-2xs font-semibold uppercase text-[#D4A853] tracking-wider block">
                  {activeLightboxImage.category}
                </span>
                <h3 className="font-serif font-bold text-lg text-white">
                  {activeLightboxImage.title}
                </h3>
              </div>
              <button
                onClick={() => setActiveLightboxImage(null)}
                className="p-1.5 rounded-full hover:bg-white/10 text-white/80 hover:text-white transition-colors cursor-pointer"
                aria-label="Close image preview"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Image Stage */}
            <div className="relative bg-black flex items-center justify-center max-h-[70vh]">
              <img
                src={activeLightboxImage.imageUrl}
                alt={activeLightboxImage.title}
                className="max-h-[70vh] w-auto object-contain mx-auto"
              />

              {/* Prev / Next controls */}
              <button
                onClick={handlePrevLightbox}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center border border-white/20 transition-all cursor-pointer"
                aria-label="Previous photo"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <button
                onClick={handleNextLightbox}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center border border-white/20 transition-all cursor-pointer"
                aria-label="Next photo"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Footer with caption and actions */}
            <div className="p-4 sm:p-5 bg-[#0f2c4c] text-white flex flex-col sm:flex-row items-center justify-between gap-3 text-xs sm:text-sm">
              <p className="text-white/80 leading-relaxed text-center sm:text-left">
                {activeLightboxImage.caption}
              </p>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setActiveLightboxImage(null);
                  onNavigate('booking');
                }}
                className="bg-white text-[#12355B] hover:bg-gray-100 border-none shrink-0"
              >
                Book Your Stay
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Booking Modal */}
      {selectedRoomForBooking && (
        <BookingModal
          selectedRoom={selectedRoomForBooking}
          allRooms={ROOMS_DATA}
          searchState={{ checkIn: '', checkOut: '', guests: 2, rooms: 1 }}
          isOpen={!!selectedRoomForBooking}
          onClose={() => setSelectedRoomForBooking(null)}
          onConfirmReservation={(reservation) => {
            if (onConfirmReservation) {
              onConfirmReservation(reservation);
            }
            setSelectedRoomForBooking(null);
          }}
        />
      )}
    </div>
  );
};

export default function FacilitiesRoute() {
  const router = useRouter();

  return (
    <FacilitiesPage
      onNavigate={(page) => router.push(page === 'home' ? '/' : `/${page}`)}
      onOpenInquiry={() => router.push('/inquiry')}
    />
  );
}
