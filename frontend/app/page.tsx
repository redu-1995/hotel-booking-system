"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Footer } from "@/components/layout/Footer";
import { FeaturedRooms } from "@/components/home/FeaturedRooms";
import { FacilitiesPreview } from "@/components/home/FacilitiesPreview";
import { Hero } from "@/components/home/Hero";
import { InquirySection } from "@/components/home/InquirySection";
import { WhyChooseUs } from "@/components/home/WhyChooseUs";
import { homeAmenities, homeFacilities, homeRooms } from "@/data/hotelData";
import type { BookingSearchState } from "@/types/types";

export default function Home() {
  const router = useRouter();
  const [searchState, setSearchState] = useState<BookingSearchState>({ checkIn: "", checkOut: "", guests: 2, rooms: 1 });
  const updateSearch = (next: Partial<BookingSearchState>) => setSearchState((current) => ({ ...current, ...next }));
  const openBooking = () => router.push("/booking");
  const openRooms = () => router.push("/rooms");
  const submitSearch = () => router.push(`/rooms?checkIn=${searchState.checkIn}&checkOut=${searchState.checkOut}&guests=${searchState.guests}&rooms=${searchState.rooms}`);

  return <main className="bg-[#f7f6f2] text-[#152c43]"><Hero searchState={searchState} onSearchChange={updateSearch} onSearchSubmit={submitSearch} onExploreRoomsClick={openRooms} onBookYourStayClick={openBooking} /><FeaturedRooms rooms={homeRooms} /><section className="border-y border-[#e7e9e7] bg-white py-5"><div className="container flex flex-wrap items-center justify-between gap-4 text-sm"><p><strong>Need a long-stay or group rate?</strong> <span className="text-[#718092]">Our reservation team can prepare a tailored option.</span></p><a href="/inquiry" className="border border-[#bfc9d2] px-4 py-2 font-bold">Send an inquiry</a></div></section><WhyChooseUs amenities={homeAmenities} /><FacilitiesPreview facilities={homeFacilities} /><InquirySection /><section className="bg-[#062c53] py-16 text-center text-white"><p className="eyebrow text-[#e2b65c]">Direct booking</p><h2 className="mt-3 font-serif text-4xl font-bold">Ready to plan your stay?</h2><p className="mt-3 text-sm text-white/70">Book directly with us for a simple, secure, and convenient hotel experience.</p><a href="/booking" className="mt-7 inline-block bg-[#d7a850] px-7 py-3 text-sm font-bold text-[#062c53]">Book your stay</a></section><Footer /></main>;
}
