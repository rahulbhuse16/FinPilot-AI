import { useState } from "react";
import type { FormEvent } from "react";
import { useFetch } from "../../hooks/useFetch";
import { portalApi } from "../../api/portal.api";
import { toApiError } from "../../api/axios";
import { CardSkeleton } from "../../components/ui/LoadingSkeleton";
import { ErrorState } from "../../components/ui/ErrorState";
import { Button } from "../../components/ui/Button";
import type { Customer } from "../../types/domain";

const inputClass =
  "mt-1 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-navy-900";
const labelClass = "text-xs font-medium uppercase tracking-wide text-slate-500";

function PersonalDetailsForm({
  customer,
  onSaved,
}: {
  customer: Customer;
  onSaved: () => void;
}) {
  const [fullName, setFullName] = useState(String(customer.full_name ?? ""));
  const [email, setEmail] = useState(String(customer.email ?? ""));
  const [phone, setPhone] = useState(String(customer.phone ?? ""));
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setMessage(null);
    setSaving(true);

    try {
      await portalApi.updateProfile({ full_name: fullName, email, phone: phone || undefined });
      setMessage("Profile updated.");
      onSaved();
    } catch (err) {
      setError(toApiError(err).message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-slate-200 bg-white p-5">
      <div>
        <h2 className="font-display text-sm font-semibold text-navy-900">Personal details</h2>
        <p className="mt-0.5 font-mono-num text-xs text-slate-500">
          Customer code {String(customer.customer_code ?? "—")}
        </p>
      </div>

      <label className="block">
        <span className={labelClass}>Full name</span>
        <input required value={fullName} onChange={(e) => setFullName(e.target.value)} className={inputClass} />
      </label>

      <label className="block">
        <span className={labelClass}>Email</span>
        <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} />
      </label>

      <label className="block">
        <span className={labelClass}>Phone</span>
        <input value={phone} onChange={(e) => setPhone(e.target.value)} className={inputClass} />
      </label>

      {error && <p role="alert" className="rounded-lg bg-risk-soft px-3 py-2 text-sm text-risk">{error}</p>}
      {message && <p className="rounded-lg bg-positive-soft px-3 py-2 text-sm text-positive">{message}</p>}

      <Button type="submit" disabled={saving}>
        {saving ? "Saving…" : "Save changes"}
      </Button>
    </form>
  );
}

function ChangePasswordForm() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setMessage(null);
    setSaving(true);

    try {
      await portalApi.changePassword({
        current_password: currentPassword,
        new_password: newPassword,
      });
      setMessage("Password changed.");
      setCurrentPassword("");
      setNewPassword("");
    } catch (err) {
      setError(toApiError(err).message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-slate-200 bg-white p-5">
      <h2 className="font-display text-sm font-semibold text-navy-900">Change password</h2>

      <label className="block">
        <span className={labelClass}>Current password</span>
        <input
          type="password"
          required
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          autoComplete="current-password"
          className={inputClass}
        />
      </label>

      <label className="block">
        <span className={labelClass}>New password</span>
        <input
          type="password"
          required
          minLength={8}
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          autoComplete="new-password"
          className={inputClass}
        />
      </label>

      {error && <p role="alert" className="rounded-lg bg-risk-soft px-3 py-2 text-sm text-risk">{error}</p>}
      {message && <p className="rounded-lg bg-positive-soft px-3 py-2 text-sm text-positive">{message}</p>}

      <Button type="submit" variant="secondary" disabled={saving}>
        {saving ? "Updating…" : "Update password"}
      </Button>
    </form>
  );
}

export function PortalProfilePage() {
  const { data, status, error, refetch } = useFetch((signal) => portalApi.profile(signal), []);

  if (status === "loading") return <CardSkeleton rows={4} />;
  if (status === "error" || !data) return <ErrorState message={error?.message} onRetry={refetch} />;

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
      <PersonalDetailsForm customer={data} onSaved={refetch} />
      <ChangePasswordForm />
    </div>
  );
}
