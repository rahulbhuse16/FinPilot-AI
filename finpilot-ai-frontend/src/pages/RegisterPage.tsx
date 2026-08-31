import { useState } from "react";
import type { FormEvent } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { Sparkles } from "lucide-react";
import { toApiError } from "../api/axios";
import { Button } from "../components/ui/Button";
import { useAuth } from "../hooks/useAuth";
import { homeRouteForRole } from "../utils/roles";

export function RegisterPage() {
  const { register, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [customerCode, setCustomerCode] = useState("");
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
      const created = await register({
        full_name: fullName,
        email,
        password,
        customer_code: customerCode.trim() || undefined,
      });
      navigate(homeRouteForRole(created.role), { replace: true });
    } catch (err) {
      setError(toApiError(err).message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
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
            <h1 className="font-display text-base font-semibold text-navy-900">Create your account</h1>
            <p className="mt-1 text-sm text-slate-500">
              Customer accounts get access to the self-service portal.
            </p>
          </div>

          <label className="block">
            <span className="text-xs font-medium uppercase tracking-wide text-slate-500">Full name</span>
            <input
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              autoComplete="name"
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-navy-900"
            />
          </label>

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
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-navy-900"
            />
            <span className="mt-1 block text-xs text-slate-400">At least 8 characters.</span>
          </label>

          <label className="block">
            <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Customer code <span className="normal-case text-slate-400">(optional)</span>
            </span>
            <input
              value={customerCode}
              onChange={(e) => setCustomerCode(e.target.value)}
              placeholder="CUST-1001"
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-navy-900"
            />
            <span className="mt-1 block text-xs text-slate-400">
              Link an existing bank profile — the code must match the email we hold on file.
              Leave blank to create a new profile.
            </span>
          </label>

          {error && (
            <p role="alert" className="rounded-lg bg-risk-soft px-3 py-2 text-sm text-risk">
              {error}
            </p>
          )}

          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? "Creating account…" : "Create account"}
          </Button>

          <p className="text-center text-sm text-slate-500">
            Already registered?{" "}
            <Link to="/login" className="font-medium text-navy-900 hover:underline">
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
