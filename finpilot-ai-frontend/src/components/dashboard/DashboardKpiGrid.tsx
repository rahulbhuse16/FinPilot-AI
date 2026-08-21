import type { LucideIcon } from "lucide-react";
import {
  Activity,
  AlertTriangle,
  HeartPulse,
  Users,
} from "lucide-react";

export interface DashboardKpi {
  label: string;
  value: string | number;
  description: string;
  icon?: LucideIcon;
  tone?: "default" | "positive" | "warning" | "danger";
}

interface DashboardKpiGridProps {
  items?: DashboardKpi[];
}

const defaultIcons: LucideIcon[] = [
  HeartPulse,
  Users,
  Activity,
  AlertTriangle,
];

export function DashboardKpiGrid({
  items = [],
}: DashboardKpiGridProps) {
  if (!items.length) {
    return null;
  }

  return (
    <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {items.map((item, index) => (
        <DashboardKpiCard
          key={`${item.label}-${index}`}
          {...item}
          icon={item.icon ?? defaultIcons[index % defaultIcons.length]}
        />
      ))}
    </section>
  );
}

function DashboardKpiCard({
  label,
  value,
  description,
  icon: Icon,
  tone = "default",
}: DashboardKpi) {
  const iconClasses = {
    default: "bg-slate-100 text-slate-600",
    positive: "bg-emerald-50 text-emerald-600",
    warning: "bg-amber-50 text-amber-600",
    danger: "bg-red-50 text-red-600",
  };

  return (
    <article className="group rounded-2xl border border-slate-200 bg-white p-5 transition duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-lg hover:shadow-slate-200/50">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
            {label}
          </p>

          <p className="mt-3 break-words font-display text-2xl font-bold tracking-tight text-navy-900 sm:text-3xl">
            {value}
          </p>
        </div>

        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${iconClasses[tone]}`}
        >
          {Icon && <Icon className="h-5 w-5" />}
        </div>
      </div>

      <p className="mt-4 text-xs leading-5 text-slate-500">
        {description}
      </p>
    </article>
  );
}