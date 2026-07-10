import { useStandardQuery } from "@/shared/hooks/useStandardQuery";
import { resolveTimeBounds } from "@shared/utils/timeBounds";
import { useRefreshKey, useTenantId, useTimeRange } from "@store/appStore";
import { buildExplorerQueryRequest, metricsExplorerApi } from "../api/metricsExplorerApi";
import type { MetricQueryDefinition, MetricSpaceAggregation, TimeStep } from "../types";

export function useMetricsExplorerQuery(
  queries: MetricQueryDefinition[],
  step: TimeStep,
  spaceAgg: MetricSpaceAggregation
) {
  const selectedTenantId = useTenantId();
  const timeRange = useTimeRange();
  const refreshKey = useRefreshKey();
  const { startTime, endTime } = resolveTimeBounds(timeRange);

  const activeQueries = queries.filter((q) => q.metricName);
  const queriesHash = JSON.stringify(activeQueries);

  return useStandardQuery({
    queryKey: [
      "metrics",
      "explorer",
      selectedTenantId,
      queriesHash,
      startTime,
      endTime,
      step,
      spaceAgg,
      refreshKey,
    ],
    queryFn: () =>
      metricsExplorerApi.query(
        buildExplorerQueryRequest(queries, startTime, endTime, step, spaceAgg)
      ),
    enabled: Boolean(selectedTenantId) && activeQueries.length > 0,
    retry: false,
  });
}
