import { useStandardQuery } from "@/shared/hooks/useStandardQuery";
import { useRefreshKey, useTenantId, useTimeRange } from "@app/store/appStore";
import { metricsExplorerApi } from "@shared/metrics/api/metricsExplorerApi";
import { resolveTimeBounds } from "@shared/utils/timeBounds";

export function useMetricNames(search: string) {
  const selectedTenantId = useTenantId();
  const timeRange = useTimeRange();
  const refreshKey = useRefreshKey();
  const { startTime, endTime } = resolveTimeBounds(timeRange);

  return useStandardQuery({
    queryKey: ["metrics", "names", selectedTenantId, startTime, endTime, search, refreshKey],
    queryFn: () => metricsExplorerApi.getMetricNames({ startTime, endTime, search }),
    enabled: Boolean(selectedTenantId),
    staleTime: 60_000,
  });
}
