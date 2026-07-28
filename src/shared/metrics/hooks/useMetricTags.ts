import { useStandardQuery } from "@/shared/hooks/useStandardQuery";
import { useResolvedTimeBounds, useTenantId } from "@app/store/appStore";
import { metricsExplorerApi } from "@shared/metrics/api/metricsExplorerApi";

export function useMetricTags(metricName: string) {
  const selectedTenantId = useTenantId();
  const { startTime, endTime } = useResolvedTimeBounds();

  return useStandardQuery({
    queryKey: ["metrics", "tags", metricName, startTime, endTime],
    queryFn: () => metricsExplorerApi.getMetricTags({ metricName, startTime, endTime }),
    enabled: Boolean(selectedTenantId) && Boolean(metricName),
    staleTime: 60_000,
  });
}
