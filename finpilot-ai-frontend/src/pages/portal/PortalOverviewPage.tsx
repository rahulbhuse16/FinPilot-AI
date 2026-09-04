import { useMemo } from "react";
import {
  Area,
  Bar,
  CartesianGrid,
  Cell,
  ComposedChart,
  Line,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AlertTriangle, ShieldCheck, TrendingDown, Wallet } from "lucide-react";
import { useFetch } from "../../hooks/useFetch";
import { useAuth } from "../../hooks/useAuth";
import { portalApi } from "../../api/portal.api";
import { FinancialMetricCard } from "../../components/financial/FinancialMetricCard";
import { CardSkeleton } from "../../components/ui/LoadingSkeleton";
import { ErrorState } from "../../components/ui/ErrorState";
import { EmptyState } from "../../components/ui/EmptyState";
import { formatCompactCurrency, formatDateTime, formatPercent } from "../../utils/format";

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

/* ------------------------------------------------------------------ */
/* Dashboard statistics types                                          */
/* ------------------------------------------------------------------ */

interface BalanceTrendItem {
  month: string;
  balance: number;
}

interface IncomeExpenseItem {
  month: string;
  income: number;
  expense: number;
}

interface SpendingCategoryItem {
  category: string;
  amount: number;
}

interface CashFlowItem {
  month: string;
  credits: number;
  debits: number;
}

interface LoanRepayment {
  paid: number;
  remaining: number;
  total: number;
  percentage: number;
}

interface DashboardStatisticsResponse {
  balance_trend: BalanceTrendItem[];
  income_expense: IncomeExpenseItem[];
  spending_by_category: SpendingCategoryItem[];
  cash_flow: CashFlowItem[];
  loan_repayment: LoanRepayment;
}

/* ------------------------------------------------------------------ */
/* Formatting + palette helpers                                        */
/* ------------------------------------------------------------------ */

const INR_FORMATTER = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

function formatINR(value: number): string {
  return INR_FORMATTER.format(Number.isFinite(value) ? value : 0);
}

const COLOR_TEAL = "#0d9488";
const COLOR_TEAL_SOFT = "rgba(13, 148, 136, 0.18)";
const COLOR_RED = "#e11d48";
const COLOR_NAVY = "#1e3a5f";
const COLOR_BLUE = "#3b82f6";
const COLOR_AMBER = "#f59e0b";
const COLOR_VIOLET = "#8b5cf6";
const COLOR_SLATE = "#94a3b8";

const CATEGORY_COLORS = [COLOR_NAVY, COLOR_BLUE, COLOR_RED, COLOR_AMBER, COLOR_VIOLET, COLOR_SLATE];

const GRID_STROKE = "#eef2f7";
const AXIS_TICK = { fill: "#94a3b8", fontSize: 11 };
const TOOLTIP_STYLE: React.CSSProperties = {
  borderRadius: 12,
  border: "1px solid #e2e8f0",
  boxShadow: "0 8px 24px rgba(15, 23, 42, 0.08)",
  fontSize: 12,
};

/* ------------------------------------------------------------------ */
/* Shared card shell                                                    */
/* ------------------------------------------------------------------ */

function ChartCard({
  title,
  subtitle,
  badge,
  className,
  bodyClassName,
  children,
}: {
  title: string;
  subtitle?: string;
  badge?: string;
  className?: string;
  bodyClassName?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`flex flex-col overflow-hidden rounded-2xl border border-slate-100 bg-gradient-to-b from-white to-slate-50/60 shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-shadow duration-200 hover:shadow-[0_4px_16px_rgba(15,23,42,0.06)] ${className ?? ""}`}
    >
      <div className="flex items-start justify-between gap-3 px-5 pt-4 pb-3">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wide text-navy-900">{title}</p>
          {subtitle && <p className="mt-0.5 text-[11px] text-slate-400">{subtitle}</p>}
        </div>
        {badge && (
          <span className="shrink-0 whitespace-nowrap rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-medium text-slate-600">
            {badge}
          </span>
        )}
      </div>
      <div className={`flex-1 px-5 pb-5 ${bodyClassName ?? ""}`}>{children}</div>
    </div>
  );
}

function ChartEmptyState({ message }: { message: string }) {
  return <div className="flex h-[220px] items-center justify-center text-sm text-slate-400">{message}</div>;
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-[11px] text-slate-500">
      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
      {label}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* 1. Balance trend — labeled smooth area chart                        */
/* ------------------------------------------------------------------ */

function BalanceTrendChart({ data }: { data: BalanceTrendItem[] }) {
  if (!data || data.length === 0) {
    return <ChartEmptyState message="No balance history available yet." />;
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <ComposedChart data={data} margin={{ top: 28, right: 16, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="balanceTrendFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={COLOR_TEAL} stopOpacity={0.28} />
            <stop offset="100%" stopColor={COLOR_TEAL} stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke={GRID_STROKE} vertical={false} />
        <XAxis dataKey="month" tick={AXIS_TICK} axisLine={{ stroke: GRID_STROKE }} tickLine={false} />
        <YAxis
          tick={AXIS_TICK}
          axisLine={false}
          tickLine={false}
          width={64}
          tickFormatter={(value: number) => formatCompactCurrency(value)}
        />
        <Tooltip formatter={(value: number) => [formatINR(value), "Balance"]} contentStyle={TOOLTIP_STYLE} />
        <Area
          type="monotone"
          dataKey="balance"
          stroke={COLOR_TEAL}
          strokeWidth={2.5}
          fill="url(#balanceTrendFill)"
          isAnimationActive
          animationDuration={700}
          dot={{ r: 4, fill: COLOR_TEAL, strokeWidth: 0 }}
          activeDot={{ r: 6 }}
          label={{
            position: "top",
            fontSize: 11,
            fill: "#475569",
            formatter: (value: number) => formatCompactCurrency(value),
          }}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}

/* ------------------------------------------------------------------ */
/* 2. Spending by category — donut with external labels                */
/* ------------------------------------------------------------------ */

const MAX_SPENDING_SLICES = 6;
const RADIAN = Math.PI / 180;

interface PieLabelRenderProps {
  cx: number;
  cy: number;
  midAngle: number;
  outerRadius: number;
  percent: number;
  name: string;
}

function renderCategoryLabel(props: PieLabelRenderProps) {
  const { cx, cy, midAngle, outerRadius, percent, name } = props;
  if (percent < 0.04) return null;

  const lineStart = outerRadius + 6;
  const lineEnd = outerRadius + 14;
  const sin = Math.sin(-RADIAN * midAngle);
  const cos = Math.cos(-RADIAN * midAngle);

  const startX = cx + lineStart * cos;
  const startY = cy + lineStart * sin;
  const endX = cx + lineEnd * cos;
  const endY = cy + lineEnd * sin;
  const textX = endX + (cos >= 0 ? 4 : -4);
  const textAnchor = cos >= 0 ? "start" : "end";

  return (
    <g>
      <path d={`M${startX},${startY}L${endX},${endY}`} stroke="#cbd5e1" strokeWidth={1} fill="none" />
      <text x={textX} y={endY} textAnchor={textAnchor} dominantBaseline="central" fontSize={10.5} fill="#475569">
        {name} ({Math.round(percent * 100)}%)
      </text>
    </g>
  );
}

function SpendingByCategoryChart({ data }: { data: SpendingCategoryItem[] }) {
  const { slices, total } = useMemo(() => {
    if (!data || data.length === 0) {
      return { slices: [] as SpendingCategoryItem[], total: 0 };
    }
    const sorted = [...data].sort((a, b) => b.amount - a.amount);
    const total = sorted.reduce((sum, item) => sum + (item.amount ?? 0), 0);

    if (sorted.length <= MAX_SPENDING_SLICES) {
      return { slices: sorted, total };
    }

    const top = sorted.slice(0, MAX_SPENDING_SLICES - 1);
    const otherAmount = sorted.slice(MAX_SPENDING_SLICES - 1).reduce((sum, item) => sum + (item.amount ?? 0), 0);
    return { slices: [...top, { category: "Other", amount: otherAmount }], total };
  }, [data]);

  if (slices.length === 0) {
    return <ChartEmptyState message="No spending activity to categorize yet." />;
  }

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-full">
        <ResponsiveContainer width="100%" height={240}>
          <PieChart margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
            <Pie
              data={slices}
              dataKey="amount"
              nameKey="category"
              innerRadius="52%"
              outerRadius="70%"
              paddingAngle={2}
              isAnimationActive
              animationDuration={700}
              labelLine={false}
              label={renderCategoryLabel}
            >
              {slices.map((entry, index) => (
                <Cell
                  key={entry.category}
                  fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]}
                  stroke="#fff"
                  strokeWidth={2}
                />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number, name: string) => [
                `${formatINR(value)} (${total > 0 ? Math.round((value / total) * 100) : 0}%)`,
                name,
              ]}
              contentStyle={TOOLTIP_STYLE}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute left-1/2 top-1/2 w-24 -translate-x-1/2 -translate-y-1/2 text-center">
          <p className="text-[10px] uppercase tracking-wide text-slate-400">Total spending</p>
          <p className="font-mono-num text-sm font-bold text-navy-900">{formatCompactCurrency(total)}</p>
        </div>
      </div>
      <div className="mt-2 flex flex-wrap justify-center gap-x-4 gap-y-1.5">
        {slices.map((entry, index) => (
          <LegendDot key={entry.category} color={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} label={entry.category} />
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 3. Income vs expense — grouped bar chart with value labels          */
/* ------------------------------------------------------------------ */

function IncomeExpenseChart({ data }: { data: IncomeExpenseItem[] }) {
  if (!data || data.length === 0) {
    return <ChartEmptyState message="No income or expense data available yet." />;
  }

  return (
    <>
      <ResponsiveContainer width="100%" height={220}>
        <ComposedChart data={data} margin={{ top: 22, right: 8, left: 0, bottom: 0 }} barGap={6}>
          <CartesianGrid strokeDasharray="3 3" stroke={GRID_STROKE} vertical={false} />
          <XAxis dataKey="month" tick={AXIS_TICK} axisLine={{ stroke: GRID_STROKE }} tickLine={false} />
          <YAxis
            tick={AXIS_TICK}
            axisLine={false}
            tickLine={false}
            width={52}
            tickFormatter={(value: number) => formatCompactCurrency(value)}
          />
          <Tooltip
            formatter={(value: number, name: string) => [formatINR(value), name === "income" ? "Income" : "Expense"]}
            contentStyle={TOOLTIP_STYLE}
          />
          <Bar
            dataKey="income"
            fill={COLOR_TEAL}
            radius={[3, 3, 0, 0]}
            isAnimationActive
            animationDuration={700}
            label={{ position: "top", fontSize: 9.5, fill: "#0d9488", formatter: (v: number) => formatCompactCurrency(v) }}
          />
          <Bar
            dataKey="expense"
            fill={COLOR_RED}
            radius={[3, 3, 0, 0]}
            isAnimationActive
            animationDuration={700}
            label={{ position: "top", fontSize: 9.5, fill: "#e11d48", formatter: (v: number) => formatCompactCurrency(v) }}
          />
        </ComposedChart>
      </ResponsiveContainer>
      <div className="mt-1 flex justify-center gap-4">
        <LegendDot color={COLOR_TEAL} label="Income" />
        <LegendDot color={COLOR_RED} label="Expense" />
      </div>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* 4. Cash flow — bars + net cash flow line                            */
/* ------------------------------------------------------------------ */

function CashFlowChart({ data }: { data: CashFlowItem[] }) {
  const withNet = useMemo(
    () => (data ?? []).map((item) => ({ ...item, net: (item.credits ?? 0) - (item.debits ?? 0) })),
    [data],
  );

  if (!withNet || withNet.length === 0) {
    return <ChartEmptyState message="No cash flow data available yet." />;
  }

  return (
    <>
      <ResponsiveContainer width="100%" height={220}>
        <ComposedChart data={withNet} margin={{ top: 10, right: 8, left: 0, bottom: 0 }} barGap={6}>
          <CartesianGrid strokeDasharray="3 3" stroke={GRID_STROKE} vertical={false} />
          <XAxis dataKey="month" tick={AXIS_TICK} axisLine={{ stroke: GRID_STROKE }} tickLine={false} />
          <YAxis
            tick={AXIS_TICK}
            axisLine={false}
            tickLine={false}
            width={60}
            tickFormatter={(value: number) => formatCompactCurrency(value)}
          />
          <Tooltip
            formatter={(value: number, name: string) => {
              const label = name === "credits" ? "Credits" : name === "debits" ? "Debits" : "Net cash flow";
              return [formatINR(value), label];
            }}
            contentStyle={TOOLTIP_STYLE}
          />
          <Bar dataKey="credits" fill={COLOR_TEAL} radius={[3, 3, 0, 0]} isAnimationActive animationDuration={700} />
          <Bar dataKey="debits" fill={COLOR_RED} radius={[3, 3, 0, 0]} isAnimationActive animationDuration={700} />
          <Line
            type="monotone"
            dataKey="net"
            stroke={COLOR_BLUE}
            strokeWidth={2}
            dot={{ r: 3, fill: COLOR_BLUE, strokeWidth: 0 }}
            isAnimationActive
            animationDuration={700}
          />
        </ComposedChart>
      </ResponsiveContainer>
      <div className="mt-1 flex flex-wrap justify-center gap-4">
        <LegendDot color={COLOR_TEAL} label="Credits" />
        <LegendDot color={COLOR_RED} label="Debits" />
        <LegendDot color={COLOR_BLUE} label="Net cash flow" />
      </div>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* 5. Loan repayment — donut + repayment summary                       */
/* ------------------------------------------------------------------ */

function LoanRepaymentChart({ data }: { data: LoanRepayment | null | undefined }) {
  const paid = Number(data?.paid ?? 0);
  const remaining = Number(data?.remaining ?? 0);
  const total = Number(data?.total ?? 0);
  const percentage = Number(data?.percentage ?? 0);

  if (!data || total <= 0) {
    return <ChartEmptyState message="No active loans." />;
  }

  const donutData = [
    { name: "Paid", value: paid },
    { name: "Remaining", value: remaining },
  ];

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        <ResponsiveContainer width={168} height={168}>
          <PieChart>
            <Pie
              data={donutData}
              dataKey="value"
              nameKey="name"
              innerRadius="70%"
              outerRadius="94%"
              startAngle={90}
              endAngle={-270}
              isAnimationActive
              animationDuration={700}
              stroke="none"
            >
              <Cell fill={COLOR_TEAL} />
              <Cell fill={COLOR_TEAL_SOFT} />
            </Pie>
            <Tooltip formatter={(value: number, name: string) => [formatINR(value), name]} contentStyle={TOOLTIP_STYLE} />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
          <p className="text-[10px] uppercase tracking-wide text-slate-400">Remaining</p>
          <p className="font-mono-num text-sm font-bold text-navy-900">{formatCompactCurrency(remaining)}</p>
        </div>
        <span className="absolute -right-1 top-2 rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[10px] font-semibold text-teal-700 shadow-sm">
          {percentage}% paid
        </span>
      </div>

      <div className="grid w-full grid-cols-2 gap-2">
        <div className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-center">
          <p className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: COLOR_TEAL }} />
            Paid
          </p>
          <p className="font-mono-num mt-0.5 text-sm font-semibold text-navy-900">{formatINR(paid)}</p>
        </div>
        <div className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-center">
          <p className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: COLOR_TEAL_SOFT }} />
            Remaining
          </p>
          <p className="font-mono-num mt-0.5 text-sm font-semibold text-navy-900">{formatINR(remaining)}</p>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                 */
/* ------------------------------------------------------------------ */

export function PortalOverviewPage() {
  const { user } = useAuth();
  const { data: summary, status, error, refetch } = useFetch((signal) => portalApi.summary(signal), []);
  const {
    data: statistics,
    status: statisticsStatus,
    error: statisticsError,
    refetch: refetchStatistics,
  } = useFetch<DashboardStatisticsResponse>((signal) => portalApi.dashboardStatistics(signal), []);

  const firstName = user?.full_name?.trim().split(/\s+/)[0];

  if (status === "loading") {
    return (
      <div className="space-y-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <CardSkeleton key={i} rows={2} />
          ))}
        </div>
        <CardSkeleton rows={3} />
      </div>
    );
  }

  if (status === "error") {
    return <ErrorState message={error?.message} onRetry={refetch} />;
  }

  if (!summary) {
    return <EmptyState title="No account summary available" />;
  }

  const dti = Number(summary.debt_to_income_ratio ?? 0);

  const kpiCards = [
    {
      key: "balance",
      node: (
        <FinancialMetricCard
          label="Total Balance"
          value={formatCompactCurrency(Number(summary.total_balance ?? 0))}
          sublabel={`${summary.account_count ?? 0} account(s)`}
          icon={Wallet}
        />
      ),
    },
    {
      key: "loan",
      node: (
        <FinancialMetricCard
          label="Loan Outstanding"
          value={formatCompactCurrency(Number(summary.total_loan_outstanding ?? 0))}
          sublabel={`${summary.active_loan_count ?? 0} active loan(s)`}
          icon={TrendingDown}
          tone={Number(summary.total_loan_outstanding ?? 0) > 0 ? "warning" : "neutral"}
        />
      ),
    },
    {
      key: "emi",
      node: (
        <FinancialMetricCard
          label="Monthly EMI"
          value={formatCompactCurrency(Number(summary.total_monthly_emi ?? 0))}
          sublabel="Across active loans"
          icon={TrendingDown}
        />
      ),
    },
    {
      key: "dti",
      node: (
        <FinancialMetricCard
          label="Debt-to-Income"
          value={formatPercent(dti)}
          sublabel="Share of monthly income"
          tone={dti <= 35 ? "positive" : dti <= 50 ? "warning" : "risk"}
        />
      ),
    },
  ];

  // Derived, real (non-fabricated) figures used in card badges below.
  const latestBalance = statistics?.balance_trend?.length
    ? statistics.balance_trend[statistics.balance_trend.length - 1].balance
    : null;
  const netIncomeExpense = statistics?.income_expense?.length
    ? statistics.income_expense.reduce((sum, item) => sum + (item.income ?? 0) - (item.expense ?? 0), 0)
    : null;
  const netCashFlow = statistics?.cash_flow?.length
    ? statistics.cash_flow.reduce((sum, item) => sum + (item.credits ?? 0) - (item.debits ?? 0), 0)
    : null;

  return (
    <div className="space-y-5">
      {firstName && (
        <p className="animate-fade-in text-sm text-slate-500">
          {getGreeting()}, <span className="font-medium text-navy-800">{firstName}</span> — here's where things
          stand.
        </p>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpiCards.map((card, i) => (
          <div
            key={card.key}
            className="animate-fade-in transition-transform duration-200 hover:-translate-y-0.5"
            style={{ animationDelay: `${i * 60}ms` }}
          >
            {card.node}
          </div>
        ))}
      </div>

     

      {/* Financial insights */}
      <div className="space-y-4">
        <p className="font-display text-sm font-semibold text-navy-900">Financial insights</p>

        {statisticsStatus === "loading" && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
              <CardSkeleton rows={4} className="lg:col-span-3" />
              <CardSkeleton rows={4} className="lg:col-span-2" />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <CardSkeleton rows={4} />
              <CardSkeleton rows={4} />
              <CardSkeleton rows={4} />
            </div>
          </div>
        )}

        {statisticsStatus === "error" && <ErrorState message={statisticsError?.message} onRetry={refetchStatistics} />}

        {statisticsStatus !== "loading" && statisticsStatus !== "error" && !statistics && (
          <EmptyState title="No financial statistics available" />
        )}

        {statistics && (
          <>
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
              <ChartCard
                title="Balance trend"
                subtitle="Past 6 months"
                badge={latestBalance !== null ? `Current balance: ${formatINR(latestBalance)}` : undefined}
                className="lg:col-span-3"
              >
                <BalanceTrendChart data={statistics.balance_trend ?? []} />
              </ChartCard>

              <ChartCard
                title="Spending by category"
                subtitle="By category"
                badge={
                  statistics.spending_by_category?.length
                    ? `${statistics.spending_by_category.length} categories`
                    : undefined
                }
                className="lg:col-span-2"
              >
                <SpendingByCategoryChart data={statistics.spending_by_category ?? []} />
              </ChartCard>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <ChartCard
                title="Income vs expense"
                subtitle="Monthly"
                badge={netIncomeExpense !== null ? `Net: ${formatCompactCurrency(netIncomeExpense)}` : undefined}
              >
                <IncomeExpenseChart data={statistics.income_expense ?? []} />
              </ChartCard>

              <ChartCard
                title="Cash flow"
                subtitle="Monthly"
                badge={netCashFlow !== null ? `Net flow: ${formatCompactCurrency(netCashFlow)}` : undefined}
              >
                <CashFlowChart data={statistics.cash_flow ?? []} />
              </ChartCard>

              <ChartCard title="Loan repayment" subtitle="Overview">
                <LoanRepaymentChart data={statistics.loan_repayment} />
              </ChartCard>
            </div>
          </>
        )}
      </div>
    </div>
  );
}