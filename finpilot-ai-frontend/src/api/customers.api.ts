import { api } from "./axios";
import type { Customer, Customer360 } from "../types/domain";
import type { Paginated } from "../types/api";

export interface ListCustomersParams {
  search?: string;
  page?: number;
  page_size?: number;
  signal?: AbortSignal;
}

export const customersApi = {
  list: ({ search, page, page_size, signal }: ListCustomersParams = {}) =>
    api
      .get<Customer[] | Paginated<Customer>>("/customers", {
        params: { search: search || undefined, page, page_size },
        signal,
      })
      .then((r) => r.data),

  getById: (customerId: string, signal?: AbortSignal) =>
    api.get<Customer>(`/customers/${customerId}`, { signal }).then((r) => r.data),

  get360: (customerId: string, signal?: AbortSignal) =>
    api.get<Customer360>(`/customers/${customerId}/360`, { signal }).then((r) => r.data),
};
