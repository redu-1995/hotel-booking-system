const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api";
export async function createInquiry(payload: Record<string, unknown>) {
  const response = await fetch(`${API_URL}/inquiries/`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
  if (!response.ok) throw new Error("Unable to create inquiry");
  return response.json();
}
