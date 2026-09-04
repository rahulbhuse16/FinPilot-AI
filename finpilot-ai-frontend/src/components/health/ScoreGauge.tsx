import { TrendingDown, TrendingUp } from "lucide-react";
import { cn } from "../../utils/cn";

interface ScoreGaugeProps {
  score: number;
  previousScore?: number | null;
  size?: number;
}

function toneFor(score: number): { stroke: string; text: string } {
  if (score >= 70) return { stroke: "var(--color-positive)", text: "text-positive" };
  if (score >= 40) return { stroke: "var(--color-warning)", text: "text-warning" };
  return { stroke: "var(--color-risk)", text: "text-risk" };
}

export function ScoreGauge({ score, previousScore, size = 132 }: ScoreGaugeProps) {
  const clamped = Math.max(0, Math.min(100, score));
  const radius = (size - 14) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - clamped / 100);
  const tone = toneFor(clamped);

  const delta = typeof previousScore === "number" ? clamped - previousScore : null;

  return (
    <div className="flex items-center gap-5">
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <svg viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="var(--color-slate-100)"
            strokeWidth={10}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={tone.stroke}
            strokeWidth={10}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transition: "stroke-dashoffset 0.6s ease-out" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={cn("font-display font-mono-num text-3xl font-bold", tone.text)}>{Math.round(clamped)}</span>
          <span className="text-[11px] text-slate-400">/ 100</span>
        </div>
      </div>

      {delta !== null && (
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Financial Health</p>
          <p
            className={cn(
              "mt-1 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium",
              delta > 0 && "bg-positive-soft text-positive",
              delta < 0 && "bg-risk-soft text-risk",
              delta === 0 && "bg-slate-100 text-slate-500"
            )}
          >
            {delta > 0 && <TrendingUp className="h-3.5 w-3.5" />}
            {delta < 0 && <TrendingDown className="h-3.5 w-3.5" />}
            {delta === 0 ? "No change" : `${delta > 0 ? "+" : ""}${delta} points`} from last month
          </p>
        </div>
      )}
    </div>
  );
}
