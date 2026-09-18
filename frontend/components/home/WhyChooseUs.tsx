import type { HomeAmenity } from "@/lib/home-data";
export function WhyChooseUs({ amenities }: { amenities: HomeAmenity[] }) { return <section className="container py-20 text-center"><p className="eyebrow">The Grandview standard</p>
<h2 className="mt-3 font-serif text-4xl font-bold">Why stay with us</h2>
<p className="mx-auto mt-2 max-w-xl text-sm text-[#718092]">Simple, reliable hospitality for international and domestic travelers.</p>
<div className="mt-8 grid gap-4 text-left sm:grid-cols-2 lg:grid-cols-4">{amenities.map((amenity) => <div key={amenity.title} className="rounded border border-[#e5e7e8] bg-white p-5">
    <span className="text-xs font-bold uppercase tracking-wider text-[#d09b38]">{amenity.icon}</span>
    <h3 className="mt-3 font-serif text-xl font-bold">{amenity.title}</h3>
    <p className="mt-2 text-sm leading-relaxed text-[#718092]">{amenity.description}</p></div>)}
</div>
</section>; }
