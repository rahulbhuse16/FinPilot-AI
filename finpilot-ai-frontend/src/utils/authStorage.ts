import type { AuthUser } from "../types/auth";

const TOKEN_KEY = "finpilot.token";
const USER_KEY = "finpilot.user";

export function readStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function readStoredUser(): AuthUser | null {
  const raw = localStorage.getItem(USER_KEY);

  if (!raw) return null;

  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export function storeAuth(token: string, user: AuthUser): void {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearStoredAuth(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}
