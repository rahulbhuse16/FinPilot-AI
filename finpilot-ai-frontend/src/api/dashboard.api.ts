import { api } from "./axios";

export interface DashboardKpis {
  total_customers: number;
  total_accounts: number;
  total_transactions: number;
  total_loans: number;
  anomaly_count: number;
  documents_count: number;
}

export interface TransactionTrend {
  date: string;
  credits: string;
  debits: string;
  transaction_count: number;
}

export interface RecentTransaction {
  id: string;
  merchant: string;
  category: string | null;
  transaction_type: "CREDIT" | "DEBIT";
  amount: string;
  transaction_time: string;
}

export interface DashboardAnomaly {
  transaction_id: string;
  merchant: string;
  amount: string;
  reason: string;
  transaction_time: string;
}

export interface CustomerIntelligenceData {
  customer_id: string;
  customer_name: string;
  credit_score: number;
  total_balance: string;
  loan_exposure: string;
  risk_level: "HIGH" | "MEDIUM" | "LOW" | string;
}

export interface DashboardRag {
  total_documents: number;
  ready_documents: number;
  processing_documents: number;
  failed_documents: number;
}

export interface DashboardOverview {
  kpis: DashboardKpis;
  transaction_trend: TransactionTrend[];
  recent_transactions: RecentTransaction[];
  anomalies: DashboardAnomaly[];
  customer_intelligence: CustomerIntelligenceData[];
  rag: DashboardRag;
}

/**
 * AI-generated dashboard insight
 */
export interface DashboardAIInsight {
  id: string;
  category: string;
  title: string;
  description: string;
  severity: "positive" | "warning" | "danger";
  customer_id: string | null;
}

/**
 * Response from:
 * GET /dashboard/ai-insights
 */
export interface DashboardAIInsights {
  insights: DashboardAIInsight[];
}

export const dashboardApi = {
  /**
   * Financial dashboard data
   *
   * GET /dashboard/overview
   */
  overview: (signal?: AbortSignal) =>
    api
      .get<DashboardOverview>(
        "/dashboard/overview",
        { signal }
      )
      .then((r) => r.data),

  /**
   * AI-powered financial insights
   *
   * GET /dashboard/ai-insights
   */
  aiInsights: (signal?: AbortSignal) =>
    api
      .get<DashboardAIInsights>(
        "/dashboard/a-insights",
        { signal }
      )
      .then((r) => r.data),
};