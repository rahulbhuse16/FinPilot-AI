import { AlertTriangle } from "lucide-react";
import { Badge } from "../ui/Badge";
import { formatCurrency, formatDateTime } from "../../utils/format";
import type { Anomaly } from "../../types/domain";

const SEVERITY_TONE: Record<string, "risk" | "warning" | "neutral"> = {
  high: "risk",
  medium: "warning",
  low: "neutral",
};

export function AnomalyCard({ anomaly }: { anomaly: Anomaly }) {
  const tone = SEVERITY_TONE[anomaly.severity ?? ""] ?? "neutral";
  return (
    <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-risk-soft text-risk">
        <AlertTriangle className="h-4 w-4" strokeWidth={1.85} />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-medium text-navy-900">{anomaly.reason ?? "Unusual transaction pattern"}</p>
          {anomaly.severity && <Badge tone={tone}>{anomaly.severity} severity</Badge>}
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-slate-500">
          {typeof anomaly.amount === "number" && (
            <span className="font-mono-num">{formatCurrency(anomaly.amount)}</span>
          )}
          {anomaly.detected_at && <span>{formatDateTime(anomaly.detected_at)}</span>}
        </div>
      </div>
    </div>
  );
}
