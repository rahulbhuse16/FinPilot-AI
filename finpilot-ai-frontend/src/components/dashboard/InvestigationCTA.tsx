import { ArrowRight, SearchCheck, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

export function InvestigationCTA() {
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-navy-900">
      <div className="relative p-6 sm:p-8">
        <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-sky-400/10 blur-3xl" />

        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/10 text-white">
              <SearchCheck className="h-5 w-5" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <Sparkles className="h-3.5 w-3.5 text-sky-300" />

                <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-sky-200">
                  AI Investigation
                </span>
              </div>

              <h2 className="mt-2 font-display text-xl font-bold text-white">
                Investigate a financial question
              </h2>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
                Let FinPilot combine customer data, transactions, financial
                policies and AI reasoning.
              </p>
            </div>
          </div>

          <Link
            to="/analyst"
            className="group inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-white px-5 py-3 text-sm font-semibold text-navy-900 transition hover:bg-slate-100"
          >
            Open AI Analyst
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </section>
  );
}