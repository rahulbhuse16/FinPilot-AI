import type { LucideIcon } from "lucide-react";
import {
  AlertTriangle,
  ArrowRight,
  Car,
  CheckCircle2,
  Clock,
  CreditCard,
  GraduationCap,
  Home,
  Plus,
  X,
} from "lucide-react";
import { useState } from "react";

import { useFetch } from "../../hooks/useFetch";
import { portalApi } from "../../api/portal.api";
import { CardSkeleton } from "../../components/ui/LoadingSkeleton";
import { ErrorState } from "../../components/ui/ErrorState";
import { EmptyState } from "../../components/ui/EmptyState";
import { Badge } from "../../components/ui/Badge";
import { formatCurrency, formatPercent } from "../../utils/format";
import { useNavigate } from "react-router-dom";

const TYPE_ICON: Record<string, LucideIcon> = {
  HOME: Home,
  AUTO: Car,
  VEHICLE: Car,
  EDUCATION: GraduationCap,
};

const STATUS_CONFIG: Record<
  string,
  {
    tone: "positive" | "warning" | "risk" | "neutral";
    icon: LucideIcon;
  }
> = {
  ACTIVE: {
    tone: "warning",
    icon: Clock,
  },
  CLOSED: {
    tone: "positive",
    icon: CheckCircle2,
  },
  DELINQUENT: {
    tone: "risk",
    icon: AlertTriangle,
  },
  OVERDUE: {
    tone: "risk",
    icon: AlertTriangle,
  },
};

export function PortalLoansPage() {
  const {
    data,
    status,
    error,
    refetch,
  } = useFetch(
    (signal) => portalApi.loans(signal),
    []
  );

  const navigate=useNavigate()

  const [showApplyLoan, setShowApplyLoan] =
    useState(false);

  if (status === "loading") {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <CardSkeleton rows={4} />
        <CardSkeleton rows={4} />
      </div>
    );
  }

  if (status === "error") {
    return (
      <ErrorState
        message={error?.message}
        onRetry={refetch}
      />
    );
  }

  /*
   * Your loan model contains customer_id.
   *
   * Ideally, replace this with the customer ID
   * coming from your authenticated customer context.
   */
  const customerId = data?.[0]?.customer_id;

  /*
   * We intentionally DON'T return EmptyState before
   * rendering the page header, because the user should
   * still be able to see the "Apply for a loan" action.
   */
  return (
    <>
      <div className="space-y-6">

        {/* PAGE HEADER */}

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent-teal">
              Financial products
            </p>

            <h1 className="mt-1 font-display text-2xl font-semibold tracking-tight text-navy-900">
              Your loans
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Track your existing loans or apply
              for new financing.
            </p>
          </div>


          {/* APPLY BUTTON */}

          <a
            href="/portal/apply"
            type="button"
            className="group inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-navy-900 px-5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-navy-800 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
          >
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-white/10">
              <Plus
                className="h-4 w-4"
                strokeWidth={2.2}
              />
            </span>

            Apply for a loan

            <ArrowRight
              className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5"
            />
          </a>

        </div>


        {/* LOAN CONTENT */}

        {!data || data.length === 0 ? (

          <EmptyState
            icon={CreditCard}
            title="No loans"
            description="You have no loans with us right now."
          />

        ) : (

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">

            {data.map((loan, i) => {

              const TypeIcon =
                TYPE_ICON[
                  String(
                    loan.loan_type ?? ""
                  ).toUpperCase()
                ] ?? CreditCard;

              const statusKey =
                String(
                  loan.status ?? ""
                ).toUpperCase();

              const statusConfig =
                STATUS_CONFIG[
                  statusKey
                ] ?? {
                  tone: "neutral" as const,
                  icon: Clock,
                };

              const StatusIcon =
                statusConfig.icon;

              const principal =
                Number(
                  loan.principal_amount ?? 0
                );

              const outstanding =
                Number(
                  loan.outstanding_amount ?? 0
                );

              const paidPercent =
                principal > 0
                  ? Math.max(
                      0,
                      Math.min(
                        100,
                        ((principal -
                          outstanding) /
                          principal) *
                          100
                      )
                    )
                  : 0;

              return (
                <div
  key={loan.id}
  className="group animate-fade-in rounded-xl border border-slate-200 bg-white p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
  style={{
    animationDelay: `${i * 70}ms`,
  }}
>
  {/* CARD HEADER */}

  <div className="flex items-center justify-between">
    <div className="flex items-center gap-2.5">
      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-navy-900 text-white">
        <TypeIcon
          className="h-4 w-4"
          strokeWidth={1.85}
        />
      </span>

      <p className="font-display text-sm font-semibold text-navy-900">
        {loan.loan_type ?? "Loan"}
      </p>
    </div>

    <Badge tone={statusConfig.tone}>
      <StatusIcon className="h-3 w-3" />
      {String(loan.status ?? "")}
    </Badge>
  </div>

  {/* REPAYMENT PROGRESS */}

  {principal > 0 && (
    <div className="mt-4">
      <div className="flex items-center justify-between text-xs text-slate-500">
        <span>
          {paidPercent.toFixed(0)}% repaid
        </span>

        <span>
          {formatCurrency(outstanding)} left
        </span>
      </div>

      <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-accent-teal transition-all duration-500"
          style={{
            width: `${paidPercent}%`,
          }}
        />
      </div>
    </div>
  )}

  {/* LOAN DETAILS */}

  <dl className="mt-4 space-y-2 text-sm">
    <div className="flex justify-between">
      <dt className="text-slate-500">
        Outstanding
      </dt>

      <dd className="font-mono-num font-medium text-navy-900">
        {formatCurrency(outstanding)}
      </dd>
    </div>

    <div className="flex justify-between">
      <dt className="text-slate-500">
        Principal
      </dt>

      <dd className="font-mono-num text-navy-800">
        {formatCurrency(principal)}
      </dd>
    </div>

    <div className="flex justify-between">
      <dt className="text-slate-500">
        Monthly EMI
      </dt>

      <dd className="font-mono-num text-navy-800">
        {formatCurrency(
          Number(loan.monthly_emi ?? 0)
        )}
      </dd>
    </div>

    <div className="flex justify-between">
      <dt className="text-slate-500">
        Interest rate
      </dt>

      <dd className="font-mono-num text-navy-800">
        {formatPercent(
          Number(loan.interest_rate ?? 0),
          2
        )}
      </dd>
    </div>
  </dl>

  {/* PAY AMOUNT */}

  {loan.status!=='PENDING' && (
    <div className="mt-5 border-t border-slate-100 pt-4">
      <button
        type="button"
        onClick={() =>
          navigate(`/portal/pay-loan/${loan.id}`)
        }
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-navy-900 px-4 py-2.5 text-sm font-semibold text-white transition-all duration-200 hover:bg-navy-800 hover:shadow-md active:scale-[0.98]"
      >
        <CreditCard
          className="h-4 w-4"
          strokeWidth={1.8}
        />

        Pay Amount
      </button>
    </div>
  )}
</div>

              );
            })}

          </div>

        )}

      </div>


      {/* APPLY LOAN MODAL */}

      {showApplyLoan && (

        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-3 backdrop-blur-sm sm:p-6"
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              setShowApplyLoan(false);
            }
          }}
        >

          <div
            className="relative max-h-[95vh] w-full max-w-7xl overflow-y-auto rounded-3xl shadow-2xl"
            onMouseDown={(event) =>
              event.stopPropagation()
            }
          >

            {/* CLOSE BUTTON */}

            <button
              type="button"
              onClick={() =>
                setShowApplyLoan(false)
              }
              className="absolute right-4 top-4 z-20 flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white/90 text-slate-500 shadow-sm backdrop-blur transition-all duration-200 hover:bg-white hover:text-navy-900"
              aria-label="Close loan application"
            >
              <X className="h-5 w-5" />
            </button>


            {/* FORM */}

           

          </div>

        </div>

      )}

    </>
  );
}