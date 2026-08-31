import { useState } from "react";
import type { FormEvent } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { Sparkles } from "lucide-react";
import { toApiError } from "../api/axios";
import { Button } from "../components/ui/Button";
import { useAuth } from "../hooks/useAuth";
import { homeRouteForRole } from "../utils/roles";

export function LoginPage() {
  const { login, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

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
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex items-center justify-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-navy-900 text-white">
            <Sparkles className="h-4 w-4" strokeWidth={2} />
          </span>
          <span className="font-display text-lg font-bold tracking-tight text-navy-900">
            FinPilot <span className="text-accent-teal">AI</span>
          </span>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-4 rounded-xl border border-slate-200 bg-white p-6"
        >
          <div>
            <h1 className="font-display text-base font-semibold text-navy-900">Sign in</h1>
            <p className="mt-1 text-sm text-slate-500">
              Access your customer portal or the admin console.
            </p>
          </div>

          <label className="block">
            <span className="text-xs font-medium uppercase tracking-wide text-slate-500">Email</span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-navy-900"
            />
          </label>

          <label className="block">
            <span className="text-xs font-medium uppercase tracking-wide text-slate-500">Password</span>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-navy-900"
            />
          </label>

          {error && (
            <p role="alert" className="rounded-lg bg-risk-soft px-3 py-2 text-sm text-risk">
              {error}
            </p>
          )}

          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? "Signing in…" : "Sign in"}
          </Button>

          <p className="text-center text-sm text-slate-500">
            New customer?{" "}
            <Link to="/register" className="font-medium text-navy-900 hover:underline">
              Create an account
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
