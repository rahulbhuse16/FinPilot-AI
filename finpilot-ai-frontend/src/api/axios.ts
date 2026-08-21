import axios, { AxiosError } from "axios";
import type { ApiErrorShape } from "../types/api";

const baseURL = `https://finpilot-3lph.onrender.com/api/v1`;

export const api = axios.create({
  baseURL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

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
    if (status === 404) {
      return { message: "The requested data could not be found.", status };
    }
    return { message: "Something went wrong. Please try again.", status };
  }
  return { message: "Something went wrong. Please try again." };
}
