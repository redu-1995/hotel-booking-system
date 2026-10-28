import Link from "next/link";
import AdminGuestsPage from "@/components/dashboard/AdminGuestsPage";
import AdminInquiriesPage from "@/components/dashboard/AdminInquiriesPage";
import AdminPaymentsPage from "@/components/dashboard/AdminPaymentsPage";
import AdminUsersPage from "@/components/dashboard/AdminUsersPage";

export default async function AdminSectionPlaceholder({ params }: PageProps<"/admin/[section]">) {
	const { section } = await params;
	if (section === "inquiries") return <AdminInquiriesPage />;
	if (section === "guests") return <AdminGuestsPage />;
	if (section === "payments") return <AdminPaymentsPage />;
	if (section === "users") return <AdminUsersPage />;
	const detail = section === "rooms" ? "Room inventory is available in the Rooms section." : "This admin section does not exist.";
	if (section !== "rooms") return <div role="alert" className="border border-[#e7c2b9] bg-[#fff5f1] p-5 text-sm text-[#884637]">{detail}</div>;
	const title = section.charAt(0).toUpperCase() + section.slice(1);
	return (
		<section className="max-w-3xl">
			<p className="text-xs font-semibold uppercase tracking-[0.13em] text-[#788279]">Hotel operations</p>
			<h1 className="mt-2 font-serif text-4xl text-[#263a31]">{title}</h1>
			<div className="mt-7 border border-dashed border-[#cbd5ca] bg-white px-6 py-12">
				<p className="text-sm leading-6 text-[#657168]">{detail}</p>
				<Link href="/admin" className="mt-5 inline-flex h-10 items-center bg-[#29443a] px-4 text-sm font-semibold text-white hover:bg-[#20382f]">Return to overview</Link>
			</div>
		</section>
	);
}