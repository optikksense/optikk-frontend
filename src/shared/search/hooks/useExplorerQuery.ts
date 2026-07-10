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

  const body: ExplorerQueryRequest = useMemo(
    () => ({
      startTime,
      endTime,
      filters: args.filters,
      cursor: args.cursor ?? undefined,
      limit: args.limit,
      include: args.include,
    }),
    [startTime, endTime, args.filters, args.cursor, args.limit, args.include]
  );

  const query = useStandardQuery<TResponse>({
    queryKey: [
      args.scope,
      "explorer",
      "query",
      tenantId ?? "none",
      refreshKey,
      startTime,
      endTime,
      JSON.stringify(args.filters),
      args.cursor,
      args.limit,
      args.include.join(","),
    ],
    queryFn: () => args.fetcher(body),
    enabled: args.enabled ?? true,
  });

  return { ...query, startTime, endTime, tenantId, refreshKey };
}
