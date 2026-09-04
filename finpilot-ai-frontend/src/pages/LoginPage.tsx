import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import {
  Sparkles,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Loader2,
  AlertCircle,
  ShieldCheck,
  TrendingUp,
  BrainCircuit,
} from "lucide-react";
import { toApiError } from "../api/axios";
import { Button } from "../components/ui/Button";
import { useAuth } from "../hooks/useAuth";
import { homeRouteForRole } from "../utils/roles";

const FEATURES = [
  { icon: BrainCircuit, label: "AI-powered financial insights, grounded in your data" },
  { icon: TrendingUp, label: "Real-time transaction risk & anomaly detection" },
  { icon: ShieldCheck, label: "Bank-grade security on every request" },
];

export function LoginPage() {
  const { login, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  if (isAuthenticated && user) {
    return <Navigate to={homeRouteForRole(user.role)} replace />;
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const signedInUser = await login({ email, password });
      navigate(homeRouteForRole(signedInUser.role), { replace: true });
    } catch (err) {
      setError(toApiError(err).message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="grid min-h-screen bg-white lg:grid-cols-[1.05fr_1fr]">
      <style>{`
        @keyframes fp-fade-up {
          from { opacity: 0; transform: translateY(14px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fp-shake {
          10%, 90% { transform: translateX(-1px); }
          20%, 80% { transform: translateX(2px); }
          30%, 50%, 70% { transform: translateX(-4px); }
          40%, 60% { transform: translateX(4px); }
        }
        @keyframes fp-float {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(18px, -24px) scale(1.06); }
        }
        @keyframes fp-float-slow {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-22px, 20px) scale(1.08); }
        }
        .fp-fade-up { animation: fp-fade-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) both; }
        .fp-shake { animation: fp-shake 0.4s ease-in-out; }
        .fp-blob-a { animation: fp-float 9s ease-in-out infinite; }
        .fp-blob-b { animation: fp-float-slow 11s ease-in-out infinite; }
      `}</style>

      {/* Branding panel */}
      <div className="relative hidden overflow-hidden bg-navy-950 lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div
          className="fp-blob-a pointer-events-none absolute -left-24 -top-24 h-80 w-80 rounded-full bg-accent-teal/25 blur-3xl"
          aria-hidden="true"
        />
        <div
          className="fp-blob-b pointer-events-none absolute bottom-[-6rem] right-[-4rem] h-96 w-96 rounded-full bg-navy-600/40 blur-3xl"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
          aria-hidden="true"
        />

        <div className="relative fp-fade-up">
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-accent-teal text-white">
              <Sparkles className="h-4 w-4" strokeWidth={2} />
            </span>
            <span className="font-display text-lg font-bold tracking-tight text-white">
              FinPilot <span className="text-accent-teal">AI</span>
            </span>
          </div>
        </div>

        <div className="relative">
          <h1
            className="fp-fade-up font-display text-4xl font-bold leading-tight text-white"
            style={{ animationDelay: "80ms" }}
          >
            Financial intelligence,
            <br />
            powered by AI.
          </h1>
          <p
            className="fp-fade-up mt-4 max-w-md text-[15px] leading-relaxed text-slate-300"
            style={{ animationDelay: "160ms" }}
          >
            Sign in to analyze customer risk, investigate transactions, and get AI-grounded
            answers from your financial knowledge base — all in one workspace.
          </p>

          <ul className="mt-8 space-y-4">
            {FEATURES.map((f, i) => (
              <li
                key={f.label}
                className="fp-fade-up flex items-start gap-3 text-sm text-slate-200"
                style={{ animationDelay: `${240 + i * 110}ms` }}
              >
                <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-white/10">
                  <f.icon className="h-3.5 w-3.5 text-accent-teal" strokeWidth={2} />
                </span>
                {f.label}
              </li>
            ))}
          </ul>
        </div>

        <p className="relative fp-fade-up text-xs text-slate-500" style={{ animationDelay: "600ms" }}>
          FinPilot AI · Financial intelligence platform
        </p>
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center px-4 py-10 sm:px-8">
        <div
          className={`w-full max-w-sm transition-all duration-700 ease-out ${
            mounted ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
          }`}
        >
          <div className="mb-8 flex items-center justify-center gap-2.5 lg:hidden">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-navy-900 text-white">
              <Sparkles className="h-4 w-4" strokeWidth={2} />
            </span>
            <span className="font-display text-lg font-bold tracking-tight text-navy-900">
              FinPilot <span className="text-accent-teal">AI</span>
            </span>
          </div>

          <div className="mb-7">
            <h2 className="font-display text-2xl font-bold text-navy-900">Welcome back</h2>
            <p className="mt-1.5 text-sm text-slate-500">
              Sign in to your customer portal or the admin console.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <label className="block">
              <span className="text-xs font-medium uppercase tracking-wide text-slate-500">Email</span>
              <div className="group relative mt-1.5">
                <Mail
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-navy-900"
                  strokeWidth={1.85}
                />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  placeholder="you@company.com"
                  className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm text-navy-900 outline-none transition-all placeholder:text-slate-400 focus:border-navy-900 focus:ring-4 focus:ring-navy-900/5"
                />
              </div>
            </label>

            <label className="block">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium uppercase tracking-wide text-slate-500">Password</span>
              </div>
              <div className="group relative mt-1.5">
                <Lock
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-navy-900"
                  strokeWidth={1.85}
                />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-10 pr-10 text-sm text-navy-900 outline-none transition-all placeholder:text-slate-400 focus:border-navy-900 focus:ring-4 focus:ring-navy-900/5"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-navy-900"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </label>

            {error && (
              <p
                role="alert"
                className="fp-shake flex items-start gap-2 rounded-lg bg-risk-soft px-3 py-2.5 text-sm text-risk"
              >
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                {error}
              </p>
            )}

            <Button type="submit" className="group w-full" disabled={submitting}>
              {submitting ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Signing in…
                </span>
              ) : (
                <span className="flex items-center justify-center gap-1.5">
                  Sign in
                  <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                </span>
              )}
            </Button>

            <p className="text-center text-sm text-slate-500">
              New customer?{" "}
              <Link to="/register" className="font-medium text-navy-900 underline-offset-2 hover:underline">
                Create an account
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}