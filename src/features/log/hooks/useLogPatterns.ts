import { useQuery } from '@tanstack/react-query';

import { useAppStore } from '@app/store/appStore';

import { resolveTimeBounds } from '@/features/explorer-core/utils/timeRange';

import { logPatternsApi } from '../api/logPatternsApi';

export function useLogPatterns(params: { query: string; limit?: number; enabled?: boolean }) {
  const { selectedTeamId, timeRange, refreshKey } = useAppStore();
  const { startTime, endTime } = resolveTimeBounds(timeRange);

  return useQuery({
    queryKey: [
      'logs',
      'patterns',
      selectedTeamId,
      startTime,
      endTime,
      params.query,
      params.limit,
      refreshKey,
    ],
    queryFn: () =>
      logPatternsApi.query({
        startTime,
        endTime,
        query: params.query,
        limit: params.limit ?? 100,
      }),
    enabled: Boolean(selectedTeamId) && params.enabled !== false,
    placeholderData: (previous) => previous,
    retry: false,
  });
}
