import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import { ArrowRight, Calculator, Loader2, Sparkles } from "lucide-react";
import { useFetch } from "../../hooks/useFetch";
import { portalApi } from "../../api/portal.api";
import { customerAiApi } from "../../api/customerAi.api";
import { toApiError } from "../../api/axios";
import { CardSkeleton } from "../../components/ui/LoadingSkeleton";
import { ErrorState } from "../../components/ui/ErrorState";
import { EmptyState } from "../../components/ui/EmptyState";
import { Button } from "../../components/ui/Button";
import { formatCurrency, formatDate } from "../../utils/format";
import type { ScenarioResult } from "../../types/financialHealth";

const SUGGESTIONS = [
  "What if I pay ₹10,000 extra toward my loan every month?",
  "What if I pay off this loan 2 years earlier?",
  "What if I reduce my monthly payment by ₹2,000?",
];

export function PortalScenarioPage() {
  const { data: customer } = useFetch((signal) => portalApi.profile(signal), []);
  const customerId = customer?.id;

  const { data: loans, status: loansStatus, error: loansError, refetch: refetchLoans } = useFetch(
    (signal) => portalApi.loans(signal),
    [],
  );

  const [selectedLoanId, setSelectedLoanId] = useState<string>("");
  const [prompt, setPrompt] = useState("");
  const [extraPayment, setExtraPayment] = useState("");
  const [result, setResult] = useState<ScenarioResult | null>(null);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loanList = loans ?? [];
  const activeLoanId = selectedLoanId || loanList[0]?.id || "";
  const selectedLoan = useMemo(() => loanList.find((l) => l.id === activeLoanId), [loanList, activeLoanId]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!customerId || !activeLoanId || !prompt.trim()) return;
    setError(null);
    setRunning(true);
    setResult(null);

    try {
      const payload = {
        loan_id: activeLoanId,
        prompt: prompt.trim(),
        extra_monthly_payment: extraPayment ? Number(extraPayment) : null,
      };
      const response = await customerAiApi.runFinancialScenario(customerId, payload);
      setResult(response);
    } catch (err) {
      setError(toApiError(err).message);
    } finally {
      setRunning(false);
    }
  }

  if (loansStatus === "loading" || !customer) return <CardSkeleton rows={4} />;
  if (loansStatus === "error") return <ErrorState message={loansError?.message} onRetry={refetchLoans} />;
  if (loanList.length === 0) {
    return (
      <EmptyState
        icon={Calculator}
        title="No loans to simulate"
        description="Scenario simulation becomes available once you have an active loan."
      />
    );
  }

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-navy-900 text-white">
            <Calculator className="h-4 w-4" strokeWidth={1.85} />
          </span>
          <div>
            <p className="font-display text-sm font-semibold text-navy-900">AI Scenario Simulator</p>
            <p className="text-xs text-slate-500">Model a repayment change before you make it.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
          <label className="block">
            <span className="text-xs font-medium uppercase tracking-wide text-slate-500">Loan</span>
            <select
              value={activeLoanId}
              onChange={(e) => setSelectedLoanId(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-navy-900"
            >
              {loanList.map((loan) => (
                <option key={loan.id} value={loan.id}>
                  {loan.loan_type ?? "Loan"} · {formatCurrency(Number(loan.outstanding_amount ?? 0))} outstanding
                </option>
              ))}
            </select>
          </label>

          <div className="flex flex-wrap gap-1.5">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setPrompt(s)}
                className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs text-slate-600 transition-colors hover:border-accent-teal hover:text-accent-teal"
              >
                {s}
              </button>
            ))}
          </div>

          <label className="block">
            <span className="text-xs font-medium uppercase tracking-wide text-slate-500">Scenario</span>
            <textarea
              required
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={2}
              placeholder="What if I pay ₹10,000 extra toward my loan every month?"
              className="mt-1.5 w-full resize-none rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm outline-none placeholder:text-slate-400 focus:border-navy-900"
            />
          </label>

          <label className="block max-w-xs">
            <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Extra monthly payment <span className="normal-case text-slate-400">(optional, ₹)</span>
            </span>
            <input
              type="number"
              min={0}
              value={extraPayment}
              onChange={(e) => setExtraPayment(e.target.value)}
              placeholder="10000"
              className="mt-1.5 w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm outline-none placeholder:text-slate-400 focus:border-navy-900"
            />
          </label>

          {error && <p role="alert" className="rounded-lg bg-risk-soft px-3 py-2 text-sm text-risk">{error}</p>}

          <Button type="submit" disabled={running || !prompt.trim()}>
            {running ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" /> Running scenario…
              </span>
            ) : (
              "Run Scenario"
            )}
          </Button>
        </form>
      </div>

      {selectedLoan && (
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="font-display text-sm font-semibold text-navy-900">Current loan state</p>
          <dl className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div>
              <dt className="text-xs text-slate-500">Outstanding</dt>
              <dd className="font-mono-num text-sm font-medium text-navy-900">
                {formatCurrency(Number(selectedLoan.outstanding_amount ?? 0))}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-slate-500">Monthly EMI</dt>
              <dd className="font-mono-num text-sm font-medium text-navy-900">
                {formatCurrency(Number(selectedLoan.monthly_emi ?? 0))}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-slate-500">Interest rate</dt>
              <dd className="font-mono-num text-sm font-medium text-navy-900">
                {selectedLoan.interest_rate ?? "—"}%
              </dd>
            </div>
            <div>
              <dt className="text-xs text-slate-500">Status</dt>
              <dd className="text-sm font-medium text-navy-900">{selectedLoan.status ?? "—"}</dd>
            </div>
          </dl>
        </div>
      )}

      {result && (
        <div className="animate-fade-in overflow-hidden rounded-xl border border-accent-teal/30 bg-white">
          <div className="flex items-center gap-2.5 border-b border-slate-100 bg-accent-teal-soft px-5 py-3.5">
            <Sparkles className="h-4 w-4 text-accent-teal" />
            <p className="font-display text-sm font-semibold text-navy-900">Scenario result</p>
          </div>

          <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg border border-slate-200 p-3.5">
              <p className="text-xs text-slate-500">Interest saved</p>
              <p className="font-mono-num mt-1 text-lg font-semibold text-positive">
                {formatCurrency(result.interest_saved)}
              </p>
            </div>
            <div className="rounded-lg border border-slate-200 p-3.5">
              <p className="text-xs text-slate-500">Months saved</p>
              <p className="font-mono-num mt-1 text-lg font-semibold text-navy-900">{result.months_saved}</p>
            </div>
            <div className="rounded-lg border border-slate-200 p-3.5">
              <p className="text-xs text-slate-500">New payoff date</p>
              <p className="mt-1 text-sm font-medium text-navy-900">{formatDate(result.projected_payoff_date)}</p>
              <p className="text-xs text-slate-400">was {formatDate(result.current_payoff_date)}</p>
            </div>
            <div className="rounded-lg border border-slate-200 p-3.5">
              <p className="text-xs text-slate-500">Monthly cash-flow impact</p>
              <p
                className={`font-mono-num mt-1 text-lg font-semibold ${
                  result.monthly_cash_flow_impact < 0 ? "text-risk" : "text-positive"
                }`}
              >
                {result.monthly_cash_flow_impact < 0 ? "-" : "+"}
                {formatCurrency(Math.abs(result.monthly_cash_flow_impact))}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 border-t border-slate-100 px-5 py-4 sm:grid-cols-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Interest before</span>
              <span className="font-mono-num font-medium text-navy-900">
                {formatCurrency(result.current_total_interest)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Interest after</span>
              <span className="font-mono-num font-medium text-navy-900">
                {formatCurrency(result.projected_total_interest)}
              </span>
            </div>
          </div>

          <div className="border-t border-slate-100 px-5 py-4">
            <p className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-accent-teal">
              <Sparkles className="h-3.5 w-3.5" /> AI explanation
            </p>
            <p className="text-sm leading-relaxed text-navy-800">{result.ai_explanation}</p>
            {result.ai_recommendation && (
              <p className="mt-2 flex items-start gap-1.5 text-sm text-slate-600">
                <ArrowRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent-teal" />
                {result.ai_recommendation}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
