import { api } from "./axios";
import type {
  LoanDetails,
  LoanPaymentRequest,
  LoanPaymentResponse,
} from "../utils/loanPayment";

/**
 * Loan API service — the ONLY place that talks to the loan/payment
 * endpoints. Components consume these functions and never call axios
 * directly for loans.
 */
export const loanService = {
  /** GET /portal/loans — all loans for the authenticated customer. */
  async getLoans(signal?: AbortSignal): Promise<LoanDetails[]> {
    const { data } = await api.get<LoanDetails[]>("/portal/loans", { signal });
    return data;
  },

  /** GET /portal/loans/{loanId} — a single customer loan. */
  async getLoanById(loanId: string, signal?: AbortSignal): Promise<LoanDetails> {
    const { data } = await api.get<LoanDetails>(`/portal/loans/${loanId}`, { signal });
    return data;
  },

  /** POST /portal/loans/{loanId}/payments — record a loan payment. */
  async payLoan(
    loanId: string,
    payload: LoanPaymentRequest
  ): Promise<LoanPaymentResponse> {
    const { data } = await api.post<LoanPaymentResponse>(
      `/portal/loans/${loanId}/payments`,
      payload
    );
    return data;l
  },
};