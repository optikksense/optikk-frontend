import { useCallback, useMemo } from "react";

import { useSearchParamsCompat } from "@shared/hooks/useSearchParamsCompat";

import type { ExplorerFilter, ExplorerMode } from "../types/filters";
import { decodeFilters, encodeFilters, parseMode } from "../utils/urlState";

/**
 * URL-synced snapshot shared by all explorers (logs, traces).
 * 
 * Migration from `useURLFilters`: This synchronous hook replaces the legacy
 * timer-debounced `useURLFilters` system. Migrate legacy pages to this hook
 * when overhauling their search architectures.
 */
interface ExplorerStateSnapshot {
  readonly filters: readonly ExplorerFilter[];
  readonly mode: ExplorerMode;
  readonly cursor: string | null;
  readonly detail: string | null;
}

export interface ExplorerStateApi extends ExplorerStateSnapshot {
  readonly setFilters: (filters: readonly ExplorerFilter[]) => void;
  readonly addFilter: (filter: ExplorerFilter) => void;
  readonly removeFilter: (filter: ExplorerFilter) => void;
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
  const addFilter = useCallback(
    (filter: ExplorerFilter) => {
      setFilters([...filters, filter]);
    },
    [filters, setFilters]
  );
  const removeFilter = useCallback(
    (filter: ExplorerFilter) => {
      setFilters(
        filters.filter(
          (f) => f.field !== filter.field || f.op !== filter.op || f.value !== filter.value
        )
      );
    },
    [filters, setFilters]
  );
  const setMode = useCallback(
    (next: ExplorerMode) =>
      setParams(
        (prev) => setOrDelete(prev, "mode", (next as string) === "analytics" ? "analytics" : null),
        {
          replace: true,
        }
      ),
    [setParams]
  );
  const setCursor = useCallback(
    (next: string | null) =>
      setParams((prev) => setOrDelete(prev, "cursor", next), { replace: true }),
    [setParams]
  );
  const setDetail = useCallback(
    (next: string | null) =>
      setParams((prev) => setOrDelete(prev, "detail", next), { replace: true }),
    [setParams]
  );
  const clearAll = useCallback(() => {
    setParams(() => new URLSearchParams(), { replace: true });
  }, [setParams]);

  return { filters, mode, cursor, detail, setFilters, addFilter, removeFilter, setMode, setCursor, setDetail, clearAll };
}
