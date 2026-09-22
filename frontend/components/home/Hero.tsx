import React from 'react';
import { Button } from '../ui/Button';
import { BookingSearchBar } from './BookingSearchBar';

import { BookingSearchState } from '../../types/types';
import { ArrowRight, Star, ShieldCheck, Award } from 'lucide-react';

interface HeroProps {
  searchState: BookingSearchState;
  onSearchChange: (newState: Partial<BookingSearchState>) => void;
  onSearchSubmit: () => void;
  onExploreRoomsClick: () => void;
  onBookYourStayClick: () => void;
  isSearching?: boolean;
}

export const Hero: React.FC<HeroProps> = ({
  searchState,
  onSearchChange,
  onSearchSubmit,
  onExploreRoomsClick,
  onBookYourStayClick,
  isSearching,
}) => {
  return (
    <section id="home" className="relative w-full">
      {/* Header */}
      
      {/* Visual Container with Hotel Hero Image & Overlay */}
      <div className="relative min-h-[580px] lg:min-h-[640px] flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-1000 scale-100"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=2000&q=85')`,
          }}
          role="img"
          aria-label="The Grandview Hotel luxury facade and grand entryway"
        />

        {/* Sophisticated Dark Gradient Overlay for Maximum Text Readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#12355B]/90 via-[#12355B]/65 to-[#12355B]/45" />

        {/* Hero Content Container */}
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-16 pb-28 md:pb-32">
          {/* Subtle Trust Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs sm:text-sm font-medium mb-6">
            <div className="flex items-center text-[#D4A853]">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3.5 h-3.5 fill-[#D4A853]" />
              ))}
            </div>
            <span className="text-white/90">Rated 4.9/5 by over 1,200 international & local guests</span>
          </div>

          {/* Large Headline (48–64px) */}
          <h1 className="font-serif font-bold text-4xl sm:text-5xl md:text-6xl text-white tracking-tight leading-[1.15] mb-5 drop-shadow-xs">
            Your Perfect Stay <br className="hidden sm:inline" />
            <span className="text-white">Starts Here</span>
          </h1>

          {/* Supporting Text (18-20px) */}
          <p className="max-w-2xl mx-auto text-base sm:text-lg md:text-xl text-white/90 font-normal leading-relaxed mb-8">
            Discover comfortable rooms, exceptional hospitality, and a seamless booking experience.
          </p>

          {/* Call-to-Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 sm:gap-4">
            <Button
              id="hero-primary-book-stay-btn"
              variant="gold"
              size="lg"
              onClick={onBookYourStayClick}
              className="w-full sm:w-auto shadow-md hover:shadow-lg"
            >
              Book Your Stay
            </Button>
            <Button
              id="hero-secondary-explore-rooms-btn"
              variant="secondary"
              size="lg"
              onClick={onExploreRoomsClick}
              rightIcon={<ArrowRight className="w-4 h-4" />}
              className="w-full sm:w-auto bg-white/10 backdrop-blur-sm border-white/40 text-white hover:bg-white hover:text-[#12355B]"
            >
              Explore Rooms
            </Button>
          </div>

          {/* Micro trust highlights below buttons */}
          <div className="mt-8 pt-6 border-t border-white/15 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs sm:text-sm text-white/80">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#D4A853]" />
              <span>Direct Booking Rate Guarantee</span>
            </div>
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-[#D4A853]" />
              <span>Complimentary Room Upgrade (subject to availability)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Search Section - Prominently Overlapping Hero */}
      <div className="relative -mt-16 sm:-mt-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <BookingSearchBar
          searchState={searchState}
          onSearchChange={onSearchChange}
          onSearchSubmit={onSearchSubmit}
          isSearching={isSearching}
        />
      </div>
    </section>
  );
};
