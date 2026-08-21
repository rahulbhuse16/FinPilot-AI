import { FileText, Scissors, Boxes, SearchCheck, Sparkles, ArrowRight } from "lucide-react";

const STEPS = [
  { icon: FileText, label: "PDF", desc: "Document uploaded" },
  { icon: Scissors, label: "Chunking", desc: "Split into passages" },
  { icon: Boxes, label: "Embeddings", desc: "Encoded as vectors" },
  { icon: SearchCheck, label: "Vector search", desc: "pgvector similarity" },
  { icon: Sparkles, label: "AI analyst", desc: "Grounded answer" },
];

export function RagPipeline() {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <p className="mb-4 font-display text-sm font-semibold text-navy-900">How your knowledge base works</p>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-2">
        {STEPS.map((step, i) => (
          <div key={step.label} className="flex items-center gap-3 sm:flex-1 sm:flex-col sm:text-center">
            <div className="flex items-center gap-3 sm:flex-col">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-navy-900 text-white">
                <step.icon className="h-[18px] w-[18px]" strokeWidth={1.75} />
              </span>
              <div className="sm:mt-2">
                <p className="text-sm font-medium text-navy-900">{step.label}</p>
                <p className="text-xs text-slate-500">{step.desc}</p>
              </div>
            </div>
            {i < STEPS.length - 1 && (
              <ArrowRight className="hidden h-4 w-4 shrink-0 text-slate-300 sm:block" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
