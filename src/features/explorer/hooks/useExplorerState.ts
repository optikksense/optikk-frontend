import { useCallback, useMemo } from "react";

import { useSearchParamsCompat } from "@shared/hooks/useSearchParamsCompat";

import type { ExplorerFilter, ExplorerMode } from "../types/filters";
import { decodeFilters, encodeFilters, parseMode } from "../utils/urlState";

/** URL-synced snapshot shared by all explorers (both logs + traces). */
export interface ExplorerStateSnapshot {
  readonly filters: readonly ExplorerFilter[];
  readonly mode: ExplorerMode;
  readonly cursor: string | null;
  readonly detail: string | null;
}

export interface ExplorerStateApi extends ExplorerStateSnapshot {
  readonly setFilters: (filters: readonly ExplorerFilter[]) => void;
  readonly setMode: (mode: ExplorerMode) => void;
  readonly setCursor: (cursor: string | null) => void;
  readonly setDetail: (detail: string | null) => void;
  readonly clearAll: () => void;
}

function setOrDelete(params: URLSearchParams, key: string, value: string | null): URLSearchParams {
  const next = new URLSearchParams(params);
  if (value === null || value === "") {
    next.delete(key);
  } else {
    next.set(key, value);
  }
  return next;
}

/**
 * Canonical URL state: `filters` (base64 JSON), `mode`, `cursor`, `detail`.
 * Analytics sub-params (groupBy/aggs/step/viz) are owned by useExplorerAnalytics.
 */
export function useExplorerState(): ExplorerStateApi {
  const [params, setParams] = useSearchParamsCompat();
  const filters = useMemo(() => decodeFilters(params.get("filters")), [params]);
  const mode = useMemo(() => parseMode(params.get("mode")), [params]);
  const cursor = params.get("cursor");
  const detail = params.get("detail");

  const setFilters = useCallback(
    (next: readonly ExplorerFilter[]) => {
      setParams(
        (prev) => setOrDelete(prev, "filters", next.length > 0 ? encodeFilters(next) : null),
        { replace: true }
      );
    },
    [setParams]
  );
  const setMode = useCallback(
    (next: ExplorerMode) =>
      setParams((prev) => setOrDelete(prev, "mode", next === "analytics" ? "analytics" : null), {
        replace: true,
      }),
    [setParams]
  );
  const setCursor = useCallback(
    (next: string | null) => setParams((prev) => setOrDelete(prev, "cursor", next), { replace: true }),
    [setParams]
  );
  const setDetail = useCallback(
    (next: string | null) => setParams((prev) => setOrDelete(prev, "detail", next), { replace: true }),
    [setParams]
  );
  const clearAll = useCallback(() => {
    setParams(() => new URLSearchParams(), { replace: true });
  }, [setParams]);

  return { filters, mode, cursor, detail, setFilters, setMode, setCursor, setDetail, clearAll };
}
