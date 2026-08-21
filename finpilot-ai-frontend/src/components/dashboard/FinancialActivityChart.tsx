import {
  Activity,
  BarChart3,
  PieChart,
  ScatterChart as ScatterIcon,
  TrendingUp,
} from "lucide-react";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  ScatterChart,
  Scatter,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

export interface FinancialChartPoint {
  label: string;
  value: number;
  secondaryValue?: number;
}

interface FinancialActivityChartProps {
  data: FinancialChartPoint[];
  title?: string;
  subtitle?: string;
  valueFormatter?: (value: number) => string;
  primaryLabel?: string;
  secondaryLabel?: string;
  loading?: boolean;
}

export function FinancialActivityChart({
  data,
  title = "Transaction Intelligence",
  subtitle = "Financial activity across available accounts",
  valueFormatter = (value) => value.toLocaleString(),
  primaryLabel = "Credits",
  secondaryLabel = "Debits",
  loading = false,
}: FinancialActivityChartProps) {
  if (loading) {
    return <ChartSkeleton />;
  }

  if (!data.length) {
    return (
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <ChartHeader title={title} subtitle={subtitle} />
        <EmptyState />
      </section>
    );
  }

  const pieData = [
    {
      name: primaryLabel,
      value: data.reduce(
        (sum, item) => sum + item.value,
        0
      ),
    },
    {
      name: secondaryLabel,
      value: data.reduce(
        (sum, item) =>
          sum + (item.secondaryValue ?? 0),
        0
      ),
    },
  ].filter((item) => item.value > 0);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      {/* Main section header */}
      <ChartHeader
        title={title}
        subtitle={subtitle}
      />

      {/* Legend */}
      <div className="mt-5 flex flex-wrap items-center gap-5 text-xs text-slate-500">
        <LegendItem
          className="bg-navy-900"
          label={primaryLabel}
        />

        <LegendItem
          className="bg-sky-400"
          label={secondaryLabel}
        />
      </div>

      {/* Four charts */}
      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* =====================================================
            1. BAR CHART
        ===================================================== */}
        <ChartCard
          icon={<BarChart3 className="h-4 w-4" />}
          title="Credits vs Debits"
          subtitle="Daily transaction volume"
        >
          <TransactionBarChart
            data={data}
            valueFormatter={valueFormatter}
            primaryLabel={primaryLabel}
            secondaryLabel={secondaryLabel}
          />
        </ChartCard>

        {/* =====================================================
            2. LINE / CURVE CHART
        ===================================================== */}
        <ChartCard
          icon={<TrendingUp className="h-4 w-4" />}
          title="Financial Trend"
          subtitle="Movement of credits and debits over time"
        >
          <TransactionLineChart
            data={data}
            valueFormatter={valueFormatter}
            primaryLabel={primaryLabel}
            secondaryLabel={secondaryLabel}
          />
        </ChartCard>

        {/* =====================================================
            3. SCATTER CHART
        ===================================================== */}
        <ChartCard
          icon={<ScatterIcon className="h-4 w-4" />}
          title="Transaction Distribution"
          subtitle="Transaction amount distribution by period"
        >
          <TransactionScatterChart
            data={data}
            valueFormatter={valueFormatter}
            primaryLabel={primaryLabel}
            secondaryLabel={secondaryLabel}
          />
        </ChartCard>

        {/* =====================================================
            4. PIE / DONUT CHART
        ===================================================== */}
        <ChartCard
          icon={<PieChart className="h-4 w-4" />}
          title="Credit vs Debit Split"
          subtitle="Overall transaction composition"
        >
          <TransactionPieChart
            data={pieData}
            valueFormatter={valueFormatter}
          />
        </ChartCard>
      </div>
    </section>
  );
}

/* =========================================================
   CHART CARD
========================================================= */

function ChartCard({
  icon,
  title,
  subtitle,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4">
      <div className="flex items-start gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-slate-500 shadow-sm">
          {icon}
        </div>

        <div>
          <h3 className="text-sm font-semibold text-navy-900">
            {title}
          </h3>

          <p className="mt-0.5 text-[11px] text-slate-400">
            {subtitle}
          </p>
        </div>
      </div>

      <div className="mt-4 h-[250px] w-full">
        {children}
      </div>
    </div>
  );
}

/* =========================================================
   BAR CHART
========================================================= */

function TransactionBarChart({
  data,
  valueFormatter,
  primaryLabel,
  secondaryLabel,
}: {
  data: FinancialChartPoint[];
  valueFormatter: (value: number) => string;
  primaryLabel: string;
  secondaryLabel: string;
}) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={data}
        margin={{
          top: 5,
          right: 10,
          left: 0,
          bottom: 5,
        }}
        barGap={3}
      >
        <CartesianGrid
          strokeDasharray="3 3"
          vertical={false}
          stroke="#e2e8f0"
        />

        <XAxis
          dataKey="label"
          axisLine={false}
          tickLine={false}
          tick={{
            fontSize: 9,
            fill: "#94a3b8",
          }}
        />

        <YAxis
          axisLine={false}
          tickLine={false}
          width={65}
          tick={{
            fontSize: 9,
            fill: "#94a3b8",
          }}
          tickFormatter={valueFormatter}
        />

        <Tooltip
          formatter={(value, name) => [
            valueFormatter(Number(value)),
            String(name),
          ]}
          contentStyle={{
            borderRadius: 10,
            border: "1px solid #e2e8f0",
            fontSize: 12,
          }}
        />

        <Legend
          wrapperStyle={{
            fontSize: 11,
          }}
        />

        <Bar
          dataKey="value"
          name={primaryLabel}
          fill="#0f172a"
          radius={[4, 4, 0, 0]}
          maxBarSize={20}
        />

        <Bar
          dataKey="secondaryValue"
          name={secondaryLabel}
          fill="#38bdf8"
          radius={[4, 4, 0, 0]}
          maxBarSize={20}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}

/* =========================================================
   LINE / CURVE CHART
========================================================= */

function TransactionLineChart({
  data,
  valueFormatter,
  primaryLabel,
  secondaryLabel,
}: {
  data: FinancialChartPoint[];
  valueFormatter: (value: number) => string;
  primaryLabel: string;
  secondaryLabel: string;
}) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        data={data}
        margin={{
          top: 10,
          right: 10,
          left: 0,
          bottom: 5,
        }}
      >
        <CartesianGrid
          strokeDasharray="3 3"
          vertical={false}
          stroke="#e2e8f0"
        />

        <XAxis
          dataKey="label"
          axisLine={false}
          tickLine={false}
          tick={{
            fontSize: 9,
            fill: "#94a3b8",
          }}
        />

        <YAxis
          axisLine={false}
          tickLine={false}
          width={65}
          tick={{
            fontSize: 9,
            fill: "#94a3b8",
          }}
          tickFormatter={valueFormatter}
        />

        <Tooltip
          formatter={(value, name) => [
            valueFormatter(Number(value)),
            String(name),
          ]}
          contentStyle={{
            borderRadius: 10,
            border: "1px solid #e2e8f0",
            fontSize: 12,
          }}
        />

        <Legend
          wrapperStyle={{
            fontSize: 11,
          }}
        />

        {/* Smooth curve */}
        <Line
          type="monotone"
          dataKey="value"
          name={primaryLabel}
          stroke="#0f172a"
          strokeWidth={2.5}
          dot={{
            r: 3,
          }}
          activeDot={{
            r: 5,
          }}
        />

        {/* Smooth debit curve */}
        <Line
          type="monotone"
          dataKey="secondaryValue"
          name={secondaryLabel}
          stroke="#38bdf8"
          strokeWidth={2.5}
          dot={{
            r: 3,
          }}
          activeDot={{
            r: 5,
          }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

/* =========================================================
   SCATTER CHART
========================================================= */

function TransactionScatterChart({
  data,
  valueFormatter,
  primaryLabel,
  secondaryLabel,
}: {
  data: FinancialChartPoint[];
  valueFormatter: (value: number) => string;
  primaryLabel: string;
  secondaryLabel: string;
}) {
  const primaryPoints = data.map(
    (item, index) => ({
      x: index + 1,
      y: item.value,
      label: item.label,
    })
  );

  const secondaryPoints = data.map(
    (item, index) => ({
      x: index + 1,
      y: item.secondaryValue ?? 0,
      label: item.label,
    })
  );

  return (
    <ResponsiveContainer width="100%" height="100%">
      <ScatterChart
        margin={{
          top: 10,
          right: 15,
          left: 0,
          bottom: 5,
        }}
      >
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="#e2e8f0"
        />

        <XAxis
          type="number"
          dataKey="x"
          domain={[1, data.length]}
          tickCount={Math.min(data.length, 6)}
          tickFormatter={(value) =>
            data[Math.round(value) - 1]?.label ?? ""
          }
          axisLine={false}
          tickLine={false}
          tick={{
            fontSize: 9,
            fill: "#94a3b8",
          }}
        />

        <YAxis
          type="number"
          dataKey="y"
          tickFormatter={valueFormatter}
          axisLine={false}
          tickLine={false}
          tick={{
            fontSize: 9,
            fill: "#94a3b8",
          }}
        />

        <Tooltip
          formatter={(value) =>
            valueFormatter(Number(value))
          }
          contentStyle={{
            borderRadius: 10,
            border: "1px solid #e2e8f0",
            fontSize: 12,
          }}
        />

        <Legend
          wrapperStyle={{
            fontSize: 11,
          }}
        />

        <Scatter
          name={primaryLabel}
          data={primaryPoints}
          fill="#0f172a"
        />

        <Scatter
          name={secondaryLabel}
          data={secondaryPoints}
          fill="#38bdf8"
        />
      </ScatterChart>
    </ResponsiveContainer>
  );
}

/* =========================================================
   PIE / DONUT
========================================================= */

function TransactionPieChart({
  data,
  valueFormatter,
}: {
  data: {
    name: string;
    value: number;
  }[];
  valueFormatter: (value: number) => string;
}) {
  if (!data.length) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-slate-400">
        No transaction distribution available
      </div>
    );
  }

  const colors = ["#0f172a", "#38bdf8"];

  const total = data.reduce(
    (sum, item) => sum + item.value,
    0
  );

  return (
    <ResponsiveContainer width="100%" height="100%">
      <RechartsPieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="45%"
          innerRadius={55}
          outerRadius={85}
          paddingAngle={3}
          stroke="none"
        >
          {data.map((_, index) => (
            <Cell
              key={`cell-${index}`}
              fill={
                colors[index % colors.length]
              }
            />
          ))}
        </Pie>

        <Tooltip
          formatter={(value, name) => [
            valueFormatter(Number(value)),
            String(name),
          ]}
          contentStyle={{
            borderRadius: 10,
            border: "1px solid #e2e8f0",
            fontSize: 12,
          }}
        />

        <Legend
          verticalAlign="bottom"
          iconType="circle"
          wrapperStyle={{
            fontSize: 11,
          }}
        />

        {/* Center total */}
        <text
          x="50%"
          y="43%"
          textAnchor="middle"
          dominantBaseline="middle"
          className="fill-slate-900 text-sm font-semibold"
        >
          {valueFormatter(total)}
        </text>

        <text
          x="50%"
          y="50%"
          textAnchor="middle"
          dominantBaseline="middle"
          className="fill-slate-400 text-[10px]"
        >
          Total Flow
        </text>
      </RechartsPieChart>
    </ResponsiveContainer>
  );
}

/* =========================================================
   HEADER
========================================================= */

function ChartHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-50">
        <Activity className="h-4 w-4 text-slate-500" />
      </div>

      <div>
        <h2 className="font-display text-base font-semibold text-navy-900">
          {title}
        </h2>

        <p className="mt-1 text-xs text-slate-400">
          {subtitle}
        </p>
      </div>
    </div>
  );
}

/* =========================================================
   LEGEND
========================================================= */

function LegendItem({
  className,
  label,
}: {
  className: string;
  label: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <span
        className={`h-2 w-2 rounded-full ${className}`}
      />

      {label}
    </div>
  );
}

/* =========================================================
   EMPTY STATE
========================================================= */

function EmptyState() {
  return (
    <div className="flex min-h-[280px] flex-col items-center justify-center text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-50">
        <BarChart3 className="h-5 w-5 text-slate-400" />
      </div>

      <p className="mt-4 text-sm font-semibold text-navy-900">
        No transaction activity yet
      </p>

      <p className="mt-1 max-w-sm text-xs leading-5 text-slate-400">
        Transaction insights will appear when
        financial activity is available.
      </p>
    </div>
  );
}

/* =========================================================
   SKELETON
========================================================= */

function ChartSkeleton() {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6">
      <div className="h-5 w-48 animate-pulse rounded bg-slate-100" />

      <div className="mt-2 h-3 w-72 animate-pulse rounded bg-slate-100" />

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        {[1, 2, 3, 4].map((item) => (
          <div
            key={item}
            className="h-[300px] animate-pulse rounded-xl bg-slate-100"
          />
        ))}
      </div>
    </section>
  );
}