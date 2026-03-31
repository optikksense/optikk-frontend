import { useQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';

import { logsService } from '@shared/api/logsService';
import { useAppStore } from '@app/store/appStore';

import type { LogEntry } from '@entities/log/model';
import { useLiveTailStream } from '@/features/explorer-core/hooks/useLiveTailStream';
import { resolveTimeBounds } from '@/features/explorer-core/utils/timeRange';

import type { StructuredFilter } from '@shared/hooks/useURLFilters';
import { logsExplorerApi } from '../api/logsExplorerApi';
import type { LogAggregateRow, LogFacet, LogVolumeBucket, LogsBackendParams } from '../types';

export interface UseLogsHubDataProps {
  searchText: string;
  filters: StructuredFilter[];
  backendParams: LogsBackendParams;
  page: number;
  pageSize: number;
}

const DEFAULT_STEP = '5m';

export function useLogsHubData({
  searchText,
  filters,
  backendParams,
  page,
  pageSize,
}: UseLogsHubDataProps) {
  const { selectedTeamId, timeRange, refreshKey } = useAppStore();
  const [liveTailEnabled, setLiveTailEnabled] = useState(false);

  const { startTime, endTime } = useMemo(() => resolveTimeBounds(timeRange), [timeRange]);

  const explorerQuery = useQuery({
    queryKey: [
      'logs',
      'explorer',
      selectedTeamId,
      startTime,
      endTime,
      page,
      pageSize,
      searchText,
      filters,
      backendParams,
      refreshKey,
    ],
    queryFn: () =>
      logsExplorerApi.query({
        startTime,
        endTime,
        limit: pageSize,
        offset: (page - 1) * pageSize,
        step: DEFAULT_STEP,
        params: backendParams,
      }),
    enabled: Boolean(selectedTeamId),
    placeholderData: (previous) => previous,
    retry: false,
  });

  const liveTail = useLiveTailStream<LogEntry>({
    enabled: liveTailEnabled && Boolean(selectedTeamId),
    subscribeEvent: 'subscribe:logs',
    itemEvent: 'log',
    params: { startMs: startTime, endMs: endTime, ...backendParams },
    normalizeItem: (value) => {
      const record = value as LogEntry;
      return {
        ...record,
        level: record.severity_text ?? record.level ?? '',
        message: record.body ?? record.message ?? '',
        service: record.service_name ?? record.service ?? '',
        service_name: record.service_name ?? record.service ?? '',
      };
    },
  });

  const results = explorerQuery.data;
  const logs = liveTailEnabled ? liveTail.items : (results?.results ?? []);
  const total = liveTailEnabled ? liveTail.items.length : Number(results?.pageInfo.total ?? 0);
  const serviceFacets = (results?.facets.service_name ?? []) as LogFacet[];
  const levelFacets = (results?.facets.level ?? []) as LogFacet[];
  const aggregateRows = ((
    results?.correlations?.serviceErrorRate as { rows?: LogAggregateRow[] } | undefined
  )?.rows ?? []) as LogAggregateRow[];

  return {
    logs,
    logsLoading: explorerQuery.isLoading,
    logsError: explorerQuery.isError,
    logsErrorDetail: explorerQuery.error,
    total,
    volumeBuckets: (results?.trend.buckets ?? []) as LogVolumeBucket[],
    volumeStep: results?.trend.step ?? DEFAULT_STEP,
    volumeLoading: explorerQuery.isLoading,
    errorCount: Number(results?.summary.error_logs ?? 0),
    warnCount: Number(results?.summary.warn_logs ?? 0),
    totalCount: Number(results?.summary.total_logs ?? total),
    serviceFacets,
    levelFacets,
    statsLoading: explorerQuery.isLoading,
    aggregateRows,
    aggregateLoading: explorerQuery.isLoading,
    liveTailEnabled,
    setLiveTailEnabled,
    liveTailStatus: liveTail.status,
    liveTailLagMs: liveTail.lagMs,
    liveTailDroppedCount: liveTail.droppedCount,
  };
}
