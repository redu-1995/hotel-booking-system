const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api";
export async function getPayments() {
  const response = await fetch(`${API_URL}/payments/`, { next: { revalidate: 30 } });
  if (!response.ok) throw new Error("Unable to load payments");
  return response.json();
}
