import { useMemo } from "react";
import { useFetch } from "../hooks/useFetch";

import { healthApi } from "../api/health.api";
import { dashboardApi } from "../api/dashboard.api";
import { documentsApi } from "../api/documents.api";

import { DashboardHeader } from "../components/dashboard/DashboardHeader";
import { DashboardKpiGrid } from "../components/dashboard/DashboardKpiGrid";
import { FinancialActivityChart } from "../components/dashboard/FinancialActivityChart";
import { AIInsightsPanel } from "../components/dashboard/AIInsightsPanel";
import { TransactionIntelligence } from "../components/dashboard/TransactionIntelligence";
import { CustomerIntelligence } from "../components/dashboard/CustomerIntelligence";
import { KnowledgeBaseCard } from "../components/dashboard/KnowledgeBaseCard";
import { InvestigationCTA } from "../components/dashboard/InvestigationCTA";

import {
  Activity,
  AlertTriangle,
  HeartPulse,
  Users,
} from "lucide-react";

export function DashboardPage() {
  /*
   * Existing backend health API
   */
  const {
    data: health,
    status: healthStatus,
  } = useFetch(
    (signal) => healthApi.check(signal),
    [],
    true
  );

  /*
   * New dashboard overview API
   *
   * This single API gives us:
   * - KPIs
   * - transaction trend
   * - recent transactions
   * - anomalies
   * - customer intelligence
   * - RAG information
   */
  const {
    data: dashboard,
    status: dashboardStatus,
  } = useFetch(
    (signal) => dashboardApi.overview(signal),
    [],
    true
  );

  /*
   * Existing documents API.
   *
   * Keep this because the Knowledge Base component
   * already knows how to display actual document names/status.
   */
  const {
    data: documents,
    status: docStatus,
  } = useFetch(
    (signal) => documentsApi.list(signal),
    [],
    true
  );


  const {
    data: aiInsights,
    status: insightStatus,
  } = useFetch(
    (signal) => dashboardApi.aiInsights(signal),
    [],
    true
  );

  /*
   * --------------------------------------------------
   * KPI DATA
   * --------------------------------------------------
   */

  const kpis = useMemo(() => {
    if (!dashboard) {
      return [];
    }

    return [
      {
        label: "Customers",
        value: dashboard.kpis.total_customers,
        description: "Customers currently available in FinPilot.",
        icon: Users,
        tone: "default" as const,
      },

      {
        label: "Transactions",
        value: dashboard.kpis.total_transactions,
        description: "Financial transactions available for analysis.",
        icon: Activity,
        tone: "default" as const,
      },

      {
        label: "AI Risk Signals",
        value: dashboard.kpis.anomaly_count,
        description:
          dashboard.kpis.anomaly_count === 0
            ? "No transaction anomalies detected."
            : "Transactions currently requiring attention.",
        icon: AlertTriangle,
        tone:
          dashboard.kpis.anomaly_count > 0
            ? ("warning" as const)
            : ("positive" as const),
      },

      {
        label: "Accounts",
        value: dashboard.kpis.total_accounts,
        description: "Financial accounts available for analysis.",
        icon: HeartPulse,
        tone: "default" as const,
      },
    ];
  }, [dashboard]);

  /*
   * --------------------------------------------------
   * TRANSACTION CHART
   * --------------------------------------------------
   *
   * Backend returns:
   *
   * {
   *   date,
   *   credits,
   *   debits,
   *   transaction_count
   * }
   *
   * Convert strings -> numbers here.
   */

  const chartData = useMemo(
  () =>
    (dashboard?.transaction_trend ?? []).map(
      (item) => ({
        label: new Date(
          item.date
        ).toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
        }),

        value: Number(item.credits),

        secondaryValue: Number(item.debits),
      })
    ),
  [dashboard?.transaction_trend]
);

  /*
   * --------------------------------------------------
   * AI INSIGHTS
   * --------------------------------------------------
   *
   * These are derived ONLY from backend anomaly data.
   */



  /*
   * --------------------------------------------------
   * CUSTOMER DISTRIBUTION
   * --------------------------------------------------
   */

  const customerDistribution = useMemo(() => {
    if (!dashboard?.customer_intelligence?.length) {
      return [];
    }

    const distribution = new Map<string, number>();

    for (const customer of dashboard.customer_intelligence) {
      const risk = customer.risk_level;

      distribution.set(
        risk,
        (distribution.get(risk) ?? 0) + 1
      );
    }

    return Array.from(distribution.entries()).map(
      ([label, value]) => ({
        label,
        value,
        total: dashboard.customer_intelligence.length,
      })
    );
  }, [dashboard]);

  /*
   * --------------------------------------------------
   * CUSTOMER ANOMALY COUNT
   * --------------------------------------------------
   *
   * We only have transaction anomalies in this response.
   *
   * Therefore don't pretend they are unique customers.
   *
   * Use total anomaly count from KPI.
   */

  const customerCount =
    dashboard?.kpis.total_customers;

  const anomalyCount =
    dashboard?.kpis.anomaly_count;

  /*
   * --------------------------------------------------
   * TRANSACTIONS
   * --------------------------------------------------
   *
   * Convert backend:
   *
   * transaction_type
   *
   * into component:
   *
   * type
   */

  const transactions = useMemo(() => {
    if (!dashboard?.recent_transactions) {
      return [];
    }

    const anomalyIds = new Set(
      dashboard.anomalies.map(
        (anomaly) => anomaly.transaction_id
      )
    );

    return dashboard.recent_transactions.map(
      (transaction) => ({
        id: transaction.id,

        merchant: transaction.merchant,

        category: transaction.category,

        amount: Number(transaction.amount),

        type:
          transaction.transaction_type === "CREDIT"
            ? ("credit" as const)
            : ("debit" as const),

        date: transaction.transaction_time,

        isAnomaly: anomalyIds.has(transaction.id),
      })
    );
  }, [dashboard]);

  /*
   * --------------------------------------------------
   * RENDER
   * --------------------------------------------------
   */

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6">

      <DashboardHeader
        health={health}
        healthStatus={healthStatus as any}
      />

      <DashboardKpiGrid
        items={kpis}
      />

      <div className="grid gap-4 xl:grid-cols-[1.65fr_1fr]">

        <FinancialActivityChart
          data={chartData}
          loading={dashboardStatus === "loading"}
          primaryLabel="Debits"
          secondaryLabel="Credits"
          valueFormatter={formatCurrency}
        />

        <AIInsightsPanel
          insights={aiInsights?.insights ?? []}
          loading={insightStatus === "loading"}
        />

      </div>

      <TransactionIntelligence
        transactions={transactions}
        loading={dashboardStatus === "loading"}
        currencyFormatter={formatCurrency}
      />

      <div className="grid gap-4 xl:grid-cols-2">

        <CustomerIntelligence
          customerCount={customerCount}
          anomalyCount={anomalyCount}
          distribution={customerDistribution}
          loading={dashboardStatus === "loading"}
        />

        <KnowledgeBaseCard
          documents={documents ?? []}
          status={docStatus}
        />

      </div>

      <InvestigationCTA />

    </div>
  );
}

/*
 * --------------------------------------------------
 * Currency formatter
 * --------------------------------------------------
 */

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}