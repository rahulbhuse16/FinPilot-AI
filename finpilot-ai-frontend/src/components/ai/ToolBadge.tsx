import { CheckCircle2 } from "lucide-react";

const TOOL_LABELS: Record<string, string> = {
  get_customer_360: "Customer 360",
  search_financial_knowledge: "Knowledge Search",
  get_transactions: "Transaction Analysis",
  detect_anomalies: "Anomaly Detection",
  get_loans: "Loan Analysis",
};

function labelFor(tool: string): string {
  return (
    TOOL_LABELS[tool] ??
    tool
      .replace(/_/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase())
  );
}

export function ToolBadge({ tool }: { tool: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-md bg-accent-teal-soft px-2.5 py-1 text-xs font-medium text-accent-teal">
      <CheckCircle2 className="h-3.5 w-3.5" strokeWidth={2} />
      {labelFor(tool)}
    </span>
  );
}
