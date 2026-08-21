import type { ReactNode } from "react";
import { cn } from "../../utils/cn";

type Tone = "neutral" | "positive" | "risk" | "warning" | "info";

const toneClasses: Record<Tone, string> = {
  neutral: "bg-slate-100 text-slate-600",
  positive: "bg-positive-soft text-positive",
  risk: "bg-risk-soft text-risk",
  warning: "bg-warning-soft text-warning",
  info: "bg-accent-teal-soft text-accent-teal",
};

export function Badge({ tone = "neutral", children }: { tone?: Tone; children: ReactNode }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium",
        toneClasses[tone]
      )}
    >
      {children}
    </span>
  );
}
