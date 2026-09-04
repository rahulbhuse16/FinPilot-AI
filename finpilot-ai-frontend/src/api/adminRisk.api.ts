// Reuses the existing centralized Axios instance — do not create another one.
import { api } from "./axios";
import type {
  AdminCopilotQuery,
  AdminCopilotResponse,
  RiskCustomerFilters,
  RiskCustomerSummary,
  RiskInvestigation,
  RiskOverview,
} from "../types/risk";

// ASSUMED endpoint paths — adjust to match your FastAPI routes if they differ.
// The copilot endpoint MUST resolve intent + query the database server-side;
// the frontend never sends or executes raw SQL.
export const adminRiskApi = {
  getRiskOverview: (signal?: AbortSignal) =>
    api.get<RiskOverview>("/admin/risk/overview", { signal }).then((r) => r.data),

  getRiskCustomers: (filters: RiskCustomerFilters = {}, signal?: AbortSignal) =>
    api
      .get<RiskCustomerSummary[]>("/admin/risk/customers", {
        params: {
          tier: filters.tier && filters.tier !== "ALL" ? filters.tier : undefined,
          search: filters.search || undefined,
          page: filters.page,
          page_size: filters.page_size,
        },
        signal,
      })
      .then((r) => r.data),

  getCustomerRiskInvestigation: (customerId: string, signal?: AbortSignal) =>
    api.get<RiskInvestigation>(`/admin/risk/customers/${customerId}`, { signal }).then((r) => r.data),

  askAdminCopilot: (payload: AdminCopilotQuery, signal?: AbortSignal) =>
    api.post<AdminCopilotResponse>("/admin/copilot/ask", payload, { signal }).then((r) => r.data),
};
