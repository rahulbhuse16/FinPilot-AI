/**
 * Pure loan-payment math helpers — no React, no API calls.
 *
 * All money values are carried as JS numbers but every calculation is
 * defensively rounded to 2 decimal places (rupees/paise) to avoid
 * floating-point drift. UI components must never re-derive these numbers.
 */

export const CURRENCY_EPSILON = 0.0049;

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

/** Raw loan shape returned by the backend (decimals may arrive as strings). */
export interface LoanDetails {
  id: string;
  loan_type?: string | null;
  principal_amount?: number | string | null;
  outstanding_amount?: number | string | null;
  interest_rate?: number | string | null;
  monthly_emi?: number | string | null;
  status?: string | null;
  [key: string]: unknown;
}

/** Normalized numeric loan financials used by the payment UI. */
export interface LoanFinancials {
  id: string;
  loanType: string | null;
  totalLoanAmount: number;
  outstandingAmount: number;
  alreadyPaid: number;
  interestRate: number;
  monthlyEmi: number;
  status: string | null;
}

export interface LoanPaymentRequest {
  /** Amount to pay, in rupees (max 2 decimals). */
  amount: number;
}

export interface LoanPaymentResponse extends LoanDetails {
  amount_paid?: number | string | null;
}

export interface PaymentValidation {
  ok: boolean;
  /** Parsed & clamped amount (0 when invalid). */
  amount: number;
  error?: string;
}

export interface PaymentSnapshot {
  totalLoanAmount: number;
  alreadyPaid: number;
  remainingBeforePayment: number;
  paymentAmount: number;
  remainingAfterPayment: number;
  totalPaidAfterPayment: number;
  /** Repayment progress after this payment (0–100). */
  paymentPercentage: number;
  /** Repayment progress before this payment (0–100). */
  progressBefore: number;
  isFullPayment: boolean;
  isFullyPaidAfter: boolean;
}

/* ------------------------------------------------------------------ */
/* Currency-safe helpers                                              */
/* ------------------------------------------------------------------ */

/** Rounds a float to 2 decimals (rupees → paise precision). */
export function toRupee(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function moneyToPaise(value: number): number {
  return Math.round(toRupee(value) * 100);
}

/**
 * Parses a user-typed amount ("₹25,000.50", "25 000") into rupees.
 * Returns `null` when the string is not a positive number with at most
 * two decimal places.
 */
export function parsePaymentAmount(raw: string): number | null {
  const cleaned = raw.trim().replace(/[₹,\s]/g, "");

  if (cleaned === "" || cleaned === ".") return null;

  const value = Number(cleaned);
  if (!Number.isFinite(value) || value < 0) return null;

  const decimals = cleaned.split(".")[1]?.length ?? 0;
  if (decimals > 2) return null;

  return toRupee(value);
}

/** Validates and parses a payment amount against the remaining balance. */
export function validatePayment(
  raw: string,
  remainingBalance: number
): PaymentValidation {
  if (remainingBalance <= 0) {
    return {
      ok: false,
      amount: 0,
      error: "This loan has already been fully paid.",
    };
  }

  if (raw.trim() === "") {
    return {
      ok: false,
      amount: 0,
      error: "Enter the amount you would like to pay.",
    };
  }

  const amount = parsePaymentAmount(raw);

  if (amount === null) {
    return {
      ok: false,
      amount: 0,
      error: "Enter a valid amount using numbers with up to 2 decimal places.",
    };
  }

  if (amount <= 0) {
    return {
      ok: false,
      amount: 0,
      error: "Payment amount must be greater than zero.",
    };
  }

  if (amount - remainingBalance > CURRENCY_EPSILON) {
    return {
      ok: false,
      amount,
      error: `Payment cannot exceed your remaining balance of ${formatMoney(remainingBalance)}.`,
    };
  }

  return { ok: true, amount: Math.min(amount, remainingBalance) };
}

/* ------------------------------------------------------------------ */
/* Core calculations                                                  */
/* ------------------------------------------------------------------ */

/** remainingBefore = max(0, total - alreadyPaid) */
export function calculateRemainingBalance(
  totalLoanAmount: number,
  alreadyPaid: number
): number {
  return Math.max(0, toRupee(totalLoanAmount - alreadyPaid));
}

/** totalPaidAfter = alreadyPaid + paymentAmount */
export function calculateTotalPaid(
  alreadyPaid: number,
  paymentAmount: number
): number {
  return toRupee(alreadyPaid + paymentAmount);
}

/** (totalPaid / total) × 100, clamped to 0–100. */
export function calculatePaymentPercentage(
  totalPaid: number,
  totalLoanAmount: number
): number {
  if (totalLoanAmount <= 0) return 0;
  return Math.max(
    0,
    Math.min(100, (totalPaid / totalLoanAmount) * 100)
  );
}

/**
 * Builds a full projection from an already-parsed payment amount.
 * The payment is clamped to the remaining balance so the resulting
 * snapshot never shows a negative balance.
 */
export function buildPaymentSnapshot(
  totalLoanAmount: number,
  alreadyPaid: number,
  paymentAmount = 0
): PaymentSnapshot {
  const remainingBefore = calculateRemainingBalance(totalLoanAmount, alreadyPaid);
  const clampedPayment = Math.max(
    0,
    Math.min(toRupee(paymentAmount), remainingBefore)
  );
  const remainingAfter = calculateRemainingBalance(
    remainingBefore,
    clampedPayment
  );
  const totalPaidAfter = calculateTotalPaid(alreadyPaid, clampedPayment);

  return {
    totalLoanAmount,
    alreadyPaid,
    remainingBeforePayment: remainingBefore,
    paymentAmount: clampedPayment,
    remainingAfterPayment: remainingAfter,
    totalPaidAfterPayment: totalPaidAfter,
    paymentPercentage: calculatePaymentPercentage(
      totalPaidAfter,
      totalLoanAmount
    ),
    progressBefore: calculatePaymentPercentage(
      alreadyPaid,
      totalLoanAmount
    ),
    isFullPayment:
      clampedPayment > 0 &&
      clampedPayment >= remainingBefore - CURRENCY_EPSILON,
    isFullyPaidAfter: remainingAfter <= CURRENCY_EPSILON,
  };
}

/**
 * Normalizes a raw backend loan row into safe numeric financials.
 * Defensive about Decimal-stored-as-string responses and missing data.
 */
export function toLoanFinancials(loan: LoanDetails): LoanFinancials {
  const totalLoanAmount = Math.max(0, toNumber(loan.principal_amount));
  const outstanding = Math.max(
    0,
    Math.min(totalLoanAmount, toNumber(loan.outstanding_amount))
  );

  return {
    id: String(loan.id),
    loanType: loan.loan_type ?? null,
    totalLoanAmount,
    outstandingAmount: toRupee(outstanding),
    alreadyPaid: toRupee(totalLoanAmount - outstanding),
    interestRate: toNumber(loan.interest_rate),
    monthlyEmi: toNumber(loan.monthly_emi),
    status: loan.status ?? null,
  };
}

/* ------------------------------------------------------------------ */
/* Formatting / quick amounts                                         */
/* ------------------------------------------------------------------ */

/** INR formatting that keeps up to 2 decimals when values have paise. */
export function formatMoney(value: number): string {
  const rounded = toRupee(value);
  const hasFractional = Math.abs(rounded - Math.trunc(rounded)) >= 0.005;

  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: hasFractional ? 2 : 0,
      maximumFractionDigits: 2,
    }).format(rounded);
  } catch {
    return `₹${rounded.toLocaleString("en-IN", {
      maximumFractionDigits: 2,
    })}`;
  }
}

export function formatPercentLabel(value: number, digits = 0): string {
  return `${value.toFixed(digits)}%`;
}

/**
 * Generates quick-select amounts (10 / 25 / 50 / 75% of remaining).
 * Values are unique, non-zero integers, never exceeding the balance.
 */
export function buildQuickAmounts(remainingBalance: number): number[] {
  if (remainingBalance <= 0) return [];

  const ratios = [0.1, 0.25, 0.5, 0.75];
  const amounts = ratios.map((ratio) =>
    Math.max(1, Math.round(toRupee(remainingBalance * ratio)))
  );

  return Array.from(new Set(amounts)).map((amount) =>
    Math.min(toRupee(amount), remainingBalance)
  );
}

/* ------------------------------------------------------------------ */
/* Private                                                             */
/* ------------------------------------------------------------------ */

function toNumber(
  value: number | string | null | undefined,
  fallback = 0
): number {
  if (value === null || value === undefined || value === "") return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}
