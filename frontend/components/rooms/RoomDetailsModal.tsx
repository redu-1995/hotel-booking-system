"use client";

import type { HomeRoom } from "@/data/hotelData";

export function RoomDetailsModal({ room, onClose }: { room: HomeRoom | null; onClose: () => void }) {
  if (!room) return null;
  return <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 grid place-items-center bg-[#062c53]/70 p-6"><div className="max-w-md bg-white p-7 text-[#152c43]"><button type="button" onClick={onClose} className="float-right text-xl" aria-label="Close room details">×</button><p className="eyebrow">Room details</p><h2 className="mt-2 font-serif text-3xl font-bold">{room.name}</h2><p className="mt-3 text-sm text-[#718092]">{room.description}</p><p className="mt-5 font-bold">{room.price} per night · {room.bedType} · Up to {room.maxGuests} guests</p></div></div>;
}
