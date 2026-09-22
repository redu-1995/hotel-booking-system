import React, { useState } from 'react';
import { Room } from '../../types/types';
import { RoomCard } from '../../components/rooms/RoomCard';
import { Sparkles, Shield, ArrowRight } from 'lucide-react';
import { Button } from '../ui/Button';

interface FeaturedRoomsProps {
  rooms: Room[];
  onViewDetails: (room: Room) => void;
  onBookRoom: (room: Room) => void;
  onOpenInquiry: () => void;
  onExploreAllRooms?: () => void;
}

export const FeaturedRooms: React.FC<FeaturedRoomsProps> = ({
  rooms,
  onViewDetails,
  onBookRoom,
  onOpenInquiry,
  onExploreAllRooms,
}) => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'standard' | 'deluxe' | 'suite'>('all');

  const filteredRooms = activeFilter === 'all'
    ? rooms
    : rooms.filter((r) => r.category === activeFilter);

  return (
    <section id="featured-rooms" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#12355B]/5 text-[#12355B] text-xs font-semibold uppercase tracking-widest mb-3">
          <Sparkles className="w-3.5 h-3.5 text-[#D4A853]" />
          Accommodations & Suites
        </div>

        {/* Section Heading: 32–40px Bold */}
        <h2 className="font-serif font-bold text-3xl sm:text-4xl text-[#12355B] tracking-tight mb-4">
          Find Your Perfect Room
        </h2>

        {/* Subtitle */}
        <p className="text-base sm:text-lg text-[#6B7280] leading-relaxed">
          Choose from our comfortable and carefully designed rooms.
        </p>

        {/* Category Filters */}
        <div className="flex flex-wrap items-center justify-center gap-2 mt-6">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-all cursor-pointer ${
              activeFilter === 'all'
                ? 'bg-[#12355B] text-white shadow-xs'
                : 'bg-white text-[#6B7280] hover:text-[#12355B] border border-[#E5E7EB]'
            }`}
          >
            All Rooms ({rooms.length})
          </button>
          <button
            onClick={() => setActiveFilter('standard')}
            className={`px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-all cursor-pointer ${
              activeFilter === 'standard'
                ? 'bg-[#12355B] text-white shadow-xs'
                : 'bg-white text-[#6B7280] hover:text-[#12355B] border border-[#E5E7EB]'
            }`}
          >
            Standard Rooms
          </button>
          <button
            onClick={() => setActiveFilter('deluxe')}
            className={`px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-all cursor-pointer ${
              activeFilter === 'deluxe'
                ? 'bg-[#12355B] text-white shadow-xs'
                : 'bg-white text-[#6B7280] hover:text-[#12355B] border border-[#E5E7EB]'
            }`}
          >
            Deluxe Rooms
          </button>
          <button
            onClick={() => setActiveFilter('suite')}
            className={`px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-all cursor-pointer ${
              activeFilter === 'suite'
                ? 'bg-[#12355B] text-white shadow-xs'
                : 'bg-white text-[#6B7280] hover:text-[#12355B] border border-[#E5E7EB]'
            }`}
          >
            Executive Suites
          </button>
        </div>
      </div>

      {/* 3 Room Cards in Responsive Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredRooms.map((room) => (
          <RoomCard
            key={room.id}
            room={room}
            onViewDetails={onViewDetails}
            onBookRoom={onBookRoom}
          />
        ))}
      </div>

      {onExploreAllRooms && (
        <div className="mt-10 text-center">
          <Button
            id="view-all-rooms-btn"
            variant="secondary"
            size="lg"
            onClick={onExploreAllRooms}
            rightIcon={<ArrowRight className="w-4 h-4 text-[#12355B]" />}
            className="px-8 shadow-2xs hover:bg-[#12355B] hover:text-white transition-all"
          >
            Explore All Rooms & Filter Catalog ({rooms.length})
          </Button>
        </div>
      )}

      {/* Direct Booking Benefit Strip */}
      <div className="mt-14 p-6 bg-white rounded-[12px] border border-[#E5E7EB] shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3.5 text-left">
          <div className="w-11 h-11 rounded-[8px] bg-[#12355B]/5 flex items-center justify-center text-[#12355B] shrink-0">
            <Shield className="w-5 h-5 text-[#D4A853]" />
          </div>
          <div>
            <h4 className="font-serif font-semibold text-base text-[#12355B]">
              Need customized booking for long stays, delegations, or events?
            </h4>
            <p className="text-xs sm:text-sm text-[#6B7280]">
              Our guest relations managers provide personalized rates and tailored room allocation.
            </p>
          </div>
        </div>

        <Button
          id="rooms-inquiry-btn"
          variant="secondary"
          size="md"
          onClick={onOpenInquiry}
          rightIcon={<ArrowRight className="w-4 h-4" />}
          className="shrink-0 w-full md:w-auto"
        >
          Send Custom Inquiry
        </Button>
      </div>
    </section>
  );
};
