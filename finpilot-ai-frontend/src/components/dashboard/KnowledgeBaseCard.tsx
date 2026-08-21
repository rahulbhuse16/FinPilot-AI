import { FileCheck2, FileStack, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { DocumentStatus } from "../documents/DocumentStatus";
import { CardSkeleton } from "../ui/LoadingSkeleton";

interface KnowledgeDocument {
  id: string;
  filename: string;
  status: string;
}

interface KnowledgeBaseCardProps {
  documents?: KnowledgeDocument[];
  status: "idle" | "loading" | "success" | "error";
  maxDocuments?: number;
}

export function KnowledgeBaseCard({
  documents = [],
  status,
  maxDocuments = 4,
}: KnowledgeBaseCardProps) {
  const recentDocuments = documents.slice(0, maxDocuments);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-50">
            <FileStack className="h-4 w-4 text-slate-500" />
          </div>

          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
              AI Knowledge Base
            </p>

            <h2 className="mt-1 font-display text-base font-semibold text-navy-900">
              Financial Document Intelligence
            </h2>
          </div>
        </div>

        <Link
          to="/documents"
          className="inline-flex items-center gap-1 text-xs font-semibold text-accent-teal hover:underline"
        >
          Open
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {status === "loading" && (
        <div className="mt-6">
          <CardSkeleton rows={4} />
        </div>
      )}

      {status === "error" && (
        <div className="mt-6 rounded-xl bg-slate-50 p-5 text-center">
          <p className="text-sm font-medium text-navy-900">
            Unable to load knowledge base
          </p>

          <p className="mt-1 text-xs text-slate-400">
            Document information is temporarily unavailable.
          </p>
        </div>
      )}

      {status === "success" && recentDocuments.length === 0 && (
        <div className="mt-6 rounded-xl bg-slate-50 p-6 text-center">
          <FileStack className="mx-auto h-5 w-5 text-slate-400" />

          <p className="mt-3 text-sm font-semibold text-navy-900">
            No documents uploaded yet
          </p>

          <p className="mt-1 text-xs leading-5 text-slate-400">
            Add policy PDFs to ground the AI analyst.
          </p>

          <Link
            to="/documents"
            className="mt-4 inline-flex text-xs font-semibold text-accent-teal hover:underline"
          >
            Add documents →
          </Link>
        </div>
      )}

      {status === "success" && recentDocuments.length > 0 && (
        <>
          <div className="mt-5 rounded-xl bg-slate-50 px-4 py-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">
              Documents available
            </p>

            <p className="mt-1 font-display text-2xl font-bold text-navy-900">
              {documents.length}
            </p>
          </div>

          <div className="mt-5 divide-y divide-slate-100">
            {recentDocuments.map((document) => (
              <div
                key={document.id}
                className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
              >
                <FileCheck2 className="h-4 w-4 shrink-0 text-slate-400" />

                <span className="min-w-0 flex-1 truncate text-sm text-navy-800">
                  {document.filename}
                </span>

                <DocumentStatus status={document.status} />
              </div>
            ))}
          </div>
        </>
      )}
    </section>
  );
}