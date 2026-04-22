import { useRefreshKey, useTeamId, useTimeRange } from "@app/store/appStore";
import { useStandardQuery } from "@shared/hooks/useStandardQuery";
import { useMemo } from "react";

import type { ExplorerFilter } from "../types/filters";
import type { ExplorerIncludeFlag, ExplorerQueryRequest } from "../types/queries";
import { resolveTimeBounds } from "../utils/timeRange";

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
 *   - teamId + refreshKey + time-range plumbing
 *   - stable query-key hashing
 *   - `include` flag passthrough (facets/trend/summary)
 *
 * Callers (useLogsExplorer, useTracesExplorer) stay under 200 LOC.
 */
export function useExplorerQuery<TResponse>(args: UseExplorerQueryArgs<TResponse>) {
  const teamId = useTeamId();
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
      teamId,
      refreshKey,
      startTime,
      endTime,
      JSON.stringify(args.filters),
      args.cursor,
      args.limit,
      args.include.join(","),
    ],
    queryFn: () => args.fetcher(body),
    enabled: (args.enabled ?? true) && Boolean(teamId),
  });

  return { ...query, startTime, endTime, teamId, refreshKey };
}
