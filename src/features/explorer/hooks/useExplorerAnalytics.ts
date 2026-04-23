import { useRefreshKey, useTeamId, useTimeRange } from "@app/store/appStore";
import { useStandardQuery } from "@shared/hooks/useStandardQuery";
import { useMemo } from "react";

import type { AnalyticsRequest, AnalyticsResponse } from "../types/analytics";
import type { ExplorerFilter } from "../types/filters";
import { resolveTimeBounds } from "../utils/timeRange";

interface UseExplorerAnalyticsArgs {
  readonly scope: "logs" | "traces";
  readonly filters: readonly ExplorerFilter[];
  readonly groupBy: readonly string[];
  readonly aggregations: AnalyticsRequest["aggregations"];
  readonly step: string;
  readonly vizMode: AnalyticsRequest["vizMode"];
  readonly limit?: number;
  readonly enabled?: boolean;
  readonly fetcher: (body: AnalyticsRequest) => Promise<AnalyticsResponse>;
}

/**
 * Keyed per viz so switching Timeseries → TopN re-issues a fresh request.
 * URL sync of these args lives in page-level state, not here.
 *
 * Same as useExplorerQuery: tenant is enforced server-side; do not disable
 * the query when `selectedTeamId` is null.
 */
export function useExplorerAnalytics(args: UseExplorerAnalyticsArgs) {
  const teamId = useTeamId();
  const refreshKey = useRefreshKey();
  const timeRange = useTimeRange();
  const { startTime, endTime } = useMemo(() => resolveTimeBounds(timeRange), [timeRange]);

  const body: AnalyticsRequest = useMemo(
    () => ({
      startTime,
      endTime,
      filters: args.filters,
      groupBy: args.groupBy,
      aggregations: args.aggregations,
      step: args.step,
      vizMode: args.vizMode,
      limit: args.limit,
    }),
    [
      startTime,
      endTime,
      args.filters,
      args.groupBy,
      args.aggregations,
      args.step,
      args.vizMode,
      args.limit,
    ]
  );

  return useStandardQuery<AnalyticsResponse>({
    queryKey: [
      args.scope,
      "explorer",
      "analytics",
      teamId ?? "none",
      refreshKey,
      startTime,
      endTime,
      JSON.stringify(args.filters),
      args.groupBy.join(","),
      JSON.stringify(args.aggregations),
      args.step,
      args.vizMode,
      args.limit,
    ],
    queryFn: () => args.fetcher(body),
    enabled: args.enabled ?? true,
  });
}
