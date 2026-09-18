export type AuthUser = { id: number; email: string; first_name?: string; last_name?: string };

export function isAuthenticated() {
  return false;
}