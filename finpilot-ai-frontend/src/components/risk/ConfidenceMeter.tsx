import { cn } from "../../utils/cn";

export function ConfidenceMeter({ confidence, compact = false }: { confidence: number; compact?: boolean }) {
  const clamped = Math.max(0, Math.min(100, confidence));
  const tone = clamped >= 70 ? "bg-risk" : clamped >= 40 ? "bg-warning" : "bg-slate-300";

  return (
    <div className={cn("flex items-center gap-2", compact ? "w-20" : "w-28")}>
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
        <div className={cn("h-full rounded-full transition-all duration-500", tone)} style={{ width: `${clamped}%` }} />
      </div>
      <span className="w-9 shrink-0 font-mono-num text-xs text-slate-500">{Math.round(clamped)}%</span>
    </div>
  );
}
