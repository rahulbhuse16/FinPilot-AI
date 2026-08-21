import { Wallet, TrendingDown, CreditCard, Droplets } from "lucide-react";
import { FinancialMetricCard } from "../financial/FinancialMetricCard";
import { formatCompactCurrency, formatPercent } from "../../utils/format";
import type { Customer360 } from "../../types/domain";

function healthTone(score: number | null | undefined): "positive" | "warning" | "risk" | "neutral" {
  if (score === null || score === undefined) return "neutral";
  if (score >= 70) return "positive";
  if (score >= 40) return "warning";
  return "risk";
}

function dtiTone(dti: number | null | undefined): "positive" | "warning" | "risk" | "neutral" {
  if (dti === null || dti === undefined) return "neutral";
  if (dti <= 35) return "positive";
  if (dti <= 50) return "warning";
  return "risk";
}

export function FinancialHealthGrid({ profile }: { profile: Customer360 }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <FinancialMetricCard
        label="Financial Health"
        value={
          profile.financial_health_score !== undefined && profile.financial_health_score !== null
            ? `${profile.financial_health_score}/100`
            : "—"
        }
        icon={Wallet}
        tone={healthTone(profile.financial_health_score)}
        sublabel="Composite score"
      />
      <FinancialMetricCard
        label="Debt Exposure"
        value={formatCompactCurrency(profile.total_loan_outstanding)}
        icon={TrendingDown}
        tone={profile.total_loan_exposure ? "warning" : "neutral"}
        sublabel="Total outstanding loans"
      />
      <FinancialMetricCard
        label="Credit Profile"
        value={profile.credit_score !== undefined && profile.credit_score !== null ? `${profile.credit_score}` : "—"}
        icon={CreditCard}
        tone={
          profile.credit_score
            ? profile.credit_score >= 700
              ? "positive"
              : profile.credit_score >= 600
              ? "warning"
              : "risk"
            : "neutral"
        }
        sublabel="Credit score"
      />
      <FinancialMetricCard
        label="Liquidity"
        value={formatPercent(profile.liquidity_ratio)}
        icon={Droplets}
        tone={profile.liquidity_ratio ? (profile.liquidity_ratio >= 20 ? "positive" : "warning") : "neutral"}
        sublabel="Liquidity ratio"
      />
      {profile.debt_to_income_ratio !== undefined && profile.debt_to_income_ratio !== null && (
        <FinancialMetricCard
          label="Debt-to-Income"
          value={formatPercent(profile.debt_to_income_ratio)}
          tone={dtiTone(profile.debt_to_income_ratio)}
          sublabel="DTI ratio"
        />
      )}
      {profile.total_balance !== undefined && profile.total_balance !== null && (
        <FinancialMetricCard label="Total Balance" value={formatCompactCurrency(profile.total_balance)} sublabel="Across all accounts" />
      )}
    </div>
  );
}
