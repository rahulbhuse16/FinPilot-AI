import { useMemo, useState } from "react";
import type { ChangeEvent } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronDown,
  CreditCard,
  Landmark,
  LockKeyhole,
  Plus,
  ShieldCheck,
  Smartphone,
  Wallet,
} from "lucide-react";
import { Link, useParams } from "react-router-dom";

import { useFetch } from "../../hooks/useFetch";
import { portalApi } from "../../api/portal.api";
import { formatCurrency } from "../../utils/format";
import { Badge } from "../../components/ui/Badge";

type PaymentMethod = "UPI" | "CARD" | "NETBANKING";

type CardNetwork =
  | ""
  | "VISA"
  | "MASTERCARD"
  | "RUPAY"
  | "AMEX"
  | "OTHER";

interface PaymentForm {
  upiId: string;

  cardNetwork: CardNetwork;
  cardNumber: string;
  cardHolder: string;
  expiry: string;
  cvv: string;

  bank: string;
  bankAccountName: string;
  bankAccountNumber: string;
  ifsc: string;
}

const QUICK_AMOUNTS = [
  500,
  1000,
  2000,
  5000,
  10000,
];

const PAYMENT_METHODS = [
  {
    id: "UPI" as const,
    title: "UPI",
    description: "Instant payment",
    icon: Smartphone,
    badge: "Recommended",
  },
  {
    id: "CARD" as const,
    title: "Card",
    description: "Visa · Mastercard · RuPay",
    icon: CreditCard,
  },
  {
    id: "NETBANKING" as const,
    title: "Net Banking",
    description: "Pay from your bank",
    icon: Landmark,
  },
];

const BANKS = [
  {
    value: "SBI",
    label: "State Bank of India",
  },
  {
    value: "HDFC",
    label: "HDFC Bank",
  },
  {
    value: "ICICI",
    label: "ICICI Bank",
  },
  {
    value: "AXIS",
    label: "Axis Bank",
  },
  {
    value: "KOTAK",
    label: "Kotak Mahindra Bank",
  },
  {
    value: "OTHER",
    label: "Other bank",
  },
];








const VisaIcon = () => (
  <svg
    viewBox="0 0 48 32"
    className="h-7 w-11"
    aria-hidden="true"
  >
    <rect width="48" height="32" rx="4" fill="#fff" />
    <path
      fill="#1A1F71"
      d="M19.4 10.2l-2.8 11.6h-3.4L16 10.2h3.4zm13.8 7.5l1.8-4.9 1 4.9h-2.8zM37 21.8h3.1l-2.7-11.6h-2.9c-.7 0-1.3.4-1.6 1l-5 10.6h3.6l.7-2h4.4l.4 2zM27.5 18c0-3-4.1-3.2-4.1-4.5 0-.4.4-.9 1.4-1 0 0 1.8-.2 3.6 1l.6-2.9c-.9-.3-2-.6-3.5-.6-3.7 0-6.3 2-6.3 4.8 0 2.1 1.8 3.2 3.2 3.9 1.4.7 1.9 1.1 1.9 1.7 0 .9-1.1 1.3-2.1 1.3-1.8 0-2.9-.5-3.8-.9l-.6 3c.9.4 2.6.8 4.4.8 3.9 0 6.5-2 6.5-5z"
    />
  </svg>
);

const MastercardIcon = () => (
  <svg
    viewBox="0 0 48 32"
    className="h-7 w-11"
    aria-hidden="true"
  >
    <rect width="48" height="32" rx="4" fill="#fff" />
    <circle cx="19" cy="16" r="8" fill="#EB001B" />
    <circle cx="29" cy="16" r="8" fill="#F79E1B" />
    <path
      fill="#FF5F00"
      d="M24 9.9a8 8 0 000 12.2 8 8 0 000-12.2z"
    />
  </svg>
);

const RuPayIcon = () => (
  <svg
    viewBox="0 0 48 32"
    className="h-7 w-11"
    aria-hidden="true"
  >
    <rect width="48" height="32" rx="4" fill="#fff" />
    <path
      fill="#087F3E"
      d="M10 10h13c3.2 0 5.5 1.7 5.5 4.6 0 2.5-1.7 4.1-4.1 4.6L29 22h-5l-4.1-4.8H15V22h-5V10zm5 3.7v3.8h7.2c1 0 1.8-.7 1.8-1.9 0-1.2-.8-1.9-1.8-1.9H15z"
    />
    <path
      fill="#F58220"
      d="M30 10h8v3h-4v9h-4v-12z"
    />
  </svg>
);

const AmexIcon = () => (
  <svg
    viewBox="0 0 48 32"
    className="h-7 w-11"
    aria-hidden="true"
  >
    <rect width="48" height="32" rx="4" fill="#2E77BC" />
    <text
      x="24"
      y="20"
      textAnchor="middle"
      fill="#fff"
      fontSize="8"
      fontWeight="900"
      fontFamily="Arial, sans-serif"
    >
      AMEX
    </text>
  </svg>
);

const OtherCardIcon = () => (
  <svg
    viewBox="0 0 24 24"
    className="h-6 w-6"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    aria-hidden="true"
  >
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="M3 9h18" />
    <path d="M7 14h4" />
  </svg>
);

const CARD_NETWORKS = [
  {
    value: "VISA",
    label: "Visa",
    icon: <VisaIcon />,
  },
  {
    value: "MASTERCARD",
    label: "Mastercard",
    icon: <MastercardIcon />,
  },
  {
    value: "RUPAY",
    label: "RuPay",
    icon: <RuPayIcon />,
  },
  {
    value: "AMEX",
    label: "American Express",
    icon: <AmexIcon />,
  },
  {
    value: "OTHER",
    label: "Other",
    icon: <OtherCardIcon />,
  },
];

function maskAccountNumber(value: string): string {
  const digits = value.replace(/\s+/g, "");

  if (digits.length <= 4) {
    return digits;
  }

  return `•••• •••• ${digits.slice(-4)}`;
}

function formatCardNumber(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 16);

  return digits.replace(/(.{4})/g, "$1 ").trim();
}

function formatExpiry(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 4);

  if (digits.length <= 2) {
    return digits;
  }

  return `${digits.slice(0, 2)} / ${digits.slice(2)}`;
}

function isValidUpiId(value: string): boolean {
  return /^[\w.-]+@[\w.-]+$/.test(value);
}

function isValidIfsc(value: string): boolean {
  return /^[A-Z]{4}0[A-Z0-9]{6}$/.test(value);
}

export function AddBalanceToAccount() {
  const { accountId } = useParams<{
    accountId: string;
  }>();

  const {
    data: accounts,
    status,
    error,
  } = useFetch(
    (signal) => portalApi.accounts(signal),
    []
  );

  const [amount, setAmount] = useState("");

  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethod>("UPI");

  const [showCardDetails, setShowCardDetails] =
    useState(true);

  const [showBankDetails, setShowBankDetails] =
    useState(true);

  const [paymentForm, setPaymentForm] =
    useState<PaymentForm>({
      upiId: "",

      cardNetwork: "",
      cardNumber: "",
      cardHolder: "",
      expiry: "",
      cvv: "",

      bank: "",
      bankAccountName: "",
      bankAccountNumber: "",
      ifsc: "",
    });

  const account = useMemo(
    () =>
      accounts?.find(
        (item) =>
          String(item.id) === String(accountId)
      ),
    [accounts, accountId]
  );

  const numericAmount = Number(amount || 0);

  const currentBalance = Number(
    account?.balance ?? 0
  );

  const newBalance =
    currentBalance + numericAmount;

  const currency = String(
    account?.currency ?? "INR"
  );

  const isAmountValid =
    numericAmount >= 100 &&
    numericAmount <= 200000;

  function updatePaymentField(
    field: keyof PaymentForm,
    value: string
  ) {
    setPaymentForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function handleAmountChange(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const value = event.target.value;

    if (!/^\d*(\.\d{0,2})?$/.test(value)) {
      return;
    }

    setAmount(value);
  }

  function selectQuickAmount(value: number) {
    setAmount(String(value));
  }

  function handlePaymentMethodChange(
    method: PaymentMethod
  ) {
    setPaymentMethod(method);
  }

  const paymentDetailsValid = useMemo(() => {
    if (!isAmountValid) {
      return false;
    }

    if (paymentMethod === "UPI") {
      return isValidUpiId(
        paymentForm.upiId.trim()
      );
    }

    if (paymentMethod === "CARD") {
      const cardNumber =
        paymentForm.cardNumber.replace(/\s/g, "");

      return (
        paymentForm.cardNetwork !== "" &&
        cardNumber.length >= 13 &&
        paymentForm.cardHolder.trim().length >= 2 &&
        /^\d{2}\/\d{2}$/.test(
          paymentForm.expiry.replace(/\s/g, "")
        ) &&
        /^\d{3,4}$/.test(paymentForm.cvv)
      );
    }

    if (paymentMethod === "NETBANKING") {
      return (
        paymentForm.bank !== "" &&
        paymentForm.bankAccountName.trim().length >= 2 &&
        paymentForm.bankAccountNumber.length >= 8 &&
        isValidIfsc(
          paymentForm.ifsc.toUpperCase()
        )
      );
    }

    return false;
  }, [
    isAmountValid,
    paymentMethod,
    paymentForm,
  ]);

  function handleContinue() {
    if (!paymentDetailsValid) {
      return;
    }

    /*
     * IMPORTANT:
     *
     * Do NOT directly update account.balance here.
     *
     * Production flow:
     *
     * POST
     * /portal/accounts/{accountId}/add-money/order
     *
     * Backend creates the Razorpay order.
     *
     * Then open Razorpay Checkout.
     *
     * After payment, verify the payment on backend.
     *
     * The backend webhook should:
     *
     * 1. Verify payment
     * 2. Create transaction
     * 3. Update account balance
     * 4. Commit transaction
     */

    console.log("Create payment", {
      accountId,
      amount: numericAmount,
      paymentMethod,
    });
  }

  if (status === "loading") {
    return (
      <div className="flex min-h-[500px] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-navy-200 border-t-accent-teal" />
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="rounded-2xl border border-red-500/10 bg-red-500/[0.04] p-6 text-sm text-red-600">
        {error?.message ||
          "Unable to load account."}
      </div>
    );
  }

  if (!account) {
    return (
      <div className="rounded-3xl border border-navy-800 bg-[#08111f] p-8 text-white">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/[0.05]">
          <Wallet className="h-5 w-5 text-accent-teal" />
        </div>

        <h2 className="mt-5 text-lg font-semibold">
          Account not found
        </h2>

        <p className="mt-1 text-sm text-white/40">
          The account you're trying to fund
          doesn't exist or is no longer available.
        </p>

        <Link
          to="/portal/accounts"
          className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-accent-teal"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to accounts
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-7">
      {/* Header */}
      <div>
        <Link
          to="/portal/accounts"
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-navy-400 transition-colors hover:text-navy-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to accounts
        </Link>

        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-accent-teal" />

              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-navy-400">
                Account funding
              </p>
            </div>

            <h1 className="font-display text-3xl font-semibold tracking-tight text-navy-950">
              Add money
            </h1>

            <p className="mt-1.5 max-w-xl text-sm text-navy-500">
              Add funds securely to your
              {` ${String(
                account.account_type ?? "account"
              ).toLowerCase()}`}
              .
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_370px]">
        {/* Main column */}
        <div className="space-y-5">
          {/* Destination account */}
          <section className="relative overflow-hidden rounded-[28px] border border-white/[0.08] bg-[#0b1524] p-6 text-white shadow-2xl shadow-navy-950/20">
            <div
              className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-accent-teal/[0.08] blur-[90px]"
              aria-hidden="true"
            />

            <div className="relative flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.05]">
                  <Wallet
                    className="h-5 w-5 text-accent-teal"
                    strokeWidth={1.8}
                  />
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold">
                      {account.account_type ??
                        "Account"}
                    </p>

                    <Badge
                      tone={
                        account.status ===
                        "ACTIVE"
                          ? "positive"
                          : "neutral"
                      }
                    >
                      {String(
                        account.status ?? ""
                      ).toLowerCase()}
                    </Badge>
                  </div>

                  <p className="mt-1 font-mono text-xs tracking-[0.16em] text-white/35">
                    {maskAccountNumber(
                      String(
                        account.account_number ??
                          ""
                      )
                    )}
                  </p>
                </div>
              </div>

              <div className="hidden text-right sm:block">
                <p className="text-[9px] uppercase tracking-[0.16em] text-white/30">
                  Current balance
                </p>

                <p className="mt-1 font-display text-lg font-semibold">
                  {formatCurrency(
                    currentBalance,
                    currency
                  )}
                </p>
              </div>
            </div>
          </section>

          {/* Amount */}
          <section className="rounded-[28px] border border-white/[0.08] bg-[#08111f] p-6 text-white shadow-xl">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-semibold">
                  Enter amount
                </p>

                <p className="mt-1 text-xs text-white/30">
                  Minimum ₹100 · Maximum
                  ₹2,00,000
                </p>
              </div>

              <span className="rounded-lg bg-white/[0.05] px-2.5 py-1.5 text-[10px] font-semibold tracking-wide text-white/40">
                INR
              </span>
            </div>

            <div className="mt-5 rounded-2xl border border-white/[0.08] bg-white/[0.025] px-5 py-5 transition-all focus-within:border-accent-teal/40 focus-within:bg-white/[0.04]">
              <div className="flex items-center">
                <span className="mr-3 font-display text-3xl text-white/30">
                  ₹
                </span>

                <input
                  type="text"
                  inputMode="decimal"
                  value={amount}
                  onChange={handleAmountChange}
                  placeholder="0"
                  className="w-full bg-transparent font-display text-4xl font-semibold tracking-tight text-white outline-none placeholder:text-white/[0.12]"
                  aria-label="Amount"
                />
              </div>
            </div>

            <div className="mt-4">
              <p className="mb-2 text-[9px] font-semibold uppercase tracking-[0.16em] text-white/25">
                Quick select
              </p>

              <div className="flex flex-wrap gap-2">
                {QUICK_AMOUNTS.map(
                  (value) => {
                    const selected =
                      numericAmount === value;

                    return (
                      <button
                        key={value}
                        type="button"
                        onClick={() =>
                          selectQuickAmount(
                            value
                          )
                        }
                        className={`rounded-xl border px-4 py-2.5 text-xs font-semibold transition-all ${
                          selected
                            ? "border-accent-teal/40 bg-accent-teal/10 text-accent-teal"
                            : "border-white/[0.07] bg-white/[0.025] text-white/45 hover:border-white/[0.14] hover:bg-white/[0.05] hover:text-white"
                        }`}
                      >
                        ₹
                        {value.toLocaleString(
                          "en-IN"
                        )}
                      </button>
                    );
                  }
                )}
              </div>
            </div>

            {amount &&
              !isAmountValid && (
                <p className="mt-3 text-xs text-red-400">
                  Enter an amount between
                  ₹100 and ₹2,00,000.
                </p>
              )}
          </section>

          {/* Payment method */}
          <section className="rounded-[28px] border border-white/[0.08] bg-[#08111f] p-6 text-white shadow-xl">
            <div>
              <p className="text-sm font-semibold">
                Payment method
              </p>

              <p className="mt-1 text-xs text-white/30">
                Choose how you want to add
                money.
              </p>
            </div>

            {/* Toggle */}
            <div className="mt-5 grid grid-cols-3 gap-1.5 rounded-2xl border border-white/[0.06] bg-white/[0.025] p-1.5">
              {PAYMENT_METHODS.map(
                (method) => {
                  const Icon = method.icon;

                  const selected =
                    paymentMethod ===
                    method.id;

                  return (
                    <button
                      key={method.id}
                      type="button"
                      onClick={() =>
                        handlePaymentMethodChange(
                          method.id
                        )
                      }
                      className={`relative rounded-xl px-2 py-4 transition-all ${
                        selected
                          ? "bg-white/[0.08] shadow-sm"
                          : "hover:bg-white/[0.04]"
                      }`}
                    >
                      {selected && (
                        <span className="absolute bottom-0 left-1/2 h-0.5 w-8 -translate-x-1/2 rounded-full bg-accent-teal" />
                      )}

                      <Icon
                        className={`mx-auto h-5 w-5 ${
                          selected
                            ? "text-accent-teal"
                            : "text-white/30"
                        }`}
                        strokeWidth={1.7}
                      />

                      <p
                        className={`mt-2 text-[11px] font-semibold ${
                          selected
                            ? "text-white"
                            : "text-white/40"
                        }`}
                      >
                        {method.title}
                      </p>

                      {method.badge && (
                        <span className="mt-1 hidden text-[8px] font-semibold uppercase tracking-wide text-accent-teal sm:block">
                          {method.badge}
                        </span>
                      )}
                    </button>
                  );
                }
              )}
            </div>

            {/* UPI */}
            {paymentMethod === "UPI" && (
              <div className="mt-5 animate-fade-in rounded-2xl border border-accent-teal/20 bg-accent-teal/[0.035] p-5">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent-teal/10">
                    <Smartphone className="h-4.5 w-4.5 text-accent-teal" />
                  </div>

                  <div>
                    <p className="text-sm font-semibold">
                      Pay with UPI
                    </p>

                    <p className="mt-1 text-xs leading-5 text-white/30">
                      Enter your UPI ID and
                      continue. Your UPI app will
                      be used to authorize the
                      payment.
                    </p>
                  </div>
                </div>

                <div className="mt-5">
                  <label className="mb-2 block text-[9px] font-semibold uppercase tracking-[0.16em] text-white/35">
                    UPI ID
                  </label>

                  <input
                    type="text"
                    value={paymentForm.upiId}
                    onChange={(event) =>
                      updatePaymentField(
                        "upiId",
                        event.target.value
                      )
                    }
                    placeholder="yourname@upi"
                    className="h-12 w-full rounded-xl border border-white/[0.08] bg-black/20 px-4 text-sm text-white outline-none placeholder:text-white/15 focus:border-accent-teal/40"
                  />

                  <div className="mt-2 flex items-center justify-between">
                    <p className="text-[10px] text-white/20">
                      Example:
                      rahul@oksbi
                    </p>

                    {paymentForm.upiId &&
                      isValidUpiId(
                        paymentForm.upiId
                      ) && (
                        <span className="flex items-center gap-1 text-[10px] text-accent-teal">
                          <Check className="h-3 w-3" />
                          Valid UPI ID
                        </span>
                      )}
                  </div>
                </div>
              </div>
            )}

            {/* Card */}
            {paymentMethod === "CARD" && (
              <div className="mt-5 animate-fade-in overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.025]">
                <button
                  type="button"
                  onClick={() =>
                    setShowCardDetails(
                      (value) => !value
                    )
                  }
                  className="flex w-full items-center justify-between p-5 text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.06]">
                      <CreditCard className="h-4.5 w-4.5 text-accent-teal" />
                    </div>

                    <div>
                      <p className="text-sm font-semibold">
                        Card details
                      </p>

                      <p className="mt-1 text-xs text-white/30">
                        Secure card payment
                      </p>
                    </div>
                  </div>

                  <ChevronDown
                    className={`h-4 w-4 text-white/30 transition-transform ${
                      showCardDetails
                        ? "rotate-180"
                        : ""
                    }`}
                  />
                </button>

                {showCardDetails && (
                  <div className="border-t border-white/[0.07] p-5">
                    {/* Network */}
                    <label className="mb-2 block text-[9px] font-semibold uppercase tracking-[0.16em] text-white/35">
                      Card network
                    </label>

                   <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
  {CARD_NETWORKS.map((network) => {
    const selected =
      paymentForm.cardNetwork === network.value;

    return (
      <button
        key={network.value}
        type="button"
        onClick={() =>
          updatePaymentField(
            "cardNetwork",
            network.value
          )
        }
        className={`flex min-h-[72px] flex-col items-center justify-center gap-2 rounded-xl border px-2 py-3 transition-all ${
          selected
            ? "border-accent-teal/40 bg-accent-teal/10 text-accent-teal"
            : "border-white/[0.07] bg-white/[0.025] text-white/40 hover:border-white/[0.13] hover:bg-white/[0.04] hover:text-white"
        }`}
      >
        {network.icon}

        <span className="text-[10px] font-semibold">
          {network.label}
        </span>
      </button>
    );
  })}
</div>

                    {/* Number */}
                    <div className="mt-5">
                      <label className="mb-2 block text-[9px] font-semibold uppercase tracking-[0.16em] text-white/35">
                        Card number
                      </label>

                      <input
                        type="text"
                        inputMode="numeric"
                        value={
                          paymentForm.cardNumber
                        }
                        onChange={(event) =>
                          updatePaymentField(
                            "cardNumber",
                            formatCardNumber(
                              event.target
                                .value
                            )
                          )
                        }
                        placeholder="1234 5678 9012 3456"
                        maxLength={19}
                        className="h-12 w-full rounded-xl border border-white/[0.08] bg-black/20 px-4 font-mono text-sm tracking-wider text-white outline-none placeholder:text-white/15 focus:border-accent-teal/40"
                      />
                    </div>

                    {/* Holder */}
                    <div className="mt-4">
                      <label className="mb-2 block text-[9px] font-semibold uppercase tracking-[0.16em] text-white/35">
                        Cardholder name
                      </label>

                      <input
                        type="text"
                        value={
                          paymentForm.cardHolder
                        }
                        onChange={(event) =>
                          updatePaymentField(
                            "cardHolder",
                            event.target.value
                          )
                        }
                        placeholder="Name as shown on card"
                        className="h-12 w-full rounded-xl border border-white/[0.08] bg-black/20 px-4 text-sm text-white outline-none placeholder:text-white/15 focus:border-accent-teal/40"
                      />
                    </div>

                    {/* Expiry / CVV */}
                    <div className="mt-4 grid grid-cols-2 gap-3">
                      <div>
                        <label className="mb-2 block text-[9px] font-semibold uppercase tracking-[0.16em] text-white/35">
                          Expiry
                        </label>

                        <input
                          type="text"
                          inputMode="numeric"
                          value={
                            paymentForm.expiry
                          }
                          onChange={(event) =>
                            updatePaymentField(
                              "expiry",
                              formatExpiry(
                                event.target
                                  .value
                              )
                            )
                          }
                          placeholder="MM / YY"
                          maxLength={7}
                          className="h-12 w-full rounded-xl border border-white/[0.08] bg-black/20 px-4 text-sm text-white outline-none placeholder:text-white/15 focus:border-accent-teal/40"
                        />
                      </div>

                      <div>
                        <label className="mb-2 block text-[9px] font-semibold uppercase tracking-[0.16em] text-white/35">
                          CVV
                        </label>

                        <input
                          type="password"
                          inputMode="numeric"
                          value={
                            paymentForm.cvv
                          }
                          onChange={(event) =>
                            updatePaymentField(
                              "cvv",
                              event.target.value
                                .replace(
                                  /\D/g,
                                  ""
                                )
                                .slice(
                                  0,
                                  4
                                )
                            )
                          }
                          placeholder="•••"
                          maxLength={4}
                          className="h-12 w-full rounded-xl border border-white/[0.08] bg-black/20 px-4 text-sm text-white outline-none placeholder:text-white/15 focus:border-accent-teal/40"
                        />
                      </div>
                    </div>

                    <div className="mt-5 flex gap-2 rounded-xl bg-white/[0.025] p-3">
                      <LockKeyhole className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent-teal/70" />

                      <p className="text-[10px] leading-4 text-white/25">
                        For production payments,
                        these fields should be
                        collected through your
                        payment provider's secure
                        checkout rather than sent to
                        your application server.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Net Banking */}
            {paymentMethod ===
              "NETBANKING" && (
              <div className="mt-5 animate-fade-in overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.025]">
                <button
                  type="button"
                  onClick={() =>
                    setShowBankDetails(
                      (value) => !value
                    )
                  }
                  className="flex w-full items-center justify-between p-5 text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.06]">
                      <Landmark className="h-4.5 w-4.5 text-accent-teal" />
                    </div>

                    <div>
                      <p className="text-sm font-semibold">
                        Bank details
                      </p>

                      <p className="mt-1 text-xs text-white/30">
                        Secure bank authentication
                      </p>
                    </div>
                  </div>

                  <ChevronDown
                    className={`h-4 w-4 text-white/30 transition-transform ${
                      showBankDetails
                        ? "rotate-180"
                        : ""
                    }`}
                  />
                </button>

                {showBankDetails && (
                  <div className="border-t border-white/[0.07] p-5">
                    {/* Bank */}
                    <label className="mb-2 block text-[9px] font-semibold uppercase tracking-[0.16em] text-white/35">
                      Select bank
                    </label>

                    <select
                      value={
                        paymentForm.bank
                      }
                      onChange={(event) =>
                        updatePaymentField(
                          "bank",
                          event.target.value
                        )
                      }
                      className="h-12 w-full rounded-xl border border-white/[0.08] bg-[#0b1524] px-4 text-sm text-white outline-none focus:border-accent-teal/40"
                    >
                      <option
                        value=""
                        disabled
                      >
                        Choose your bank
                      </option>

                      {BANKS.map((bank) => (
                        <option
                          key={bank.value}
                          value={bank.value}
                        >
                          {bank.label}
                        </option>
                      ))}
                    </select>

                    {/* Account holder */}
                    <div className="mt-4">
                      <label className="mb-2 block text-[9px] font-semibold uppercase tracking-[0.16em] text-white/35">
                        Account holder name
                      </label>

                      <input
                        type="text"
                        value={
                          paymentForm.bankAccountName
                        }
                        onChange={(event) =>
                          updatePaymentField(
                            "bankAccountName",
                            event.target.value
                          )
                        }
                        placeholder="Enter account holder name"
                        className="h-12 w-full rounded-xl border border-white/[0.08] bg-black/20 px-4 text-sm text-white outline-none placeholder:text-white/15 focus:border-accent-teal/40"
                      />
                    </div>

                    {/* Account number */}
                    <div className="mt-4">
                      <label className="mb-2 block text-[9px] font-semibold uppercase tracking-[0.16em] text-white/35">
                        Bank account number
                      </label>

                      <input
                        type="password"
                        inputMode="numeric"
                        value={
                          paymentForm.bankAccountNumber
                        }
                        onChange={(event) =>
                          updatePaymentField(
                            "bankAccountNumber",
                            event.target.value
                              .replace(
                                /\D/g,
                                ""
                              )
                              .slice(
                                0,
                                20
                              )
                          )
                        }
                        placeholder="Enter account number"
                        className="h-12 w-full rounded-xl border border-white/[0.08] bg-black/20 px-4 text-sm text-white outline-none placeholder:text-white/15 focus:border-accent-teal/40"
                      />
                    </div>

                    {/* IFSC */}
                    <div className="mt-4">
                      <label className="mb-2 block text-[9px] font-semibold uppercase tracking-[0.16em] text-white/35">
                        IFSC code
                      </label>

                      <input
                        type="text"
                        value={
                          paymentForm.ifsc
                        }
                        onChange={(event) =>
                          updatePaymentField(
                            "ifsc",
                            event.target.value
                              .toUpperCase()
                              .replace(
                                /[^A-Z0-9]/g,
                                ""
                              )
                              .slice(
                                0,
                                11
                              )
                          )
                        }
                        placeholder="HDFC0001234"
                        maxLength={11}
                        className="h-12 w-full rounded-xl border border-white/[0.08] bg-black/20 px-4 font-mono text-sm tracking-wider text-white outline-none placeholder:text-white/15 focus:border-accent-teal/40"
                      />

                      <div className="mt-2 flex items-center justify-between">
                        <p className="text-[10px] text-white/20">
                          11-character IFSC code
                        </p>

                        {paymentForm.ifsc &&
                          isValidIfsc(
                            paymentForm.ifsc.toUpperCase()
                          ) && (
                            <span className="flex items-center gap-1 text-[10px] text-accent-teal">
                              <Check className="h-3 w-3" />
                              Valid IFSC
                            </span>
                          )}
                      </div>
                    </div>

                    <div className="mt-5 flex gap-2 rounded-xl bg-white/[0.025] p-3">
                      <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent-teal/70" />

                      <p className="text-[10px] leading-4 text-white/25">
                        You'll complete authentication
                        securely with your bank. Your
                        banking password and OTP are
                        never shared with us.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </section>
        </div>

        {/* Summary */}
        <aside className="lg:sticky lg:top-6 lg:h-fit">
          <div className="overflow-hidden rounded-[28px] border border-white/[0.08] bg-[#0b1524] text-white shadow-2xl shadow-navy-950/20">
            <div className="border-b border-white/[0.07] p-6">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent-teal/10">
                  <Plus className="h-3.5 w-3.5 text-accent-teal" />
                </span>

                <p className="text-[10px] font-semibold uppercase tracking-[0.17em] text-white/35">
                  Payment summary
                </p>
              </div>

              <p className="mt-3 font-display text-xl font-semibold">
                Review your deposit
              </p>
            </div>

            <div className="space-y-5 p-6">
              {/* Destination */}
              <div>
                <p className="text-[9px] uppercase tracking-[0.16em] text-white/25">
                  Adding to
                </p>

                <div className="mt-2 flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/[0.05]">
                    <Wallet className="h-4 w-4 text-accent-teal" />
                  </div>

                  <div>
                    <p className="text-sm font-semibold">
                      {account.account_type}
                    </p>

                    <p className="font-mono text-[10px] tracking-wider text-white/30">
                      {maskAccountNumber(
                        String(
                          account.account_number ??
                            ""
                        )
                      )}
                    </p>
                  </div>
                </div>
              </div>

              <div className="border-t border-white/[0.07]" />

              {/* Amounts */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white/35">
                    Current balance
                  </span>

                  <span className="font-medium">
                    {formatCurrency(
                      currentBalance,
                      currency
                    )}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-white/35">
                    Amount
                  </span>

                  <span className="font-semibold text-accent-teal">
                    +
                    {formatCurrency(
                      numericAmount,
                      currency
                    )}
                  </span>
                </div>
              </div>

              {/* New balance */}
              <div className="rounded-2xl border border-accent-teal/15 bg-accent-teal/[0.035] p-4">
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-[9px] uppercase tracking-[0.15em] text-white/30">
                      Balance after payment
                    </p>

                    <p className="mt-1 font-display text-xl font-semibold">
                      {formatCurrency(
                        newBalance,
                        currency
                      )}
                    </p>
                  </div>

                  <span className="mb-1 rounded-full bg-accent-teal/10 px-2 py-1 text-[9px] font-semibold text-accent-teal">
                    Updated
                  </span>
                </div>
              </div>

              {/* Method */}
              <div className="flex items-center justify-between">
                <span className="text-xs text-white/30">
                  Payment method
                </span>

                <span className="rounded-lg border border-white/[0.07] bg-white/[0.03] px-2.5 py-1.5 text-[10px] font-semibold text-white/60">
                  {paymentMethod === "CARD"
                    ? "Card"
                    : paymentMethod ===
                      "NETBANKING"
                    ? "Net Banking"
                    : "UPI"}
                </span>
              </div>

              {/* Continue */}
              <button
                type="button"
                disabled={
                  !paymentDetailsValid
                }
                onClick={handleContinue}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-accent-teal px-5 text-sm font-semibold text-navy-950 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-accent-teal/10 disabled:cursor-not-allowed disabled:bg-white/[0.07] disabled:text-white/20 disabled:shadow-none"
              >
                Continue to payment
                <ArrowRight className="h-4 w-4" />
              </button>

              {/* Security */}
              <div className="space-y-2 border-t border-white/[0.07] pt-4">
                <div className="flex items-center gap-2 text-[10px] text-white/25">
                  <LockKeyhole className="h-3.5 w-3.5 text-accent-teal/60" />
                  Secure payment
                </div>

                <div className="flex items-center gap-2 text-[10px] text-white/25">
                  <ShieldCheck className="h-3.5 w-3.5 text-accent-teal/60" />
                  Protected by encrypted payment processing
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

