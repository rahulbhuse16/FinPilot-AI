import { api } from "./axios";
import type { Health } from "../types/domain";

export const healthApi = {
  check: (signal?: AbortSignal) => api.get<Health>("/health", { signal }).then((r) => r.data),
};
