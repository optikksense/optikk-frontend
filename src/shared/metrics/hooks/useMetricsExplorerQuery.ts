import { useStandardQuery } from "@/shared/hooks/useStandardQuery";
import { useRefreshKey, useTenantId, useTimeRange } from "@app/store/appStore";
import {
  buildExplorerQueryRequest,
  metricsExplorerApi,
} from "@shared/metrics/api/metricsExplorerApi";
import type { MetricQueryDefinition, TimeStep } from "@shared/metrics/types";
import { resolveTimeBounds } from "@shared/utils/timeBounds";

export function useMetricsExplorerQuery(queries: MetricQueryDefinition[], step: TimeStep) {
  const selectedTenantId = useTenantId();
  const timeRange = useTimeRange();
  const refreshKey = useRefreshKey();

  const activeQueries = queries.filter((q) => q.metricName);
  const queriesHash = JSON.stringify(activeQueries);
  const timeRangeKey = JSON.stringify(timeRange);

  return useStandardQuery({
    queryKey: [
      "metrics",
      "explorer",
      selectedTenantId,
      queriesHash,
      timeRangeKey,
      step,
      refreshKey,
    ],
    queryFn: ({ signal }) => {
      const { startTime, endTime } = resolveTimeBounds(timeRange);
      return metricsExplorerApi.query(
        buildExplorerQueryRequest(queries, startTime, endTime, step),
        signal
      );
    },
    enabled: Boolean(selectedTenantId) && activeQueries.length > 0,
    retry: false,
  });
}
