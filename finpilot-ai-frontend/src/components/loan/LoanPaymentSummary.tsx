import { motion } from "framer-motion";
import { ArrowDownRight, CheckCircle2, IndianRupee, TrendingUp } from "lucide-react";
import type { PaymentSnapshot } from "../../utils/loanPayment";
import { formatMoney, formatPercentLabel } from "../../utils/loanPayment";

interface LoanPaymentSummaryProps {
  /** Normalized loan financials (already computed by the caller). */
  totalLoanAmount: number;
  alreadyPaid: number;
  remainingBeforePayment: number;
  /** Live projection for the current input (0 when empty/invalid). */
  snapshot: PaymentSnapshot;
  /** True when the user has typed an amount (even if invalid). */
  hasInput: boolean;
}

/**
 * Presentational payment summary — receives pre-computed values through
 * props and renders the progress visualization + live breakdown.
 * Contains no state, no API calls, and no business logic.
 */
export function LoanPaymentSummary({
  totalLoanAmount,
  alreadyPaid,
  remainingBeforePayment,
  snapshot,
  hasInput,
}: LoanPaymentSummaryProps) {
  const progress = snapshot.paymentPercentage;
  const progressBefore = snapshot.progressBefore;
  const isFullyPaid = snapshot.isFullyPaidAfter;
  const hasValidPayment = hasInput && snapshot.paymentAmount > 0;

  return (
    <div className="space-y-4">
      {/* =====================================================
          PROGRESS CARD
      ====================================================== */}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="bg-navy-900 p-5 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                Repayment progress
              </p>

              <motion.p
                key={Math.round(progress)}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-1.5 font-display text-3xl font-semibold tracking-tight"
              >
                {formatPercentLabel(progress)}
              </motion.p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10">
              <TrendingUp className="h-5 w-5" strokeWidth={2} />
            </div>
          </div>

          {/* PROGRESS BAR */}
          <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-white/10">
            <motion.div
              className="h-full rounded-full bg-accent-teal transition-all duration-500"
              initial={false}
              animate={{ width: `${Math.max(0, Math.min(100, progress))}%` }}
            />
          </div>

          <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400">
            <span>
              {formatMoney(alreadyPaid)} paid
            </span>
            <span>
              {formatMoney(remainingBeforePayment)} left
            </span>
          </div>
        </div>

        {/* PAID / TOTAL STRIP */}
        <div className="flex items-center justify-between border-t border-slate-100 px-5 py-3.5">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <IndianRupee className="h-3.5 w-3.5 text-accent-teal" />
            <span>You'll have paid</span>
          </div>

          <p className="font-mono-num text-sm font-semibold text-navy-900">
            {formatMoney(snapshot.totalPaidAfterPayment)}
            <span className="font-normal text-slate-400">
              {" "}
              / {formatMoney(totalLoanAmount)}
            </span>
          </p>
        </div>
      </div>

      {/* =====================================================
          LIVE CALCULATION
      ====================================================== */}

      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <p className="text-xs font-semibold text-navy-900">
          Payment breakdown
        </p>

        <div className="mt-4 space-y-3">
          <BreakdownRow
            label="Current remaining"
            value={formatMoney(remainingBeforePayment)}
          />

          <BreakdownRow
            label="Payment"
            value={hasValidPayment ? formatMoney(snapshot.paymentAmount) : "—"}
            accent={hasValidPayment}
          />

          <div className="h-px bg-slate-100" />

          <BreakdownRow
            label="Remaining after payment"
            value={
              hasValidPayment
                ? formatMoney(snapshot.remainingAfterPayment)
                : formatMoney(remainingBeforePayment)
            }
            strong
          />
        </div>

        {/* FULL PAYMENT / FULLY PAID INDICATOR */}
        {hasValidPayment && snapshot.isFullPayment && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 flex items-center gap-2 rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-2.5 text-xs font-medium text-emerald-800"
          >
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
            {isFullyPaid
              ? "This payment clears your entire loan balance."
              : "This is the full remaining balance."}
          </motion.div>
        )}

        {hasValidPayment && !snapshot.isFullPayment && (
          <div className="mt-4 flex items-center gap-2 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2.5 text-xs text-slate-500">
            <ArrowDownRight className="h-4 w-4 shrink-0 text-accent-teal" />
            Progress moves from{" "}
            <span className="font-semibold text-navy-900">
              {formatPercentLabel(progressBefore)}
            </span>{" "}
            to{" "}
            <span className="font-semibold text-navy-900">
              {formatPercentLabel(progress)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

/* =====================================================
   BREAKDOWN ROW
===================================================== */

function BreakdownRow({
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
        className={`font-mono-num text-sm ${
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