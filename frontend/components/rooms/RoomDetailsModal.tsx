import React, { useState, useEffect } from 'react';
import { Room, BookingSearchState } from '../../types/types';
import { Button } from '../ui/Button';
import { AvailabilityBadge } from '../ui/Badge';
import {
  X,
  Users,
  Bed,
  Star,
  ChevronLeft,
  ChevronRight,
  Wifi,
  Wind,
  Tv,
  Bath,
  Coffee,
  SunMedium,
  Wine,
  Bell,
  ShieldCheck,
  Calendar,
  Sparkles,
  MailQuestion,
  Maximize2,
  CheckCircle2,
} from 'lucide-react';

interface RoomDetailsModalProps {
  room: Room | null;
  isOpen: boolean;
  onClose: () => void;
  onBookRoom: (room: Room) => void;
  onSendInquiry?: (room: Room) => void;
  searchState?: BookingSearchState;
}

// Icon mapper for modal amenities
const getDetailedAmenityIcon = (name: string) => {
  const lower = name.toLowerCase();
  if (lower.includes('wi-fi') || lower.includes('wifi')) return <Wifi className="w-4 h-4 text-[#12355B]" />;
  if (lower.includes('air conditioning') || lower.includes('climate')) return <Wind className="w-4 h-4 text-[#12355B]" />;
  if (lower.includes('television') || lower.includes('tv')) return <Tv className="w-4 h-4 text-[#12355B]" />;
  if (lower.includes('bathroom') || lower.includes('shower') || lower.includes('tub') || lower.includes('jacuzzi')) return <Bath className="w-4 h-4 text-[#12355B]" />;
  if (lower.includes('breakfast') || lower.includes('coffee') || lower.includes('tea')) return <Coffee className="w-4 h-4 text-[#12355B]" />;
  if (lower.includes('balcony') || lower.includes('terrace')) return <SunMedium className="w-4 h-4 text-[#12355B]" />;
  if (lower.includes('bar') || lower.includes('wine')) return <Wine className="w-4 h-4 text-[#12355B]" />;
  if (lower.includes('service') || lower.includes('butler') || lower.includes('concierge') || lower.includes('bell')) return <Bell className="w-4 h-4 text-[#12355B]" />;
  return <CheckCircle2 className="w-4 h-4 text-[#D4A853]" />;
};

export const RoomDetailsModal: React.FC<RoomDetailsModalProps> = ({
  room,
  isOpen,
  onClose,
  onBookRoom,
  onSendInquiry,
  searchState,
}) => {
  if (!isOpen || !room) return null;

  const images = room.galleryImages && room.galleryImages.length > 0 ? room.galleryImages : [room.image];
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);

  useEffect(() => {
    setCurrentImageIndex(0);
  }, [room?.id]);

  const handlePrevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  // Booking summary calculation
  const hasDatesSelected = Boolean(searchState?.checkIn && searchState?.checkOut);
  const calculateNights = () => {
    if (!hasDatesSelected || !searchState?.checkIn || !searchState?.checkOut) return 1;
    try {
      const d1 = new Date(searchState.checkIn);
      const d2 = new Date(searchState.checkOut);
      const diffTime = d2.getTime() - d1.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays > 0 ? diffDays : 1;
    } catch {
      return 1;
    }
  };

  const nightsCount = calculateNights();
  const roomsCount = searchState?.rooms || 1;
  const estimatedTotal = room.pricePerNight * nightsCount * roomsCount;
  const isUnavailable = room.availability === 'unavailable';

  // Amenities list
  const amenitiesList = room.allAmenities && room.allAmenities.length > 0
    ? room.allAmenities
    : Array.from(new Set([...room.keyAmenities, 'Smart Television', 'Private Bathroom', 'Air Conditioning', 'Free Wi-Fi', 'Daily Housekeeping']));

  return (
    <div
      id="room-details-modal-backdrop"
      className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        id="room-details-modal"
        className="relative w-full max-w-4xl bg-white rounded-[12px] shadow-2xl border border-[#E5E7EB] overflow-hidden my-4 sm:my-8 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Clearly Visible Close Button */}
        <button
          id="close-room-details-modal"
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-white/95 hover:bg-white text-[#1F2937] hover:text-[#12355B] flex items-center justify-center shadow-md transition-all border border-gray-200 focus:outline-none cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* IMAGE GALLERY */}
        <div className="relative aspect-[16/9] max-h-[380px] w-full bg-gray-900 overflow-hidden select-none">
          <img
            src={images[currentImageIndex]}
            alt={`${room.name} photo ${currentImageIndex + 1}`}
            className="w-full h-full object-cover transition-opacity duration-300"
          />

          {/* Navigation Arrows */}
          {images.length > 1 && (
            <>
              <button
                id="gallery-prev-btn"
                onClick={handlePrevImage}
                className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-black/50 hover:bg-black/75 text-white flex items-center justify-center backdrop-blur-xs transition-colors cursor-pointer"
                aria-label="Previous photo"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                id="gallery-next-btn"
                onClick={handleNextImage}
                className="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-black/50 hover:bg-black/75 text-white flex items-center justify-center backdrop-blur-xs transition-colors cursor-pointer"
                aria-label="Next photo"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}

          {/* Gradient Overlay for Room Info */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent pointer-events-none" />

          {/* Room Header Overlay */}
          <div className="absolute bottom-4 sm:bottom-6 left-4 sm:left-6 right-4 sm:right-6 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-3 text-white pointer-events-none">
            <div>
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-wider uppercase bg-[#12355B]/90 text-white backdrop-blur-xs border border-white/20">
                  {room.category}
                </span>
                <AvailabilityBadge
                  availability={room.availability}
                  availableRoomsLeft={room.availableRoomsLeft}
                />
                <div className="flex items-center gap-1 text-xs text-white/90 ml-1">
                  <Star className="w-3.5 h-3.5 fill-[#D4A853] text-[#D4A853]" />
                  <span>{room.rating.toFixed(1)}</span>
                  <span>({room.reviewsCount} reviews)</span>
                </div>
              </div>
              <h2 className="font-serif font-bold text-2xl sm:text-3xl text-white tracking-tight">
                {room.name}
              </h2>
            </div>

            <div className="text-left sm:text-right">
              <div className="text-2xl sm:text-3xl font-serif font-bold text-white">
                ETB {room.pricePerNight.toLocaleString()}
                <span className="text-xs sm:text-sm font-sans font-normal text-white/90 ml-1">per night</span>
              </div>
              <p className="text-[11px] text-white/80">Direct booking price guarantee</p>
            </div>
          </div>
        </div>

        {/* Thumbnail Selector */}
        {images.length > 1 && (
          <div className="flex items-center gap-2 px-4 sm:px-6 py-2.5 bg-[#F8F7F4] border-b border-[#E5E7EB] overflow-x-auto">
            {images.map((imgUrl, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentImageIndex(idx)}
                className={`relative w-16 sm:w-20 h-12 sm:h-14 rounded-[6px] overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                  currentImageIndex === idx
                    ? 'border-[#12355B] ring-2 ring-[#12355B]/20 scale-102'
                    : 'border-transparent opacity-70 hover:opacity-100'
                }`}
              >
                <img src={imgUrl} alt={`${room.name} thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}

        {/* Modal Body Content */}
        <div className="p-5 sm:p-8 space-y-6 max-h-[50vh] overflow-y-auto">
          {/* ROOM SPECIFICATIONS (Grid) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-[8px] bg-[#F8F7F4] border border-[#E5E7EB]">
            <div>
              <div className="text-xs text-[#6B7280] mb-1">Guest Capacity</div>
              <div className="flex items-center gap-1.5 font-medium text-sm text-[#12355B]">
                <Users className="w-4 h-4 text-[#D4A853]" />
                <span>Up to {room.capacityGuests} {room.capacityGuests === 1 ? 'Guest' : 'Guests'}</span>
              </div>
            </div>
            <div>
              <div className="text-xs text-[#6B7280] mb-1">Bed Configuration</div>
              <div className="flex items-center gap-1.5 font-medium text-sm text-[#12355B]">
                <Bed className="w-4 h-4 text-[#D4A853]" />
                <span>{room.bedType}</span>
              </div>
            </div>
            <div>
              <div className="text-xs text-[#6B7280] mb-1">Room Dimensions</div>
              <div className="flex items-center gap-1.5 font-medium text-sm text-[#12355B]">
                <Maximize2 className="w-4 h-4 text-[#D4A853]" />
                <span>{room.sizeSqM} m² ({Math.round(room.sizeSqM * 10.764)} sq ft)</span>
              </div>
            </div>
            <div>
              <div className="text-xs text-[#6B7280] mb-1">Availability Status</div>
              <div>
                <AvailabilityBadge
                  availability={room.availability}
                  availableRoomsLeft={room.availableRoomsLeft}
                />
              </div>
            </div>
          </div>

          {/* ROOM DESCRIPTION */}
          <div>
            <h4 className="font-serif font-semibold text-lg text-[#12355B] mb-2">Room Overview</h4>
            <p className="text-[#1F2937] text-sm sm:text-base leading-relaxed">
              {room.fullDescription}
            </p>
          </div>

          {/* ALL AMENITIES WITH ICONS */}
          <div>
            <h4 className="font-serif font-semibold text-lg text-[#12355B] mb-3">Room Amenities & Services</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {amenitiesList.map((amenity, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2.5 p-2.5 rounded-[6px] bg-white border border-[#E5E7EB] text-sm text-[#1F2937]"
                >
                  <div className="w-7 h-7 rounded-full bg-[#12355B]/5 flex items-center justify-center shrink-0">
                    {getDetailedAmenityIcon(amenity)}
                  </div>
                  <span className="font-medium text-xs sm:text-sm">{amenity}</span>
                </div>
              ))}
            </div>
          </div>

          {/* BOOKING SUMMARY SECTION */}
          <div className="p-4 sm:p-5 rounded-[10px] bg-[#12355B]/5 border border-[#12355B]/15">
            <h4 className="font-serif font-semibold text-base sm:text-lg text-[#12355B] mb-2 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[#D4A853]" />
              <span>Booking Summary & Estimated Cost</span>
            </h4>

            {hasDatesSelected ? (
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-sm pt-2">
                <div>
                  <span className="text-xs text-[#6B7280] block">Dates</span>
                  <span className="font-semibold text-[#1F2937]">
                    {searchState?.checkIn} → {searchState?.checkOut}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-[#6B7280] block">Stay Duration</span>
                  <span className="font-semibold text-[#1F2937]">
                    {nightsCount} {nightsCount === 1 ? 'Night' : 'Nights'}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-[#6B7280] block">Guests & Rooms</span>
                  <span className="font-semibold text-[#1F2937]">
                    {searchState?.guests || 2} Guests, {roomsCount} {roomsCount === 1 ? 'Room' : 'Rooms'}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-[#6B7280] block">Estimated Total</span>
                  <span className="font-serif font-bold text-base text-[#12355B]">
                    ETB {estimatedTotal.toLocaleString()}
                  </span>
                </div>
              </div>
            ) : (
              <div className="py-2 text-sm text-[#4B5563] flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#D4A853] shrink-0" />
                <span>
                  Please select your travel dates in the search bar above to calculate exact night totals and availability.
                </span>
              </div>
            )}
          </div>

          {/* Direct Booking Guarantee */}
          <div className="p-3.5 rounded-[8px] bg-white border border-[#E5E7EB] flex items-start gap-3 text-xs text-[#6B7280]">
            <ShieldCheck className="w-4 h-4 text-[#16A34A] shrink-0 mt-0.5" />
            <div>
              <strong className="text-[#1F2937]">Official Direct Booking Privilege:</strong> Best rate guarantee, complimentary late check-out upon availability, and priority room allocation.
            </div>
          </div>
        </div>

        {/* MODAL FOOTER ACTIONS */}
        <div className="p-4 sm:p-6 bg-[#F8F7F4] border-t border-[#E5E7EB] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-center sm:text-left">
            <div className="text-xs text-[#6B7280]">Rate per room</div>
            <div className="text-xl sm:text-2xl font-serif font-bold text-[#12355B]">
              ETB {room.pricePerNight.toLocaleString()}{' '}
              <span className="text-xs font-sans font-normal text-[#6B7280]">per night</span>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            {/* Secondary Button: Send Inquiry */}
            <Button
              id="modal-send-inquiry-btn"
              variant="secondary"
              size="md"
              onClick={() => {
                onClose();
                if (onSendInquiry) onSendInquiry(room);
              }}
              className="w-1/2 sm:w-auto text-xs sm:text-sm"
            >
              <MailQuestion className="w-4 h-4 mr-1.5 text-[#12355B]" />
              Send Inquiry
            </Button>

            {/* Primary Button: Book This Room */}
            {isUnavailable ? (
              <Button
                id="modal-book-disabled-btn"
                variant="secondary"
                size="md"
                disabled
                className="w-1/2 sm:w-auto text-xs sm:text-sm"
              >
                Unavailable
              </Button>
            ) : (
              <Button
                id="modal-book-this-room-btn"
                variant="primary"
                size="md"
                onClick={() => {
                  onClose();
                  onBookRoom(room);
                }}
                className="w-1/2 sm:w-auto text-xs sm:text-sm"
              >
                Book This Room
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

