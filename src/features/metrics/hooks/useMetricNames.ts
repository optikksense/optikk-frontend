import { resolveTimeBounds } from "@/features/explorer-core/utils/timeRange";
import { useStandardQuery } from "@/shared/hooks/useStandardQuery";
import { useRefreshKey, useTeamId, useTimeRange } from "@store/appStore";
import { metricsExplorerApi } from "../api/metricsExplorerApi";

export function useMetricNames(search: string) {
  const selectedTeamId = useTeamId();
  const timeRange = useTimeRange();
  const refreshKey = useRefreshKey();
  const { startTime, endTime } = resolveTimeBounds(timeRange);

  return useStandardQuery({
    queryKey: ["metrics", "names", selectedTeamId, startTime, endTime, search, refreshKey],
    queryFn: () => metricsExplorerApi.getMetricNames({ startTime, endTime, search }),
    enabled: Boolean(selectedTeamId),
    staleTime: 60_000,
  });
}
