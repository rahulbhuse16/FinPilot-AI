import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  Banknote,
  BriefcaseBusiness,
  Building2,
  Check,
  ChevronDown,
  CircleDollarSign,
  CreditCard,
  FileCheck2,
  FileText,
  Home,
  Info,
  Landmark,
  Percent,
  ShieldCheck,
  Sparkles,
  Upload,
  UserRound,
  WalletCards,
  X,
} from "lucide-react";
import { useMemo, useRef, useState, type FormEvent } from "react";
import { api } from "../../api/axios";
import { useNavigate } from "react-router-dom";

type LoanType =
  | "PERSONAL"
  | "HOME"
  | "BUSINESS"
  | "EDUCATION"
  | "AUTO";

interface ApplyLoanProps {
  customerId: string;
  onSuccess?: (loan: unknown) => void;
  apiUrl?: string;
}

interface LoanPayload {
  loan_type: LoanType;
  principal_amount: number;
  outstanding_amount: number;
  interest_rate: number;
  monthly_emi: number;
}

const LOAN_TYPES = [
  {
    value: "PERSONAL",
    label: "Personal",
    description: "Flexible funds for your personal goals",
    icon: WalletCards,
  },
  {
    value: "HOME",
    label: "Home",
    description: "Finance your dream home",
    icon: Home,
  },
  {
    value: "BUSINESS",
    label: "Business",
    description: "Grow your business with confidence",
    icon: BriefcaseBusiness,
  },
  {
    value: "EDUCATION",
    label: "Education",
    description: "Invest in your future",
    icon: Landmark,
  },
  {
    value: "AUTO",
    label: "Auto",
    description: "Get moving with easy financing",
    icon: Building2,
  },
];

const QUICK_AMOUNTS = [
  100000,
  250000,
  500000,
  1000000,
  2500000,
];

const TENURES = [
  12,
  24,
  36,
  48,
  60,
  72,
  84,
  120,
];

const MAX_FILE_SIZE = 10 * 1024 * 1024;

const formatINR = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value || 0);

function calculateEMI(
  principal: number,
  annualRate: number,
  tenureMonths: number,
) {
  if (!principal || !tenureMonths) {
    return 0;
  }

  const monthlyRate = annualRate / 12 / 100;

  if (monthlyRate === 0) {
    return principal / tenureMonths;
  }

  const factor = Math.pow(
    1 + monthlyRate,
    tenureMonths,
  );

  return (
    (principal * monthlyRate * factor) /
    (factor - 1)
  );
}

export default function ApplyLoan({
  customerId,
  onSuccess,
  apiUrl = "/portal/loans",
}: ApplyLoanProps) {
  const navigate = useNavigate();

  const fileInputRef =
    useRef<HTMLInputElement | null>(null);

  const [loanType, setLoanType] =
    useState<LoanType>("PERSONAL");

  const [principalAmount, setPrincipalAmount] =
    useState("");

  const [interestRate, setInterestRate] =
    useState("10.5");

  const [tenure, setTenure] =
    useState("36");

  const [outstandingAmount, setOutstandingAmount] =
    useState("");

  const [salarySlip, setSalarySlip] =
    useState<File | null>(null);

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [isSuccess, setIsSuccess] =
    useState(false);

  const [error, setError] = useState("");

  const principal =
    Number(principalAmount) || 0;

  const rate =
    Number(interestRate) || 0;

  const tenureMonths =
    Number(tenure) || 0;

  const monthlyEMI = useMemo(
    () =>
      calculateEMI(
        principal,
        rate,
        tenureMonths,
      ),
    [
      principal,
      rate,
      tenureMonths,
    ],
  );

  const totalPayable =
    monthlyEMI * tenureMonths;

  const totalInterest = Math.max(
    totalPayable - principal,
    0,
  );

  const selectedLoan =
    LOAN_TYPES.find(
      (loan) => loan.value === loanType,
    );

  // ============================================================
  // SALARY SLIP SELECTION
  // ============================================================

  const handleSalarySlipChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setError("");

    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    // Validate PDF
    if (
      file.type !== "application/pdf" &&
      !file.name
        .toLowerCase()
        .endsWith(".pdf")
    ) {
      setError(
        "Salary slip must be a PDF file.",
      );

      event.target.value = "";
      return;
    }

    // Validate size
    if (file.size > MAX_FILE_SIZE) {
      setError(
        "Salary slip must be less than 10 MB.",
      );

      event.target.value = "";
      return;
    }

    setSalarySlip(file);
  };

  // ============================================================
  // REMOVE SALARY SLIP
  // ============================================================

  const removeSalarySlip = () => {
    setSalarySlip(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // ============================================================
  // SUBMIT
  // ============================================================

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    setError("");

    // ----------------------------------------------------------
    // LOAN AMOUNT
    // ----------------------------------------------------------

    if (principal <= 0) {
      setError(
        "Please enter a valid loan amount.",
      );
      return;
    }

    // ----------------------------------------------------------
    // INTEREST RATE
    // ----------------------------------------------------------

    if (rate <= 0) {
      setError(
        "Please enter a valid interest rate.",
      );
      return;
    }

    // ----------------------------------------------------------
    // TENURE
    // ----------------------------------------------------------

    if (tenureMonths <= 0) {
      setError(
        "Please select a valid repayment tenure.",
      );
      return;
    }

    // ----------------------------------------------------------
    // SALARY SLIP
    // ----------------------------------------------------------

    if (!salarySlip) {
      setError(
        "Please upload your latest salary slip.",
      );
      return;
    }

    if (
      salarySlip.type !== "application/pdf" &&
      !salarySlip.name
        .toLowerCase()
        .endsWith(".pdf")
    ) {
      setError(
        "Salary slip must be a PDF file.",
      );
      return;
    }

    if (salarySlip.size > MAX_FILE_SIZE) {
      setError(
        "Salary slip must be less than 10 MB.",
      );
      return;
    }

    // ----------------------------------------------------------
    // PAYLOAD
    // ----------------------------------------------------------

    const payload: LoanPayload = {
      loan_type: loanType,
      principal_amount: principal,
      outstanding_amount:
        Number(outstandingAmount) > 0
          ? Number(outstandingAmount)
          : principal,
      interest_rate: rate,
      monthly_emi: Number(
        monthlyEMI.toFixed(2),
      ),
    };

    // ----------------------------------------------------------
    // FORM DATA
    // ----------------------------------------------------------

    const formData = new FormData();

    /*
     * Backend expects:
     *
     * payload_json: JSON string
     * salary_slip: PDF file
     */

    formData.append(
      "payload_json",
      JSON.stringify(payload),
    );

    formData.append(
      "salary_slip",
      salarySlip,
    );

    // ----------------------------------------------------------
    // SUBMIT
    // ----------------------------------------------------------

    try {
      setIsSubmitting(true);

      const response = await api.post(
        apiUrl,
        formData,
        {
          headers: {
            "Content-Type":
              "multipart/form-data",
          },
        },
      );

      const data = response.data;

      setIsSuccess(true);

      onSuccess?.(data);

      navigate(
        "/portal/loan-request-success",
        {
          state: {
            loan: data,
          },
        },
      );
    } catch (submissionError: any) {
      console.error(
        "Loan submission error:",
        submissionError,
      );

      const backendMessage =
        submissionError?.response?.data?.detail;

      if (
        typeof backendMessage === "string"
      ) {
        setError(backendMessage);
      } else if (
        Array.isArray(backendMessage)
      ) {
        setError(
          backendMessage
            .map(
              (item: any) =>
                item?.msg || "Invalid request",
            )
            .join(", "),
        );
      } else {
        setError(
          "Unable to submit loan application. Please try again.",
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full">
      {/* =====================================================
          PAGE HEADER
      ====================================================== */}

      <motion.div
        initial={{
          opacity: 0,
          y: -10,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        className="mb-6"
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

            <h1 className="font-display text-xl font-semibold tracking-tight text-navy-900 sm:text-2xl">
              Apply for a loan
            </h1>

            <p className="mt-0.5 text-xs text-slate-500 sm:text-sm">
              Smart financing tailored to your
              financial profile.
            </p>
          </div>
        </div>
      </motion.div>

      {/* =====================================================
          TRUST STRIP
      ====================================================== */}

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
        className="mb-6 grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-slate-200 bg-slate-200 sm:grid-cols-3"
      >
        <TrustItem
          icon={ShieldCheck}
          title="Secure"
          text="Bank-grade protection"
        />

        <TrustItem
          icon={FileCheck2}
          title="Transparent"
          text="No hidden calculations"
        />

        <TrustItem
          icon={CircleDollarSign}
          title="AI powered"
          text="Smart financial insights"
        />
      </motion.div>

      {/* =====================================================
          APPLICATION CONTAINER
      ====================================================== */}

      <motion.div
        initial={{
          opacity: 0,
          y: 12,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          delay: 0.1,
        }}
        className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_12px_40px_rgba(15,23,42,0.06)]"
      >
        <div className="grid lg:grid-cols-[minmax(0,1fr)_330px]">
          {/* =================================================
              LEFT FORM
          ================================================== */}

          <form
            onSubmit={handleSubmit}
            className="space-y-6 p-5 sm:p-6 lg:p-7"
          >
            {/* FORM HEADER */}

            <div className="flex items-start gap-3 border-b border-slate-100 pb-5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-950 text-white">
                <Banknote size={18} />
              </div>

              <div>
                <h2 className="text-sm font-semibold text-navy-900">
                  Loan details
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Tell us how much you need and
                  upload your salary slip for
                  AI-powered eligibility verification.
                </p>
              </div>
            </div>

            {/* =================================================
                LOAN TYPE
            ================================================== */}

            <section>
              <div className="mb-3">
                <label className="text-sm font-semibold text-navy-900">
                  Choose loan type
                </label>

                <p className="mt-0.5 text-xs text-slate-500">
                  Select the financing option that
                  fits your needs.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                {LOAN_TYPES.map((loan) => {
                  const Icon = loan.icon;

                  const active =
                    loanType === loan.value;

                  return (
                    <motion.button
                      key={loan.value}
                      type="button"
                      whileHover={{
                        y: -1,
                      }}
                      whileTap={{
                        scale: 0.98,
                      }}
                      onClick={() =>
                        setLoanType(
                          loan.value as LoanType,
                        )
                      }
                      className={`relative rounded-xl border p-3 text-left transition-all ${
                        active
                          ? "border-navy-900 bg-navy-900 text-white shadow-md shadow-navy-900/10"
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
                        {loan.label}
                      </p>

                      <p
                        className={`mt-1 text-[10px] leading-4 ${
                          active
                            ? "text-slate-300"
                            : "text-slate-500"
                        }`}
                      >
                        {loan.description}
                      </p>
                    </motion.button>
                  );
                })}
              </div>
            </section>

            {/* =================================================
                LOAN AMOUNT
            ================================================== */}

            <section>
              <div className="mb-2">
                <label
                  htmlFor="principalAmount"
                  className="text-sm font-semibold text-navy-900"
                >
                  Loan amount
                </label>

                <p className="mt-0.5 text-xs text-slate-500">
                  Enter the principal amount you
                  would like to borrow.
                </p>
              </div>

              <div className="relative">
                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-400">
                  ₹
                </span>

                <input
                  id="principalAmount"
                  type="number"
                  min="1"
                  step="1000"
                  value={principalAmount}
                  onChange={(event) =>
                    setPrincipalAmount(
                      event.target.value,
                    )
                  }
                  placeholder="5,00,000"
                  className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-4 text-base font-semibold text-navy-900 outline-none transition focus:border-navy-900 focus:bg-white focus:ring-4 focus:ring-navy-900/5"
                />
              </div>

              <div className="mt-2.5 flex flex-wrap gap-1.5">
                {QUICK_AMOUNTS.map(
                  (amount) => (
                    <motion.button
                      key={amount}
                      type="button"
                      whileTap={{
                        scale: 0.96,
                      }}
                      onClick={() =>
                        setPrincipalAmount(
                          String(amount),
                        )
                      }
                      className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[10px] font-medium text-slate-600 transition hover:border-navy-900 hover:text-navy-900"
                    >
                      {formatINR(amount)}
                    </motion.button>
                  ),
                )}
              </div>
            </section>

            {/* =================================================
                RATE + TENURE
            ================================================== */}

            <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="interestRate"
                  className="mb-2 block text-sm font-semibold text-navy-900"
                >
                  Interest rate
                </label>

                <div className="relative">
                  <input
                    id="interestRate"
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={interestRate}
                    onChange={(event) =>
                      setInterestRate(
                        event.target.value,
                      )
                    }
                    className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 pr-10 text-sm font-medium text-navy-900 outline-none transition focus:border-navy-900 focus:bg-white focus:ring-4 focus:ring-navy-900/5"
                  />

                  <Percent
                    size={15}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="tenure"
                  className="mb-2 block text-sm font-semibold text-navy-900"
                >
                  Repayment tenure
                </label>

                <div className="relative">
                  <select
                    id="tenure"
                    value={tenure}
                    onChange={(event) =>
                      setTenure(
                        event.target.value,
                      )
                    }
                    className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-3 pr-9 text-sm font-medium text-navy-900 outline-none transition focus:border-navy-900 focus:bg-white focus:ring-4 focus:ring-navy-900/5"
                  >
                    {TENURES.map(
                      (months) => (
                        <option
                          key={months}
                          value={months}
                        >
                          {months / 12}{" "}
                          {months === 12
                            ? "year"
                            : "years"}
                        </option>
                      ),
                    )}
                  </select>

                  <ChevronDown
                    size={15}
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                </div>
              </div>
            </section>

            {/* =================================================
                OUTSTANDING AMOUNT
            ================================================== */}

            <section>
              <label
                htmlFor="outstandingAmount"
                className="mb-2 flex items-center gap-2 text-sm font-semibold text-navy-900"
              >
                Outstanding amount

                <span
                  title="Defaults to the requested principal amount if empty."
                  className="cursor-help"
                >
                  <Info
                    size={13}
                    className="text-slate-400"
                  />
                </span>
              </label>

              <div className="relative">
                <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-400">
                  ₹
                </span>

                <input
                  id="outstandingAmount"
                  type="number"
                  min="0"
                  step="1000"
                  value={outstandingAmount}
                  onChange={(event) =>
                    setOutstandingAmount(
                      event.target.value,
                    )
                  }
                  placeholder="Leave blank to use loan amount"
                  className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm font-medium text-navy-900 outline-none transition focus:border-navy-900 focus:bg-white focus:ring-4 focus:ring-navy-900/5"
                />
              </div>
            </section>

            {/* =================================================
                SALARY SLIP
            ================================================== */}

            <section>
              <div className="mb-2">
                <div className="flex items-center gap-2">
                  <label className="text-sm font-semibold text-navy-900">
                    Salary slip
                  </label>

                  <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[9px] font-semibold text-emerald-700">
                    Required
                  </span>
                </div>

                <p className="mt-0.5 text-xs text-slate-500">
                  Upload your latest salary slip.
                  FinPilot AI will verify your salary
                  and calculate your loan eligibility.
                </p>
              </div>

              {!salarySlip ? (
                <motion.button
                  type="button"
                  whileHover={{
                    y: -1,
                  }}
                  whileTap={{
                    scale: 0.99,
                  }}
                  onClick={() =>
                    fileInputRef.current?.click()
                  }
                  className="group w-full rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5 text-center transition hover:border-navy-900 hover:bg-white"
                >
                  <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-white text-slate-600 shadow-sm ring-1 ring-slate-200 transition group-hover:bg-navy-900 group-hover:text-white">
                    <Upload size={18} />
                  </div>

                  <p className="mt-3 text-xs font-semibold text-navy-900">
                    Upload salary slip
                  </p>

                  <p className="mt-1 text-[10px] text-slate-500">
                    PDF only · Maximum 10 MB
                  </p>

                  <p className="mt-2 text-[9px] text-slate-400">
                    Your document is securely processed
                    for eligibility verification.
                  </p>
                </motion.button>
              ) : (
                <motion.div
                  initial={{
                    opacity: 0,
                    y: 5,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-3.5"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-emerald-600 shadow-sm">
                    <FileText size={18} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-semibold text-emerald-900">
                      {salarySlip.name}
                    </p>

                    <p className="mt-0.5 text-[10px] text-emerald-700">
                      {(
                        salarySlip.size /
                        1024 /
                        1024
                      ).toFixed(2)}{" "}
                      MB · PDF ready for verification
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={removeSalarySlip}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-slate-500 transition hover:bg-red-50 hover:text-red-600"
                    title="Remove salary slip"
                  >
                    <X size={15} />
                  </button>
                </motion.div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf,.pdf"
                onChange={
                  handleSalarySlipChange
                }
                className="hidden"
              />

              <div className="mt-2 flex items-start gap-2 rounded-lg bg-slate-50 px-3 py-2">
                <ShieldCheck
                  size={13}
                  className="mt-0.5 shrink-0 text-emerald-600"
                />

                <p className="text-[9px] leading-4 text-slate-500">
                  FinPilot AI analyzes the salary slip
                  to verify income and determine
                  eligibility for the requested amount.
                </p>
              </div>
            </section>

            {/* =================================================
                ERROR
            ================================================== */}

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
            ================================================== */}

            <div className="flex flex-col gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2 text-[10px] text-slate-500">
                <ShieldCheck
                  size={14}
                  className="text-emerald-600"
                />

                Secure and encrypted application
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
                    Application submitted
                  </>
                ) : isSubmitting ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />

                    Verifying & submitting...
                  </>
                ) : (
                  <>
                    Submit application

                    <ArrowRight
                      size={16}
                      className="transition-transform group-hover:translate-x-0.5"
                    />
                  </>
                )}
              </motion.button>
            </div>
          </form>

          {/* =================================================
              RIGHT SUMMARY
          ================================================== */}

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
              delay: 0.15,
            }}
            className="border-t border-slate-200 bg-slate-50 p-5 sm:p-6 lg:border-l lg:border-t-0"
          >
            <div className="lg:sticky lg:top-6">
              {/* SUMMARY HEADER */}

              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-400">
                    Repayment preview
                  </p>

                  <p className="mt-1 text-sm font-semibold text-navy-900">
                    {selectedLoan?.label} Loan
                  </p>
                </div>

                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-navy-900 text-white">
                  <CreditCard size={16} />
                </div>
              </div>

              {/* EMI */}

              <div className="rounded-2xl bg-navy-900 p-5 text-white shadow-lg shadow-navy-900/10">
                <p className="text-[10px] uppercase tracking-wider text-slate-400">
                  Estimated monthly EMI
                </p>

                <motion.p
                  key={monthlyEMI}
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
                  {formatINR(
                    monthlyEMI,
                  )}
                </motion.p>

                <p className="mt-1 text-[10px] text-slate-400">
                  {tenureMonths || 0} months
                  {" · "}
                  {rate || 0}% p.a.
                </p>
              </div>

              {/* BREAKDOWN */}

              <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
                <p className="mb-3 text-xs font-semibold text-navy-900">
                  Loan breakdown
                </p>

                <div className="space-y-3">
                  <SummaryRow
                    label="Principal"
                    value={formatINR(
                      principal,
                    )}
                  />

                  <SummaryRow
                    label="Total interest"
                    value={formatINR(
                      totalInterest,
                    )}
                  />

                  <div className="h-px bg-slate-100" />

                  <SummaryRow
                    label="Total payable"
                    value={formatINR(
                      totalPayable,
                    )}
                    strong
                  />
                </div>
              </div>

              {/* AI ELIGIBILITY */}

              <div className="mt-4 rounded-2xl border border-violet-100 bg-violet-50 p-4">
                <div className="flex gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-violet-100 text-violet-700">
                    <Sparkles size={14} />
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-violet-900">
                      AI eligibility check
                    </p>

                    <p className="mt-1 text-[10px] leading-4 text-violet-800/70">
                      Your salary slip will be analyzed
                      by FinPilot AI before your loan
                      request is created.
                    </p>
                  </div>
                </div>
              </div>

              {/* CUSTOMER */}

              <div className="mt-4 flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3.5">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600">
                  <UserRound size={15} />
                </div>

                <div className="min-w-0">
                  <p className="text-[11px] font-semibold text-navy-900">
                    Customer profile
                  </p>

                  <p className="mt-0.5 truncate font-mono text-[9px] text-slate-400">
                    {customerId}
                  </p>
                </div>

                <Check
                  size={15}
                  className="ml-auto shrink-0 text-emerald-500"
                />
              </div>

              {/* SECURITY */}

              <div className="mt-4 flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5">
                <ShieldCheck
                  size={14}
                  className="shrink-0 text-emerald-600"
                />

                <p className="text-[9px] leading-4 text-slate-500">
                  Salary slip is securely uploaded
                  and processed for loan eligibility.
                </p>
              </div>

              {/* DISCLAIMER */}

              <p className="mt-4 text-[9px] leading-4 text-slate-400">
                EMI shown is an estimate for
                illustration purposes. Final loan
                terms are subject to eligibility,
                credit assessment and approval.
              </p>
            </div>
          </motion.aside>
        </div>
      </motion.div>
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
  icon: typeof ShieldCheck;
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
        className={`text-xs ${
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