import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

interface LoanData {
  id?: string;
  loan_id?: string;
  application_id?: string;

  amount?: number | string;
  loan_amount?: number | string;

  loan_type?: string;
  type?: string;

  status?: string;

  [key: string]: unknown;
}

interface LocationState {
  loan?: LoanData;
}

const LoanRequestSuccess: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const { loan } = (location.state as LocationState) || {};

  const applicationId =
    loan?.application_id ||
    loan?.loan_id ||
    loan?.id ||
    "—";

  const loanAmount =
    loan?.loan_amount ??
    loan?.principal_amount;

  const loanType =
    loan?.loan_type ||
    loan?.type ||
    "—";

  const status =
    loan?.status ||
    "Submitted";

  const formattedAmount =
    loanAmount !== undefined && loanAmount !== null
      ? new Intl.NumberFormat("en-IN", {
          style: "currency",
          currency: "INR",
          maximumFractionDigits: 0,
        }).format(Number(loanAmount))
      : "—";

  const handleContinue = () => {
    navigate("/portal");
  };

  const handleViewApplication = () => {
    if (applicationId !== "—") {
      navigate(`/portal/loans/${applicationId}`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10 sm:px-6">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-3xl items-center justify-center">
        <div className="w-full">

          {/* Main Card */}
          <div className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-xl shadow-slate-200/60">

            {/* Header */}
            <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 px-6 py-14 sm:px-10">

              {/* Decorative circles */}
              <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-white/10" />
              <div className="absolute -bottom-28 -left-20 h-64 w-64 rounded-full bg-white/10" />
              <div className="absolute right-20 top-1/2 h-20 w-20 rounded-full bg-white/5" />

              <div className="relative flex flex-col items-center text-center">

                {/* Animated Check */}
                <div className="relative mb-7">
                  <div className="absolute inset-0 animate-ping rounded-full bg-white/20" />

                  <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-white shadow-2xl">
                    <svg
                      className="h-14 w-14 text-emerald-500"
                      viewBox="0 0 52 52"
                      fill="none"
                    >
                      <circle
                        cx="26"
                        cy="26"
                        r="23"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeDasharray="145"
                        strokeDashoffset="145"
                        className="animate-[drawCircle_0.6s_ease-out_forwards]"
                      />

                      <path
                        d="M15 27L22 34L38 18"
                        stroke="currentColor"
                        strokeWidth="4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeDasharray="35"
                        strokeDashoffset="35"
                        className="animate-[drawCheck_0.5s_0.5s_ease-out_forwards]"
                      />
                    </svg>
                  </div>
                </div>

                <p className="mb-2 text-sm font-semibold tracking-[0.18em] text-indigo-100">
                  APPLICATION RECEIVED
                </p>

                <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                  Loan Request Submitted
                </h1>

                <p className="mt-4 max-w-xl text-sm leading-6 text-indigo-100 sm:text-base">
                  Your loan request has been successfully submitted.
                  Our team will review your application and get back to
                  you shortly.
                </p>
              </div>
            </div>

            {/* Content */}
            <div className="px-6 py-8 sm:px-10">

              {/* Application ID */}
              <div className="mb-8 flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
                    Application ID
                  </p>

                  <p className="mt-1 font-semibold text-slate-800">
                    {applicationId}
                  </p>
                </div>

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100">
                  <svg
                    className="h-5 w-5 text-emerald-600"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path
                      d="M20 6L9 17l-5-5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </div>

              {/* Application Details */}
              <div>
                <h2 className="mb-4 text-lg font-semibold text-slate-900">
                  Application Details
                </h2>

                <div className="grid gap-4 sm:grid-cols-3">

                  {/* Amount */}
                  <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5 transition hover:border-indigo-100 hover:bg-indigo-50/40">
                    <p className="text-sm text-slate-500">
                      Loan Amount
                    </p>

                    <p className="mt-2 text-xl font-bold text-slate-900">
                      {formattedAmount}
                    </p>
                  </div>

                  {/* Type */}
                  <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5 transition hover:border-indigo-100 hover:bg-indigo-50/40">
                    <p className="text-sm text-slate-500">
                      Loan Type
                    </p>

                    <p className="mt-2 text-xl font-bold capitalize text-slate-900">
                      {loanType}
                    </p>
                  </div>

                  {/* Status */}
                  <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5 transition hover:border-indigo-100 hover:bg-indigo-50/40">
                    <p className="text-sm text-slate-500">
                      Status
                    </p>

                    <div className="mt-2 flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />

                      <span className="font-bold capitalize text-slate-900">
                        {status}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* What's Next */}
              <div className="mt-8 rounded-2xl border border-indigo-100 bg-indigo-50/60 p-6">
                <h3 className="font-semibold text-slate-900">
                  What happens next?
                </h3>

                <div className="mt-5 space-y-5">

                  <div className="flex gap-4">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-sm font-bold text-white">
                      1
                    </div>

                    <div>
                      <p className="font-medium text-slate-900">
                        Application review
                      </p>

                      <p className="mt-1 text-sm leading-5 text-slate-500">
                        Our team will verify the information provided
                        in your application.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-sm font-bold text-white">
                      2
                    </div>

                    <div>
                      <p className="font-medium text-slate-900">
                        Eligibility verification
                      </p>

                      <p className="mt-1 text-sm leading-5 text-slate-500">
                        We'll assess your eligibility and loan
                        requirements.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-sm font-bold text-white">
                      3
                    </div>

                    <div>
                      <p className="font-medium text-slate-900">
                        Decision & notification
                      </p>

                      <p className="mt-1 text-sm leading-5 text-slate-500">
                        You'll receive an update once your application
                        has been reviewed.
                      </p>
                    </div>
                  </div>

                </div>
              </div>

              {/* Actions */}
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">

                {/* Continue */}
                <button
                  type="button"
                  onClick={handleContinue}
                  className="group flex flex-1 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition-all duration-200 hover:bg-indigo-700 hover:shadow-xl active:scale-[0.98]"
                >
                  Continue

                  <svg
                    className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path
                      d="M5 12h14M13 6l6 6-6 6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>

                {/* View Application */}
                <button
                  type="button"
                  onClick={handleViewApplication}
                  disabled={applicationId === "—"}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3.5 text-sm font-semibold text-slate-700 transition-all duration-200 hover:border-slate-300 hover:bg-slate-50 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <svg
                    className="h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path
                      d="M15 3h6v6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />

                    <path
                      d="M10 14L21 3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />

                    <path
                      d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>

                  View Application
                </button>

              </div>

              <p className="mt-6 text-center text-xs text-slate-400">
                You can track your application status from your dashboard.
              </p>
            </div>
          </div>

          {/* Footer */}
          <p className="mt-6 text-center text-xs text-slate-400">
            Thank you for choosing FinPilot AI
          </p>
        </div>
      </div>

      {/* Animations */}
      <style>{`
        @keyframes drawCircle {
          to {
            stroke-dashoffset: 0;
          }
        }

        @keyframes drawCheck {
          to {
            stroke-dashoffset: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default LoanRequestSuccess;