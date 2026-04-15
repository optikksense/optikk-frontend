import { resolveTimeBounds } from "@/features/explorer-core/utils/timeRange";
import { useStandardQuery } from "@/shared/hooks/useStandardQuery";
import { useRefreshKey, useTeamId, useTimeRange } from "@store/appStore";
import { buildExplorerQueryRequest, metricsExplorerApi } from "../api/metricsExplorerApi";
import type { MetricQueryDefinition, MetricSpaceAggregation, TimeStep } from "../types";

export function useMetricsExplorerQuery(
  queries: MetricQueryDefinition[],
  step: TimeStep,
  spaceAgg: MetricSpaceAggregation
) {
  const selectedTeamId = useTeamId();
  const timeRange = useTimeRange();
  const refreshKey = useRefreshKey();
  const { startTime, endTime } = resolveTimeBounds(timeRange);

  const activeQueries = queries.filter((q) => q.metricName);
  const queriesHash = JSON.stringify(activeQueries);

  return useStandardQuery({
    queryKey: [
      "metrics",
      "explorer",
      selectedTeamId,
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
    enabled: Boolean(selectedTeamId) && activeQueries.length > 0,
    retry: false,
  });
}
