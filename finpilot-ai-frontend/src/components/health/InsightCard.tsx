import { SeverityBadge } from "./SeverityBadge";
import type { FinancialInsight } from "../../types/financialHealth";

export function InsightCard({ insight }: { insight: FinancialInsight }) {
  return (
    <li className="animate-fade-in flex items-start gap-3 border-b border-slate-50 px-5 py-3.5 last:border-0">
      <div className="mt-0.5 shrink-0">
        <SeverityBadge severity={insight.severity} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-navy-900">{insight.title}</p>
        <p className="mt-0.5 text-sm text-slate-500">{insight.description}</p>
      </div>
    </li>
  );
}
