import axios, { AxiosError } from "axios";
import type { ApiErrorShape } from "../types/api";
import { clearStoredAuth, readStoredToken } from "../utils/authStorage";

export const baseURL =
  window.location.hostname === "localhost"
    ? "http://localhost:8000/api/v1"
    : "https://finpilot-3lph.onrender.com/api/v1";

export const UNAUTHORIZED_EVENT = "finpilot:unauthorized";

export const api = axios.create({
  baseURL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = readStoredToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      clearStoredAuth();
      window.dispatchEvent(new Event(UNAUTHORIZED_EVENT));
    }

    return Promise.reject(error);
  }
);

/** Normalizes any Axios/network error into a safe, user-facing message. */
export function toApiError(error: unknown): ApiErrorShape {
  if (axios.isAxiosError(error)) {
    const err = error as AxiosError<{ detail?: string; message?: string }>;
    const status = err.response?.status;

    if (!err.response) {
      return { message: "Unable to reach the server. Check your connection and try again.", status };
    }
    if (status && status >= 500) {
      return { message: "Something went wrong. Please try again.", status };
    }
    const detail = err.response?.data?.detail ?? err.response?.data?.message;
    if (typeof detail === "string" && detail.length > 0 && detail.length < 200) {
      return { message: detail, status };
    }
    if (status === 401) {
      return { message: "Your session has expired. Please sign in again.", status };
    }
    if (status === 403) {
      return { message: "You do not have access to this resource.", status };
    }
    if (status === 404) {
      return { message: "The requested data could not be found.", status };
    }
    return { message: "Something went wrong. Please try again.", status };
  }
  return { message: "Something went wrong. Please try again." };
}
