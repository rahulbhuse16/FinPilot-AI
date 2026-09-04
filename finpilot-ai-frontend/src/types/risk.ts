export type RiskTier = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";

export interface RiskOverview {
  critical_count: number;
  high_count: number;
  medium_count: number;
  low_count: number;
  generated_at: string;
}

export interface RiskCustomerSummary {
  customer_id: string;
  customer_name: string;
  risk_tier: RiskTier;
  risk_score: number; // 0-100
  primary_signal: string;
  confidence: number; // 0-100
  last_updated: string;
}

export interface RiskCustomerFilters {
  tier?: RiskTier | "ALL";
  search?: string;
  page?: number;
  page_size?: number;
}

export interface RiskSignal {
  id: string;
  label: string;
  detail: string;
  weight?: number | null; // 0-100 contribution to score
}

export interface RiskEvidenceTransaction {
  id: string;
  merchant?: string | null;
  amount: number;
  transaction_time: string;
  reason?: string | null;
}

export interface RiskInvestigation {
  customer_id: string;
  customer_name: string;
  risk_score: number;
  risk_tier: RiskTier;
  confidence: number; // 0-100
  signals: RiskSignal[];
  ai_assessment: string;
  repayment_behavior_summary?: string | null;
  evidence_transactions: RiskEvidenceTransaction[];
  generated_at: string;
}

export interface AdminCopilotQuery {
  question: string;
}

export type AdminCopilotCell = string | number | null;

export interface AdminCopilotTable {
  columns: string[];
  rows: AdminCopilotCell[][];
}

export interface AdminCopilotMetric {
  label: string;
  value: string;
}

export interface AdminCopilotResponse {
  id: string;
  question: string;
  summary: string;
  ai_explanation: string;
  metrics?: AdminCopilotMetric[];
  table?: AdminCopilotTable | null;
  related_customer_ids?: string[];
  created_at: string;
}
