import { useQuery } from '@tanstack/react-query';

import { useTeamId, useRefreshKey } from '@app/store/appStore';

import { explorerAnalyticsApi, type ExplorerAnalyticsRequest } from '../api/explorerAnalyticsApi';

export function useExplorerAnalytics(
  scope: 'logs' | 'traces',
  params: ExplorerAnalyticsRequest & { enabled?: boolean }
) {
  const selectedTeamId = useTeamId();
  const refreshKey = useRefreshKey();
  const { enabled: enabledOverride, ...body } = params;

  return useQuery({
    queryKey: ['explorer', 'analytics', scope, selectedTeamId, body, refreshKey],
    queryFn: () => explorerAnalyticsApi.query(scope, body),
    enabled: Boolean(selectedTeamId) && enabledOverride !== false,
    placeholderData: (previous) => previous,
    retry: false,
  });
}
