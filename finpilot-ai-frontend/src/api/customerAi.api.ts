// Reuses the existing centralized Axios instance — do not create another one.
import { api } from "./axios";
import type {
  FinancialHealthScore,
  FinancialInsight,
  FinancialRecommendation,
  ScenarioLoanSnapshot,
  ScenarioRequest,
  ScenarioResult,
} from "../types/financialHealth";

// ASSUMED endpoint paths — adjust to match your FastAPI routes if they differ.
// See the integration checklist for the full expected contract.
export const customerAiApi = {
  getFinancialHealth: (customerId: string, signal?: AbortSignal) =>
    api
      .get<FinancialHealthScore>(`/customers/${customerId}/financial-health`, { signal })
      .then((r) => r.data),

  getFinancialInsights: (customerId: string, signal?: AbortSignal) =>
    api
      .get<FinancialInsight[]>(`/customers/${customerId}/financial-insights`, { signal })
      .then((r) => r.data),

  getFinancialRecommendations: (customerId: string, signal?: AbortSignal) =>
    api
      .get<FinancialRecommendation[]>(`/customers/${customerId}/financial-recommendations`, { signal })
      .then((r) => r.data),

  getScenarioLoanSnapshot: (customerId: string, loanId: string, signal?: AbortSignal) =>
    api
      .get<ScenarioLoanSnapshot>(`/customers/${customerId}/loans/${loanId}/snapshot`, { signal })
      .then((r) => r.data),

  runFinancialScenario: (customerId: string, payload: ScenarioRequest, signal?: AbortSignal) =>
    api
      .post<ScenarioResult>(`/customers/${customerId}/financial-scenarios`, payload, { signal })
      .then((r) => r.data),
};
