from datetime import datetime
from decimal import Decimal
from pydantic import BaseModel


class DashboardKpis(BaseModel):
    total_customers: int
    total_accounts: int
    total_transactions: int
    total_loans: int
    anomaly_count: int
    documents_count: int


class TransactionTrend(BaseModel):
    date: str
    credits: Decimal
    debits: Decimal
    transaction_count: int


class RecentTransaction(BaseModel):
    id: str
    merchant: str | None = None
    category: str | None = None
    transaction_type: str
    amount: Decimal
    transaction_time: datetime


class AnomalySummary(BaseModel):
    transaction_id: str
    merchant: str | None = None
    amount: Decimal
    reason: str
    transaction_time: datetime


class CustomerIntelligence(BaseModel):
    customer_id: str
    customer_name: str
    credit_score: int | None = None
    total_balance: Decimal
    loan_exposure: Decimal
    risk_level: str


class RagSummary(BaseModel):
    total_documents: int
    ready_documents: int
    processing_documents: int
    failed_documents: int


class DashboardOverview(BaseModel):
    kpis: DashboardKpis
    transaction_trend: list[TransactionTrend]
    recent_transactions: list[RecentTransaction]
    anomalies: list[AnomalySummary]
    customer_intelligence: list[CustomerIntelligence]
    rag: RagSummary