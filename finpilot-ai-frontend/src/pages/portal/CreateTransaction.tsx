import { FormEvent, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  Banknote,
  BriefcaseBusiness,
  Check,
  ChevronDown,
  CircleDollarSign,
  CreditCard,
  FileText,
  Info,
  Landmark,
  Receipt,
  ShoppingBag,
  Sparkles,
  Store,
  WalletCards,
  X,
  Zap,
} from "lucide-react";
import { api } from "../../api/axios";
import { useFetch } from "../../hooks/useFetch";
import { portalApi } from "../../api/portal.api";
import { useNavigate } from "react-router-dom";
import { AxiosError } from "axios";

type TransactionType =
  | "CREDIT"
  | "DEBIT"
  | "TRANSFER";

interface CreateTransactionProps {
  accountId: string;
  onSuccess?: (transaction: unknown) => void;
  onClose?: () => void;
  apiUrl?: string;
}

interface TransactionPayload {
  account_id: string;
  amount: number;
  transaction_type: string;
  category?: string | null;
  merchant?: string | null;
  description?: string | null;
  transaction_time: string;
}

const TRANSACTION_TYPES = [
  {
    value: "DEBIT",
    label: "Debit",
    description: "Money spent or paid from account",
    icon: ShoppingBag,
  },
  
  {
    value: "TRANSFER",
    label: "Transfer",
    description: "Move money between accounts",
    icon: Zap,
  },
];

const CATEGORIES = [
  "Food & Dining",
  "Shopping",
  "Bills & Utilities",
  "Travel",
  "Entertainment",
  "Healthcare",
  "Education",
  "Salary",
  "Investment",
  "Rent",
  "EMI",
  "Transfer",
  "Other",
];

const MERCHANT_SUGGESTIONS = [
  "Amazon",
  "Flipkart",
  "Swiggy",
  "Zomato",
  "Uber",
  "Netflix",
  "Reliance",
];

const formatINR = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value || 0);

export default function CreateTransaction({
  onSuccess,
  onClose,
  apiUrl = "/api/v1/transactions",
}: CreateTransactionProps) {


    const { data} = useFetch((signal) => portalApi.accounts(signal), []);
  
  const [amount, setAmount] = useState("");
  const [transactionType, setTransactionType] =
    useState<TransactionType>("DEBIT");

  const [accountOpen, setAccountOpen] = useState(false);
  const[accountId,setAccountId]=useState("")

  const [category, setCategory] = useState("");
  const [merchant, setMerchant] = useState("");
  const [description, setDescription] = useState("");

  const [transactionTime, setTransactionTime] = useState(() => {
    const now = new Date();

    const offset = now.getTimezoneOffset();
    const localDate = new Date(
      now.getTime() - offset * 60 * 1000,
    );

    return localDate.toISOString().slice(0, 16);
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");
  const navigate=useNavigate()

  const amountValue = Number(amount) || 0;

  const selectedType = TRANSACTION_TYPES.find(
    (type) => type.value === transactionType,
  );

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    setError("");

    if (!accountId) {
      setError(
        "Account information is required to create a transaction.",
      );
      return;
    }

    if (amountValue <= 0) {
      setError("Please enter a valid transaction amount.");
      return;
    }

    if (!transactionType) {
      setError("Please select a transaction type.");
      return;
    }

    if (!transactionTime) {
      setError("Please select the transaction date and time.");
      return;
    }

    setIsSubmitting(true);

    const payload: TransactionPayload = {
      account_id: accountId,
      amount: amountValue,
      transaction_type: transactionType,
      category: category.trim() || null,
      merchant: merchant.trim() || null,
      description: description.trim() || null,
      transaction_time: new Date(transactionTime).toISOString(),
    };

    try {
      const response = await api.post(`/portal/transaction`,payload)

      

      const data = await response.data;

      setIsSuccess(true);
      navigate('/portal/transactions')


      onSuccess?.(data);
    } catch (submissionError) {
      setError(
        submissionError instanceof AxiosError
          ? submissionError.response?.data?.detail
          : "Something went wrong. Please try again.",
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
            <Sparkles
              size={17}
              strokeWidth={2}
            />
          </div>

          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-accent-teal">
              FINPILOT AI
            </p>

            <h2 className="font-display text-lg font-semibold tracking-tight text-navy-900">
              Create transaction
            </h2>

            <p className="hidden text-xs text-slate-500 sm:block">
              Record a new transaction in your financial profile.
            </p>
          </div>

        </div>

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:border-slate-300 hover:bg-slate-50 hover:text-navy-900"
            aria-label="Close"
          >
            <X size={17} />
          </button>
        )}

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
          icon={CreditCard}
          title="Account linked"
          text="Transaction mapped to account"
        />

        <TrustItem
          icon={Receipt}
          title="Structured data"
          text="Clean financial records"
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

          {/* ACCOUNT */}

         <section>
  <div className="mb-3">
    <label className="text-sm font-semibold text-navy-900">
      Account
    </label>

    <p className="mt-0.5 text-xs text-slate-500">
      This transaction will be associated with the selected account.
    </p>
  </div>

  <div className="relative">
    {/* Selected Account */}
    <button
      type="button"
      onClick={() => setAccountOpen((prev) => !prev)}
      className="flex w-full items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3.5 text-left transition hover:border-slate-300 hover:bg-white"
    >
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-slate-700 shadow-sm">
        <Landmark size={16} />
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-semibold text-navy-900">
          Account ID
        </p>

        <p className="mt-0.5 truncate font-mono text-[10px] text-slate-400">
          {accountId || "Select an account"}
        </p>
      </div>

      <ChevronDown
        size={16}
        className={`shrink-0 text-slate-500 transition-transform ${
          accountOpen ? "rotate-180" : ""
        }`}
      />
    </button>

    {/* Dropdown */}
    {accountOpen && (
      <div className="absolute z-20 mt-2 w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
        {data?.length === 0 ? (
          <div className="px-4 py-3 text-sm text-slate-500">
            No accounts available
          </div>
        ) : (
          <div className="max-h-60 overflow-y-auto py-1">
            {data?.map((account) => {
              const selected = accountId === account.id;

              return (
                <button
                  key={account.id}
                  type="button"
                  onClick={() => {
                    setAccountId(account.id);
                    setAccountOpen(false);
                  }}
                  className={`flex w-full items-center gap-3 px-4 py-3 text-left transition ${
                    selected
                      ? "bg-slate-50"
                      : "hover:bg-slate-50"
                  }`}
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                    <Landmark size={14} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-navy-900">
                      {account.account_type ?? "Account"}
                    </p>

                    <p className="mt-0.5 truncate font-mono text-[10px] text-slate-400">
                      {account.id}
                    </p>
                  </div>

                  {selected && (
                    <Check
                      size={15}
                      className="shrink-0 text-emerald-500"
                    />
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    )}
  </div>
</section>


          {/* TRANSACTION TYPE */}

          {/* <section>

            <div className="mb-3">
              <label className="text-sm font-semibold text-navy-900">
                Transaction type
              </label>

              <p className="mt-0.5 text-xs text-slate-500">
                Select how this transaction affects the account.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">

              {TRANSACTION_TYPES.map((type) => {
                const Icon = type.icon;

                const active =
                  transactionType === type.value;

                return (
                  <motion.button
                    key={type.value}
                    type="button"
                    whileHover={{
                      y: -1,
                    }}
                    whileTap={{
                      scale: 0.98,
                    }}
                    onClick={() =>
                      setTransactionType(
                        type.value as TransactionType,
                      )
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

          </section> */}


          {/* AMOUNT */}

          <section>

            <div className="mb-2">
              <label
                htmlFor="amount"
                className="text-sm font-semibold text-navy-900"
              >
                Transaction amount
              </label>

              <p className="mt-0.5 text-xs text-slate-500">
                Enter the amount associated with this transaction.
              </p>
            </div>

            <div className="relative">

              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-400">
                ₹
              </span>

              <input
                id="amount"
                type="number"
                min="0.01"
                step="0.01"
                value={amount}
                onChange={(event) =>
                  setAmount(event.target.value)
                }
                placeholder="25,000"
                className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-4 text-base font-semibold text-navy-900 outline-none transition focus:border-navy-900 focus:bg-white focus:ring-4 focus:ring-navy-900/5"
              />

            </div>

            <div className="mt-2.5 flex flex-wrap gap-1.5">

              {[
                500,
                1000,
                5000,
                10000,
                25000,
                50000,
              ].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() =>
                    setAmount(String(value))
                  }
                  className="rounded-full border border-slate-200 px-2.5 py-1 text-[10px] font-medium text-slate-600 transition hover:border-navy-900 hover:text-navy-900"
                >
                  {formatINR(value)}
                </button>
              ))}

            </div>

          </section>


          {/* CATEGORY + MERCHANT */}

          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">

            {/* CATEGORY */}

            <div>

              <label
                htmlFor="category"
                className="mb-2 block text-sm font-semibold text-navy-900"
              >
                Category
              </label>

              <div className="relative">

                <select
                  id="category"
                  value={category}
                  onChange={(event) =>
                    setCategory(event.target.value)
                  }
                  className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-3 pr-9 text-sm font-medium outline-none transition focus:border-navy-900 focus:bg-white focus:ring-4 focus:ring-navy-900/5"
                >
                  <option value="">
                    Select category
                  </option>

                  {CATEGORIES.map((item) => (
                    <option
                      key={item}
                      value={item}
                    >
                      {item}
                    </option>
                  ))}
                </select>

                <ArrowRight
                  size={14}
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 rotate-90 text-slate-400"
                />

              </div>

            </div>


            {/* MERCHANT */}

            <div>

              <label
                htmlFor="merchant"
                className="mb-2 block text-sm font-semibold text-navy-900"
              >
                Merchant
              </label>

              <div className="relative">

                <Store
                  size={15}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  id="merchant"
                  type="text"
                  maxLength={150}
                  value={merchant}
                  onChange={(event) =>
                    setMerchant(event.target.value)
                  }
                  placeholder="e.g. Amazon"
                  list="merchant-suggestions"
                  className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm font-medium outline-none transition focus:border-navy-900 focus:bg-white focus:ring-4 focus:ring-navy-900/5"
                />

                <datalist id="merchant-suggestions">
                  {MERCHANT_SUGGESTIONS.map((item) => (
                    <option
                      key={item}
                      value={item}
                    />
                  ))}
                </datalist>

              </div>

            </div>

          </section>


          {/* DESCRIPTION */}

          <section>

            <label
              htmlFor="description"
              className="mb-2 block text-sm font-semibold text-navy-900"
            >
              Description
            </label>

            <div className="relative">

              <FileText
                size={15}
                className="pointer-events-none absolute left-3 top-3 text-slate-400"
              />

              <textarea
                id="description"
                rows={3}
                maxLength={500}
                value={description}
                onChange={(event) =>
                  setDescription(event.target.value)
                }
                placeholder="Add a note about this transaction..."
                className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-sm font-medium outline-none transition focus:border-navy-900 focus:bg-white focus:ring-4 focus:ring-navy-900/5"
              />

            </div>

            <p className="mt-1 text-right text-[9px] text-slate-400">
              {description.length}/500
            </p>

          </section>


          {/* DATE */}

          <section>

            <label
              htmlFor="transactionTime"
              className="mb-2 block text-sm font-semibold text-navy-900"
            >
              Transaction date & time
            </label>

            <input
              id="transactionTime"
              type="datetime-local"
              value={transactionTime}
              onChange={(event) =>
                setTransactionTime(
                  event.target.value,
                )
              }
              className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-medium outline-none transition focus:border-navy-900 focus:bg-white focus:ring-4 focus:ring-navy-900/5"
            />

            <p className="mt-1.5 flex items-center gap-1 text-[10px] text-slate-400">
              <Info size={12} />
              Stored as a timezone-aware timestamp.
            </p>

          </section>


          {/* ERROR */}

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


          {/* SUBMIT */}

          <div className="flex flex-col gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">

            <div className="flex items-center gap-2 text-[10px] text-slate-500">
              <ShieldIcon />
              Secure transaction record
            </div>

            <motion.button
              type="submit"
              disabled={
                isSubmitting ||
                isSuccess
              }
              whileHover={
                !isSubmitting
                  ? {
                      scale: 1.01,
                    }
                  : undefined
              }
              whileTap={
                !isSubmitting
                  ? {
                      scale: 0.98,
                    }
                  : undefined
              }
              className="group flex h-11 items-center justify-center gap-2 rounded-xl bg-navy-900 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-navy-800 disabled:cursor-not-allowed disabled:opacity-60"
            >

              {isSuccess ? (
                <>
                  <Check size={16} />
                  Transaction created
                </>
              ) : isSubmitting ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Creating...
                </>
              ) : (
                <>
                  Create transaction

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
                  Transaction preview
                </p>

                <p className="mt-1 text-sm font-semibold text-navy-900">
                  {selectedType?.label || "Transaction"}
                </p>

              </div>

              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-navy-900 text-white">
                {selectedType ? (
                  <selectedType.icon size={16} />
                ) : (
                  <Banknote size={16} />
                )}
              </div>

            </div>


            {/* AMOUNT CARD */}

            <div
              className={`rounded-2xl p-5 text-white shadow-lg shadow-navy-900/10 ${
                transactionType === "CREDIT"
                  ? "bg-emerald-700"
                  : transactionType === "TRANSFER"
                    ? "bg-slate-800"
                    : "bg-navy-900"
              }`}
            >

              <p className="text-[10px] uppercase tracking-wider text-white/60">
                Transaction amount
              </p>

              <motion.p
                key={amountValue}
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
                {transactionType === "CREDIT"
                  ? "+"
                  : transactionType === "DEBIT"
                    ? "-"
                    : ""}
                {formatINR(amountValue)}
              </motion.p>

              <p className="mt-1 text-[10px] text-white/60">
                {category || "No category selected"}
                {" · "}
                {merchant || "No merchant"}
              </p>

            </div>


            {/* BREAKDOWN */}

            <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">

              <p className="mb-3 text-xs font-semibold text-navy-900">
                Transaction details
              </p>

              <div className="space-y-3">

                <SummaryRow
                  label="Amount"
                  value={formatINR(amountValue)}
                />

                <SummaryRow
                  label="Type"
                  value={transactionType}
                />

                <SummaryRow
                  label="Category"
                  value={category || "—"}
                />

                <SummaryRow
                  label="Merchant"
                  value={merchant || "—"}
                />

                <div className="h-px bg-slate-100" />

                <SummaryRow
                  label="Account"
                  value={
                    accountId
                      ? `${accountId.slice(0, 8)}...`
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
                    This transaction can later be
                    analyzed for spending patterns,
                    anomalies and financial insights.
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
                  Linked account
                </p>

                <p className="mt-0.5 truncate font-mono text-[9px] text-slate-400">
                  {accountId}
                </p>

              </div>

              <Check
                size={15}
                className="ml-auto shrink-0 text-emerald-500"
              />

            </div>


            {/* DISCLAIMER */}

            <p className="mt-4 text-[9px] leading-4 text-slate-400">
              Transaction records are stored against
              the selected account and may be used
              for financial analytics and AI-powered
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

