import { FormEvent, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  Banknote,
  Check,
  ChevronDown,
  CircleDollarSign,
  CreditCard,
  Info,
  Landmark,
  ShieldCheck,
  Sparkles,
  WalletCards,
  X,
} from "lucide-react";
import { api } from "../../api/axios";
import { useNavigate } from "react-router-dom";

interface CreateAccountProps {
  onSuccess?: (account: unknown) => void;
  onClose?: () => void;
}

interface AccountPayload {
  account_number: string;
  account_type: string;
  balance: number;
  currency: string;
}

const ACCOUNT_TYPES = [
  {
    value: "SAVINGS",
    label: "Savings Account",
    description: "For everyday banking and personal savings.",
    icon: WalletCards,
  },
  {
    value: "CURRENT",
    label: "Current Account",
    description: "For frequent transactions and business banking.",
    icon: Landmark,
  },
  {
    value: "SALARY",
    label: "Salary Account",
    description: "Designed for salary credits and monthly income.",
    icon: CreditCard,
  },
];

const CURRENCIES = [
  {
    value: "INR",
    label: "Indian Rupee",
    symbol: "₹",
  },
  {
    value: "USD",
    label: "US Dollar",
    symbol: "$",
  },
  {
    value: "EUR",
    label: "Euro",
    symbol: "€",
  },
];

const formatCurrency = (
  value: number,
  currency = "INR",
) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value || 0);

export default function CreateAccount() {
  const [accountNumber, setAccountNumber] = useState("");
  const [accountType, setAccountType] = useState("SAVINGS");
  const [currency, setCurrency] = useState("INR");
  const [balance, setBalance] = useState("");

  const navigate=useNavigate()

  const [accountTypeOpen, setAccountTypeOpen] =
    useState(false);

  const [currencyOpen, setCurrencyOpen] =
    useState(false);

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [isSuccess, setIsSuccess] =
    useState(false);

  const [error, setError] = useState("");

  const balanceValue = Number(balance) || 0;

  const selectedAccountType = ACCOUNT_TYPES.find(
    (item) => item.value === accountType,
  );

  const selectedCurrency = CURRENCIES.find(
    (item) => item.value === currency,
  );

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    setError("");

    const trimmedAccountNumber =
      accountNumber.trim();

    if (!trimmedAccountNumber) {
      setError("Please enter an account number.");
      return;
    }

    if (trimmedAccountNumber.length > 50) {
      setError(
        "Account number cannot exceed 50 characters.",
      );
      return;
    }

    if (!accountType) {
      setError("Please select an account type.");
      return;
    }

    if (balanceValue < 0) {
      setError("Balance cannot be negative.");
      return;
    }

    if (!currency) {
      setError("Please select a currency.");
      return;
    }

    setIsSubmitting(true);

    const payload: AccountPayload = {
      account_number: trimmedAccountNumber,
      account_type: accountType,
      balance: balanceValue,
      currency,
    };

    try {
      const response = await api.post(
        "/portal/accounts",
        payload,
      );

      const data = response.data;

      setIsSuccess(true);

      navigate('/portal/accounts')

      
    } catch (submissionError: any) {
      setError(
        submissionError?.response?.data?.detail ||
          submissionError?.message ||
          "Something went wrong. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative w-full overflow-hidden rounded-2xl bg-slate-50">
      {/* =====================================================
          HEADER
      ===================================================== */}

      <motion.div
        initial={{
          opacity: 0,
          y: -8,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        className="flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4 sm:px-6"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-navy-900 text-white shadow-sm">
            <Landmark
              size={17}
              strokeWidth={2}
            />
          </div>

          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-accent-teal">
              FINPILOT AI
            </p>

            <h2 className="font-display text-lg font-semibold tracking-tight text-navy-900">
              Create account
            </h2>

            <p className="hidden text-xs text-slate-500 sm:block">
              Add a new financial account to your profile.
            </p>
          </div>
        </div>

        
          <button
            type="button"
            onClick={()=>{
                navigate('/portal/accounts')
            }}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:border-slate-300 hover:bg-slate-50 hover:text-navy-900"
            aria-label="Close"
          >
            <X size={17} />
          </button>
      </motion.div>

      {/* =====================================================
          TRUST STRIP
      ===================================================== */}

      <motion.div
        initial={{
          opacity: 0,
          y: 8,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          delay: 0.05,
        }}
        className="grid grid-cols-1 gap-px border-b border-slate-200 bg-slate-200 sm:grid-cols-3"
      >
        <TrustItem
          icon={ShieldCheck}
          title="Secure account"
          text="Protected financial record"
        />

        <TrustItem
          icon={Banknote}
          title="Structured data"
          text="Clean account information"
        />

        <TrustItem
          icon={Sparkles}
          title="AI ready"
          text="Available for financial insights"
        />
      </motion.div>

      {/* =====================================================
          MAIN CONTENT
      ===================================================== */}

      <div className="grid max-h-[calc(100vh-180px)] overflow-y-auto lg:grid-cols-[1fr_330px]">
        {/* ===================================================
            FORM
        =================================================== */}

        <motion.form
          onSubmit={handleSubmit}
          initial={{
            opacity: 0,
            y: 12,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            delay: 0.08,
          }}
          className="space-y-6 bg-white p-5 sm:p-6"
        >
          {/* =================================================
              ACCOUNT NUMBER
          ================================================= */}

          <section>
            <div className="mb-2">
              <label
                htmlFor="accountNumber"
                className="text-sm font-semibold text-navy-900"
              >
                Account number
              </label>

              <p className="mt-0.5 text-xs text-slate-500">
                Enter the account number associated with
                this financial account.
              </p>
            </div>

            <div className="relative">
              <Landmark
                size={15}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                id="accountNumber"
                type="text"
                maxLength={50}
                value={accountNumber}
                onChange={(event) =>
                  setAccountNumber(event.target.value)
                }
                placeholder="e.g. 123456789012"
                className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-4 font-mono text-sm font-medium text-navy-900 outline-none transition focus:border-navy-900 focus:bg-white focus:ring-4 focus:ring-navy-900/5"
              />
            </div>

            <p className="mt-1.5 text-right text-[9px] text-slate-400">
              {accountNumber.length}/50
            </p>
          </section>

          {/* =================================================
              ACCOUNT TYPE
          ================================================= */}

          <section>
            <div className="mb-3">
              <label className="text-sm font-semibold text-navy-900">
                Account type
              </label>

              <p className="mt-0.5 text-xs text-slate-500">
                Select the type of account you want to create.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
              {ACCOUNT_TYPES.map((type) => {
                const Icon = type.icon;
                const active =
                  accountType === type.value;

                return (
                  <motion.button
                    key={type.value}
                    type="button"
                    whileHover={{ y: -1 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() =>
                      setAccountType(type.value)
                    }
                    className={`relative rounded-xl border p-3 text-left transition-all ${
                      active
                        ? "border-navy-900 bg-navy-900 text-white shadow-md"
                        : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    {active && (
                      <span className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-white text-navy-900">
                        <Check
                          size={11}
                          strokeWidth={3}
                        />
                      </span>
                    )}

                    <span
                      className={`mb-2 flex h-8 w-8 items-center justify-center rounded-lg ${
                        active
                          ? "bg-white/10 text-white"
                          : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      <Icon size={16} />
                    </span>

                    <p className="text-xs font-semibold">
                      {type.label}
                    </p>

                    <p
                      className={`mt-1 text-[10px] leading-4 ${
                        active
                          ? "text-slate-300"
                          : "text-slate-500"
                      }`}
                    >
                      {type.description}
                    </p>
                  </motion.button>
                );
              })}
            </div>
          </section>

          {/* =================================================
              BALANCE + CURRENCY
          ================================================= */}

          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* BALANCE */}

            <div>
              <label
                htmlFor="balance"
                className="mb-2 block text-sm font-semibold text-navy-900"
              >
                Opening balance
              </label>

              <div className="relative">
                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-400">
                  {selectedCurrency?.symbol ?? "₹"}
                </span>

                <input
                  id="balance"
                  type="number"
                  min="0"
                  step="0.01"
                  value={balance}
                  onChange={(event) =>
                    setBalance(event.target.value)
                  }
                  placeholder="25,000"
                  className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm font-semibold text-navy-900 outline-none transition focus:border-navy-900 focus:bg-white focus:ring-4 focus:ring-navy-900/5"
                />
              </div>
            </div>

            {/* CURRENCY */}

            <div>
              <label className="mb-2 block text-sm font-semibold text-navy-900">
                Currency
              </label>

              <div className="relative">
                <button
                  type="button"
                  onClick={() =>
                    setCurrencyOpen(
                      (previous) => !previous,
                    )
                  }
                  className="flex h-11 w-full items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 text-left text-sm font-medium text-navy-900 outline-none transition hover:border-slate-300 focus:border-navy-900 focus:bg-white focus:ring-4 focus:ring-navy-900/5"
                >
                  <span>
                    {selectedCurrency?.symbol}{" "}
                    {selectedCurrency?.value}
                  </span>

                  <ChevronDown
                    size={15}
                    className={`text-slate-400 transition-transform ${
                      currencyOpen
                        ? "rotate-180"
                        : ""
                    }`}
                  />
                </button>

                {currencyOpen && (
                  <div className="absolute z-30 mt-2 w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
                    {CURRENCIES.map((item) => {
                      const selected =
                        currency === item.value;

                      return (
                        <button
                          key={item.value}
                          type="button"
                          onClick={() => {
                            setCurrency(item.value);
                            setCurrencyOpen(false);
                          }}
                          className={`flex w-full items-center gap-3 px-3 py-2.5 text-left transition ${
                            selected
                              ? "bg-slate-50"
                              : "hover:bg-slate-50"
                          }`}
                        >
                          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-xs font-semibold text-slate-700">
                            {item.symbol}
                          </span>

                          <span className="flex-1">
                            <span className="block text-xs font-semibold text-navy-900">
                              {item.value}
                            </span>

                            <span className="block text-[10px] text-slate-400">
                              {item.label}
                            </span>
                          </span>

                          {selected && (
                            <Check
                              size={14}
                              className="text-emerald-500"
                            />
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* =================================================
              ERROR
          ================================================= */}

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{
                  opacity: 0,
                  height: 0,
                }}
                animate={{
                  opacity: 1,
                  height: "auto",
                }}
                exit={{
                  opacity: 0,
                  height: 0,
                }}
                className="flex items-start gap-2 overflow-hidden rounded-xl border border-red-100 bg-red-50 p-3 text-xs text-red-700"
              >
                <Info
                  size={15}
                  className="mt-0.5 shrink-0"
                />

                <span>{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* =================================================
              SUBMIT
          ================================================= */}

          <div className="flex flex-col gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2 text-[10px] text-slate-500">
              <ShieldIcon />
              Secure account record
            </div>

            <motion.button
              type="submit"
              disabled={
                isSubmitting || isSuccess
              }
              whileHover={
                !isSubmitting
                  ? { scale: 1.01 }
                  : undefined
              }
              whileTap={
                !isSubmitting
                  ? { scale: 0.98 }
                  : undefined
              }
              className="group flex h-11 items-center justify-center gap-2 rounded-xl bg-navy-900 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-navy-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSuccess ? (
                <>
                  <Check size={16} />
                  Account created
                </>
              ) : isSubmitting ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Creating...
                </>
              ) : (
                <>
                  Create account

                  <ArrowRight
                    size={16}
                    className="transition-transform group-hover:translate-x-0.5"
                  />
                </>
              )}
            </motion.button>
          </div>
        </motion.form>

        {/* ===================================================
            SUMMARY
        =================================================== */}

        <motion.aside
          initial={{
            opacity: 0,
            x: 12,
          }}
          animate={{
            opacity: 1,
            x: 0,
          }}
          transition={{
            delay: 0.1,
          }}
          className="border-l border-slate-200 bg-slate-50 p-5 sm:p-6"
        >
          <div className="sticky top-0">
            {/* SUMMARY HEADER */}

            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-400">
                  Account preview
                </p>

                <p className="mt-1 text-sm font-semibold text-navy-900">
                  {selectedAccountType?.label ||
                    "Account"}
                </p>
              </div>

              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-navy-900 text-white">
                {selectedAccountType ? (
                  <selectedAccountType.icon size={16} />
                ) : (
                  <Banknote size={16} />
                )}
              </div>
            </div>

            {/* BALANCE CARD */}

            <div className="rounded-2xl bg-navy-900 p-5 text-white shadow-lg shadow-navy-900/10">
              <p className="text-[10px] uppercase tracking-wider text-white/60">
                Opening balance
              </p>

              <motion.p
                key={`${balanceValue}-${currency}`}
                initial={{
                  opacity: 0,
                  y: 5,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                className="mt-2 text-2xl font-semibold tracking-tight"
              >
                {formatCurrency(
                  balanceValue,
                  currency,
                )}
              </motion.p>

              <p className="mt-1 text-[10px] text-white/60">
                {selectedAccountType?.label ||
                  "Account"}{" "}
                · {currency}
              </p>
            </div>

            {/* BREAKDOWN */}

            <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
              <p className="mb-3 text-xs font-semibold text-navy-900">
                Account details
              </p>

              <div className="space-y-3">
                <SummaryRow
                  label="Type"
                  value={
                    selectedAccountType?.label ||
                    "—"
                  }
                />

                <SummaryRow
                  label="Currency"
                  value={currency}
                />

                <SummaryRow
                  label="Balance"
                  value={formatCurrency(
                    balanceValue,
                    currency,
                  )}
                />

                <div className="h-px bg-slate-100" />

                <SummaryRow
                  label="Account number"
                  value={
                    accountNumber
                      ? accountNumber.length > 12
                        ? `${accountNumber.slice(
                            0,
                            8,
                          )}...`
                        : accountNumber
                      : "—"
                  }
                  strong
                />
              </div>
            </div>

            {/* SMART INSIGHT */}

            <div className="mt-4 rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
              <div className="flex gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                  <Sparkles size={14} />
                </div>

                <div>
                  <p className="text-xs font-semibold text-emerald-900">
                    FinPilot insight
                  </p>

                  <p className="mt-1 text-[10px] leading-4 text-emerald-800/70">
                    This account can later be used
                    for transaction analysis, spending
                    patterns and AI-powered financial
                    insights.
                  </p>
                </div>
              </div>
            </div>

            {/* ACCOUNT */}

            <div className="mt-4 flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3.5">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600">
                <WalletCards size={15} />
              </div>

              <div className="min-w-0">
                <p className="text-[11px] font-semibold text-navy-900">
                  Account number
                </p>

                <p className="mt-0.5 truncate font-mono text-[9px] text-slate-400">
                  {accountNumber ||
                    "No account number"}
                </p>
              </div>

              {accountNumber && (
                <Check
                  size={15}
                  className="ml-auto shrink-0 text-emerald-500"
                />
              )}
            </div>

            {/* DISCLAIMER */}

            <p className="mt-4 text-[9px] leading-4 text-slate-400">
              Account records are stored against your
              financial profile and may be used for
              financial analytics and AI-powered
              insights.
            </p>
          </div>
        </motion.aside>
      </div>
    </div>
  );
}

/* =====================================================
   TRUST ITEM
===================================================== */

function TrustItem({
  icon: Icon,
  title,
  text,
}: {
  icon: typeof CreditCard;
  title: string;
  text: string;
}) {
  return (
    <div className="flex items-center gap-2.5 bg-white px-4 py-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
        <Icon size={15} />
      </div>

      <div>
        <p className="text-[11px] font-semibold text-navy-900">
          {title}
        </p>

        <p className="text-[9px] text-slate-500">
          {text}
        </p>
      </div>
    </div>
  );
}

/* =====================================================
   SUMMARY ROW
===================================================== */

function SummaryRow({
  label,
  value,
  strong = false,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-xs text-slate-500">
        {label}
      </span>

      <span
        className={`max-w-[180px] truncate text-right text-xs ${
          strong
            ? "font-semibold text-navy-900"
            : "font-medium text-slate-700"
        }`}
      >
        {value}
      </span>
    </div>
  );
}

/* =====================================================
   SECURITY ICON
===================================================== */

function ShieldIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-emerald-600"
      aria-hidden="true"
    >
      <path d="M12 3l7 4v5c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V7l7-4z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}