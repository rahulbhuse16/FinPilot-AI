import { api } from "./axios";
import type { Loan } from "../types/domain";
import type { Paginated } from "../types/api";

export interface ListLoansParams {
  customerId?: string;
  page?: number;
  page_size?: number;
  signal?: AbortSignal;
}

export interface LoanRequest {
  loan_id: string;
  status: "ACTIVE" | "REJECTED";
}

export interface LoanResponse {
  id: string;
  loan_type: string;
  principal_amount: string;
  outstanding_amount: string;
  interest_rate: string;
  monthly_emi: string;
  status: string;
  salary_slip_url:string
}

export const loansApi = {
  list: ({ customerId, page, page_size, signal }: ListLoansParams = {}) =>
    api
      .get<Loan[] | Paginated<Loan>>(`/customers/${customerId}/loans`, {
        params: { customer_id: customerId, page, page_size },
        signal,
      })
      .then((r) => r.data),

  async handleLoanRequest(
      loanId: string,
      payload: LoanRequest
    ): Promise<LoanResponse> {
      const { data } = await api.patch<LoanResponse>(
        `/admin/loans/${loanId}/`,
        payload
      );
      return data;
    },
};
