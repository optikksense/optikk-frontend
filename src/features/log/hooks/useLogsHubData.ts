import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { logQueries } from '../api/queryOptions';
import { useAppStore } from '@shared/store/appStore';
import { fillVolumeBucketGaps } from '@shared/utils/logUtils';
import type { LogStructuredFilter, LogVolumeBucket, LogFacet } from '../types';
import type { LogsBackendParams } from '../api/logsApi';

export interface UseLogsHubDataProps {
  searchText: string;
  selectedService: string | null;
  errorsOnly: boolean;
  filters: LogStructuredFilter[];
  page: number;
  pageSize: number;
}

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
    // Stabilize time range to nearest minute to prevent infinite re-fetch loops
    const now = Date.now();
    const stabilizedNow = Math.floor(now / 60000) * 60000;
    const startTime = stabilizedNow - (timeRange.minutes ?? 0) * 60 * 1000;

    return {
      teamId: selectedTeamId,
      startTime,
      endTime: stabilizedNow,
      backendParams,
    };
  }, [selectedTeamId, timeRange.minutes, backendParams, refreshKey]);

  const { data: logsData, isLoading: logsLoading } = useQuery({
    ...logQueries.list(commonParams),
    enabled: !!selectedTeamId,
  });

  const { data: statsData, isLoading: statsLoading } = useQuery({
    ...logQueries.stats(commonParams),
    enabled: !!selectedTeamId,
  });

  const { data: volumeData, isLoading: volumeLoading } = useQuery({
    ...logQueries.volume({ ...commonParams, step: '1m' }),
    enabled: !!selectedTeamId,
  });

  const logs = logsData?.logs ?? [];
  const total = logsData?.total ?? 0;
  const levelFacets = statsData?.fields.level ?? [];
  const serviceFacets = statsData?.fields.service_name ?? [];

  const volumeBuckets = useMemo(() => {
    return fillVolumeBucketGaps<LogVolumeBucket>(
      volumeData?.buckets ?? [],
      volumeData?.step ?? '',
      timeRange.minutes ?? 0
    );
  }, [volumeData?.buckets, volumeData?.step, timeRange.minutes]);

  const errorCount = useMemo(() => {
    return levelFacets
      .filter(f => ['ERROR', 'FATAL'].includes(f.value.toUpperCase()))
      .reduce((sum, f) => sum + f.count, 0);
  }, [levelFacets]);

  const warnCount = useMemo(() => {
    return levelFacets
      .filter(f => ['WARN', 'WARNING'].includes(f.value.toUpperCase()))
      .reduce((sum, f) => sum + f.count, 0);
  }, [levelFacets]);

  return {
    logs,
    logsLoading,
    total,
    volumeBuckets,
    volumeLoading,
    errorCount,
    warnCount,
    totalCount: statsData?.total ?? total,
    serviceFacets,
    levelFacets,
    statsLoading,
  };
}
