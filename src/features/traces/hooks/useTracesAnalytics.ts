import { useExplorerAnalytics } from "@/features/explorer/hooks/useExplorerAnalytics";
import type {
  AnalyticsAggregation,
  AnalyticsVizMode,
  ExplorerFilter,
} from "@/features/explorer/types";

import { tracesExplorerApi } from "../api/tracesExplorerApi";

interface UseTracesAnalyticsArgs {
  readonly filters: readonly ExplorerFilter[];
  readonly groupBy: readonly string[];
  readonly aggregations: readonly AnalyticsAggregation[];
  readonly step: string;
  readonly vizMode: AnalyticsVizMode;
  readonly limit?: number;
  readonly enabled?: boolean;
}

/**
 * Traces-scope analytics fetch — delegates to the shared hook with the
 * traces-specific fetcher. Returned value is a plain `useStandardQuery`
 * result keyed per viz so tab switches re-issue a fresh request.
 */
export function useTracesAnalytics(args: UseTracesAnalyticsArgs) {
  return useExplorerAnalytics({
    scope: "traces",
    filters: args.filters,
    groupBy: args.groupBy,
    aggregations: args.aggregations,
    step: args.step,
    vizMode: args.vizMode,
    limit: args.limit,
    enabled: args.enabled,
    fetcher: tracesExplorerApi.analytics,
  });
}
