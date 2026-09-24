import Image from "next/image";
import Link from "next/link";
import type { HomeFacility } from "@/lib/home-data";

export function FacilitiesPreview({ facilities }: { facilities: HomeFacility[] }) {
	return (
		<section className="bg-[#f0f1ee] py-16 sm:py-18">
			<div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 text-center">
				<p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#718092]">
					Around the hotel
				</p>
				<h2 className="mt-3 font-serif text-4xl font-bold tracking-[-0.03em] text-[#1F2937]">
					Everything you need for a comfortable stay
				</h2>
				<p className="mt-2 text-sm text-[#718092]">
					Useful amenities, considered spaces, and help when you need it.
				</p>

				<div className="mt-8 grid gap-5 text-left sm:grid-cols-2 lg:grid-cols-4">
					{facilities.map((facility) => (
						<article
							key={facility.title}
							className="overflow-hidden rounded-lg border border-[#e5e7e8] bg-white shadow-[0_1px_0_rgba(15,23,42,0.02)]"
						>
							<div className="relative h-36">
								<Image
									src={facility.image}
									alt={facility.title}
									fill
									sizes="(max-width: 768px) 100vw, 25vw"
									className="object-cover"
								/>
							</div>
							<div className="p-4">
								<span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#378552]">
									{facility.tag}
								</span>
								<h3 className="mt-2 font-serif text-xl font-bold leading-tight text-[#1F2937]">
									{facility.title}
								</h3>
								<p className="mt-1 text-sm leading-relaxed text-[#718092]">
									{facility.description}
								</p>
							</div>
						</article>
					))}
				</div>

				<Link
					href="/facilities"
					className="mt-8 inline-flex items-center justify-center border border-[#bfc9d2] bg-white px-5 py-3 text-sm font-bold text-[#12355B] transition hover:border-[#12355B] hover:bg-[#F8F7F4]"
				>
					Explore facilities
				</Link>
			</div>
		</section>
	);
}
