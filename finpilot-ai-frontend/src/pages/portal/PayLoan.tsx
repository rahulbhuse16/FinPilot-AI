import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Banknote,
  CheckCircle2,
  Clock,
  CreditCard,
  IndianRupee,
  Loader2,
  ShieldCheck,
  Sparkles,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toApiError } from "../../api/axios";
import { loanService } from "../../api/loanService";
import { LoanPaymentSummary } from "../../components/loan/LoanPaymentSummary";
import { useFetch } from "../../hooks/useFetch";
import type { ApiErrorShape } from "../../types/api";
import {
  buildPaymentSnapshot,
  buildQuickAmounts,
  formatMoney,
  formatPercentLabel,
  toLoanFinancials,
  validatePayment,
  type LoanDetails,
  type LoanFinancials,
  type LoanPaymentResponse,
  type PaymentSnapshot,
  type PaymentValidation,
} from "../../utils/loanPayment";

interface PayLoanProps {
  /** Loan id from the route (e.g. /portal/loans/:loanId/pay). */
  loanId: string;
  /** Optional callback fired after a successful payment ("Done"). */
  onDone?: () => void;
}

const STATUS_CONFIG: Record<
  string,
  { tone: "positive" | "warning" | "risk" | "neutral"; icon: typeof Clock }
> = {
  ACTIVE: { tone: "warning", icon: Clock },
  CLOSED: { tone: "positive", icon: CheckCircle2 },
  DELINQUENT: { tone: "risk", icon: AlertTriangle },
  OVERDUE: { tone: "risk", icon: AlertTriangle },
  PENDING: { tone: "neutral", icon: Clock },
};

const TONE_CLASSES: Record<
  "positive" | "warning" | "risk" | "neutral",
  string
> = {
  positive: "border-emerald-100 bg-emerald-50 text-emerald-700",
  warning: "border-amber-100 bg-amber-50 text-amber-700",
  risk: "border-red-100 bg-red-50 text-red-700",
  neutral: "border-slate-200 bg-slate-50 text-slate-600",
};

/**
 * PayLoan — the complete loan repayment experience.
 *
 * Responsibilities (kept intentionally narrow):
 *  - fetch the loan via `loanService`
 *  - own input / validation / confirmation / submission state
 *  - render the calculator + summary (via `LoanPaymentSummary`)
 *  - display loading / error / success states
 *
 * All math lives in `utils/loanPayment`; all HTTP lives in `api/loanService`.
 */
export function PayLoan() {
  const navigate = useNavigate();


   const { loanId } = useParams<{ loanId: string }>();

  /* ------------------------- loan fetch ------------------------- */

  const { data, status, error, refetch } = useFetch(
    (signal) => loanService.getLoanById(loanId, signal),
    [loanId]
  );

  /* ------------------------- payment state ---------------------- */

  const [amountInput, setAmountInput] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [successLoan, setSuccessLoan] = useState<LoanDetails | null>(null);

  /* ------------------------- derived values --------------------- */

  const financials: LoanFinancials | null = useMemo(() => {
    const source = successLoan ?? data;
    return source ? toLoanFinancials(source) : null;
  }, [data, successLoan]);

  const remaining = financials?.outstandingAmount ?? 0;
  const isFullyPaid = remaining <= 0;

  const validation: PaymentValidation = useMemo(
    () => validatePayment(amountInput, remaining),
    [amountInput, remaining]
  );

  const snapshot: PaymentSnapshot = useMemo(
    () =>
      buildPaymentSnapshot(
        financials?.totalLoanAmount ?? 0,
        financials?.alreadyPaid ?? 0,
        validation.ok ? validation.amount : 0
      ),
    [financials, validation]
  );

  const quickAmounts = useMemo(
    () => buildQuickAmounts(remaining),
    [remaining]
  );

  const hasInput = amountInput.trim() !== "";
  const canPay = validation.ok && !isFullyPaid && !submitting;

  /* ------------------------- handlers --------------------------- */

  function handleAmountChange(raw: string) {
    // Keep the field clean: digits + a single decimal point.
    const cleaned = raw.replace(/[^\d.]/g, "");
    const [whole, ...rest] = cleaned.split(".");
    const normalized =
      rest.length > 0 ? `${whole}.${rest.join("")}` : cleaned;
    setAmountInput(normalized);
  }

  function handleQuickAmount(amount: number) {
    setAmountInput(String(amount));
  }

  function handlePayFull() {
    setAmountInput(String(remaining));
  }

  function openConfirmation() {
    if (!validation.ok) return;
    setSubmitError(null);
    setConfirmOpen(true);
  }

  async function handleConfirmPayment() {
    if (!validation.ok || submitting) return;

    setSubmitting(true);
    setSubmitError(null);

    try {
      const response: LoanPaymentResponse = await loanService.payLoan(loanId, {
        amount: validation.amount,
      });
      setSuccessLoan(response);
      setConfirmOpen(false);
    } catch (err) {
      const apiError: ApiErrorShape = toApiError(err);
      setSubmitError(apiError.message);
    } finally {
      setSubmitting(false);
    }
  }

  function handleDone() {
    if (onDone) {
      onDone();
    } else {
      navigate("/portal/loans");
    }
  }

  /* ------------------------- render states ---------------------- */

  if (status === "loading") {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-navy-900" />
          <p className="text-sm text-slate-500">Loading loan details…</p>
        </div>
      </div>
    );
  }

  if (status === "error" || !financials) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <h2 className="mt-4 font-display text-lg font-semibold text-navy-900">
            Couldn't load this loan
          </h2>
          <p className="mt-1.5 text-sm text-slate-500">
            {error?.message ??
              "The loan could not be found or is no longer available."}
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <button
              type="button"
              onClick={() => navigate("/portal/loans")}
              className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-navy-900 transition hover:bg-slate-50"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to loans
            </button>
            <button
              type="button"
              onClick={refetch}
              className="inline-flex h-10 items-center gap-2 rounded-xl bg-navy-900 px-4 text-sm font-semibold text-white transition hover:bg-navy-800"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ------------------------- success state ---------------------- */

  if (successLoan) {
    const paidAmount = Number(successLoan.amount_paid ?? validation.amount);
    const newRemaining = financials.outstandingAmount;
    const progress = financials.totalLoanAmount
      ? (financials.alreadyPaid / financials.totalLoanAmount) * 100
      : 0;

    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto max-w-lg"
      >
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_12px_40px_rgba(15,23,42,0.06)]">
          <div className="bg-navy-900 px-6 py-8 text-center text-white">
            <motion.div
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 18 }}
              className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20"
            >
              <BadgeCheck className="h-9 w-9 text-emerald-400" strokeWidth={2.2} />
            </motion.div>

            <h1 className="mt-4 font-display text-2xl font-semibold tracking-tight">
              Payment successful
            </h1>

            <p className="mt-1.5 text-sm text-slate-400">
              {financials.outstandingAmount <= 0
                ? "Your loan is now fully paid. Congratulations!"
                : "Your payment has been applied to your loan."}
            </p>
          </div>

          <div className="space-y-5 p-6">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-center">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                Amount paid
              </p>
              <p className="mt-1 font-display text-3xl font-semibold tracking-tight text-navy-900">
                {formatMoney(paidAmount)}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                  Remaining balance
                </p>
                <p className="mt-1 font-mono-num text-lg font-semibold text-navy-900">
                  {formatMoney(newRemaining)}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                  Repayment progress
                </p>
                <p className="mt-1 font-mono-num text-lg font-semibold text-accent-teal">
                  {formatPercentLabel(progress)}
                </p>
              </div>
            </div>

            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
              <motion.div
                className="h-full rounded-full bg-accent-teal"
                initial={{ width: 0 }}
                animate={{ width: `${Math.max(0, Math.min(100, progress))}%` }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              />
            </div>

            <button
              type="button"
              onClick={handleDone}
              className="group flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-navy-900 text-sm font-semibold text-white shadow-sm transition hover:bg-navy-800"
            >
              Done
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  /* ------------------------- main payment UI -------------------- */

  const statusKey = String(financials.status ?? "").toUpperCase();
  const statusConfig = STATUS_CONFIG[statusKey] ?? {
    tone: "neutral" as const,
    icon: Clock,
  };
  const StatusIcon = statusConfig.icon;
  const toneClass = TONE_CLASSES[statusConfig.tone];

  return (
    <div className="space-y-6">
      {/* =========================================================
          HEADER
      ========================================================== */}

      <div>
        <button
          type="button"
          onClick={() => navigate("/portal/loans")}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 transition hover:text-navy-900"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to loans
        </button>

        <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-navy-900 text-white shadow-sm">
              <Banknote className="h-5 w-5" strokeWidth={2} />
            </div>

            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-accent-teal">
                Loan repayment
              </p>

              <h1 className="font-display text-2xl font-semibold tracking-tight text-navy-900">
                Pay Loan
              </h1>

              <p className="mt-0.5 text-xs text-slate-500">
                {financials.loanType ?? "Loan"} ·{" "}
                <span className="font-mono text-[10px]">
                  {financials.id.slice(0, 8).toUpperCase()}
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold ${toneClass}`}
            >
              <StatusIcon className="h-3.5 w-3.5" />
              {financials.status ?? "—"}
            </span>

            <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600">
              <CreditCard className="h-3.5 w-3.5" />
              EMI {formatMoney(financials.monthlyEmi)}
            </span>
          </div>
        </div>
      </div>

      {/* =========================================================
          CONTENT GRID
      ========================================================== */}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        {/* ---------------------- LOAN OVERVIEW ------------------- */}

        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="h-fit rounded-2xl border border-slate-200 bg-white p-5 sm:p-6"
        >
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-navy-900">
              Loan overview
            </p>

            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
              <Sparkles className="h-4 w-4" />
            </span>
          </div>

          <div className="mt-5 space-y-4">
            <OverviewStat
              label="Original loan"
              value={formatMoney(financials.totalLoanAmount)}
              strong
            />

            <OverviewStat
              label="Paid"
              value={formatMoney(financials.alreadyPaid)}
              accent
            />

            <OverviewStat
              label="Remaining"
              value={formatMoney(remaining)}
            />
          </div>

          {/* PROGRESS */}
          <div className="mt-6">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>Repayment progress</span>
              <span className="font-mono-num font-semibold text-navy-900">
                {formatPercentLabel(snapshot.progressBefore)}
              </span>
            </div>

            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-100">
              <motion.div
                className="h-full rounded-full bg-accent-teal"
                initial={false}
                animate={{
                  width: `${Math.max(0, Math.min(100, snapshot.progressBefore))}%`,
                }}
                transition={{ duration: 0.4 }}
              />
            </div>
          </div>

          {/* FULLY PAID BANNER */}
          {isFullyPaid && (
            <div className="mt-6 flex items-start gap-3 rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                <CheckCircle2 className="h-5 w-5" />
              </div>

              <div>
                <p className="text-sm font-semibold text-emerald-900">
                  Loan Fully Paid
                </p>
                <p className="mt-0.5 text-xs leading-5 text-emerald-800/70">
                  ₹0 remaining. There's nothing left to pay on this loan.
                </p>
              </div>
            </div>
          )}
        </motion.section>

        {/* ---------------------- PAYMENT CALCULATOR -------------- */}

        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-4"
        >
          <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
            <p className="text-sm font-semibold text-navy-900">
              How much do you want to pay?
            </p>

            <p className="mt-0.5 text-xs text-slate-500">
              {isFullyPaid
                ? "This loan has no remaining balance."
                : `You can pay any amount up to ${formatMoney(remaining)}.`}
            </p>

            {/* AMOUNT INPUT */}
            <div className="relative mt-4">
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-lg font-semibold text-slate-400">
                ₹
              </span>

              <input
                type="text"
                inputMode="decimal"
                autoComplete="off"
                disabled={isFullyPaid}
                value={amountInput}
                onChange={(event) => handleAmountChange(event.target.value)}
                placeholder="0"
                aria-label="Payment amount"
                className={`h-14 w-full rounded-xl border bg-slate-50 pl-10 pr-4 font-mono-num text-xl font-semibold text-navy-900 outline-none transition focus:bg-white focus:ring-4 ${
                  validation.ok
                    ? "border-slate-200 focus:border-navy-900 focus:ring-navy-900/5"
                    : hasInput
                      ? "border-red-200 focus:border-red-400 focus:ring-red-100"
                      : "border-slate-200 focus:border-navy-900 focus:ring-navy-900/5"
                } disabled:cursor-not-allowed disabled:opacity-50`}
              />
            </div>

            {/* INLINE VALIDATION ERROR */}
            <AnimatePresence>
              {hasInput && !validation.ok && validation.error && (
                <motion.p
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-2 flex items-start gap-1.5 overflow-hidden text-xs font-medium text-red-600"
                >
                  <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  {validation.error}
                </motion.p>
              )}
            </AnimatePresence>

            {/* QUICK AMOUNTS */}
            {!isFullyPaid && (
              <div className="mt-4 flex flex-wrap gap-2">
                {quickAmounts.map((amount) => (
                  <button
                    key={amount}
                    type="button"
                    onClick={() => handleQuickAmount(amount)}
                    className="rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-navy-900 hover:bg-navy-900 hover:text-white"
                  >
                    {formatMoney(amount)}
                  </button>
                ))}

                <button
                  type="button"
                  onClick={handlePayFull}
                  className="rounded-full border border-navy-900 bg-navy-900 px-3.5 py-1.5 text-xs font-semibold text-white transition hover:bg-navy-800"
                >
                  Pay Full
                </button>
              </div>
            )}

            {/* FULL PAYMENT SELECTED INDICATOR */}
            {hasInput && validation.ok && snapshot.isFullPayment && (
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 flex items-center gap-2 rounded-xl border border-emerald-100 bg-emerald-50 px-3.5 py-2.5 text-xs font-medium text-emerald-800"
              >
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                Full remaining balance selected —{" "}
                {formatMoney(snapshot.paymentAmount)}
              </motion.div>
            )}

            {/* CTA */}
            {!isFullyPaid && (
              <button
                type="button"
                disabled={!canPay}
                onClick={openConfirmation}
                className="group mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-navy-900 text-sm font-semibold text-white shadow-sm transition hover:bg-navy-800 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <IndianRupee className="h-4 w-4" />
                {validation.ok
                  ? `Pay ${formatMoney(validation.amount)}`
                  : "Enter an amount to continue"}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </button>
            )}
          </div>

          {/* LIVE SUMMARY */}
          {!isFullyPaid && (
            <LoanPaymentSummary
              totalLoanAmount={financials.totalLoanAmount}
              alreadyPaid={financials.alreadyPaid}
              remainingBeforePayment={remaining}
              snapshot={snapshot}
              hasInput={hasInput}
            />
          )}

          {/* TRUST STRIP */}
          <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-[10px] text-slate-500">
            <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-600" />
            Payments are secure and applied to your loan instantly.
          </div>
        </motion.section>
      </div>

      {/* =========================================================
          CONFIRMATION MODAL
      ========================================================== */}

      <AnimatePresence>
        {confirmOpen && validation.ok && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget && !submitting) {
                setConfirmOpen(false);
              }
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 12 }}
              transition={{ type: "spring", stiffness: 300, damping: 26 }}
              className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl"
            >
              {/* MODAL HEADER */}
              <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-accent-teal">
                    Review payment
                  </p>
                  <h2 className="mt-0.5 font-display text-lg font-semibold text-navy-900">
                    Confirm Loan Payment
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={() => setConfirmOpen(false)}
                  disabled={submitting}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition hover:bg-slate-50 hover:text-navy-900 disabled:opacity-40"
                  aria-label="Close confirmation"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* MODAL BODY */}
              <div className="space-y-5 px-6 py-5">
                <div className="rounded-2xl bg-navy-900 p-5 text-center text-white">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                    You're about to pay
                  </p>
                  <p className="mt-1 font-display text-3xl font-semibold tracking-tight">
                    {formatMoney(validation.amount)}
                  </p>
                </div>

                <div className="space-y-3">
                  <ConfirmRow
                    label="Loan remaining"
                    before={formatMoney(snapshot.remainingBeforePayment)}
                    after={formatMoney(snapshot.remainingAfterPayment)}
                  />

                  <ConfirmRow
                    label="Total paid"
                    before={formatMoney(snapshot.alreadyPaid)}
                    after={formatMoney(snapshot.totalPaidAfterPayment)}
                  />

                  <ConfirmRow
                    label="Repayment progress"
                    before={formatPercentLabel(snapshot.progressBefore)}
                    after={formatPercentLabel(snapshot.paymentPercentage)}
                  />
                </div>

                {submitError && (
                  <div className="flex items-start gap-2 rounded-xl border border-red-100 bg-red-50 p-3 text-xs text-red-700">
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                    {submitError}
                  </div>
                )}
              </div>

              {/* MODAL FOOTER */}
              <div className="flex gap-3 border-t border-slate-100 px-6 py-4">
                <button
                  type="button"
                  onClick={() => setConfirmOpen(false)}
                  disabled={submitting}
                  className="h-11 flex-1 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-navy-900 transition hover:bg-slate-50 disabled:opacity-40"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleConfirmPayment}
                  disabled={submitting}
                  className="flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-navy-900 text-sm font-semibold text-white shadow-sm transition hover:bg-navy-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Processing…
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="h-4 w-4" />
                      Confirm Payment
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* =========================================================
   OVERVIEW STAT
========================================================== */

function OverviewStat({
  label,
  value,
  strong = false,
  accent = false,
}: {
  label: string;
  value: string;
  strong?: boolean;
  accent?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-xs text-slate-500">{label}</span>

      <span
        className={`font-mono-num text-base ${
          strong
            ? "font-semibold text-navy-900"
            : accent
              ? "font-semibold text-accent-teal"
              : "font-medium text-slate-700"
        }`}
      >
        {value}
      </span>
    </div>
  );
}

/* =========================================================
   CONFIRM ROW
========================================================== */

function ConfirmRow({
  label,
  before,
  after,
}: {
  label: string;
  before: string;
  after: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
      <span className="text-xs text-slate-500">{label}</span>

      <div className="flex items-center gap-2 font-mono-num text-sm">
        <span className="text-slate-500 line-through decoration-slate-300">
          {before}
        </span>
        <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
        <span className="font-semibold text-navy-900">{after}</span>
      </div>
    </div>
  );
}