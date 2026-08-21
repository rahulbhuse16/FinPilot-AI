import {
  HeartPulse,
  ShieldCheck,
  Users,
  AlertTriangle,
} from "lucide-react";

export interface CustomerDistribution {
  label: string;
  value: number;
  total?: number;
}

interface CustomerIntelligenceProps {
  customerCount?: number | string;
  distribution?: CustomerDistribution[];
  anomalyCount?: number | string;
  loading?: boolean;
}

export function CustomerIntelligence({
  customerCount,
  distribution = [],
  anomalyCount,
  loading = false,
}: CustomerIntelligenceProps) {
  if (loading) {
    return <CustomerSkeleton />;
  }

  const hasData =
    customerCount !== undefined ||
    anomalyCount !== undefined ||
    distribution.length > 0;

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6">
      <div className="flex items-start justify-between">
        <div className="flex gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-50">
            <Users className="h-4 w-4 text-slate-500" />
          </div>

          <div>
            <h2 className="font-display text-base font-semibold text-navy-900">
              Customer Intelligence
            </h2>

            <p className="mt-1 text-xs text-slate-400">
              Customer-level financial intelligence.
            </p>
          </div>
        </div>
      </div>

      {!hasData ? (
        <div className="py-12 text-center">
          <p className="text-sm font-semibold text-navy-900">
            No customer data available
          </p>

          <p className="mt-1 text-xs text-slate-400">
            Customer intelligence will appear when customer records are
            available.
          </p>
        </div>
      ) : (
        <>
          <div className="mt-6 grid grid-cols-2 gap-3">
            {customerCount !== undefined && (
              <Metric
                icon={<Users className="h-4 w-4" />}
                label="Customers"
                value={customerCount}
              />
            )}

            {anomalyCount !== undefined && (
              <Metric
                icon={<AlertTriangle className="h-4 w-4" />}
                label="Anomalies"
                value={anomalyCount}
              />
            )}
          </div>

          {distribution.length > 0 && (
            <div className="mt-7">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                Financial Health
              </p>

              <div className="mt-4 space-y-3">
                {distribution.map((item) => {
                  const total =
                    item.total ??
                    distribution.reduce(
                      (sum, current) => sum + current.value,
                      0
                    );

                  const percentage =
                    total > 0 ? (item.value / total) * 100 : 0;

                  return (
                    <div key={item.label}>
                      <div className="mb-1.5 flex justify-between text-xs">
                        <span className="text-slate-600">
                          {item.label}
                        </span>

                        <span className="font-semibold text-navy-900">
                          {item.value}
                        </span>
                      </div>

                      <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full bg-navy-900 transition-all"
                          style={{
                            width: `${Math.min(percentage, 100)}%`,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}
    </section>
  );
}

function Metric({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
}) {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-4">
      <div className="flex items-center gap-2 text-slate-400">
        {icon}
        <span className="text-[10px] font-semibold uppercase tracking-wide">
          {label}
        </span>
      </div>

      <p className="mt-2 font-display text-xl font-bold text-navy-900">
        {value}
      </p>
    </div>
  );
}

function CustomerSkeleton() {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6">
      <div className="h-5 w-48 animate-pulse rounded bg-slate-100" />
      <div className="mt-2 h-3 w-64 animate-pulse rounded bg-slate-100" />
      <div className="mt-6 h-20 animate-pulse rounded-xl bg-slate-100" />
      <div className="mt-6 h-24 animate-pulse rounded-xl bg-slate-100" />
    </section>
  );
}