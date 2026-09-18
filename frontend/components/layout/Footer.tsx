"use client";

import React from 'react';
import { HOTEL_INFO } from '../../data/hotelData'
import { NavPage } from './Header';
import { MapPin, Phone, Mail, Clock, ChevronRight } from 'lucide-react';

interface FooterProps {
  onOpenInquiry?: () => void;
  onOpenBooking?: () => void;
  onOpenDesignSystem?: () => void;
  onNavigate?: (page: NavPage) => void;
}

export const Footer: React.FC<FooterProps> = ({
  onOpenInquiry,
  onOpenBooking,
  onOpenDesignSystem,
  onNavigate,
}) => {
  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const offset = 80;
      const elementPosition = el.getBoundingClientRect().top + window.pageYOffset;
      window.scrollTo({
        top: elementPosition - offset,
        behavior: 'smooth',
      });
    }
  };

  const handleNavOrScroll = (targetPage: NavPage, sectionId?: string) => {
    if (onNavigate) {
      onNavigate(targetPage);
      if (sectionId) {
        setTimeout(() => scrollTo(sectionId), 60);
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } else if (sectionId) {
      scrollTo(sectionId);
    }
  };

  return (
    <footer id="contact-footer" className="bg-[#1F2937] text-white/90 pt-16 pb-12 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-gray-700/60">
          {/* Brand & Short Description */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-[8px] bg-[#12355B] border border-[#D4A853]/40 flex items-center justify-center text-white">
                <span className="font-serif font-bold text-xl text-[#D4A853]">G</span>
              </div>
              <div>
                <span className="font-serif font-bold text-xl tracking-tight text-white block">
                  THE GRANDVIEW
                </span>
                <span className="text-[10px] tracking-[0.2em] uppercase text-[#D4A853] font-medium">
                  Hotel & Suites
                </span>
              </div>
            </div>

            <p className="text-sm text-gray-400 leading-relaxed">
              Modern hospitality meeting classical elegance. We provide travelers with restful rooms, attentive service, and an effortless direct booking experience.
            </p>

            {/* Social Media Icons */}
            <div className="flex items-center gap-3 pt-2">
              <a
                href="#instagram"
                className="w-9 h-9 rounded-full bg-white/5 hover:bg-[#12355B] border border-white/10 hover:border-white/20 flex items-center justify-center text-gray-300 hover:text-white transition-colors"
                aria-label="Instagram"
              >
                <span aria-hidden="true" className="text-xs font-bold">IG</span>
              </a>
              <a
                href="#facebook"
                className="w-9 h-9 rounded-full bg-white/5 hover:bg-[#12355B] border border-white/10 hover:border-white/20 flex items-center justify-center text-gray-300 hover:text-white transition-colors"
                aria-label="Facebook"
              >
                <span aria-hidden="true" className="text-xs font-bold">FB</span>
              </a>
              <a
                href="#twitter"
                className="w-9 h-9 rounded-full bg-white/5 hover:bg-[#12355B] border border-white/10 hover:border-white/20 flex items-center justify-center text-gray-300 hover:text-white transition-colors"
                aria-label="Twitter"
              >
                <span aria-hidden="true" className="text-xs font-bold">X</span>
              </a>
              <a
                href="#linkedin"
                className="w-9 h-9 rounded-full bg-white/5 hover:bg-[#12355B] border border-white/10 hover:border-white/20 flex items-center justify-center text-gray-300 hover:text-white transition-colors"
                aria-label="LinkedIn"
              >
                <span aria-hidden="true" className="text-xs font-bold">IN</span>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-serif font-semibold text-lg text-white mb-4">
              Quick Links
            </h4>
            <ul className="space-y-2.5 text-sm text-gray-400">
              <li>
                <button
                  onClick={() => handleNavOrScroll('home')}
                  className="hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <ChevronRight className="w-3.5 h-3.5 text-[#D4A853]" />
                  Home
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNavOrScroll('rooms')}
                  className="hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <ChevronRight className="w-3.5 h-3.5 text-[#D4A853]" />
                  Rooms & Suites
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNavOrScroll('about')}
                  className="hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <ChevronRight className="w-3.5 h-3.5 text-[#D4A853]" />
                  About The Grandview
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNavOrScroll('facilities')}
                  className="hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <ChevronRight className="w-3.5 h-3.5 text-[#D4A853]" />
                  Hotel Facilities
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNavOrScroll('booking')}
                  className="hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <ChevronRight className="w-3.5 h-3.5 text-[#D4A853]" />
                  Direct Booking & Inquiries
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNavOrScroll('home', 'inquiries-management')}
                  className="hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <ChevronRight className="w-3.5 h-3.5 text-[#D4A853]" />
                  Inquiry & Reservation Tracker
                </button>
              </li>
            </ul>
          </div>

          {/* Direct Booking Services */}
          <div>
            <h4 className="font-serif font-semibold text-lg text-white mb-4">
              Direct Guest Services
            </h4>
            <ul className="space-y-2.5 text-sm text-gray-400">
              <li>
                <button
                  onClick={() => onOpenBooking?.()}
                  className="hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <ChevronRight className="w-3.5 h-3.5 text-[#D4A853]" />
                  Instant Direct Reservation
                </button>
              </li>
              <li>
                <button
                  onClick={() => onOpenInquiry?.()}
                  className="hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <ChevronRight className="w-3.5 h-3.5 text-[#D4A853]" />
                  Corporate & Event Inquiries
                </button>
              </li>
              <li>
                <span className="text-gray-400 flex items-center gap-1.5">
                  <ChevronRight className="w-3.5 h-3.5 text-[#D4A853]" />
                  Best Rate Guarantee Policy
                </span>
              </li>
              <li>
                <span className="text-gray-400 flex items-center gap-1.5">
                  <ChevronRight className="w-3.5 h-3.5 text-[#D4A853]" />
                  Flexible 24-Hour Cancellation
                </span>
              </li>
              {onOpenDesignSystem && (
                <li className="pt-1">
                  <button
                    onClick={onOpenDesignSystem}
                    className="text-xs text-[#D4A853] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <ChevronRight className="w-3.5 h-3.5 text-[#D4A853]" />
                    Design System & Figma Components
                  </button>
                </li>
              )}
            </ul>
          </div>

          {/* Contact Information */}
          <div>
            <h4 className="font-serif font-semibold text-lg text-white mb-4">
              Contact Information
            </h4>
            <div className="space-y-3.5 text-sm text-gray-400">
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-[#D4A853] shrink-0 mt-1" />
                <span>{HOTEL_INFO.address}</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-[#D4A853] shrink-0" />
                <a href={`tel:${HOTEL_INFO.phone}`} className="hover:text-white transition-colors">
                  {HOTEL_INFO.phone}
                </a>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-[#D4A853] shrink-0" />
                <a href={`mailto:${HOTEL_INFO.email}`} className="hover:text-white transition-colors">
                  {HOTEL_INFO.email}
                </a>
              </div>
              <div className="flex items-start gap-3">
                <Clock className="w-4 h-4 text-[#D4A853] shrink-0 mt-0.5" />
                <span>{HOTEL_INFO.conciergeHours}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Copyright Text */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <div>
            © {new Date().getFullYear()} {HOTEL_INFO.fullName}. All rights reserved.
          </div>
          <div className="flex items-center gap-6">
            <span className="hover:text-gray-400 cursor-pointer">Privacy Policy</span>
            <span className="hover:text-gray-400 cursor-pointer">Terms of Service</span>
            <span className="hover:text-gray-400 cursor-pointer">Direct Booking Rules</span>
            <span className="hover:text-gray-400 cursor-pointer">Cookie Settings</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
