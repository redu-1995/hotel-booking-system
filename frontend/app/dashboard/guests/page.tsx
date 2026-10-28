import { redirect } from "next/navigation";

export default function LegacyGuestsPage() {
	redirect("/admin/guests");
}