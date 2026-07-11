import { useStandardQuery } from "@/shared/hooks/useStandardQuery";
import { useRefreshKey, useTenantId, useTimeRange } from "@app/store/appStore";
import { metricsExplorerApi } from "@shared/metrics/api/metricsExplorerApi";
import { resolveTimeBounds } from "@shared/utils/timeBounds";

export function useMetricTags(metricName: string) {
  const selectedTenantId = useTenantId();
  const timeRange = useTimeRange();
  const refreshKey = useRefreshKey();
  const { startTime, endTime } = resolveTimeBounds(timeRange);

  return useStandardQuery({
    queryKey: ["metrics", "tags", selectedTenantId, metricName, startTime, endTime, refreshKey],
    queryFn: () => metricsExplorerApi.getMetricTags({ metricName, startTime, endTime }),
    enabled: Boolean(selectedTenantId) && Boolean(metricName),
    staleTime: 60_000,
  });
}
