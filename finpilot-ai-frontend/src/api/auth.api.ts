import { api } from "./axios";
import type {
  AuthTokenResponse,
  AuthUser,
  LoginPayload,
  RegisterPayload,
} from "../types/auth";

export const authApi = {
  login: (payload: LoginPayload) =>
    api.post<AuthTokenResponse>("/auth/login", payload).then((r) => r.data),

  register: (payload: RegisterPayload) =>
    api.post<AuthTokenResponse>("/auth/register", payload).then((r) => r.data),

  me: (signal?: AbortSignal) =>
    api.get<AuthUser>("/auth/me", { signal }).then((r) => r.data),
};
