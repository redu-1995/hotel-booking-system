import type { Room, RoomType } from "@/types";

export const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api").replace(/\/$/, "");

type RequestOptions = Omit<RequestInit, "body"> & { body?: unknown };

export class ApiError extends Error {
  constructor(public readonly status: number, public readonly details: unknown) {
    super(`API request failed with status ${status}`);
    this.name = "ApiError";
  }
}

function getCookie(name: string): string | undefined {
  if (typeof document === "undefined") return undefined;
  return document.cookie
    .split("; ")
    .find((cookie) => cookie.startsWith(`${name}=`))
    ?.split("=")[1];
}

async function ensureCsrfToken() {
  if (getCookie("csrftoken")) return;
  await fetch(`${API_URL}/auth/csrf/`, { credentials: "include" });
}

export async function apiFetch<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const method = (options.method ?? "GET").toUpperCase();
  if (!["GET", "HEAD", "OPTIONS"].includes(method)) await ensureCsrfToken();

  const headers = new Headers(options.headers);
  if (options.body !== undefined) headers.set("Content-Type", "application/json");
  const csrfToken = getCookie("csrftoken");
  if (csrfToken) headers.set("X-CSRFToken", decodeURIComponent(csrfToken));

  const response = await fetch(`${API_URL}${path.startsWith("/") ? path : `/${path}`}`, {
    ...options,
    headers,
    credentials: "include",
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  });

  if (!response.ok) {
    let details: unknown;
    try { details = await response.json(); } catch { details = await response.text(); }
    throw new ApiError(response.status, details);
  }
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export async function apiList<T>(path: string, options?: RequestOptions): Promise<T[]> {
  const data = await apiFetch<T[] | { results: T[] }>(path, options);
  return Array.isArray(data) ? data : data.results;
}

export async function getRooms(): Promise<Room[]> {
  return apiList<Room>("/rooms/", { next: { revalidate: 60 } });
}
export async function getRoomTypes(): Promise<RoomType[]> {
  try { return await apiList<RoomType>("/room-types/", { next: { revalidate: 60 } }); } catch { return fallbackRooms.map((room) => room.room_type_details); }
}
const makeType = (id: number, name: string, description: string, price: string, amenities: string[]): RoomType => ({ id, name, description, max_guests: 2, bed_type: "King bed", base_price: price, amenities_list: amenities });
export const fallbackRooms: Room[] = [
  { id: 1, room_number: "A01", status: "available", is_available: true, room_type_details: makeType(1, "The Garden Room", "A sunlit retreat with a private terrace and views into our old frangipani garden.", "185.00", ["Private terrace", "Rain shower", "Breakfast included"]) },
  { id: 2, room_number: "B04", status: "available", is_available: true, room_type_details: makeType(2, "The Atelier Suite", "A generous suite for slow mornings, with hand-finished furniture and a deep soaking tub.", "260.00", ["Living room", "Soaking tub", "Late checkout"]) },
  { id: 3, room_number: "C12", status: "available", is_available: true, room_type_details: makeType(3, "The Courtyard King", "A calm, textural room opening onto a leafy shared courtyard at the center of the house.", "220.00", ["Courtyard access", "King bed", "Daily minibar"]) },
];