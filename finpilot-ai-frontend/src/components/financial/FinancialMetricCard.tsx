import type { LucideIcon } from "lucide-react";
import { cn } from "../../utils/cn";

type Tone = "neutral" | "positive" | "risk" | "warning";

interface FinancialMetricCardProps {
  label: string;
  value: string;
  sublabel?: string;
  icon?: LucideIcon;
  tone?: Tone;
}

const toneClasses: Record<Tone, string> = {
  neutral: "text-navy-900",
  positive: "text-positive",
  risk: "text-risk",
  warning: "text-warning",
};

const iconToneClasses: Record<Tone, string> = {
  neutral: "bg-slate-100 text-slate-500",
  positive: "bg-positive-soft text-positive",
  risk: "bg-risk-soft text-risk",
  warning: "bg-warning-soft text-warning",
};

export function FinancialMetricCard({ label, value, sublabel, icon: Icon, tone = "neutral" }: FinancialMetricCardProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="flex items-start justify-between">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
        {Icon && (
          <span className={cn("flex h-8 w-8 items-center justify-center rounded-lg", iconToneClasses[tone])}>
            <Icon className="h-4 w-4" strokeWidth={1.75} />
          </span>
        )}
      </div>
      <p className={cn("font-mono-num font-display mt-3 text-2xl font-semibold", toneClasses[tone])}>{value}</p>
      {sublabel && <p className="mt-1 text-xs text-slate-500">{sublabel}</p>}
    </div>
  );
}
