import { api } from "./axios";
import type { Loan } from "../types/domain";
import type { Paginated } from "../types/api";

export interface ListLoansParams {
  customerId?: string;
  page?: number;
  page_size?: number;
  signal?: AbortSignal;
}

export const loansApi = {
  list: ({ customerId, page, page_size, signal }: ListLoansParams = {}) =>
    api
      .get<Loan[] | Paginated<Loan>>(`/customers/${customerId}/loans`, {
        params: { customer_id: customerId, page, page_size },
        signal,
      })
      .then((r) => r.data),
};
