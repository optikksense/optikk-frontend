import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { useRefreshKey, useTeamId } from "@app/store/appStore";

import { type ExplorerAnalyticsRequest, explorerAnalyticsApi } from "../api/explorerAnalyticsApi";

export function useExplorerAnalytics(
  scope: "logs" | "traces",
  params: ExplorerAnalyticsRequest & { enabled?: boolean }
) {
  const selectedTeamId = useTeamId();
  const refreshKey = useRefreshKey();
  const { enabled: enabledOverride, ...body } = params;

  return useQuery({
    queryKey: ["explorer", "analytics", scope, selectedTeamId, body, refreshKey],
    queryFn: () => explorerAnalyticsApi.query(scope, body),
    enabled: Boolean(selectedTeamId) && enabledOverride !== false,
    placeholderData: keepPreviousData,
    staleTime: 5_000,
    retry: 2,
  });
}
