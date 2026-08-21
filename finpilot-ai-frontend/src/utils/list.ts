import type { Paginated } from "../types/api";

/** Normalizes a backend response that may be a raw array or a paginated envelope. */
export function normalizeList<T>(data: T[] | Paginated<T> | null | undefined): T[] {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (Array.isArray(data.items)) return data.items;
  return [];
}
