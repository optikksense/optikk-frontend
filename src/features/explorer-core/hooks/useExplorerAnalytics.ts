import { useQuery } from '@tanstack/react-query';

import { useAppStore } from '@app/store/appStore';

import { explorerAnalyticsApi, type ExplorerAnalyticsRequest } from '../api/explorerAnalyticsApi';

export function useExplorerAnalytics(
  scope: 'logs' | 'traces',
  params: ExplorerAnalyticsRequest & { enabled?: boolean }
) {
  const { selectedTeamId, refreshKey } = useAppStore();
  const { enabled: enabledOverride, ...body } = params;

  return useQuery({
    queryKey: ['explorer', 'analytics', scope, selectedTeamId, body, refreshKey],
    queryFn: () => explorerAnalyticsApi.query(scope, body),
    enabled: Boolean(selectedTeamId) && enabledOverride !== false,
    placeholderData: (previous) => previous,
    retry: false,
  });
}
