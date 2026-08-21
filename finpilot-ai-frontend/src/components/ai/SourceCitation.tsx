import { FileText } from "lucide-react";
import type { AnalystSource } from "../../types/domain";

export function SourceCitation({ source }: { source: AnalystSource }) {
  return (
    <div className="flex items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs text-slate-600">
      <FileText className="h-3.5 w-3.5 shrink-0 text-slate-400" strokeWidth={1.75} />
      <span className="truncate font-medium text-navy-800">{source.source}</span>
      {typeof source.page_number === "number" && (
        <span className="shrink-0 text-slate-400">· Page {source.page_number}</span>
      )}
    </div>
  );
}
