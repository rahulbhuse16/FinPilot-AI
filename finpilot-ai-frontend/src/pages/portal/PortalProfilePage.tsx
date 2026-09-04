import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import {
  AlertCircle,
  AtSign,
  Banknote,
  Check,
  CheckCircle2,
  Info,
  Landmark,
  Lock,
  Mail,
  Phone,
  Plus,
  ShieldCheck,
  Smartphone,
  Star,
  Trash2,
  User,
  X,
} from "lucide-react";
import { useFetch } from "../../hooks/useFetch";
import { portalApi } from "../../api/portal.api";
import { toApiError } from "../../api/axios";
import { CardSkeleton } from "../../components/ui/LoadingSkeleton";
import { ErrorState } from "../../components/ui/ErrorState";
import { Button } from "../../components/ui/Button";
import { cn } from "../../utils/cn";
import type { Customer } from "../../types/domain";

const inputClass =
  "w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm text-navy-900 outline-none transition-all placeholder:text-slate-400 focus:border-navy-900 focus:ring-4 focus:ring-navy-900/5";
const labelClass = "text-xs font-medium uppercase tracking-wide text-slate-500";

function getInitials(name?: string | null): string {
  if (!name) return "U";
  const parts = name.trim().split(/\s+/);
  return parts.slice(0, 2).map((p) => p[0]?.toUpperCase() ?? "").join("") || "U";
}

function FieldIcon({ icon: Icon }: { icon: typeof User }) {
  return (
    <Icon
      className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
      strokeWidth={1.85}
    />
  );
}

function PersonalDetailsForm({ customer }: { customer: Customer }) {
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
      const updated = await portalApi.updateProfile({
        full_name: fullName,
        email,
        phone: phone || undefined,
      });
      setFullName(String(updated.full_name ?? ""));
      setEmail(String(updated.email ?? ""));
      setPhone(String(updated.phone ?? ""));
      setMessage("Profile updated.");
    } catch (err) {
      setError(toApiError(err).message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-slate-200 bg-white p-5">
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-navy-900 text-sm font-semibold text-white">
          {getInitials(fullName)}
        </span>
        <div>
          <h2 className="font-display text-sm font-semibold text-navy-900">Personal details</h2>
          <p className="font-mono-num text-xs text-slate-500">
            Customer code {String(customer.customer_code ?? "—")}
          </p>
        </div>
      </div>

      <label className="block">
        <span className={labelClass}>Full name</span>
        <div className="relative mt-1.5">
          <FieldIcon icon={User} />
          <input required value={fullName} onChange={(e) => setFullName(e.target.value)} className={inputClass} />
        </div>
      </label>

      <label className="block">
        <span className={labelClass}>Email</span>
        <div className="relative mt-1.5">
          <FieldIcon icon={Mail} />
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClass}
          />
        </div>
      </label>

      <label className="block">
        <span className={labelClass}>Phone</span>
        <div className="relative mt-1.5">
          <FieldIcon icon={Phone} />
          <input value={phone} onChange={(e) => setPhone(e.target.value)} className={inputClass} />
        </div>
      </label>

      {error && (
        <p role="alert" className="flex items-start gap-2 rounded-lg bg-risk-soft px-3 py-2.5 text-sm text-risk">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          {error}
        </p>
      )}
      {message && (
        <p className="flex items-start gap-2 rounded-lg bg-positive-soft px-3 py-2.5 text-sm text-positive">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
          {message}
        </p>
      )}

      <Button type="submit" disabled={saving} className="w-full sm:w-auto">
        {saving ? "Saving…" : "Save changes"}
      </Button>
    </form>
  );
}

function getPasswordStrength(password: string): number {
  if (!password) return 0;
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  return Math.min(score, 4);
}
const STRENGTH_LABELS = ["Too weak", "Weak", "Fair", "Good", "Strong"];
const STRENGTH_COLORS = ["bg-risk", "bg-risk", "bg-warning", "bg-accent-teal", "bg-positive"];

function ChangePasswordForm() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const strength = useMemo(() => getPasswordStrength(newPassword), [newPassword]);

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
      <div className="flex items-center gap-2.5">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent-teal-soft text-accent-teal">
          <ShieldCheck className="h-4 w-4" strokeWidth={1.85} />
        </span>
        <h2 className="font-display text-sm font-semibold text-navy-900">Change password</h2>
      </div>

      <label className="block">
        <span className={labelClass}>Current password</span>
        <div className="relative mt-1.5">
          <FieldIcon icon={Lock} />
          <input
            type="password"
            required
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            autoComplete="current-password"
            className={inputClass}
          />
        </div>
      </label>

      <label className="block">
        <span className={labelClass}>New password</span>
        <div className="relative mt-1.5">
          <FieldIcon icon={Lock} />
          <input
            type="password"
            required
            minLength={8}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            autoComplete="new-password"
            className={inputClass}
          />
        </div>
        {newPassword.length > 0 && (
          <div className="animate-fade-in mt-2">
            <div className="flex gap-1">
              {Array.from({ length: 4 }).map((_, i) => (
                <span
                  key={i}
                  className={cn(
                    "h-1 flex-1 rounded-full transition-colors duration-300",
                    i < strength ? STRENGTH_COLORS[strength] : "bg-slate-100"
                  )}
                />
              ))}
            </div>
            <p className="mt-1 text-xs text-slate-400">{STRENGTH_LABELS[strength]}</p>
          </div>
        )}
      </label>

      {error && (
        <p role="alert" className="flex items-start gap-2 rounded-lg bg-risk-soft px-3 py-2.5 text-sm text-risk">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          {error}
        </p>
      )}
      {message && (
        <p className="flex items-start gap-2 rounded-lg bg-positive-soft px-3 py-2.5 text-sm text-positive">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
          {message}
        </p>
      )}

      <Button type="submit" variant="secondary" disabled={saving} className="w-full sm:w-auto">
        {saving ? "Updating…" : "Update password"}
      </Button>
    </form>
  );
}

// ── Linked payment methods ──────────────────────────────────────────────
// No backend endpoint for linking bank/UPI accounts exists yet, so this
// section is local-only state. Wire handleAdd/handleRemove up to real
// portalApi methods (e.g. portalApi.linkBankAccount / linkUpi / unlink)
// once the backend exposes them — the UI and validation are ready to go.

interface LinkedMethod {
  id: string;
  type: "bank" | "upi";
  label: string;
  detail: string;
  isPrimary: boolean;
}

type MethodType = "upi" | "bank";

function LinkedPaymentMethods() {
  const [methods, setMethods] = useState<LinkedMethod[]>([]);
  const [formOpen, setFormOpen] = useState(false);
  const [methodType, setMethodType] = useState<MethodType>("upi");

  const [upiId, setUpiId] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [ifsc, setIfsc] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  function openForm(type: MethodType) {
    setMethodType(type);
    setFormError(null);
    setFormOpen(true);
  }

  function closeForm() {
    setFormOpen(false);
    setFormError(null);
    setUpiId("");
    setBankName("");
    setAccountNumber("");
    setIfsc("");
  }

  function handleAdd(event: FormEvent) {
    event.preventDefault();

    if (methodType === "upi") {
      if (!/^[\w.-]{2,}@[a-zA-Z]{2,}$/.test(upiId.trim())) {
        setFormError("Enter a valid UPI ID, e.g. yourname@bank");
        return;
      }
      setMethods((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          type: "upi",
          label: upiId.trim(),
          detail: "UPI ID",
          isPrimary: prev.length === 0,
        },
      ]);
    } else {
      if (bankName.trim().length < 2 || accountNumber.replace(/\s+/g, "").length < 6) {
        setFormError("Enter a valid bank name and account number.");
        return;
      }
      if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifsc.trim().toUpperCase())) {
        setFormError("Enter a valid 11-character IFSC code, e.g. HDFC0001234");
        return;
      }
      const last4 = accountNumber.replace(/\s+/g, "").slice(-4);
      setMethods((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          type: "bank",
          label: bankName.trim(),
          detail: `•••• ${last4} · ${ifsc.trim().toUpperCase()}`,
          isPrimary: prev.length === 0,
        },
      ]);
    }
    closeForm();
  }

  function handleRemove(id: string) {
    setMethods((prev) => {
      const next = prev.filter((m) => m.id !== id);
      if (next.length > 0 && !next.some((m) => m.isPrimary)) {
        next[0] = { ...next[0], isPrimary: true };
      }
      return next;
    });
  }

  function handleSetPrimary(id: string) {
    setMethods((prev) => prev.map((m) => ({ ...m, isPrimary: m.id === id })));
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 lg:col-span-2">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-navy-900 text-white">
            <Landmark className="h-4 w-4" strokeWidth={1.85} />
          </span>
          <div>
            <h2 className="font-display text-sm font-semibold text-navy-900">Linked payment methods</h2>
            <p className="text-xs text-slate-500">Connect a bank account or UPI ID for faster transfers.</p>
          </div>
        </div>
        {!formOpen && (
          <Button variant="secondary" size="sm" onClick={() => openForm("upi")}>
            <Plus className="h-3.5 w-3.5" /> Add method
          </Button>
        )}
      </div>

      <p className="mt-3 flex items-start gap-2 rounded-lg bg-warning-soft px-3 py-2 text-xs text-warning">
        <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
        These are stored in this session only until connected to a backend endpoint — nothing here is sent to a bank.
      </p>

      {methods.length === 0 && !formOpen && (
        <div className="mt-4 flex flex-col items-center gap-3 rounded-lg border border-dashed border-slate-300 py-8 text-center sm:flex-row sm:justify-center sm:gap-4">
          <button
            onClick={() => openForm("bank")}
            className="flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-navy-800 transition-colors hover:border-navy-300 hover:bg-slate-50"
          >
            <Landmark className="h-4 w-4 text-slate-400" /> Connect bank account
          </button>
          <button
            onClick={() => openForm("upi")}
            className="flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-navy-800 transition-colors hover:border-navy-300 hover:bg-slate-50"
          >
            <Smartphone className="h-4 w-4 text-slate-400" /> Connect UPI ID
          </button>
        </div>
      )}

      {methods.length > 0 && (
        <ul className="mt-4 space-y-2">
          {methods.map((method, i) => (
            <li
              key={method.id}
              className="animate-fade-in flex items-center gap-3 rounded-lg border border-slate-200 px-3.5 py-3"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent-teal-soft text-accent-teal">
                {method.type === "upi" ? (
                  <AtSign className="h-4 w-4" strokeWidth={1.85} />
                ) : (
                  <Banknote className="h-4 w-4" strokeWidth={1.85} />
                )}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate text-sm font-medium text-navy-900">{method.label}</p>
                  {method.isPrimary && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-positive-soft px-2 py-0.5 text-[11px] font-medium text-positive">
                      <Star className="h-2.5 w-2.5 fill-current" /> Primary
                    </span>
                  )}
                </div>
                <p className="truncate text-xs text-slate-500">{method.detail}</p>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                {!method.isPrimary && (
                  <button
                    onClick={() => handleSetPrimary(method.id)}
                    className="rounded-md px-2 py-1 text-xs font-medium text-slate-500 transition-colors hover:bg-slate-100 hover:text-navy-900"
                  >
                    Make primary
                  </button>
                )}
                <button
                  onClick={() => handleRemove(method.id)}
                  aria-label={`Remove ${method.label}`}
                  className="rounded-md p-1.5 text-slate-400 transition-colors hover:bg-risk-soft hover:text-risk"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {formOpen && (
        <form onSubmit={handleAdd} className="animate-fade-in mt-4 space-y-3.5 rounded-lg border border-slate-200 bg-slate-50 p-4">
          <div className="flex items-center justify-between">
            <div className="flex gap-1 rounded-lg border border-slate-200 bg-white p-1">
              <button
                type="button"
                onClick={() => setMethodType("upi")}
                className={cn(
                  "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                  methodType === "upi" ? "bg-navy-900 text-white" : "text-slate-500 hover:bg-slate-100"
                )}
              >
                <Smartphone className="h-3.5 w-3.5" /> UPI
              </button>
              <button
                type="button"
                onClick={() => setMethodType("bank")}
                className={cn(
                  "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                  methodType === "bank" ? "bg-navy-900 text-white" : "text-slate-500 hover:bg-slate-100"
                )}
              >
                <Landmark className="h-3.5 w-3.5" /> Bank account
              </button>
            </div>
            <button
              type="button"
              onClick={closeForm}
              aria-label="Cancel"
              className="rounded-md p-1.5 text-slate-400 hover:bg-slate-200 hover:text-navy-900"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {methodType === "upi" ? (
            <label className="block">
              <span className={labelClass}>UPI ID</span>
              <div className="relative mt-1.5">
                <FieldIcon icon={AtSign} />
                <input
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  placeholder="yourname@bank"
                  className={cn(inputClass, "bg-white")}
                />
              </div>
            </label>
          ) : (
            <>
              <label className="block">
                <span className={labelClass}>Bank name</span>
                <div className="relative mt-1.5">
                  <FieldIcon icon={Landmark} />
                  <input
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    placeholder="HDFC Bank"
                    className={cn(inputClass, "bg-white")}
                  />
                </div>
              </label>
              <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
                <label className="block">
                  <span className={labelClass}>Account number</span>
                  <div className="relative mt-1.5">
                    <FieldIcon icon={Banknote} />
                    <input
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value)}
                      placeholder="0123456789"
                      className={cn(inputClass, "bg-white")}
                    />
                  </div>
                </label>
                <label className="block">
                  <span className={labelClass}>IFSC code</span>
                  <div className="relative mt-1.5">
                    <FieldIcon icon={ShieldCheck} />
                    <input
                      value={ifsc}
                      onChange={(e) => setIfsc(e.target.value.toUpperCase())}
                      placeholder="HDFC0001234"
                      className={cn(inputClass, "bg-white")}
                    />
                  </div>
                </label>
              </div>
            </>
          )}

          {formError && (
            <p role="alert" className="flex items-start gap-2 rounded-lg bg-risk-soft px-3 py-2 text-sm text-risk">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              {formError}
            </p>
          )}

          <div className="flex gap-2">
            <Button type="submit" size="sm">
              <Check className="h-3.5 w-3.5" /> Save method
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={closeForm}>
              Cancel
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}

export function PortalProfilePage() {
  const { data, status, error, refetch } = useFetch((signal) => portalApi.profile(signal), []);

  if (status === "loading") return <CardSkeleton rows={4} />;
  if (status === "error" || !data) return <ErrorState message={error?.message} onRetry={refetch} />;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <PersonalDetailsForm customer={data} />
        <ChangePasswordForm />
      </div>
      <LinkedPaymentMethods />
    </div>
  );
}