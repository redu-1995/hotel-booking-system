import type { Metadata } from "next";
import AdminShell from "@/components/dashboard/AdminShell";

export const metadata: Metadata = {
	title: "Hotel Operations | Asteria House",
	description: "Staff booking and hotel operations dashboard.",
};

export default function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
	return <AdminShell>{children}</AdminShell>;
}