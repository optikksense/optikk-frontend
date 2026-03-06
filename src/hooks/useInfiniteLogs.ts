import { useInfiniteQuery, InfiniteData } from '@tanstack/react-query';
import { useMemo } from 'react';

import { v1Service } from '@services/v1Service';

import { useAppStore } from '@store/appStore';

import {
  getLogsFromPage,
  getHasMoreFromPage,
  getNextCursorFromPage,
  getTimestampMs,
  compareIdsDesc,
  extractServerTotal,
} from '@utils/logUtils';

interface UseInfiniteLogsOptions {
  backendParams: any;
  liveTail?: boolean;
  pageSize?: number;
}

/**
 * Encapsulates infinite-scroll log fetching
 * @param root0
 * @param root0.backendParams
 * @param root0.liveTail
 * @param root0.pageSize
 */
export function useInfiniteLogs({ backendParams, liveTail = false, pageSize = 100 }: UseInfiniteLogsOptions) {
  const { selectedTeamId, timeRange, refreshKey } = useAppStore();

  // Pin the time window so all pages share the same boundaries
  const { stableStart, stableEnd } = useMemo(() => {
    if (timeRange.value === 'custom' && timeRange.startTime && timeRange.endTime) {
      return { stableStart: timeRange.startTime, stableEnd: timeRange.endTime };
    }
    const end = Date.now();
    return { stableStart: end - (timeRange.minutes || 0) * 60 * 1000, stableEnd: end };
  }, [
    selectedTeamId,
    timeRange.value,
    timeRange.minutes,
    timeRange.startTime,
    timeRange.endTime,
    backendParams,
    refreshKey,
  ]);

  const query = useInfiniteQuery<any, Error, InfiniteData<any>, any[], any>({
    queryKey: [
      'logs-v2-infinite',
      selectedTeamId, timeRange.value,
      pageSize, backendParams,
      refreshKey,
    ],
    queryFn: ({ pageParam }) =>
      v1Service.getLogs(selectedTeamId, stableStart, stableEnd, {
        ...backendParams,
        limit: pageSize,
        direction: 'desc',
        ...(pageParam != null ? { cursor: pageParam } : {}),
      }),
    getNextPageParam: (lastPage, allPages) => {
      if (!getHasMoreFromPage(lastPage, allPages, pageSize)) return undefined;
      return getNextCursorFromPage(lastPage);
    },
    initialPageParam: null,
    enabled: !!selectedTeamId,
    refetchInterval: liveTail ? 3000 : false,
    refetchIntervalInBackground: false,
  });

  // Deduplicate + sort newest-first
  const allLogs = useMemo(() => {
    if (!query.data?.pages) return [];
    const raw = query.data.pages.flatMap((page) => getLogsFromPage(page));
    const seen = new Set();
    const unique = [];
    for (const log of raw) {
      const id = String(log?.id ?? '').trim();
      const traceId = log?.traceId || log?.trace_id || '';
      const spanId = log?.spanId || log?.span_id || '';
      const serviceName = log?.serviceName || log?.service_name || '';
      const key = id && id !== '0'
        ? id
        : `${log.timestamp}-${traceId}-${spanId}-${serviceName}-${(log.message || '').slice(0, 120)}`;
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(log);
      }
    }
    unique.sort((a, b) => {
      const tsDiff = getTimestampMs(b) - getTimestampMs(a);
      if (tsDiff !== 0) return tsDiff;
      return compareIdsDesc(a.id, b.id);
    });
    return unique;
  }, [query.data]);

  const serverTotal = extractServerTotal(query.data?.pages);

  return {
    allLogs,
    serverTotal,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    isFetchingNextPage: query.isFetchingNextPage,
    hasNextPage: query.hasNextPage,
    fetchNextPage: query.fetchNextPage,
    refetch: query.refetch,
  };
}
