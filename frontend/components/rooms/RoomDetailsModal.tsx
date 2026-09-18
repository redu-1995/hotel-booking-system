"use client";

import type { Room, BookingSearchState } from "@/types/types";
import { Button } from "@/components/ui/Button";

interface RoomDetailsModalProps {
  room: Room | null;
  isOpen: boolean;
  onClose: () => void;
  searchState: BookingSearchState;
  onBookRoom: (room: Room) => void;
  onSendInquiry: (room: Room) => void;
}

export function RoomDetailsModal({ room, isOpen, onClose, onBookRoom, onSendInquiry }: RoomDetailsModalProps) {
  if (!isOpen || !room) return null;
  return <div role="dialog" aria-modal="true" aria-labelledby="room-details-title" className="fixed inset-0 z-50 grid place-items-center bg-[#062c53]/70 p-6" onClick={onClose}>
    <div className="w-full max-w-lg bg-white p-7 text-[#152c43]" onClick={(event) => event.stopPropagation()}>
      <button type="button" onClick={onClose} className="float-right text-xl" aria-label="Close room details">×</button>
      <p className="eyebrow">{room.category} room</p>
      <h2 id="room-details-title" className="mt-2 font-serif text-3xl font-bold">{room.name}</h2>
      <p className="mt-3 text-sm text-[#718092]">{room.fullDescription}</p>
      <div className="mt-5 grid grid-cols-2 gap-3 border-y border-[#e5e7e8] py-4 text-sm"><span>Up to {room.capacityGuests} guests</span><span>{room.bedType}</span><span>ETB {room.pricePerNight.toLocaleString()} per night</span><span>{room.availability === "available" ? "Available now" : "Currently unavailable"}</span></div>
      <div className="mt-5 flex gap-3"><Button type="button" variant="secondary" onClick={() => onSendInquiry(room)} className="flex-1">Send inquiry</Button><Button type="button" variant="primary" onClick={() => onBookRoom(room)} className="flex-1" disabled={room.availability === "unavailable"}>Book room</Button></div>
    </div>
  </div>;
}
