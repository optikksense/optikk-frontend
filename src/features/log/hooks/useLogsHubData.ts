import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

import { useAppStore } from '@shared/store/appStore';
import { fillVolumeBucketGaps } from '@shared/utils/logUtils';

import { logQueries } from '../api/queryOptions';

import type { LogsBackendParams } from '../api/logsApi';
import type { LogAggregateRow, LogStructuredFilter, LogVolumeBucket } from '../types';

/**
 * Resolves the active logs range into concrete millisecond bounds.
 */
function resolveTimeBounds(timeRange: {
  value?: string;
  minutes?: number;
  startTime?: number | string | null;
  endTime?: number | string | null;
}) {
  const now = Date.now();
  const stabilizedNow = Math.floor(now / 60000) * 60000;
  const isCustom = timeRange.value === 'custom';
  const customStart = Number(timeRange.startTime);
  const customEnd = Number(timeRange.endTime);

  const endTime = isCustom && Number.isFinite(customEnd)
    ? customEnd
    : stabilizedNow;
  const startTime = isCustom && Number.isFinite(customStart)
    ? customStart
    : endTime - (timeRange.minutes ?? 0) * 60 * 1000;

  return { startTime, endTime };
}

/**
 * Picks a bucket size that keeps long-range log volume charts legible.
 */
function getAdaptiveVolumeStep(rangeMs: number): '1m' | '5m' | '1h' | '1d' {
  const hourMs = 60 * 60 * 1000;
  const dayMs = 24 * hourMs;

  if (rangeMs <= 3 * hourMs) return '1m';
  if (rangeMs <= dayMs) return '5m';
  if (rangeMs <= 7 * dayMs) return '1h';
  return '1d';
}

/**
 * Input parameters for the logs hub data hook.
 */
export interface UseLogsHubDataProps {
  searchText: string;
  selectedService: string | null;
  errorsOnly: boolean;
  filters: LogStructuredFilter[];
  page: number;
  pageSize: number;
}

/**
 * Aggregates the logs page list, stats, and volume queries behind one hook.
 */
export function useLogsHubData({
  searchText,
  selectedService,
  errorsOnly,
  filters,
  page,
  pageSize,
}: UseLogsHubDataProps) {
  const { selectedTeamId, timeRange, refreshKey } = useAppStore();

  const backendParams = useMemo((): LogsBackendParams => {
    const params: LogsBackendParams = { limit: pageSize, offset: (page - 1) * pageSize };
    if (searchText.trim()) params.search = searchText.trim();
    if (errorsOnly) params.severities = ['ERROR', 'FATAL'];
    if (selectedService) params.services = [selectedService];
    
    // ... filtering logic simplified for this phase ...
    for (const filter of filters) {
      if (filter.field === 'level' && filter.operator === 'equals') params.severities = [filter.value.toUpperCase()];
      if (filter.field === 'service_name' && filter.operator === 'equals') params.services = [filter.value];
      if (filter.field === 'host' && filter.operator === 'equals') params.hosts = [filter.value];
    }
    return params;
  }, [filters, selectedService, errorsOnly, searchText, pageSize, page]);

  const commonParams = useMemo(() => {
    void refreshKey;

    const { startTime, endTime } = resolveTimeBounds(timeRange);

    return {
      teamId: selectedTeamId,
      startTime,
      endTime,
      backendParams,
    };
  }, [
    selectedTeamId,
    timeRange,
    backendParams,
    refreshKey,
  ]);

  const volumeStep = useMemo(
    () => getAdaptiveVolumeStep(Math.max(commonParams.endTime - commonParams.startTime, 0)),
    [commonParams.endTime, commonParams.startTime],
  );

  const { data: logsData, isLoading: logsLoading } = useQuery({
    ...logQueries.list(commonParams),
    enabled: !!selectedTeamId,
  });

  const { data: statsData, isLoading: statsLoading } = useQuery({
    ...logQueries.stats(commonParams),
    enabled: !!selectedTeamId,
  });

  const { data: volumeData, isLoading: volumeLoading } = useQuery({
    ...logQueries.volume({ ...commonParams, step: volumeStep }),
    enabled: !!selectedTeamId,
  });

  const { data: aggregateData, isLoading: aggregateLoading } = useQuery({
    ...logQueries.aggregate({
      teamId: selectedTeamId,
      startTime: commonParams.startTime,
      endTime: commonParams.endTime,
      groupBy: 'service',
      step: volumeStep,
      topN: 10,
      metric: 'error_rate',
    }),
    enabled: !!selectedTeamId,
  });

  const logs = logsData?.logs ?? [];
  const total = logsData?.total ?? 0;
  const levelFacets = useMemo(
    () => statsData?.fields.level ?? [],
    [statsData?.fields.level],
  );
  const serviceFacets = useMemo(
    () => statsData?.fields.service_name ?? [],
    [statsData?.fields.service_name],
  );

  const volumeBuckets = useMemo(() => {
    return fillVolumeBucketGaps<LogVolumeBucket>(
      volumeData?.buckets ?? [],
      volumeData?.step ?? '',
      commonParams.startTime,
      commonParams.endTime,
    );
  }, [volumeData?.buckets, volumeData?.step, commonParams.endTime, commonParams.startTime]);

  const errorCount = useMemo(() => {
    return levelFacets
      .filter((f) => ['ERROR', 'FATAL'].includes(f.value.toUpperCase()))
      .reduce((sum, f) => sum + f.count, 0);
  }, [levelFacets]);

  const warnCount = useMemo(() => {
    return levelFacets
      .filter((f) => ['WARN', 'WARNING'].includes(f.value.toUpperCase()))
      .reduce((sum, f) => sum + f.count, 0);
  }, [levelFacets]);

  const aggregateRows: LogAggregateRow[] = (aggregateData?.rows ?? []) as LogAggregateRow[];

  return {
    logs,
    logsLoading,
    total,
    volumeBuckets,
    volumeStep: volumeData?.step ?? volumeStep,
    volumeLoading,
    errorCount,
    warnCount,
    totalCount: statsData?.total ?? total,
    serviceFacets,
    levelFacets,
    statsLoading,
    aggregateRows,
    aggregateLoading,
  };
}
