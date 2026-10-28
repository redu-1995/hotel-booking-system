import AdminBookingDetails from "@/components/dashboard/AdminBookingDetails";

export default async function AdminBookingPage({ params }: PageProps<"/admin/bookings/[id]">) {
	const { id } = await params;
	const bookingId = Number(id);
	if (!Number.isInteger(bookingId) || bookingId < 1) {
		return <div role="alert" className="border border-[#e7c2b9] bg-[#fff5f1] p-5 text-sm text-[#884637]">The booking ID is not valid.</div>;
	}
	return <AdminBookingDetails id={bookingId} />;
}