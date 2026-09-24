import type { HomeAmenity } from "@/lib/home-data";

export function WhyChooseUs({ amenities }: { amenities: HomeAmenity[] }) {
    return (
        <section className="py-16 sm:py-18">
            <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 text-center">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#718092]">
                    The Grandview standard
                </p>
                <h2 className="mt-3 font-serif text-4xl font-bold tracking-[-0.03em] text-[#1F2937]">
                    Why stay with us
                </h2>
                <p className="mx-auto mt-2 max-w-xl text-sm text-[#718092]">
                    Simple, reliable hospitality for international and domestic travelers.
                </p>

                <div className="mt-8 grid gap-4 text-left sm:grid-cols-2 lg:grid-cols-4">
                    {amenities.map((amenity) => (
                        <div
                            key={amenity.title}
                            className="min-h-[190px] rounded-lg border border-[#e5e7e8] bg-white p-5 shadow-[0_1px_0_rgba(15,23,42,0.02)]"
                        >
                            <span className="text-xs font-bold uppercase tracking-[0.18em] text-[#d09b38]">
                                {amenity.icon}
                            </span>
                            <h3 className="mt-3 font-serif text-xl font-bold leading-tight text-[#1F2937]">
                                {amenity.title}
                            </h3>
                            <p className="mt-2 text-sm leading-relaxed text-[#718092]">
                                {amenity.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
