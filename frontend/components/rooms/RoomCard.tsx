import React from 'react';
import { Room } from '../../types/types';
import { Button } from '../ui/Button';
import { AvailabilityBadge } from '../ui/Badge';
import {
  Users,
  Bed,
  Star,
  Wifi,
  Wind,
  Tv,
  Bath,
  Coffee,
  SunMedium,
  Wine,
  Bell,
  CheckCircle2,
  MailQuestion,
} from 'lucide-react';

interface RoomCardProps {
  room: Room;
  onViewDetails: (room: Room) => void;
  onBookRoom: (room: Room) => void;
  onSendInquiry?: (room: Room) => void;
  featuredBadge?: string;
}

// Map amenity names to icons
const getAmenityIcon = (name: string) => {
  const lower = name.toLowerCase();
  if (lower.includes('wi-fi') || lower.includes('wifi')) return <Wifi className="w-3.5 h-3.5 text-[#12355B]" />;
  if (lower.includes('air conditioning') || lower.includes('climate')) return <Wind className="w-3.5 h-3.5 text-[#12355B]" />;
  if (lower.includes('television') || lower.includes('tv')) return <Tv className="w-3.5 h-3.5 text-[#12355B]" />;
  if (lower.includes('bathroom') || lower.includes('shower') || lower.includes('tub')) return <Bath className="w-3.5 h-3.5 text-[#12355B]" />;
  if (lower.includes('breakfast') || lower.includes('coffee')) return <Coffee className="w-3.5 h-3.5 text-[#12355B]" />;
  if (lower.includes('balcony') || lower.includes('terrace')) return <SunMedium className="w-3.5 h-3.5 text-[#12355B]" />;
  if (lower.includes('bar') || lower.includes('wine')) return <Wine className="w-3.5 h-3.5 text-[#12355B]" />;
  if (lower.includes('service') || lower.includes('concierge')) return <Bell className="w-3.5 h-3.5 text-[#12355B]" />;
  return <CheckCircle2 className="w-3.5 h-3.5 text-[#D4A853]" />;
};

export const RoomCard: React.FC<RoomCardProps> = ({
  room,
  onViewDetails,
  onBookRoom,
  onSendInquiry,
  featuredBadge,
}) => {
  const isUnavailable = room.availability === 'unavailable';

  return (
    <div
      id={`room-card-${room.id}`}
      className="bg-white rounded-[12px] overflow-hidden shadow-xs hover:shadow-md transition-all duration-300 border border-[#E5E7EB] flex flex-col h-full group"
    >
      {/* Large room image at the top with rounded top corners */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-gray-100">
        <img
          src={room.image}
          alt={room.name}
          className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
          loading="lazy"
        />

        {/* Gradient overlay for contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-70 group-hover:opacity-50 transition-opacity" />

        {/* Top left badge area: Category / Featured */}
        <div className="absolute top-3.5 left-3.5 flex flex-col gap-1.5 items-start">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-wider uppercase bg-[#12355B]/90 text-white backdrop-blur-xs border border-white/20 shadow-2xs">
            {room.category}
          </span>
          {(featuredBadge || room.isPopular) && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#D4A853] text-[#1F2937] shadow-xs">
              ★ {featuredBadge || 'Popular'}
            </span>
          )}
        </div>

        {/* Top right: Availability Status Badge */}
        <div className="absolute top-3.5 right-3.5">
          <AvailabilityBadge
            availability={room.availability}
            availableRoomsLeft={room.availableRoomsLeft}
          />
        </div>

        {/* Bottom image overlay: Prominent Price (20-24px bold) */}
        <div className="absolute bottom-3 left-3 text-white">
          <div className="text-xl sm:text-2xl font-bold font-serif tracking-tight drop-shadow-xs flex items-baseline gap-1">
            <span>ETB {room.pricePerNight.toLocaleString()}</span>
            <span className="text-xs font-sans font-normal text-white/90">/ night</span>
          </div>
        </div>

        {/* Rating chip on image bottom right */}
        <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded-full flex items-center gap-1 text-xs font-semibold text-[#1F2937] shadow-2xs">
          <Star className="w-3 h-3 text-[#D4A853] fill-[#D4A853]" />
          <span>{room.rating.toFixed(1)}</span>
          <span className="text-[#6B7280] font-normal text-[11px]">({room.reviewsCount})</span>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-6 flex-1 flex flex-col justify-between">
        <div>
          {/* Room Name - Card Heading: 20–24px Semi-bold */}
          <h3 className="font-serif font-semibold text-xl sm:text-[22px] text-[#12355B] tracking-tight mb-2 group-hover:text-[#0e2a4a] transition-colors">
            {room.name}
          </h3>

          {/* Short description */}
          <p className="text-sm text-[#6B7280] line-clamp-2 leading-relaxed mb-4">
            {room.shortDescription}
          </p>

          <div className="flex flex-wrap items-center gap-3 py-3 border-y border-[#E5E7EB] text-xs sm:text-sm text-[#1F2937] mb-4">
            <div className="flex items-center gap-1.5 font-medium">
              <Users className="w-4 h-4 text-[#12355B]" />
              <span>Up to {room.capacityGuests}</span>
            </div>
            <div className="w-1 h-1 rounded-full bg-gray-300" />
            <div className="flex items-center gap-1.5 font-medium">
              <Bed className="w-4 h-4 text-[#12355B]" />
              <span>{room.bedType}</span>
            </div>
          </div>

          {/* Key Amenities (3 to 5 key amenities with small icons) */}
          <div className="mb-6">
            <div className="text-xs uppercase tracking-wider text-[#6B7280] font-semibold mb-2">
              Key Amenities
            </div>
            <div className="grid grid-cols-2 gap-2">
              {room.keyAmenities.slice(0, 4).map((amenity, idx) => (
                <div key={idx} className="flex items-center gap-1.5 text-xs text-[#1F2937]">
                  {getAmenityIcon(amenity)}
                  <span className="truncate">{amenity}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <Button
            id={`view-details-${room.id}`}
            variant="secondary"
            size="md"
            onClick={() => onViewDetails(room)}
            className="w-full text-xs sm:text-sm"
          >
            View Details
          </Button>

          {isUnavailable ? (
            <Button
              id={`inquire-room-${room.id}`}
              variant="secondary"
              size="md"
              onClick={() => (onSendInquiry ? onSendInquiry(room) : onViewDetails(room))}
              className="w-full text-xs sm:text-sm border-[#D4A853] text-[#12355B] hover:bg-[#D4A853]/10"
            >
              <MailQuestion className="w-3.5 h-3.5 mr-1 text-[#D4A853]" />
              Send Inquiry
            </Button>
          ) : (
            <Button
              id={`book-now-${room.id}`}
              variant="primary"
              size="md"
              onClick={() => onBookRoom(room)}
              className="w-full text-xs sm:text-sm"
            >
              Book Now
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

