import type { Role } from "../types/auth";

export function homeRouteForRole(role: Role): string {
  return role === "ADMIN" ? "/dashboard" : "/portal";
}
