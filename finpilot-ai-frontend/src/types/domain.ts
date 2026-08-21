// Domain types mapped to the FinPilot AI backend contract.
// If the backend response shape differs, adapt the mapping in src/api/*
// rather than spreading `any` across the app — these interfaces are the
// single source of truth for components.

export interface Health {
  status: string;
  database: string;
  version: string;
}

export interface Customer {
  id: string;
  full_name: string;
  email?: string | null;
  phone?: string | null;
  segment?: string | null;
  risk_rating?: string | null;
  created_at?: string;
  [key: string]: unknown;
}

export interface Account {
  id: string;
  account_type?: string | null;
  balance?: number | null;
  currency?: string | null;
  [key: string]: unknown;
}

export interface Customer360 {
  id: string;
  full_name: string;
  email?: string | null;
  phone?: string | null;
  segment?: string | null;
  risk_rating?: string | null;
  created_at?: string;
  accounts?: Account[];
  total_balance?: number | null;
  credit_score?: number | null;
  debt_to_income_ratio?: number | null;
  total_loan_outstanding?: number | null;
  liquidity_ratio?: number | null;
  financial_health_score?: number | null;
  [key: string]: unknown;
}

export interface Transaction {
  id: string;
  customer_id?: string;
  amount: number;
  merchant?: string | null;
  category?: string | null;
  type?: "debit" | "credit" | string;
  date?: string;
  description?: string | null;
  [key: string]: unknown;
}

export interface Loan {
  id: string;
  customer_id?: string;
  loan_type?: string | null;
  principal?: number | null;
  outstanding_balance?: number | null;
  interest_rate?: number | null;
  status?: string | null;
  [key: string]: unknown;
}

export interface Anomaly {
  id: string;
  transaction_id?: string;
  reason?: string | null;
  severity?: "low" | "medium" | "high" | string;
  amount?: number | null;
  detected_at?: string;
  [key: string]: unknown;
}

export type DocumentStatus = "uploading" | "processing" | "ready" | "failed" | string;

export interface FinDocument {
  id: string;
  filename: string;
  size_bytes?: number | null;
  status: DocumentStatus;
  uploaded_at?: string;
  error?: string | null;
  [key: string]: unknown;
}

export interface Conversation {
  id: string;
  customer_id: string | null;
  title: string | null;
  created_at: string;
  updated_at: string;
}

export interface AnalystSource {
  type: string;
  source: string;
  page_number?: number | null;
}

export interface AnalystRequest {
  conversation_id: string;
  customer_id: string | null;
  question: string;
}

export interface AnalystResponse {
  answer: string;
  sources: AnalystSource[];
  tools_used: string[];
}

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: AnalystSource[];
  tools_used?: string[];
  created_at: string;
  status?: "pending" | "complete" | "error";
}
