import { useQuery } from '@tanstack/react-query';

import { useAppStore } from '@app/store/appStore';

import { resolveTimeBounds } from '@/features/explorer-core/utils/timeRange';

import { logTransactionsApi } from '../api/logTransactionsApi';

export function useLogTransactions(params: {
  query: string;
  groupByField: string;
  limit?: number;
  enabled?: boolean;
}) {
  const { selectedTeamId, timeRange, refreshKey } = useAppStore();
  const { startTime, endTime } = resolveTimeBounds(timeRange);

  return useQuery({
    queryKey: [
      'logs',
      'transactions',
      selectedTeamId,
      startTime,
      endTime,
      params.query,
      params.groupByField,
      params.limit,
      refreshKey,
    ],
    queryFn: () =>
      logTransactionsApi.query({
        startTime,
        endTime,
        query: params.query,
        groupByField: params.groupByField,
        limit: params.limit ?? 100,
      }),
    enabled: Boolean(selectedTeamId) && Boolean(params.groupByField) && params.enabled !== false,
    placeholderData: (previous) => previous,
    retry: false,
  });
}
