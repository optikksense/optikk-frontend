import { useState, useMemo, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';

import { useURLFilters } from '@shared/hooks/useURLFilters';
import { useAppStore } from '@shared/store/appStore';
import { traceQueries } from '../api/queryOptions';
import type { TracesBackendParams } from '../api/tracesApi';
import type { ServiceBadge } from '../types';

const TRACES_URL_FILTER_CONFIG = {
  params: [
    { key: 'search', type: 'string' as const, defaultValue: '' },
    { key: 'service', type: 'string' as const, defaultValue: '' },
    { key: 'errorsOnly', type: 'boolean' as const, defaultValue: false },
  ],
  syncStructuredFilters: true,
};

/**
 * Traces hub page logic with React Query and queryOptions pattern.
 */
export function useTracesExplorer() {
  const { selectedTeamId, timeRange, refreshKey } = useAppStore();

  const {
    values: urlValues,
    setters: urlSetters,
    structuredFilters: filters,
    setStructuredFilters: setFilters,
    clearAll: clearURLFilters,
  } = useURLFilters(TRACES_URL_FILTER_CONFIG);

  const searchText = typeof urlValues['search'] === 'string' ? urlValues['search'] : '';
  const selectedService =
    typeof urlValues['service'] === 'string' && urlValues['service'].length > 0 ? urlValues['service'] : null;
  const errorsOnly = urlValues['errorsOnly'] === true;

  const setSearchText = (value: string): void => {
    urlSetters['search']?.(value);
  };

  const setSelectedService = (value: string | null): void => {
    urlSetters['service']?.(value || '');
  };

  const setErrorsOnly = (value: boolean): void => {
    urlSetters['errorsOnly']?.(value);
  };

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const backendParams: TracesBackendParams = useMemo(() => {
    const params: TracesBackendParams = {
      limit: pageSize,
      offset: (page - 1) * pageSize,
    };

    if (errorsOnly) params.status = 'ERROR';
    if (selectedService) params.services = [selectedService];

    return params;
  }, [selectedService, errorsOnly, pageSize, page]);

  const { startMs, endMs } = useMemo(() => {
    const resolvedEndMs =
      timeRange.value === 'custom' && timeRange.endTime != null ? Number(timeRange.endTime) : Date.now();
    const resolvedStartMs =
      timeRange.value === 'custom' && timeRange.startTime != null
        ? Number(timeRange.startTime)
        : resolvedEndMs - (timeRange.minutes ?? 60) * 60 * 1000;

    return { startMs: resolvedStartMs, endMs: resolvedEndMs };
  }, [refreshKey, timeRange]);

  const { data, isLoading } = useQuery({
    ...traceQueries.list(
      selectedTeamId,
      startMs,
      endMs,
      { ...backendParams, refreshKey } as any
    ),
    placeholderData: (prev) => prev,
  });

  const traces = data?.traces ?? [];
  const totalTraces = data?.total ?? 0;
  const summary = data?.summary || {};
  
  const errorTraces = Number(summary['error_traces'] ?? 0);
  const errorRate = totalTraces > 0 ? (errorTraces * 100) / totalTraces : 0;
  const p95 = Number(summary['p95_duration'] ?? 0);
  const p99 = Number(summary['p99_duration'] ?? 0);

  const maxDuration = useMemo(
    () => Math.max(...traces.map((trace) => trace.duration_ms), 1),
    [traces],
  );

  const serviceBadges = useMemo<ServiceBadge[]>(() => {
    const counts: Record<string, number> = {};
    for (const trace of traces) {
      if (trace.service_name) {
        counts[trace.service_name] = (counts[trace.service_name] || 0) + 1;
      }
    }
    return Object.entries(counts).sort((left, right) => right[1] - left[1]);
  }, [traces]);

  const clearAll = useCallback((): void => {
    clearURLFilters();
    setPage(1);
  }, [clearURLFilters]);

  return {
    isLoading,
    traces,
    total: totalTraces,
    totalTraces,
    errorTraces,
    errorRate,
    p95,
    p99,
    serviceBadges,
    maxDuration,
    searchText,
    selectedService,
    errorsOnly,
    page,
    pageSize,
    filters,
    setSearchText,
    setSelectedService,
    setErrorsOnly,
    setPage,
    setPageSize,
    setFilters,
    clearAll,
  };
}