import { api } from "./axios";
import type { Transaction, Anomaly } from "../types/domain";
import type { Paginated } from "../types/api";

export interface ListTransactionsParams {
  customerId?: string;
  page?: number;
  page_size?: number;
  signal?: AbortSignal;
}

export const transactionsApi = {
  list: ({ customerId, page, page_size, signal }: ListTransactionsParams = {}) =>
    api
      .get<Transaction[] | Paginated<Transaction>>(`/customers/${customerId}/transactions`, {
        params: { customer_id: customerId, page, page_size },
        signal,
      })
      .then((r) => r.data),

  getAnomalies: (customerId: string, signal?: AbortSignal) =>
    api
      .get<Anomaly[]>(`/customers/${customerId}/transaction-anomalies`, { signal })
      .then((r) => r.data),
};
