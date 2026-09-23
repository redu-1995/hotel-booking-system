'use client';

import React, { useState } from 'react';
import { Header } from '../components/layout/Header';
import { Hero } from '../components/home/Hero';
import { FeaturedRooms } from '../components/home/FeaturedRooms';
import { RoomDetailsModal } from '../components/rooms/RoomDetailsModal';
import { WhyChooseUs } from '../components/home/WhyChooseUs';
import { Facilities } from '../components/facilities/Facilities';
import { InquirySection } from '../components/home/InquirySection';
import { DirectBookingCTA } from '../components/home/DirectBookingCTA';
import { Footer } from '../components/layout/Footer';
import { BookingModal } from '../components/booking/BookingModal';
import { DesignSystemModal } from '../components/home/DesignSystemModalProps';
import { ROOMS_DATA, INITIAL_INQUIRIES } from '../data/hotelData';
import { Room, BookingSearchState, Inquiry, Reservation } from '../types/types';
import { CheckCircle2, Layers, Sparkles } from 'lucide-react';
import { RoomsPage } from './rooms/page';
import { AboutPage } from './about/page';
import { FacilitiesPage } from './facilities/page';
import { BookingInquiryPage } from './booking/page';
import { NavPage } from '../components/layout/Header';
import { homeAmenities, homeFacilities } from '../lib/home-data';

export default function App() {
  // Navigation state: starts on requested Direct Booking & Inquiries Page, easily toggled between Home, Rooms, About, Facilities, and Booking
  const [currentPage, setCurrentPage] = useState<NavPage>('booking');

  // Default dates: tomorrow to +3 days
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
  const threeDaysLater = new Date(Date.now() + 86400000 * 4).toISOString().split('T')[0];

  const [searchState, setSearchState] = useState<BookingSearchState>({
    checkIn: tomorrow,
    checkOut: threeDaysLater,
    guests: 2,
    rooms: 1,
  });

  const [isSearching, setIsSearching] = useState(false);
  const [searchResultBanner, setSearchResultBanner] = useState<string | null>(null);

  // Modals state
  const [selectedRoomForDetails, setSelectedRoomForDetails] = useState<Room | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedRoomForBooking, setSelectedRoomForBooking] = useState<Room>(ROOMS_DATA[1]);
  const [isDesignSystemModalOpen, setIsDesignSystemModalOpen] = useState(false);

  // Inquiries and Reservations live state
  const [inquiries, setInquiries] = useState<Inquiry[]>(INITIAL_INQUIRIES);
  const [reservations, setReservations] = useState<Reservation[]>([]);

  // Handlers
  const handleSearchChange = (changes: Partial<BookingSearchState>) => {
    setSearchState((prev) => ({ ...prev, ...changes }));
  };

  const handleSearchSubmit = () => {
    setIsSearching(true);
    setSearchResultBanner(null);

    setTimeout(() => {
      setIsSearching(false);
      setSearchResultBanner(
        `Showing 3 room types available for ${searchState.guests} guest${
          searchState.guests > 1 ? 's' : ''
        } from ${searchState.checkIn} to ${searchState.checkOut}. Best direct rate applied!`
      );

      // Scroll smoothly to the rooms section
      const roomsEl = document.getElementById('featured-rooms');
      if (roomsEl) {
        const offset = 80;
        const bodyRect = document.body.getBoundingClientRect().top;
        const elementRect = roomsEl.getBoundingClientRect().top;
        const elementPosition = elementRect - bodyRect;
        window.scrollTo({
          top: elementPosition - offset,
          behavior: 'smooth',
        });
      }
    }, 450);
  };

  const handleOpenRoomDetails = (room: Room) => {
    setSelectedRoomForDetails(room);
  };

  const handleOpenBookingModal = () => {
    setCurrentPage('booking');
  };

  const handleAddInquiry = (newInquiryData: Omit<Inquiry, 'id' | 'referenceNumber' | 'createdAt'>) => {
    const newInquiry: Inquiry = {
      ...newInquiryData,
      id: `inq-${Date.now()}`,
      referenceNumber: `GV-INQ-${Math.floor(1000 + Math.random() * 9000)}`,
      createdAt: new Date().toISOString(),
    };
    setInquiries((prev) => [newInquiry, ...prev]);
  };

  const handleConfirmReservation = (newReservation: Reservation) => {
    setReservations((prev) => [newReservation, ...prev]);
    // Also create an associated inquiry tracker entry
    const newInquiry: Inquiry = {
      id: `inq-res-${Date.now()}`,
      referenceNumber: newReservation.referenceNumber,
      guestName: newReservation.guestName,
      email: newReservation.email,
      phone: newReservation.phone,
      roomType: newReservation.roomName,
      checkIn: newReservation.checkIn,
      checkOut: newReservation.checkOut,
      guests: newReservation.guests,
      status: 'confirmed',
      message: `Direct Online Reservation for ${newReservation.nights} night(s). Special requests: ${newReservation.specialRequests || 'None'}`,
      createdAt: newReservation.createdAt,
    };
    setInquiries((prev) => [newInquiry, ...prev]);
  };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 80;
      const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
      window.scrollTo({
        top: elementPosition - offset,
        behavior: 'smooth',
      });
    }
  };

  if (currentPage === 'booking') {
    return (
      <>
        <BookingInquiryPage
          onNavigate={(page) => setCurrentPage(page)}
          onOpenDesignSystem={() => setIsDesignSystemModalOpen(true)}
          onConfirmReservation={handleConfirmReservation}
          onAddInquiry={handleAddInquiry}
        />

        {/* Floating Design System & Component Library Toggle */}
        <aside
          aria-label="Component specifications"
          className="fixed bottom-5 right-5 z-30"
        >
          
        </aside>

        <DesignSystemModal
          isOpen={isDesignSystemModalOpen}
          onClose={() => setIsDesignSystemModalOpen(false)}
        />
      </>
    );
  }

  if (currentPage === 'facilities') {
    return (
      <>
        <FacilitiesPage
          onNavigate={(page) => setCurrentPage(page)}
          onOpenInquiry={(facilityOrRoomName) => {
            setCurrentPage('home');
            setTimeout(() => {
              const el = document.getElementById('inquiries-management');
              if (el) {
                el.scrollIntoView({ behavior: 'smooth' });
              }
            }, 100);
          }}
          onOpenDesignSystem={() => setIsDesignSystemModalOpen(true)}
          onConfirmReservation={handleConfirmReservation}
        />

        {/* Floating Design System & Component Library Toggle */}
        <aside
          aria-label="Component specifications"
          className="fixed bottom-5 right-5 z-30"
        >
          <button
            onClick={() => setIsDesignSystemModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-full bg-[#12355B] text-white text-xs font-semibold shadow-lg hover:bg-[#0d2744] hover:shadow-xl transition-all border border-white/20 active:scale-95 cursor-pointer"
            title="Inspect Figma reusable components and variants"
          >
            <Layers className="w-4 h-4 text-[#D4A853]" />
            <span className="hidden sm:inline">Figma Components & UI Specs</span>
            <span className="sm:hidden">UI Specs</span>
          </button>
        </aside>

        <DesignSystemModal
          isOpen={isDesignSystemModalOpen}
          onClose={() => setIsDesignSystemModalOpen(false)}
        />
      </>
    );
  }

  if (currentPage === 'about') {
    return (
      <>
        <AboutPage
          onNavigate={(page) => setCurrentPage(page)}
          onOpenInquiry={(roomName) => {
            setCurrentPage('home');
            setTimeout(() => {
              const el = document.getElementById('inquiries-management');
              if (el) {
                el.scrollIntoView({ behavior: 'smooth' });
              }
            }, 100);
          }}
          onOpenDesignSystem={() => setIsDesignSystemModalOpen(true)}
          onConfirmReservation={handleConfirmReservation}
        />

        {/* Floating Design System & Component Library Toggle */}
        <aside
          aria-label="Component specifications"
          className="fixed bottom-5 right-5 z-30"
        >
          <button
            onClick={() => setIsDesignSystemModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-full bg-[#12355B] text-white text-xs font-semibold shadow-lg hover:bg-[#0d2744] hover:shadow-xl transition-all border border-white/20 active:scale-95 cursor-pointer"
            title="Inspect Figma reusable components and variants"
          >
            <Layers className="w-4 h-4 text-[#D4A853]" />
            <span className="hidden sm:inline">Figma Components & UI Specs</span>
            <span className="sm:hidden">UI Specs</span>
          </button>
        </aside>

        <DesignSystemModal
          isOpen={isDesignSystemModalOpen}
          onClose={() => setIsDesignSystemModalOpen(false)}
        />
      </>
    );
  }

  if (currentPage === 'rooms') {
    return (
      <>
        <RoomsPage
          onNavigate={(page) => setCurrentPage(page)}
          onOpenInquiry={(roomName) => {
            setCurrentPage('home');
            setTimeout(() => {
              const el = document.getElementById('inquiries-management');
              if (el) {
                el.scrollIntoView({ behavior: 'smooth' });
              }
            }, 100);
          }}
          onOpenDesignSystem={() => setIsDesignSystemModalOpen(true)}
          initialSearchState={searchState}
          onConfirmReservation={handleConfirmReservation}
        />

        {/* Floating Design System & Component Library Toggle */}
        <aside
          aria-label="Component specifications"
          className="fixed bottom-5 right-5 z-30"
        >
          <button
            onClick={() => setIsDesignSystemModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-full bg-[#12355B] text-white text-xs font-semibold shadow-lg hover:bg-[#0d2744] hover:shadow-xl transition-all border border-white/20 active:scale-95 cursor-pointer"
            title="Inspect Figma reusable components and variants"
          >
            <Layers className="w-4 h-4 text-[#D4A853]" />
            <span className="hidden sm:inline">Figma Components & UI Specs</span>
            <span className="sm:hidden">UI Specs</span>
          </button>
        </aside>

        <DesignSystemModal
          isOpen={isDesignSystemModalOpen}
          onClose={() => setIsDesignSystemModalOpen(false)}
        />
      </>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F7F4] text-[#1F2937]">
      {/* 1. Sticky Header */}
      <Header
        currentPage="home"
        onNavigate={(page) => setCurrentPage(page)}
        onBookNowClick={() => handleOpenBookingModal()}
        onOpenInquiryClick={() => scrollToSection('inquiries-management')}
        onOpenDesignSystemClick={() => setIsDesignSystemModalOpen(true)}
      />

      <main className="flex-grow">
        {/* 2. Hero Section & 3. Booking Search Section */}
        <Hero
          searchState={searchState}
          onSearchChange={handleSearchChange}
          onSearchSubmit={() => setCurrentPage('rooms')}
          onExploreRoomsClick={() => setCurrentPage('rooms')}
          onBookYourStayClick={() => handleOpenBookingModal()}
          isSearching={isSearching}
        />

        {/* Search Feedback Banner (if user searched) */}
        {searchResultBanner && (
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
            <div className="p-4 rounded-[8px] bg-[#DCFCE7] border border-[#BBF7D0] text-[#15803D] flex items-center justify-between shadow-2xs animate-in fade-in duration-300">
              <div className="flex items-center gap-2 text-sm font-medium">
                <CheckCircle2 className="w-5 h-5 shrink-0" />
                <span>{searchResultBanner}</span>
              </div>
              <button
                onClick={() => setSearchResultBanner(null)}
                className="text-xs underline hover:no-underline font-semibold cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        {/* 4. Featured Rooms Section */}
        <FeaturedRooms
          rooms={ROOMS_DATA}
          onViewDetails={handleOpenRoomDetails}
          onBookRoom={() => handleOpenBookingModal()}
          onOpenInquiry={() => scrollToSection('inquiries-management')}
          onExploreAllRooms={() => setCurrentPage('rooms')}
        />

        {/* 5. Why Choose Us Section */}
        <WhyChooseUs amenities={homeAmenities} />

        {/* 6. Hotel Facilities Section */}
        <Facilities facilities={homeFacilities} />

        {/* Dedicated Direct Booking & Inquiry Management */}
        <InquirySection />

        {/* 7. Direct Booking CTA Section */}
        <DirectBookingCTA />
      </main>

      {/* 8. Footer */}
      <Footer
        onOpenBooking={() => handleOpenBookingModal()}
        onOpenInquiry={() => scrollToSection('inquiries-management')}
        onOpenDesignSystem={() => setIsDesignSystemModalOpen(true)}
        onNavigate={(page) => setCurrentPage(page)}
      />

      {/* Floating Design System & Component Library Toggle */}
      <aside
        aria-label="Component specifications"
        className="fixed bottom-5 right-5 z-30"
      >
        <button
          onClick={() => setIsDesignSystemModalOpen(true)}
          className="flex items-center gap-2 px-3.5 py-2.5 rounded-full bg-[#12355B] text-white text-xs font-semibold shadow-lg hover:bg-[#0d2744] hover:shadow-xl transition-all border border-white/20 active:scale-95 cursor-pointer"
          title="Inspect Figma reusable components and variants"
        >
          <Layers className="w-4 h-4 text-[#D4A853]" />
          <span className="hidden sm:inline">Figma Components & UI Specs</span>
          <span className="sm:hidden">UI Specs</span>
        </button>
      </aside>

      {/* Modals */}
      <RoomDetailsModal
        room={selectedRoomForDetails}
        isOpen={!!selectedRoomForDetails}
        onClose={() => setSelectedRoomForDetails(null)}
        searchState={searchState}
        onBookRoom={(room) => {
          setSelectedRoomForDetails(null);
          handleOpenBookingModal();
        }}
        onSendInquiry={(room) => {
          setSelectedRoomForDetails(null);
          scrollToSection('inquiries-management');
        }}
      />

      <BookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        selectedRoom={selectedRoomForBooking}
        allRooms={ROOMS_DATA}
        searchState={searchState}
        onConfirmReservation={handleConfirmReservation}
      />

      <DesignSystemModal
        isOpen={isDesignSystemModalOpen}
        onClose={() => setIsDesignSystemModalOpen(false)}
      />
    </div>
  );
}
