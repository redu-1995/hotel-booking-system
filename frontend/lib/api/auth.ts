import { apiFetch } from "./client";

export type User = {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  is_active: boolean;
};

export function getCsrfToken() { return apiFetch<{ detail: string }>("/auth/csrf/"); }
export function login(username: string, password: string) { return apiFetch<User>("/auth/login/", { method: "POST", body: { username, password } }); }
export function logout() { return apiFetch<void>("/auth/logout/", { method: "POST" }); }
export function getCurrentUser() { return apiFetch<User>("/auth/me/"); }
export function changePassword(oldPassword: string, newPassword: string) {
  return apiFetch<{ detail: string }>("/auth/change-password/", { method: "POST", body: { old_password: oldPassword, new_password: newPassword } });
}