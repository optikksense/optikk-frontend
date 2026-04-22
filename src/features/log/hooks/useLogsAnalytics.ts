import { useExplorerAnalytics } from "@features/explorer/hooks/useExplorerAnalytics";
import type {
  AnalyticsAggregation,
  AnalyticsVizMode,
  ExplorerFilter,
} from "@features/explorer/types";

import { analyticsLogs } from "../api/logsExplorerApi";

interface UseLogsAnalyticsArgs {
  readonly filters: readonly ExplorerFilter[];
  readonly groupBy: readonly string[];
  readonly aggregations: readonly AnalyticsAggregation[];
  readonly step: string;
  readonly vizMode: AnalyticsVizMode;
  readonly limit?: number;
  readonly enabled?: boolean;
}

/**
 * Logs-scoped wrapper over `useExplorerAnalytics`. URL sync of
 * groupBy/aggs/step/viz lives at the page level (see the analytics toolbar);
 * this hook just pipes the resolved args into the shared analytics fetch.
 *
 * Default behavior matches plan §D.8: first entry → timeseries
 * `count() by service`. The page layer supplies those defaults.
 */
export function useLogsAnalytics(args: UseLogsAnalyticsArgs) {
  return useExplorerAnalytics({
    scope: "logs",
    filters: args.filters,
    groupBy: args.groupBy,
    aggregations: args.aggregations,
    step: args.step,
    vizMode: args.vizMode,
    limit: args.limit,
    enabled: args.enabled,
    fetcher: analyticsLogs,
  });
}

export type UseLogsAnalyticsReturn = ReturnType<typeof useLogsAnalytics>;
