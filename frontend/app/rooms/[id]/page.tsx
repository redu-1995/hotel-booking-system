import Link from "next/link";
import Image from "next/image";
import { Header } from "@/components/layout/Header";
import { fallbackRooms } from "@/lib/api/client";
import { getRoomImagery } from "@/data/hotelData";
export default async function RoomDetail({ params }: { params: Promise<{ id: string }> }) {
	const { id } = await params;
	const room = fallbackRooms.find((item) => item.id === Number(id)) ?? fallbackRooms[0];
	const type = room.room_type_details;
	const normalizedName = type.name.toLowerCase();
	const category = normalizedName.includes("suite")
		? "suite"
		: normalizedName.includes("deluxe")
			? "deluxe"
			: "standard";
	const imagery = getRoomImagery(type.name, category);

	return (
		<main>
			<section className="relative flex min-h-[520px] items-end overflow-hidden bg-[#b7c5b5] pb-16 text-white">
				<Image
					src={imagery.image}
					alt={`${type.name} room`}
					fill
					priority
					sizes="100vw"
					className="object-cover"
				/>
				<div className="absolute inset-0 bg-black/40" />
				<Header />
				<div className="absolute right-[15%] top-[24%] z-10 h-64 w-64 rounded-full border-[34px] border-white/20" />
				<div className="container relative z-10">
					<Link href="/rooms" className="text-sm text-white/80">← All rooms</Link>
					<p className="eyebrow mt-12 text-[#f0a18a]">Room {room.room_number}</p>
					<h1 className="display mt-3 text-7xl">{type.name}</h1>
				</div>
			</section>
			<section className="section-pad">
				<div className="container grid gap-16 md:grid-cols-[1.2fr_.8fr]">
					<div>
						<p className="text-xl leading-relaxed text-[var(--muted)]">{type.description}</p>
						<div className="mt-12 grid grid-cols-2 gap-5 border-y border-[var(--line)] py-6 text-sm">
							{type.amenities_list.map((amenity) => <p key={amenity}>+ {amenity}</p>)}
						</div>
					</div>
					<aside className="bg-[var(--cream)] p-8">
						<p className="eyebrow">Make it yours</p>
						<p className="display mt-3 text-4xl">
							${type.base_price}<span className="font-sans text-sm text-[var(--muted)]"> / night</span>
						</p>
						<p className="mt-3 text-sm text-[var(--muted)]">Flexible cancellation · Breakfast available</p>
						<Link href={`/booking?room=${room.id}`} className="mt-8 block bg-[var(--coral)] px-5 py-4 text-center text-xs font-bold uppercase tracking-widest">
							Book this room
						</Link>
					</aside>
				</div>
			</section>
		</main>
	);
}