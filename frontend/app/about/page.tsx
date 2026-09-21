"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header, NavPage } from '../../components/layout/Header';
import { Footer } from '../../components/layout/Footer';
import { Button } from '../../components/ui/Button';
import { HOTEL_INFO, ROOMS_DATA } from '../../data/hotelData';
import { BookingModal } from '../../components/booking/BookingModal';
import { BookingSearchState, Reservation, Room } from '../../types/types';
import {
  Sparkles,
  Bed,
  HeartHandshake,
  Award,
  ShieldCheck,
  MapPin,
  Wifi,
  Smile,
  CalendarCheck,
  CircleDollarSign,
  ChevronRight,
  Phone,
  Mail,
  Clock,
  Compass,
  Car,
  ExternalLink,
  Check,
  ArrowRight,
  X,
  Maximize2
} from 'lucide-react';

interface AboutPageProps {
  onNavigate: (page: NavPage) => void;
  onOpenInquiry: (roomName?: string) => void;
  onOpenDesignSystem?: () => void;
  onConfirmReservation?: (reservation: Reservation) => void;
}

interface GalleryItem {
  id: string;
  title: string;
  category: string;
  imageUrl: string;
  caption: string;
}

export const AboutPage: React.FC<AboutPageProps> = ({
  onNavigate,
  onOpenInquiry,
  onOpenDesignSystem,
  onConfirmReservation,
}) => {
  // Modal state for direct booking
  const [selectedRoomForBooking, setSelectedRoomForBooking] = useState<Room | null>(null);
  
  // Gallery lightbox preview modal
  const [activeLightboxImage, setActiveLightboxImage] = useState<GalleryItem | null>(null);

  // Copy address state for directions
  const [copiedAddress, setCopiedAddress] = useState(false);

  // Booking search defaults used by the direct booking modal
  const [searchState] = useState<BookingSearchState>({
    checkIn: '',
    checkOut: '',
    guests: 2,
    rooms: 1,
  });

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(HOTEL_INFO.address);
    setCopiedAddress(true);
    setTimeout(() => setCopiedAddress(false), 2500);
  };

  // Values data
  const hotelValues = [
    {
      id: 'val-comfort',
      title: 'Comfort',
      subtitle: 'Spaces to Rest',
      description: 'Creating spaces where every guest can relax and feel at home.',
      icon: Bed,
    },
    {
      id: 'val-hospitality',
      title: 'Hospitality',
      subtitle: 'Warm Care',
      description: 'Providing warm, attentive, and professional service.',
      icon: HeartHandshake,
    },
    {
      id: 'val-quality',
      title: 'Quality',
      subtitle: 'Excellence in Detail',
      description: 'Maintaining high standards in every part of the guest experience.',
      icon: Award,
    },
    {
      id: 'val-trust',
      title: 'Trust',
      subtitle: 'Integrity First',
      description: 'Providing transparent, reliable, and secure service.',
      icon: ShieldCheck,
    },
  ];

  // Why Stay With Us advantages
  const stayAdvantages = [
    {
      id: 'adv-rooms',
      title: 'Comfortable & Well-Designed Rooms',
      description: 'Serene interiors with plush pillow-top bedding, sound-insulated windows, and ergonomic workspaces tailored for restful sleep.',
      icon: Bed,
    },
    {
      id: 'adv-location',
      title: 'Convenient Location',
      description: 'Ideally situated in the coastal district, just footsteps away from waterfront promenades, fine dining, and cultural attractions.',
      icon: MapPin,
    },
    {
      id: 'adv-wifi',
      title: 'High-Speed Free Wi-Fi',
      description: 'Ultra-fast gigabit fiber connectivity throughout all guest rooms, suites, and garden lounges for seamless work or entertainment.',
      icon: Wifi,
    },
    {
      id: 'adv-service',
      title: 'Friendly & Professional Service',
      description: 'Our attentive team is on hand 24 hours a day to assist with custom itineraries, luggage handling, and room dining.',
      icon: Smile,
    },
    {
      id: 'adv-direct',
      title: 'Secure Direct Booking',
      description: 'Book directly through our certified reservation system with zero hidden agent fees, instant confirmation, and flexible modifications.',
      icon: CalendarCheck,
    },
    {
      id: 'adv-value',
      title: 'Excellent Value For Your Stay',
      description: 'Transparent pricing in ETB and USD, inclusive of fresh morning breakfast packages and complimentary welcome refreshments.',
      icon: CircleDollarSign,
    },
  ];

  // Gallery items representing different facets of the hotel
  const galleryItems: GalleryItem[] = [
    {
      id: 'gal-1',
      title: 'Grand Exterior & Entrance',
      category: 'Exterior',
      imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
      caption: 'Our welcoming architecture combining classical warmth with clean coastal lines.',
    },
    {
      id: 'gal-2',
      title: 'The Grandview Lobby & Reception',
      category: 'Lobby',
      imageUrl: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80',
      caption: 'A bright, peaceful welcome area designed for seamless check-in and unhurried arrivals.',
    },
    {
      id: 'gal-3',
      title: 'Deluxe Oceanfront Suite',
      category: 'Rooms & Suites',
      imageUrl: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80',
      caption: 'Spacious guest chambers with plush furnishings, bespoke linens, and natural light.',
    },
    {
      id: 'gal-4',
      title: 'The Terrace Bistro & Dining',
      category: 'Restaurant',
      imageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80',
      caption: 'Artisanal farm-to-table breakfast and evening dinners crafted by our culinary team.',
    },
    {
      id: 'gal-5',
      title: 'Rooftop Heated Pool & Sun Deck',
      category: 'Facilities',
      imageUrl: 'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?auto=format&fit=crop&w=800&q=80',
      caption: 'Relax above the city skyline with temperature-controlled swimming and panoramic sunset views.',
    },
    {
      id: 'gal-6',
      title: 'Serene Guest Lounge & Library',
      category: 'Guest Experience',
      imageUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80',
      caption: 'A quiet haven for reading, quiet conversation, or sipping freshly roasted coffee.',
    },
  ];

  // Local attractions
  const localAttractions = [
    {
      name: 'Waterfront Promenade & Marina',
      distance: '3 min walk (300m)',
      category: 'Recreation',
      description: 'Scenic shoreline walking trail with coastal cafes, boat tours, and sunset views.',
    },
    {
      name: 'City Arts & Heritage Museum',
      distance: '8 min drive (2.4 km)',
      category: 'Culture',
      description: 'Curated historic galleries, local artisan exhibits, and cultural performances.',
    },
    {
      name: 'Downtown Financial & Shopping District',
      distance: '10 min drive (3.2 km)',
      category: 'Business & Retail',
      description: 'Corporate headquarters, boutique shopping, and vibrant commercial centers.',
    },
    {
      name: 'International Airport Hub',
      distance: '25 min drive (18 km)',
      category: 'Transit',
      description: 'Direct highway access with chauffeured hotel shuttle arrangements available.',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F7F4] text-[#1F2937]">
      {/* 1. Header (Highlighting 'About') */}
      <Header
        currentPage="about"
        onNavigate={onNavigate}
        onBookNowClick={() => setSelectedRoomForBooking(ROOMS_DATA[0])}
        onOpenInquiryClick={() => onOpenInquiry()}
        onOpenDesignSystemClick={onOpenDesignSystem}
      />

      <main className="flex-grow">
        {/* 2. ABOUT HERO SECTION */}
        <section
          id="about-hero-section"
          className="relative bg-[#12355B] text-white py-16 sm:py-24 lg:py-28 overflow-hidden"
        >
          {/* Background image with gentle dark/warm overlay */}
          <div className="absolute inset-0 z-0">
            <img
              src="https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1920&q=80"
              alt="The Grandview Hotel Exterior"
              className="w-full h-full object-cover object-center scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#12355B]/95 via-[#12355B]/85 to-[#12355B]/75" />
            <div className="absolute inset-0 bg-[#12355B]/30 backdrop-blur-[1px]" />
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            {/* Breadcrumb Navigation */}
            <nav className="flex items-center gap-2 text-xs text-white/70 mb-6">
              <button
                onClick={() => onNavigate('home')}
                className="hover:text-white transition-colors cursor-pointer"
              >
                Home
              </button>
              <ChevronRight className="w-3.5 h-3.5 text-[#D4A853]" />
              <span className="font-semibold text-[#D4A853]">About the Hotel</span>
            </nav>

            <div className="max-w-3xl">
              {/* Subtle gold accent micro-badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-[#D4A853] text-xs font-semibold uppercase tracking-wider mb-5 shadow-2xs backdrop-blur-sm">
                <Sparkles className="w-3.5 h-3.5 text-[#D4A853]" />
                Heartfelt Hospitality Since 2019
              </div>

              {/* Page Hero Heading */}
              <h1
                id="about-page-title"
                className="text-4xl sm:text-5xl lg:text-[56px] font-serif font-bold text-white leading-[1.12] tracking-tight mb-5"
              >
                Welcome to {HOTEL_INFO.name}
              </h1>

              {/* Supporting Text */}
              <p className="text-lg sm:text-xl text-white/90 leading-relaxed font-normal max-w-2xl">
                Where comfort, hospitality, and memorable experiences come together.
              </p>

              {/* Action shortcuts */}
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Button
                  id="hero-explore-rooms-btn"
                  variant="gold"
                  size="md"
                  onClick={() => onNavigate('rooms')}
                  rightIcon={<ArrowRight className="w-4 h-4 text-[#1F2937]" />}
                  className="shadow-md"
                >
                  Explore Rooms
                </Button>
                <Button
                  id="hero-send-inquiry-btn"
                  variant="secondary"
                  size="md"
                  onClick={() => onOpenInquiry()}
                  className="bg-white/10 hover:bg-white text-white hover:text-[#12355B] border-white/40"
                  leftIcon={<Mail className="w-4 h-4" />}
                >
                  Send an Inquiry
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* 3. OUR STORY SECTION */}
        <section
          id="our-story-section"
          className="py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            {/* Left side: Image collage */}
            <div className="lg:col-span-6 relative">
              <div className="relative z-10">
                <img
                  src="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=900&q=80"
                  alt="The Grandview Hotel Architecture and Atmosphere"
                  className="w-full h-[380px] sm:h-[460px] object-cover rounded-[12px] shadow-md border border-[#E5E7EB]"
                />
              </div>

              {/* Secondary inset photo */}
              <div className="hidden sm:block absolute -bottom-8 -right-6 w-56 h-56 rounded-[12px] overflow-hidden shadow-xl border-4 border-white z-20">
                <img
                  src="https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=500&q=80"
                  alt="Attentive Concierge Hospitality"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Decorative gold heritage badge */}
              <div className="absolute -top-5 -left-4 sm:-left-6 bg-[#12355B] text-white p-4 rounded-[10px] shadow-lg border border-[#D4A853]/40 z-20">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-[#D4A853]/20 flex items-center justify-center text-[#D4A853]">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[11px] uppercase tracking-wider text-[#D4A853] font-bold block">
                      Authentic Stay
                    </span>
                    <span className="text-sm font-serif font-bold text-white">
                      5+ Years of Care
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right side: Story Content */}
            <div className="lg:col-span-6 space-y-6">
              <div className="inline-flex items-center gap-2 text-xs font-bold text-[#D4A853] uppercase tracking-widest">
                <span className="w-6 h-[2px] bg-[#D4A853]" />
                Our Story
              </div>

              <h2 className="text-3xl sm:text-4xl lg:text-[40px] font-serif font-bold text-[#12355B] tracking-tight leading-[1.2]">
                Crafting Meaningful Hospitality for Every Traveler
              </h2>

              <p className="text-base sm:text-lg text-[#1F2937] leading-relaxed font-medium">
                {HOTEL_INFO.name} was created with a simple goal: to provide every guest with a comfortable, welcoming, and memorable stay.
              </p>

              <div className="space-y-4 text-sm sm:text-base text-[#4B5563] leading-relaxed">
                <p>
                  Established in 2019 in the heart of the coastal district, our hotel began with the belief that true hospitality is not about cold grandeur, but about thoughtful care, quiet elegance, and authentic human warmth.
                </p>
                <p>
                  Whether you are arriving for business, embarking on a family holiday, or pausing during your travels, we ensure each detail—from our hand-pressed linens and locally sourced breakfast to our seamless direct booking system—is designed to make you feel instantly at ease.
                </p>
                <p>
                  We take pride in fostering genuine connections with our guests. By booking directly with us, you enjoy transparent communication, our guaranteed best pricing, and dedicated attention tailored to your itinerary.
                </p>
              </div>

              {/* Hotel History & Highlights element */}
              <div className="pt-4 border-t border-[#E5E7EB]">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3.5 bg-white rounded-[8px] border border-[#E5E7EB] shadow-2xs">
                    <span className="block text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                      Established
                    </span>
                    <span className="text-base font-serif font-bold text-[#12355B]">
                      October 2019
                    </span>
                  </div>
                  <div className="p-3.5 bg-white rounded-[8px] border border-[#E5E7EB] shadow-2xs">
                    <span className="block text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                      Philosophy
                    </span>
                    <span className="text-base font-serif font-bold text-[#12355B]">
                      Genuine Care & Rest
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 4. OUR MISSION AND VALUES */}
        <section
          id="mission-and-values-section"
          className="py-16 sm:py-20 bg-white border-y border-[#E5E7EB]"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#D4A853] uppercase tracking-widest mb-2.5">
                <span>Our Core Principles</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#12355B] tracking-tight mb-4">
                Hospitality at the Heart of Everything We Do
              </h2>
              <p className="text-base text-[#6B7280] leading-relaxed">
                Four foundational values guide every interaction, from the moment you make an inquiry to your check-out.
              </p>
            </div>

            {/* 4 Elegant Value Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {hotelValues.map((val) => {
                const IconComponent = val.icon;
                return (
                  <div
                    key={val.id}
                    className="bg-[#F8F7F4]/60 hover:bg-white rounded-[12px] p-6 sm:p-7 border border-[#E5E7EB] shadow-2xs hover:shadow-md transition-all duration-200 group flex flex-col justify-between"
                  >
                    <div>
                      {/* Minimal icon with warm gold accent */}
                      <div className="w-12 h-12 rounded-[8px] bg-white group-hover:bg-[#12355B] border border-[#E5E7EB] group-hover:border-[#12355B] flex items-center justify-center text-[#12355B] group-hover:text-[#D4A853] transition-colors shadow-2xs mb-5">
                        <IconComponent className="w-6 h-6" />
                      </div>

                      <span className="text-[11px] uppercase tracking-wider text-[#D4A853] font-bold block mb-1">
                        {val.subtitle}
                      </span>
                      <h3 className="text-xl font-serif font-bold text-[#12355B] mb-2.5">
                        {val.title}
                      </h3>
                      <p className="text-sm text-[#4B5563] leading-relaxed">
                        {val.description}
                      </p>
                    </div>

                    <div className="pt-5 mt-5 border-t border-[#E5E7EB]/60 flex items-center gap-1.5 text-xs font-semibold text-[#12355B]">
                      <Check className="w-3.5 h-3.5 text-[#16A34A]" />
                      <span>Guest Commitment</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* 5. WHY STAY WITH US */}
        <section
          id="why-stay-with-us-section"
          className="py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
        >
          <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#D4A853] uppercase tracking-widest mb-2.5">
              <span>The Grandview Advantage</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#12355B] tracking-tight mb-4">
              Why Stay With Us?
            </h2>
            <p className="text-base text-[#6B7280] leading-relaxed">
              Experience the distinctive benefits of booking your stay directly with our hotel.
            </p>
          </div>

          {/* 3-column / 2-column grid on desktop, single on mobile */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {stayAdvantages.map((adv) => {
              const IconComponent = adv.icon;
              return (
                <div
                  key={adv.id}
                  className="bg-white rounded-[12px] p-6 sm:p-7 border border-[#E5E7EB] shadow-2xs hover:border-[#12355B]/40 hover:shadow-sm transition-all duration-200"
                >
                  <div className="w-10 h-10 rounded-[8px] bg-[#12355B]/10 text-[#12355B] flex items-center justify-center mb-4">
                    <IconComponent className="w-5 h-5 text-[#12355B]" />
                  </div>
                  <h3 className="text-lg font-serif font-bold text-[#12355B] mb-2">
                    {adv.title}
                  </h3>
                  <p className="text-sm text-[#4B5563] leading-relaxed">
                    {adv.description}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Reassurance strip */}
          <div className="mt-12 p-5 sm:p-6 bg-white rounded-[12px] border border-[#E5E7EB] shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-50 text-[#16A34A] flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-[#1F2937]">Best Direct Rate Guarantee</h4>
                <p className="text-xs text-[#6B7280]">No third-party markups. Special corporate and extended stay concessions available upon direct inquiry.</p>
              </div>
            </div>
            <Button
              id="reassurance-explore-btn"
              variant="primary"
              size="sm"
              onClick={() => onNavigate('rooms')}
              className="shrink-0"
            >
              Browse Rooms Catalog
            </Button>
          </div>
        </section>

        {/* 6. HOTEL EXPERIENCE / IMAGE GALLERY */}
        <section
          id="hotel-experience-gallery-section"
          className="py-16 sm:py-20 bg-white border-t border-[#E5E7EB]"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
              <div>
                <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#D4A853] uppercase tracking-widest mb-2">
                  <span>Photo Showcase</span>
                </div>
                <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#12355B] tracking-tight">
                  Experience Our Hotel
                </h2>
                <p className="text-sm sm:text-base text-[#6B7280] mt-1 max-w-xl">
                  Take a visual tour through our architectural spaces, restful accommodations, and dining amenities.
                </p>
              </div>

              <div className="text-xs text-[#6B7280] bg-[#F8F7F4] px-3.5 py-1.5 rounded-full border border-[#E5E7EB] self-start sm:self-auto">
                Click any image to view details
              </div>
            </div>

            {/* Gallery Grid: Modern layout with varying image proportions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {galleryItems.map((item, idx) => (
                <div
                  key={item.id}
                  onClick={() => setActiveLightboxImage(item)}
                  className={`group relative rounded-[12px] overflow-hidden border border-[#E5E7EB] shadow-2xs cursor-pointer bg-gray-100 ${
                    idx === 0 ? 'sm:col-span-2 lg:col-span-2 sm:h-[360px]' : 'h-[270px] sm:h-[360px]'
                  }`}
                >
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                    loading="lazy"
                  />
                  {/* Subtle dark gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#12355B]/85 via-[#12355B]/30 to-transparent opacity-85 group-hover:opacity-95 transition-opacity" />

                  {/* Caption & Category tag */}
                  <div className="absolute bottom-0 inset-x-0 p-5 text-white flex items-end justify-between">
                    <div>
                      <span className="inline-block px-2.5 py-0.5 rounded-full bg-[#D4A853] text-[#12355B] text-[10px] font-bold uppercase tracking-wider mb-2">
                        {item.category}
                      </span>
                      <h4 className="text-lg font-serif font-bold text-white drop-shadow-sm">
                        {item.title}
                      </h4>
                      <p className="text-xs text-white/80 line-clamp-1 mt-1">
                        {item.caption}
                      </p>
                    </div>

                    <div className="w-8 h-8 rounded-full bg-white/20 hover:bg-white text-white hover:text-[#12355B] flex items-center justify-center shrink-0 backdrop-blur-sm transition-colors">
                      <Maximize2 className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 7. HOTEL STATISTICS SECTION */}
        <section
          id="hotel-statistics-section"
          className="bg-[#12355B] text-white py-14 sm:py-16 border-y border-[#12355B]"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10 text-center">
              {/* Stat 1 */}
              <div className="p-4">
                <span className="font-serif font-bold text-4xl sm:text-5xl lg:text-[54px] text-[#D4A853] block leading-none mb-2">
                  50+
                </span>
                <span className="text-base sm:text-lg font-medium text-white block">
                  Comfortable Rooms
                </span>
                <span className="text-xs text-white/60 block mt-1">
                  From Standard to Executive Suites
                </span>
              </div>

              {/* Stat 2 */}
              <div className="p-4">
                <span className="font-serif font-bold text-4xl sm:text-5xl lg:text-[54px] text-[#D4A853] block leading-none mb-2">
                  1,000+
                </span>
                <span className="text-base sm:text-lg font-medium text-white block">
                  Happy Guests
                </span>
                <span className="text-xs text-white/60 block mt-1">
                  Trusted by travelers worldwide
                </span>
              </div>

              {/* Stat 3 */}
              <div className="p-4">
                <span className="font-serif font-bold text-4xl sm:text-5xl lg:text-[54px] text-[#D4A853] block leading-none mb-2">
                  24/7
                </span>
                <span className="text-base sm:text-lg font-medium text-white block">
                  Guest Support
                </span>
                <span className="text-xs text-white/60 block mt-1">
                  Always available concierge team
                </span>
              </div>

              {/* Stat 4 */}
              <div className="p-4">
                <span className="font-serif font-bold text-4xl sm:text-5xl lg:text-[54px] text-[#D4A853] block leading-none mb-2">
                  5+
                </span>
                <span className="text-base sm:text-lg font-medium text-white block">
                  Years of Hospitality
                </span>
                <span className="text-xs text-white/60 block mt-1">
                  Dedicated service since 2019
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* 8. LOCATION / LOCAL EXPERIENCE SECTION */}
        <section
          id="location-local-experience-section"
          className="py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            {/* Left Column: Location description & Attractions list */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#D4A853] uppercase tracking-widest">
                <Compass className="w-3.5 h-3.5 text-[#D4A853]" />
                Prime Neighborhood
              </div>

              <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#12355B] tracking-tight">
                Discover the Best of the City
              </h2>

              <p className="text-base sm:text-lg text-[#4B5563] leading-relaxed">
                Situated in the Coastal District, {HOTEL_INFO.name} places you within moments of scenic ocean views, vibrant dining lanes, and premier cultural destinations.
              </p>

              {/* Attractions Cards */}
              <div className="space-y-3.5 pt-2">
                {localAttractions.map((attraction, idx) => (
                  <div
                    key={idx}
                    className="p-4 bg-white rounded-[10px] border border-[#E5E7EB] shadow-2xs hover:border-[#12355B]/40 transition-colors flex items-start justify-between gap-4"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-[6px] bg-[#12355B]/10 text-[#12355B] flex items-center justify-center shrink-0 mt-0.5">
                        <MapPin className="w-4 h-4 text-[#12355B]" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-[#1F2937]">
                          {attraction.name}
                        </h4>
                        <p className="text-xs text-[#6B7280] mt-0.5">
                          {attraction.description}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-semibold text-[#12355B] bg-[#F8F7F4] px-2.5 py-1 rounded-[6px] shrink-0 border border-[#E5E7EB]">
                      {attraction.distance}
                    </span>
                  </div>
                ))}
              </div>

              {/* Action Buttons: Get Directions & Contact Us */}
              <div className="pt-4 flex flex-wrap items-center gap-3.5">
                <Button
                  id="location-get-directions-btn"
                  variant="secondary"
                  size="md"
                  onClick={handleCopyAddress}
                  leftIcon={copiedAddress ? <Check className="w-4 h-4 text-[#16A34A]" /> : <MapPin className="w-4 h-4 text-[#12355B]" />}
                >
                  {copiedAddress ? 'Address Copied!' : 'Get Directions & Address'}
                </Button>
                <Button
                  id="location-contact-us-btn"
                  variant="primary"
                  size="md"
                  onClick={() => onOpenInquiry()}
                  leftIcon={<Phone className="w-4 h-4" />}
                >
                  Contact Concierge
                </Button>
              </div>
            </div>

            {/* Right Column: Visual Map / Location Card */}
            <div className="lg:col-span-5">
              <div className="bg-white rounded-[14px] border border-[#E5E7EB] shadow-sm p-6 space-y-5">
                {/* Styled Map Illustration / Satellite View card */}
                <div className="relative h-64 rounded-[10px] overflow-hidden border border-[#E5E7EB] bg-[#E5E7EB]">
                  <img
                    src="https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&w=800&q=80"
                    alt="City Map Representation"
                    className="w-full h-full object-cover"
                  />
                  {/* Pin overlay */}
                  <div className="absolute inset-0 bg-[#12355B]/20 flex items-center justify-center">
                    <div className="bg-[#12355B] text-white px-4 py-2.5 rounded-[10px] shadow-xl border-2 border-[#D4A853] flex items-center gap-2 animate-bounce">
                      <MapPin className="w-4 h-4 text-[#D4A853]" />
                      <span className="font-serif font-bold text-xs">{HOTEL_INFO.name}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-start gap-2.5 text-xs text-[#4B5563]">
                    <MapPin className="w-4 h-4 text-[#12355B] shrink-0 mt-0.5" />
                    <span>{HOTEL_INFO.address}</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-xs text-[#4B5563]">
                    <Phone className="w-4 h-4 text-[#12355B] shrink-0" />
                    <span>{HOTEL_INFO.phone}</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-xs text-[#4B5563]">
                    <Mail className="w-4 h-4 text-[#12355B] shrink-0" />
                    <span>{HOTEL_INFO.email}</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-xs text-[#4B5563]">
                    <Clock className="w-4 h-4 text-[#12355B] shrink-0" />
                    <span>{HOTEL_INFO.conciergeHours}</span>
                  </div>
                </div>

                {/* Transportation perks */}
                <div className="pt-4 border-t border-[#E5E7EB] grid grid-cols-2 gap-2 text-[11px] text-[#6B7280]">
                  <div className="flex items-center gap-1.5">
                    <Car className="w-3.5 h-3.5 text-[#12355B]" />
                    <span>Complimentary Valet</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#D4A853]" />
                    <span>EV Fast Charging</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 9. CALL TO ACTION SECTION */}
        <section
          id="about-cta-section"
          className="bg-[#12355B] text-white py-16 sm:py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden"
        >
          {/* Subtle gold glow visual accent */}
          <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-[#D4A853]/10 blur-3xl pointer-events-none" />
          <div className="absolute -left-20 -bottom-20 w-80 h-80 rounded-full bg-white/5 blur-2xl pointer-events-none" />

          <div className="max-w-4xl mx-auto text-center relative z-10">
            <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-4 text-[#D4A853]">
              <Bed className="w-6 h-6" />
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-[44px] font-serif font-bold text-white mb-4 tracking-tight">
              Your Comfortable Stay Awaits
            </h2>

            <p className="text-base sm:text-lg text-white/80 max-w-xl mx-auto mb-8 leading-relaxed">
              Explore our rooms and book directly for a simple, convenient, and personalized hotel experience.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                id="cta-explore-rooms-primary-btn"
                variant="gold"
                size="lg"
                onClick={() => onNavigate('rooms')}
                className="w-full sm:w-auto font-bold text-[#1F2937] shadow-lg"
                rightIcon={<ArrowRight className="w-4 h-4 text-[#1F2937]" />}
              >
                Explore Rooms
              </Button>
              <Button
                id="cta-send-inquiry-secondary-btn"
                variant="secondary"
                size="lg"
                onClick={() => onOpenInquiry()}
                className="w-full sm:w-auto bg-white/10 hover:bg-white text-white hover:text-[#12355B] border-white/40 shadow-sm"
                leftIcon={<Mail className="w-4 h-4" />}
              >
                Send an Inquiry
              </Button>
            </div>
          </div>
        </section>
      </main>

      {/* 10. Footer */}
      <Footer
        onOpenBooking={() => setSelectedRoomForBooking(ROOMS_DATA[0])}
        onOpenInquiry={() => onOpenInquiry()}
        onOpenDesignSystem={onOpenDesignSystem}
        onNavigate={onNavigate}
      />

      {/* Lightbox Modal for Image Gallery */}
      {activeLightboxImage && (
        <div
          id="gallery-lightbox-modal"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={() => setActiveLightboxImage(null)}
        >
          <div
            className="bg-white rounded-[12px] overflow-hidden max-w-3xl w-full shadow-2xl border border-gray-700 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative h-[320px] sm:h-[450px] bg-black">
              <img
                src={activeLightboxImage.imageUrl}
                alt={activeLightboxImage.title}
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => setActiveLightboxImage(null)}
                className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/60 hover:bg-black text-white flex items-center justify-center transition-colors cursor-pointer"
                aria-label="Close image preview"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 sm:p-6 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-[11px] font-bold text-[#D4A853] uppercase tracking-wider block mb-1">
                  {activeLightboxImage.category}
                </span>
                <h3 className="text-xl font-serif font-bold text-[#12355B]">
                  {activeLightboxImage.title}
                </h3>
                <p className="text-xs sm:text-sm text-[#6B7280] mt-1">
                  {activeLightboxImage.caption}
                </p>
              </div>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  setActiveLightboxImage(null);
                  onNavigate('rooms');
                }}
                className="shrink-0"
              >
                View Rooms
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Direct Booking Modal */}
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

export default function Page() {
  const router = useRouter();

  const handleNavigate = (page: NavPage) => {
    if (page === 'home') router.push('/');
    else if (page === 'rooms') router.push('/rooms');
    else if (page === 'about') router.push('/about');
    // else if (page === 'inquiry') router.push('/inquiry');
    else if (page === 'booking') router.push('/booking');
    else router.push('/');
  };

  const handleOpenInquiry = (roomName?: string) => {
    const params = roomName ? `?room=${encodeURIComponent(roomName)}` : '';
    router.push(`/inquiry${params}`);
  };

  return (
    <AboutPage
      onNavigate={handleNavigate}
      onOpenInquiry={handleOpenInquiry}
      onOpenDesignSystem={() => router.push('/')}
      onConfirmReservation={() => undefined}
    />
  );
}
