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
      refreshKey,
    ],
    queryFn: ({ signal }) =>
      metricsExplorerApi.query(
        buildExplorerQueryRequest(queries, startTime, endTime, step),
        signal
      ),
    enabled: Boolean(selectedTenantId) && activeQueries.length > 0,
    retry: false,
  });
}
