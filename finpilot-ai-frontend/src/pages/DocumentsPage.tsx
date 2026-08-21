import { FileStack, FileText } from "lucide-react";
import { useFetch } from "../hooks/useFetch";
import { documentsApi } from "../api/documents.api";
import { DocumentUpload } from "../components/documents/DocumentUpload";
import { DocumentStatus } from "../components/documents/DocumentStatus";
import { RagPipeline } from "../components/documents/RagPipeline";
import { TableSkeleton } from "../components/ui/LoadingSkeleton";
import { EmptyState } from "../components/ui/EmptyState";
import { ErrorState } from "../components/ui/ErrorState";
import { formatBytes, formatDateTime } from "../utils/format";

export function DocumentsPage() {
  const { data: documents, status, error, refetch } = useFetch((signal) => documentsApi.list(signal), []);

  return (
    <div className="mx-auto max-w-5xl space-y-5 p-4 sm:p-6">
      <RagPipeline />

      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <p className="mb-3 font-display text-sm font-semibold text-navy-900">Upload a policy document</p>
        <DocumentUpload onUploaded={refetch} />
      </div>

      <div>
        <div className="mb-3 flex items-center gap-2">
          <FileStack className="h-4 w-4 text-slate-400" />
          <p className="font-display text-sm font-semibold text-navy-900">Knowledge base documents</p>
        </div>

        {status === "loading" && <TableSkeleton rows={4} />}
        {status === "error" && <ErrorState message={error?.message} onRetry={refetch} />}
        {status === "success" && (documents ?? []).length === 0 && (
          <EmptyState
            icon={FileText}
            title="No documents yet"
            description="Upload PDF policies or guidelines to ground the AI analyst's answers."
          />
        )}
        {status === "success" && (documents ?? []).length > 0 && (
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
            <ul>
              {documents!.map((d) => (
                <li key={d.id} className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-3.5 last:border-0">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                      <FileText className="h-4 w-4" strokeWidth={1.75} />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-navy-900">{d.filename}</p>
                      <p className="text-xs text-slate-500">
                        {formatBytes(d.size_bytes)} · {formatDateTime(d.uploaded_at)}
                      </p>
                    </div>
                  </div>
                  <DocumentStatus status={d.status} />
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
