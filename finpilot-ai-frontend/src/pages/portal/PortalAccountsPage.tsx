import { useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  ArrowUpRight,
  Check,
  ChevronRight,
  Copy,
  CreditCard,
  Landmark,
  PiggyBank,
  Plus,
  Wallet,
  WalletIcon,
} from "lucide-react";
import { Link } from "react-router-dom";

import { useFetch } from "../../hooks/useFetch";
import { portalApi } from "../../api/portal.api";
import { TableSkeleton } from "../../components/ui/LoadingSkeleton";
import { ErrorState } from "../../components/ui/ErrorState";
import { EmptyState } from "../../components/ui/EmptyState";
import { Badge } from "../../components/ui/Badge";
import { formatCurrency } from "../../utils/format";

const TYPE_ICON: Record<string, LucideIcon> = {
  SAVINGS: PiggyBank,
  CURRENT: Landmark,
  CREDIT: CreditCard,
};

const TYPE_LABEL: Record<string, string> = {
  SAVINGS: "Savings Account",
  CURRENT: "Current Account",
  CREDIT: "Credit Account",
};

function maskAccountNumber(value: string): string {
  const digits = value.replace(/\s+/g, "");

  if (digits.length <= 4) return digits;

  return `•••• •••• ${digits.slice(-4)}`;
}

export function PortalAccountsPage() {
  const {
    data,
    status,
    error,
    refetch,
  } = useFetch((signal) => portalApi.accounts(signal), []);

  const [copiedId, setCopiedId] = useState<string | null>(null);

  async function handleCopy(id: string, accountNumber: string) {
    try {
      await navigator.clipboard.writeText(accountNumber);

      setCopiedId(id);

      setTimeout(() => {
        setCopiedId((current) => (current === id ? null : current));
      }, 1500);
    } catch {
      // Ignore clipboard errors.
    }
  }

  if (status === "loading") {
    return <TableSkeleton rows={4} />;
  }

  if (status === "error") {
    return <ErrorState message={error?.message} onRetry={refetch} />;
  }

  if (!data || data.length === 0) {
    return (
      <div className="rounded-3xl border border-navy-100 bg-white p-8 shadow-sm">
        <EmptyState
          icon={Wallet}
          title="No accounts yet"
          description="Create your first account to start managing your finances."
          action={
            <Link
              to="/portal/create-account"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-navy-900 px-5 text-sm font-semibold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-navy-800 hover:shadow-md"
            >
              <Plus className="h-4 w-4" />
              Create Account
            </Link>
          }
        />
      </div>
    );
  }

  const totalBalance = data.reduce(
    (total, account) => total + Number(account.balance ?? 0),
    0
  );

  const activeAccounts = data.filter(
    (account) => account.status === "ACTIVE"
  ).length;

   return (
  <div className="min-h-full space-y-7">
    {/* Header */}
    <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <div className="mb-2 flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-accent-teal" />
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-navy-400">
            Financial accounts
          </p>
        </div>

        <h1 className="font-display text-3xl font-semibold tracking-tight text-navy-950">
          Your accounts
        </h1>

        <p className="mt-1.5 text-sm text-navy-500">
          All your accounts, balances and activity in one place.
        </p>
      </div>

      <Link
        to="/portal/create-account"
        className="inline-flex h-11 items-center gap-2 self-start rounded-xl bg-navy-950 px-5 text-sm font-semibold text-white shadow-lg shadow-navy-950/10 transition-all duration-200 hover:-translate-y-0.5 hover:bg-navy-800 sm:self-auto"
      >
        <Plus className="h-4 w-4" strokeWidth={2.2} />
        New account
      </Link>
    </div>

    {/* Portfolio summary */}
    <div className="relative overflow-hidden rounded-[28px] border border-navy-800 bg-[#08111f] px-6 py-6 text-white shadow-xl shadow-navy-950/10 sm:px-8">
      {/* Background glow */}
      <div
        className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-accent-teal/10 blur-[90px]"
        aria-hidden="true"
      />

      <div
        className="pointer-events-none absolute -bottom-32 left-1/3 h-64 w-64 rounded-full bg-blue-500/5 blur-[90px]"
        aria-hidden="true"
      />

      <div className="relative">
        <div className="flex flex-col justify-between gap-7 md:flex-row md:items-end">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-white/40">
              Total portfolio balance
            </p>

            <p className="font-display mt-2 text-4xl font-semibold tracking-tight sm:text-5xl">
              {formatCurrency(totalBalance, "INR")}
            </p>

            <div className="mt-3 flex items-center gap-2 text-xs text-white/45">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-accent-teal/10">
                <Wallet className="h-3 w-3 text-accent-teal" />
              </span>

              {data.length} {data.length === 1 ? "account" : "accounts"}
              <span className="text-white/20">•</span>
              {activeAccounts} active
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 md:min-w-[250px]">
            <div>
              <p className="text-[10px] uppercase tracking-[0.16em] text-white/35">
                Accounts
              </p>

              <p className="mt-1 text-xl font-semibold text-white">
                {data.length}
              </p>
            </div>

            <div>
              <p className="text-[10px] uppercase tracking-[0.16em] text-white/35">
                Active
              </p>

              <p className="mt-1 text-xl font-semibold text-accent-teal">
                {activeAccounts}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* Section heading */}
    <div className="flex items-end justify-between">
      <div>
        <h2 className="font-display text-lg font-semibold text-navy-950">
          Accounts
        </h2>

        <p className="mt-0.5 text-xs text-navy-400">
          Select an account to view more details.
        </p>
      </div>

      <span className="text-xs font-medium text-navy-400">
        {data.length} total
      </span>
    </div>

    {/* Account cards */}
    <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
      {data.map((account, index) => {
        const type = String(account.account_type ?? "").toUpperCase();

        const Icon =
          TYPE_ICON[type] ?? Wallet;

        const accountNumber =
          String(account.account_number ?? "");

        const isActive =
          account.status === "ACTIVE";

        const balance =
          Number(account.balance ?? 0);

        return (
          <div
            key={account.id}
            className="group relative min-h-[265px] overflow-hidden rounded-[28px] border border-white/[0.08] bg-[#0b1524] text-white shadow-2xl shadow-navy-950/20 transition-all duration-300 hover:-translate-y-1 hover:border-white/[0.14] hover:shadow-navy-950/30"
            style={{
              animationDelay: `${index * 80}ms`,
            }}
          >
            {/* Card shine */}
            <div
              className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/[0.045] via-transparent to-transparent"
              aria-hidden="true"
            />

            {/* Teal ambient glow */}
            <div
              className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-accent-teal/[0.09] blur-[70px] transition-all duration-500 group-hover:bg-accent-teal/[0.14]"
              aria-hidden="true"
            />

            {/* Decorative circle */}
            <div
              className="pointer-events-none absolute -bottom-24 -right-12 h-48 w-48 rounded-full border border-white/[0.035]"
              aria-hidden="true"
            />

            <div
              className="pointer-events-none absolute -bottom-16 -right-4 h-32 w-32 rounded-full border border-white/[0.035]"
              aria-hidden="true"
            />

            <div className="relative flex h-full flex-col justify-between p-6 sm:p-7">
              {/* Top */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.055]">
                    <Icon
                      className="h-5 w-5 text-accent-teal"
                      strokeWidth={1.7}
                    />
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-white">
                      {TYPE_LABEL[type] ?? "Account"}
                    </p>

                    <p className="mt-0.5 text-[11px] uppercase tracking-[0.12em] text-white/35">
                      {account.currency ?? "INR"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      isActive
                        ? "bg-accent-teal shadow-[0_0_10px_rgba(45,212,191,0.7)]"
                        : "bg-white/25"
                    }`}
                  />

                  <span className="text-[10px] font-medium uppercase tracking-[0.14em] text-white/45">
                    {String(account.status ?? "").toLowerCase()}
                  </span>
                </div>
              </div>

              {/* Balance */}
              <div className="mt-8">
                <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-white/35">
                  Available balance
                </p>

                <p className="font-display mt-1 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                  {formatCurrency(
                    balance,
                    String(account.currency ?? "INR")
                  )}
                </p>
              </div>

              {/* Bottom */}
              <div className="mt-7 flex items-end justify-between border-t border-white/[0.07] pt-4">
                <div>
                  <p className="text-[9px] uppercase tracking-[0.18em] text-white/30">
                    Account number
                  </p>

                  <div className="mt-1.5 flex items-center gap-2">
                    <p className="font-mono-num text-sm tracking-[0.2em] text-white/70">
                      {maskAccountNumber(accountNumber)}
                    </p>

                    {accountNumber && (
                      <button
                        type="button"
                        onClick={() =>
                          handleCopy(
                            account.id,
                            accountNumber
                          )
                        }
                        className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/[0.07] bg-white/[0.035] text-white/40 transition-all hover:border-white/[0.12] hover:bg-white/[0.08] hover:text-white"
                        aria-label="Copy account number"
                      >
                        {copiedId === account.id ? (
                          <Check
                            className="h-3.5 w-3.5 text-accent-teal"
                          />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                      </button>
                    )}
                  </div>
                </div>

                <Link
                 to={`/portal/accounts/${account.id}/add-money`}
                  className="flex h-9 items-center gap-1.5 rounded-lg border border-white/[0.2] bg-white/[0.035] px-3 text-xs font-medium text-white/55 transition-all hover:border-white/[0.12] hover:bg-white/[0.08] hover:text-white"
                >
                  Add Balance
                  <WalletIcon className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </div>
        );
      })}
    </div>

    {/* Create another */}
    <Link
      to="/portal/create-account"
      className="group flex min-h-[100px] items-center justify-between rounded-2xl border border-dashed border-navy-200 bg-navy-50/30 px-5 transition-all hover:border-navy-300 hover:bg-navy-50"
    >
      <div className="flex items-center gap-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-navy-900 text-white shadow-sm">
          <Plus className="h-4 w-4" />
        </div>

        <div>
          <p className="text-sm font-semibold text-navy-900">
            Open another account
          </p>

          <p className="mt-0.5 text-xs text-navy-400">
            Keep your savings, spending and credit organized.
          </p>
        </div>
      </div>

      <ChevronRight className="h-4 w-4 text-navy-300 transition-transform group-hover:translate-x-1 group-hover:text-navy-600" />
    </Link>
  </div>
);
  
}