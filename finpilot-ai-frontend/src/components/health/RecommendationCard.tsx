import { Lightbulb } from "lucide-react";
import { Badge } from "../ui/Badge";
import type { FinancialRecommendation } from "../../types/financialHealth";

const PRIORITY_TONE: Record<string, "risk" | "warning" | "neutral"> = {
  HIGH: "risk",
  MEDIUM: "warning",
  LOW: "neutral",
};

export function RecommendationCard({ recommendation }: { recommendation: FinancialRecommendation }) {
  return (
    <li className="animate-fade-in flex items-start gap-3 border-b border-slate-50 px-5 py-3.5 last:border-0">
      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent-teal-soft text-accent-teal">
        <Lightbulb className="h-4 w-4" strokeWidth={1.85} />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm font-medium text-navy-900">{recommendation.title}</p>
          {recommendation.priority && (
            <Badge tone={PRIORITY_TONE[recommendation.priority] ?? "neutral"}>{recommendation.priority}</Badge>
          )}
        </div>
        <p className="mt-0.5 text-sm text-slate-500">{recommendation.description}</p>
        {recommendation.potential_impact && (
          <p className="mt-1 text-xs font-medium text-accent-teal">{recommendation.potential_impact}</p>
        )}
      </div>
    </li>
  );
}
