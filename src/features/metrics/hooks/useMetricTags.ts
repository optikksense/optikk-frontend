import { resolveTimeBounds } from "@/features/explorer-core/utils/timeRange";
import { useStandardQuery } from "@/shared/hooks/useStandardQuery";
import { useRefreshKey, useTeamId, useTimeRange } from "@store/appStore";
import { metricsExplorerApi } from "../api/metricsExplorerApi";

export function useMetricTags(metricName: string) {
  const selectedTeamId = useTeamId();
  const timeRange = useTimeRange();
  const refreshKey = useRefreshKey();
  const { startTime, endTime } = resolveTimeBounds(timeRange);

  return useStandardQuery({
    queryKey: ["metrics", "tags", selectedTeamId, metricName, startTime, endTime, refreshKey],
    queryFn: () => metricsExplorerApi.getMetricTags({ metricName, startTime, endTime }),
    enabled: Boolean(selectedTeamId) && Boolean(metricName),
    staleTime: 60_000,
  });
}
