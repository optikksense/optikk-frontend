import { useRefreshKey, useTenantId, useTimeRange } from "@app/store/appStore";
import { useStandardQuery } from "@shared/hooks/useStandardQuery";
import { useMemo } from "react";

import { resolveTimeBounds } from "@shared/utils/timeBounds";
import type { ExplorerFilter } from "../types/filters";
import type { ExplorerIncludeFlag, ExplorerQueryRequest } from "../types/queries";

interface UseExplorerQueryArgs<TResponse> {
  readonly scope: "logs" | "traces";
  readonly filters: readonly ExplorerFilter[];
  readonly cursor: string | null;
  readonly limit: number;
  readonly include: readonly ExplorerIncludeFlag[];
  readonly enabled?: boolean;
  readonly fetcher: (body: ExplorerQueryRequest) => Promise<TResponse>;
}

/**
 * Thin wrapper around `useStandardQuery` that encapsulates:
 *   - tenantId + refreshKey + time-range plumbing
 *   - stable query-key hashing
 *   - `include` flag passthrough (facets/trend/summary)
 *
 * Callers (useLogsExplorer, useTracesExplorer) stay under 200 LOC.
 *
 * Explorer reads are scoped by the session tenant on the server; `tenantId` is
 * kept in the query key for cache separation when the workspace picker
 * changes, but we do not gate `enabled` on it — a null primary tenant id should
 * not block fetches (see auth + persist merge in appStore).
 */
export function useExplorerQuery<TResponse>(args: UseExplorerQueryArgs<TResponse>) {
  const tenantId = useTenantId();
  const refreshKey = useRefreshKey();
  const timeRange = useTimeRange();
  const { startTime, endTime } = useMemo(() => resolveTimeBounds(timeRange), [timeRange]);
  const timeRangeKey = useMemo(() => JSON.stringify(timeRange), [timeRange]);

  const query = useStandardQuery<TResponse>({
    queryKey: [
      args.scope,
      "explorer",
      "query",
      tenantId ?? "none",
      refreshKey,
      timeRangeKey,
      JSON.stringify(args.filters),
      args.cursor,
      args.limit,
      args.include.join(","),
    ],
    queryFn: () => {
      return args.fetcher({
        startTime,
        endTime,
        filters: args.filters,
        cursor: args.cursor ?? undefined,
        limit: args.limit,
        include: args.include,
      });
    },
    enabled: args.enabled ?? true,
  });

  return { ...query, startTime, endTime, tenantId, refreshKey };
}

export interface UseExplorerSubQueryArgs<TResponse> {
  readonly scope: "logs" | "traces";
  readonly subKey: string;
  readonly filters: readonly ExplorerFilter[];
  readonly enabled?: boolean;
  readonly fetcher: (req: {
    startTime: number;
    endTime: number;
    filters: readonly ExplorerFilter[];
  }) => Promise<TResponse>;
}

/**
 * Standardized sub-query helper for explorer secondary reads (facets, trend,
 * summary) that shares tenantId, refreshKey, timeRangeKey, and live bounds.
 */
export function useExplorerSubQuery<TResponse>(args: UseExplorerSubQueryArgs<TResponse>) {
  const tenantId = useTenantId();
  const refreshKey = useRefreshKey();
  const timeRange = useTimeRange();
  const timeRangeKey = useMemo(() => JSON.stringify(timeRange), [timeRange]);
  const { startTime, endTime } = useMemo(() => resolveTimeBounds(timeRange), [timeRange]);
  const filtersKey = useMemo(() => JSON.stringify(args.filters), [args.filters]);

  return useStandardQuery<TResponse>({
    queryKey: [
      args.scope,
      "explorer",
      args.subKey,
      tenantId ?? "none",
      refreshKey,
      timeRangeKey,
      filtersKey,
    ],
    queryFn: () => {
      return args.fetcher({
        startTime,
        endTime,
        filters: args.filters,
      });
    },
    enabled: args.enabled ?? true,
  });
}
