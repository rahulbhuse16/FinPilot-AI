import { api } from "./axios";
import type { Account, Anomaly, Customer, Customer360, Loan, Transaction } from "../types/domain";

export interface ProfileUpdatePayload {
  full_name?: string;
  email?: string;
  phone?: string;
}

export interface PasswordChangePayload {
  current_password: string;
  new_password: string;
}

export const portalApi = {
  profile: (signal?: AbortSignal) =>
    api.get<Customer>("/portal/profile", { signal }).then((r) => r.data),

  updateProfile: (payload: ProfileUpdatePayload) =>
    api.patch<Customer>("/portal/profile", payload).then((r) => r.data),

  changePassword: (payload: PasswordChangePayload) =>
    api.post<void>("/portal/change-password", payload).then((r) => r.data),

  summary: (signal?: AbortSignal) =>
    api.get<Customer360>("/portal/summary", { signal }).then((r) => r.data),

  accounts: (signal?: AbortSignal) =>
    api.get<Account[]>("/portal/accounts", { signal }).then((r) => r.data),

  transactions: (limit = 50, signal?: AbortSignal) =>
    api
      .get<Transaction[]>("/portal/transactions", { params: { limit }, signal })
      .then((r) => r.data),

  loans: (signal?: AbortSignal) =>
    api.get<Loan[]>("/portal/loans", { signal }).then((r) => r.data),


  dashboardStatistics: (signal?: AbortSignal) =>
    api.get<Loan[]>("/portal/dashboard/statistics", { signal }).then((r) => r.data),

  anomalies: (signal?: AbortSignal) =>
    api.get<Anomaly[]>("/portal/transaction-anomalies", { signal }).then((r) => r.data),
};
