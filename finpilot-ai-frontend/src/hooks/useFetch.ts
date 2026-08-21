import { useCallback, useEffect, useRef, useState } from "react";
import { toApiError } from "../api/axios";
import type { ApiErrorShape } from "../types/api";

export type FetchStatus = "idle" | "loading" | "success" | "error";

interface UseFetchResult<T> {
  data: T | null;
  status: FetchStatus;
  error: ApiErrorShape | null;
  refetch: () => void;
}

/**
 * Runs an abortable async fetcher whenever `deps` change, cancelling any
 * in-flight request from a previous render. Returns loading/error/success
 * status so screens can render the right state without duplicating logic.
 */
export function useFetch<T>(
  fetcher: (signal: AbortSignal) => Promise<T>,
  deps: React.DependencyList,
  enabled = true
): UseFetchResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [status, setStatus] = useState<FetchStatus>("idle");
  const [error, setError] = useState<ApiErrorShape | null>(null);
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;
  const [tick, setTick] = useState(0);

  const refetch = useCallback(() => setTick((t) => t + 1), []);

  useEffect(() => {
    if (!enabled) {
      setStatus("idle");
      return;
    }
    const controller = new AbortController();
    setStatus("loading");
    setError(null);

    fetcherRef.current(controller.signal)
      .then((result) => {
        if (controller.signal.aborted) return;
        setData(result);
        setStatus("success");
      })
      .catch((err) => {
        if (controller.signal.aborted) return;
        setError(toApiError(err));
        setStatus("error");
      });

    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, tick, ...deps]);

  return { data, status, error, refetch };
}
