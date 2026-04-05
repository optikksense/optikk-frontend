import { useQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';

import { useAppStore } from '@app/store/appStore';

import type { LogEntry } from '@entities/log/model';
import { useLiveTailStream } from '@/features/explorer-core/hooks/useLiveTailStream';
import { resolveTimeBounds } from '@/features/explorer-core/utils/timeRange';

import type { StructuredFilter } from '@shared/hooks/useURLFilters';
import { logsExplorerApi } from '../api/logsExplorerApi';
import type { LogAggregateRow, LogFacet, LogVolumeBucket, LogsBackendParams } from '../types';
import { sortLogEntriesNewestFirst } from '../utils/sortLogEntries';

export interface UseLogsHubDataProps {
  explorerQuery: string;
  filters: StructuredFilter[];
  /** Params derived for live tail (legacy socket payload shape). */
  liveTailParams: LogsBackendParams;
  page: number;
  pageSize: number;
}

const DEFAULT_STEP = '5m';

/** Live tail buffer size (must match `maxItems` on `useLiveTailStream` and any UI cap). */
export const LOGS_LIVE_TAIL_MAX_ROWS = 20;

export function useLogsHubData({
  explorerQuery,
  filters,
  liveTailParams,
  page,
  pageSize,
}: UseLogsHubDataProps) {
  const { selectedTeamId, timeRange, refreshKey } = useAppStore();
  const [liveTailEnabled, setLiveTailEnabled] = useState(false);

  const { startTime, endTime } = useMemo(() => resolveTimeBounds(timeRange), [timeRange]);

  const explorerQueryKey = useMemo(
    () => ({
      startTime,
      endTime,
      limit: pageSize,
      offset: (page - 1) * pageSize,
      step: DEFAULT_STEP,
      query: explorerQuery,
    }),
    [startTime, endTime, page, pageSize, explorerQuery]
  );

  const explorerQueryFn = useQuery({
    queryKey: ['logs', 'explorer', selectedTeamId, explorerQueryKey, refreshKey],
    queryFn: () =>
      logsExplorerApi.query({
        ...explorerQueryKey,
      }),
    enabled: Boolean(selectedTeamId),
    placeholderData: (previous) => previous,
    retry: false,
  });

  const liveTail = useLiveTailStream<LogEntry>({
    enabled: liveTailEnabled && Boolean(selectedTeamId),
    subscribeEvent: 'subscribe:logs',
    itemEvent: 'log',
    maxItems: LOGS_LIVE_TAIL_MAX_ROWS,
    params: { startMs: startTime, endMs: endTime, ...liveTailParams },
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

  const results = explorerQueryFn.data;
  const logs = useMemo(() => {
    if (!liveTailEnabled) return results?.results ?? [];
    return sortLogEntriesNewestFirst(liveTail.items).slice(0, LOGS_LIVE_TAIL_MAX_ROWS);
  }, [liveTailEnabled, results?.results, liveTail.items]);
  const total = liveTailEnabled ? logs.length : Number(results?.pageInfo.total ?? 0);
  const serviceFacets = (results?.facets.service_name ?? []) as LogFacet[];
  const levelFacets = (results?.facets.level ?? []) as LogFacet[];
  const hostFacets = (results?.facets.host ?? []) as LogFacet[];
  const podFacets = (results?.facets.pod ?? []) as LogFacet[];
  const containerFacets = (results?.facets.container ?? []) as LogFacet[];
  const environmentFacets = (results?.facets.environment ?? []) as LogFacet[];
  const scopeNameFacets = (results?.facets.scope_name ?? []) as LogFacet[];
  const aggregateRows = ((
    results?.correlations?.serviceErrorRate as { rows?: LogAggregateRow[] } | undefined
  )?.rows ?? []) as LogAggregateRow[];

  return {
    logs,
    logsLoading: liveTailEnabled
      ? liveTail.status === 'connecting' && liveTail.items.length === 0
      : explorerQueryFn.isLoading,
    logsError: explorerQueryFn.isError,
    logsErrorDetail: explorerQueryFn.error,
    total,
    volumeBuckets: (results?.trend.buckets ?? []) as LogVolumeBucket[],
    volumeStep: results?.trend.step ?? DEFAULT_STEP,
    volumeLoading: explorerQueryFn.isLoading,
    errorCount: Number(results?.summary.error_logs ?? 0),
    warnCount: Number(results?.summary.warn_logs ?? 0),
    totalCount: Number(results?.summary.total_logs ?? total),
    serviceFacets,
    levelFacets,
    hostFacets,
    podFacets,
    containerFacets,
    environmentFacets,
    scopeNameFacets,
    statsLoading: explorerQueryFn.isLoading,
    aggregateRows,
    aggregateLoading: explorerQueryFn.isLoading,
    liveTailEnabled,
    setLiveTailEnabled,
    liveTailStatus: liveTail.status,
    liveTailLagMs: liveTail.lagMs,
    liveTailErrorMessage: liveTail.errorMessage,
    liveTailDroppedCount: liveTail.droppedCount,
  };
}
