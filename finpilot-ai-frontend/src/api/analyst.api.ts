import { api } from "./axios";
import type { AnalystRequest, AnalystResponse } from "../types/domain";

export const analystApi = {
  ask: (payload: AnalystRequest, signal?: AbortSignal) =>
    api.post<AnalystResponse>("/analyst/ask", payload, { signal }).then((r) => r.data),
};
