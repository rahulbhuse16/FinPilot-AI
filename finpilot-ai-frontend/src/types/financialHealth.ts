export type SeverityLevel = "INFO" | "WARNING" | "CRITICAL";
export type DimensionStatus = "GOOD" | "FAIR" | "POOR" | string;

export interface HealthDimension {
  label: string;
  status: DimensionStatus;
  score?: number | null;
  description?: string | null;
}

export interface FinancialHealthScore {
  customer_id: string;
  score: number; // 0-100
  previous_score?: number | null;
  score_change?: number | null;
  spending_health: HealthDimension;
  cash_flow_health: HealthDimension;
  loan_health: HealthDimension;
  calculated_at: string;
}

export interface FinancialInsight {
  id: string;
  severity: SeverityLevel;
  title: string;
  description: string;
  metric_value?: number | null;
  created_at: string;
}

export interface FinancialRecommendation {
  id: string;
  title: string;
  description: string;
  potential_impact?: string | null;
  priority?: "HIGH" | "MEDIUM" | "LOW" | string;
}

export interface ScenarioLoanSnapshot {
  loan_id: string;
  loan_type?: string | null;
  outstanding_amount: number;
  principal_amount?: number | null;
  interest_rate?: number | null;
  monthly_emi?: number | null;
  projected_payoff_date?: string | null;
}

export interface ScenarioRequest {
  loan_id: string;
  prompt: string;
  extra_monthly_payment?: number | null;
}

export interface ScenarioResult {
  id: string;
  loan_id: string;
  current_payoff_date: string;
  projected_payoff_date: string;
  months_saved: number;
  current_total_interest: number;
  projected_total_interest: number;
  interest_saved: number;
  monthly_cash_flow_impact: number;
  ai_explanation: string;
  ai_recommendation?: string | null;
  created_at: string;
}
