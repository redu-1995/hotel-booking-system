"use client";

import React, { useState, useEffect } from 'react';
import { HOTEL_INFO } from '../../data/hotelData';
import { Button } from '../ui/Button';
import { Menu, X, Phone, Compass, CalendarCheck, Sparkles } from 'lucide-react';

export type NavPage = 'home' | 'rooms' | 'about' | 'facilities' | 'booking';

interface HeaderProps {
  onBookNowClick?: () => void;
  onOpenInquiryClick?: () => void;
  onOpenDesignSystemClick?: () => void;
  activeSection?: string;
  currentPage?: NavPage;
  onNavigate?: (page: NavPage) => void;
}

export const Header: React.FC<HeaderProps> = ({
  onBookNowClick,
  onOpenInquiryClick,
  onOpenDesignSystemClick,
  currentPage = 'facilities',
  onNavigate,
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNav = (targetPage: NavPage, sectionId?: string) => {
    setMobileMenuOpen(false);
    if (onNavigate) {
      onNavigate(targetPage);
    }
    if (sectionId) {
      setTimeout(() => {
        const element = document.getElementById(sectionId);
        if (element) {
          const offset = 80;
          const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
          window.scrollTo({
            top: elementPosition - offset,
            behavior: 'smooth',
          });
        }
      }, 50);
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <>
      {/* Top micro-announcement bar for direct booking perks & contact */}
      <div id="top-announcement-bar" className="bg-[#12355B] text-white/90 text-xs py-2 px-4 sm:px-8 border-b border-white/10 hidden md:block">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5 text-white/95">
              <Sparkles className="w-3.5 h-3.5 text-[#D4A853]" />
              <strong className="font-semibold text-white">Direct Booking Advantage:</strong> Guaranteed best room rates & complimentary welcome amenity
            </span>
          </div>
          <div className="flex items-center gap-5 text-white/80">
            <a href={`tel:${HOTEL_INFO.phone}`} className="flex items-center gap-1.5 hover:text-white transition-colors">
              <Phone className="w-3 h-3 text-[#D4A853]" />
              <span>{HOTEL_INFO.phone}</span>
            </a>
            <span className="text-white/30">|</span>
            <button
              onClick={() => onOpenInquiryClick?.()}
              className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer"
            >
              <CalendarCheck className="w-3 h-3 text-[#D4A853]" />
              <span>Inquiry Status Lookup</span>
            </button>
            {onOpenDesignSystemClick && (
              <>
                <span className="text-white/30">|</span>
                <button
                  onClick={onOpenDesignSystemClick}
                  className="text-xs text-[#D4A853] hover:underline cursor-pointer flex items-center gap-1"
                >
                  <span>UI Specs</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main Sticky Navigation */}
      <header
        id="main-header"
        className={`sticky top-0 z-40 w-full transition-all duration-300 ${
          isScrolled
            ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-[#E5E7EB] py-3.5'
            : 'bg-white border-b border-[#E5E7EB] py-4'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Hotel Logo on the left */}
            <button
              onClick={() => handleNav('home')}
              id="hotel-logo-link"
              className="flex items-center gap-3 group focus:outline-none text-left cursor-pointer"
            >
              <div className="w-10 h-10 rounded-[8px] bg-[#12355B] flex items-center justify-center text-white shadow-2xs group-hover:bg-[#0e2a4a] transition-colors">
                <span className="font-serif font-bold text-xl text-[#D4A853] tracking-tighter">G</span>
              </div>
              <div className="flex flex-col">
                <span className="font-serif font-bold text-xl sm:text-2xl text-[#12355B] tracking-tight leading-none">
                  THE GRANDVIEW
                </span>
                <span className="text-[10px] tracking-[0.2em] uppercase text-[#6B7280] font-medium mt-1">
                  Hotel & Suites
                </span>
              </div>
            </button>

            {/* Desktop Navigation Links */}
            <nav id="desktop-navigation" className="hidden lg:flex items-center gap-8 text-[15px] font-medium text-[#1F2937]">
              <button
                id="nav-link-home"
                onClick={() => handleNav('home')}
                className={`py-1.5 transition-colors cursor-pointer relative ${
                  currentPage === 'home'
                    ? 'text-[#12355B] font-bold after:content-[\'\'] after:absolute after:bottom-0 after:left-0 after:w-full after:h-[2px] after:bg-[#12355B]'
                    : 'text-[#4B5563] hover:text-[#12355B] after:content-[\'\'] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[2px] after:bg-[#12355B] hover:after:w-full after:transition-all'
                }`}
              >
                Home
              </button>
              <button
                id="nav-link-rooms"
                onClick={() => handleNav('rooms')}
                className={`py-1.5 transition-colors cursor-pointer relative flex items-center gap-1.5 ${
                  currentPage === 'rooms'
                    ? 'text-[#12355B] font-bold after:content-[\'\'] after:absolute after:bottom-0 after:left-0 after:w-full after:h-[2px] after:bg-[#12355B]'
                    : 'text-[#4B5563] hover:text-[#12355B] after:content-[\'\'] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[2px] after:bg-[#12355B] hover:after:w-full after:transition-all'
                }`}
              >
                <span>Rooms</span>
                {currentPage === 'rooms' && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#D4A853]" />
                )}
              </button>
              <button
                id="nav-link-about"
                onClick={() => handleNav('about')}
                className={`py-1.5 transition-colors cursor-pointer relative flex items-center gap-1.5 ${
                  currentPage === 'about'
                    ? 'text-[#12355B] font-bold after:content-[\'\'] after:absolute after:bottom-0 after:left-0 after:w-full after:h-[2px] after:bg-[#12355B]'
                    : 'text-[#4B5563] hover:text-[#12355B] after:content-[\'\'] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[2px] after:bg-[#12355B] hover:after:w-full after:transition-all'
                }`}
              >
                <span>About</span>
                {currentPage === 'about' && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#D4A853]" />
                )}
              </button>
              <button
                id="nav-link-facilities"
                onClick={() => handleNav('facilities')}
                className={`py-1.5 transition-colors cursor-pointer relative flex items-center gap-1.5 ${
                  currentPage === 'facilities'
                    ? 'text-[#12355B] font-bold after:content-[\'\'] after:absolute after:bottom-0 after:left-0 after:w-full after:h-[2px] after:bg-[#12355B]'
                    : 'text-[#4B5563] hover:text-[#12355B] after:content-[\'\'] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[2px] after:bg-[#12355B] hover:after:w-full after:transition-all'
                }`}
              >
                <span>Facilities</span>
                {currentPage === 'facilities' && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#D4A853]" />
                )}
              </button>
              <button
                id="nav-link-booking"
                onClick={() => handleNav('booking')}
                className={`py-1.5 transition-colors cursor-pointer relative flex items-center gap-1.5 ${
                  currentPage === 'booking'
                    ? 'text-[#12355B] font-bold after:content-[\'\'] after:absolute after:bottom-0 after:left-0 after:w-full after:h-[2px] after:bg-[#12355B]'
                    : 'text-[#4B5563] hover:text-[#12355B] after:content-[\'\'] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[2px] after:bg-[#12355B] hover:after:w-full after:transition-all'
                }`}
              >
                <span>Booking & Inquiry</span>
                {currentPage === 'booking' && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#D4A853]" />
                )}
              </button>
              <button
                id="nav-link-contact"
                onClick={() => handleNav('home', 'contact-footer')}
                className="py-1.5 text-[#4B5563] hover:text-[#12355B] transition-colors cursor-pointer relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[2px] after:bg-[#12355B] hover:after:w-full after:transition-all"
              >
                Contact
              </button>
            </nav>

            {/* Header Right Actions */}
            <div className="flex items-center gap-3">
              <Button
                id="header-book-now-btn"
                variant="primary"
                size="md"
                onClick={() => onBookNowClick?.()}
                className="hidden sm:inline-flex shadow-sm"
              >
                Book Now
              </Button>

              {/* Mobile Hamburger Button */}
              <button
                id="mobile-menu-toggle-btn"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-[8px] text-[#12355B] hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[#12355B]/20"
                aria-label="Toggle navigation menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div id="mobile-navigation-drawer" className="lg:hidden border-t border-[#E5E7EB] bg-white px-5 pt-4 pb-6 shadow-lg animate-in slide-in-from-top-2 duration-200">
            <div className="flex flex-col space-y-3 font-medium text-base text-[#1F2937]">
              <button
                onClick={() => handleNav('home')}
                className={`text-left py-2 border-b border-gray-100 ${
                  currentPage === 'home' ? 'text-[#12355B] font-bold' : 'text-[#4B5563]'
                }`}
              >
                Home
              </button>
              <button
                onClick={() => handleNav('rooms')}
                className={`text-left py-2 border-b border-gray-100 flex items-center justify-between ${
                  currentPage === 'rooms' ? 'text-[#12355B] font-bold' : 'text-[#4B5563]'
                }`}
              >
                <span>Rooms & Suites</span>
                {currentPage === 'rooms' && (
                  <span className="text-xs bg-[#12355B] text-white px-2 py-0.5 rounded-full font-sans font-medium">
                    Active
                  </span>
                )}
              </button>
              <button
                onClick={() => handleNav('about')}
                className={`text-left py-2 border-b border-gray-100 flex items-center justify-between ${
                  currentPage === 'about' ? 'text-[#12355B] font-bold' : 'text-[#4B5563]'
                }`}
              >
                <span>About The Hotel</span>
                {currentPage === 'about' && (
                  <span className="text-xs bg-[#12355B] text-white px-2 py-0.5 rounded-full font-sans font-medium">
                    Active
                  </span>
                )}
              </button>
              <button
                onClick={() => handleNav('facilities')}
                className={`text-left py-2 border-b border-gray-100 flex items-center justify-between ${
                  currentPage === 'facilities' ? 'text-[#12355B] font-bold' : 'text-[#4B5563]'
                }`}
              >
                <span>Hotel Facilities</span>
                {currentPage === 'facilities' && (
                  <span className="text-xs bg-[#12355B] text-white px-2 py-0.5 rounded-full font-sans font-medium">
                    Active
                  </span>
                )}
              </button>
              <button
                onClick={() => handleNav('booking')}
                className={`text-left py-2 border-b border-gray-100 flex items-center justify-between ${
                  currentPage === 'booking' ? 'text-[#12355B] font-bold' : 'text-[#4B5563]'
                }`}
              >
                <span>Booking & Inquiry</span>
                {currentPage === 'booking' && (
                  <span className="text-xs bg-[#12355B] text-white px-2 py-0.5 rounded-full font-sans font-medium">
                    Active
                  </span>
                )}
              </button>
              <button
                onClick={() => handleNav('home', 'contact-footer')}
                className="text-left py-2 hover:text-[#12355B] text-[#4B5563]"
              >
                Contact & Location
              </button>
            </div>

            <div className="mt-5 pt-4 border-t border-[#E5E7EB] flex flex-col gap-2.5">
              <Button
                id="mobile-book-now-btn"
                variant="primary"
                fullWidth
                size="md"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onBookNowClick?.();
                }}
              >
                Book Your Stay
              </Button>
              <Button
                id="mobile-inquire-btn"
                variant="secondary"
                fullWidth
                size="md"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenInquiryClick?.();
                }}
              >
                Send Booking Inquiry
              </Button>
              {onOpenDesignSystemClick && (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenDesignSystemClick();
                  }}
                  className="mt-2 text-center text-xs text-[#12355B] font-medium py-1"
                >
                  View UI Component Specs
                </button>
              )}
            </div>
          </div>
        )}
      </header>
    </>
  );
};
