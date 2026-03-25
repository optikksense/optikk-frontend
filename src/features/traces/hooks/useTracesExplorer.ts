import { useQuery } from '@tanstack/react-query';
import { useCallback, useMemo, useState } from 'react';

import { useURLFilters } from '@shared/hooks/useURLFilters';
import { useAppStore } from '@app/store/appStore';

import { resolveTimeBounds } from '@/features/explorer-core/utils/timeRange';

import { tracesExplorerApi } from '../api/tracesExplorerApi';

import type { TracesBackendParams } from '../api/tracesApi';
import type { TraceExplorerFacets, TraceSummary } from '../types';

const EMPTY_TRACE_FACETS: TraceExplorerFacets = {
  service_name: [],
  status: [],
  operation_name: [],
};

const EMPTY_TRACE_SUMMARY: TraceSummary = {
  total_traces: 0,
  error_traces: 0,
  p95_duration: 0,
  p99_duration: 0,
  p50_duration: 0,
  avg_duration: 0,
};

const TRACES_URL_FILTER_CONFIG = {
  params: [
    { key: 'search', type: 'string' as const, defaultValue: '' },
    { key: 'service', type: 'string' as const, defaultValue: '' },
    { key: 'errorsOnly', type: 'boolean' as const, defaultValue: false },
    { key: 'mode', type: 'string' as const, defaultValue: 'all' },
  ],
  syncStructuredFilters: true,
  stripParams: ['view'],
};

function compileStructuredFilters(
  filters: Array<{ field: string; operator: string; value: string }>,
): Partial<TracesBackendParams & { mode?: string; search?: string }> {
  const compiled: Partial<TracesBackendParams & { mode?: string; search?: string }> = {};

  for (const filter of filters) {
    switch (filter.field) {
      case 'trace_id':
        compiled.traceId = filter.value;
        break;
      case 'operation_name':
        compiled.operationName = filter.value;
        break;
      case 'status':
        compiled.status = filter.value;
        break;
      case 'service_name':
        compiled.services = [filter.value];
        break;
      case 'http_method':
        compiled.httpMethod = filter.value;
        break;
      case 'http_status':
        compiled.httpStatusCode = filter.value;
        break;
      case 'duration_ms':
        if (filter.operator === 'gt') {
          compiled.minDuration = Number(filter.value);
        }
        if (filter.operator === 'lt') {
          compiled.maxDuration = Number(filter.value);
        }
        break;
      default:
        break;
    }
  }

  return compiled;
}

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
  const mode = typeof urlValues['mode'] === 'string' ? urlValues['mode'] : 'all';

  const setSearchText = (value: string): void => {
    urlSetters['search']?.(value);
  };

  const setSelectedService = (value: string | null): void => {
    urlSetters['service']?.(value || '');
  };

  const setErrorsOnly = (value: boolean): void => {
    urlSetters['errorsOnly']?.(value);
  };

  const setMode = (value: string): void => {
    urlSetters['mode']?.(value);
  };

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const { startTime, endTime } = useMemo(() => resolveTimeBounds(timeRange), [timeRange]);

  const backendParams = useMemo((): TracesBackendParams & { search?: string; mode?: string } => {
    const params: TracesBackendParams & { search?: string; mode?: string } = {
      limit: pageSize,
      offset: (page - 1) * pageSize,
      mode,
    };

    if (errorsOnly) {
      params.status = 'ERROR';
    }
    if (selectedService) {
      params.services = [selectedService];
    }
    if (searchText.trim()) {
      params.search = searchText.trim();
    }

    return {
      ...params,
      ...compileStructuredFilters(filters),
    };
  }, [errorsOnly, filters, mode, page, pageSize, searchText, selectedService]);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: [
      'traces',
      'explorer',
      selectedTeamId,
      startTime,
      endTime,
      backendParams,
      refreshKey,
    ],
    queryFn: () =>
      tracesExplorerApi.query({
        startTime,
        endTime,
        limit: pageSize,
        offset: (page - 1) * pageSize,
        step: '5m',
        params: backendParams,
      }),
    enabled: Boolean(selectedTeamId),
    placeholderData: (previous) => previous,
    retry: false,
  });

  const traces = useMemo(() => data?.results ?? [], [data?.results]);
  const totalTraces = Number(data?.pageInfo?.total ?? data?.summary?.total_traces ?? 0);
  const summary = data?.summary ?? EMPTY_TRACE_SUMMARY;

  const errorTraces = Number(summary.error_traces ?? 0);
  const errorRate = totalTraces > 0 ? (errorTraces * 100) / totalTraces : 0;
  const p50 = Number(summary.p50_duration ?? 0);
  const p95 = Number(summary.p95_duration ?? 0);
  const p99 = Number(summary.p99_duration ?? 0);

  const maxDuration = useMemo(
    () => Math.max(...traces.map((trace) => trace.duration_ms), 1),
    [traces],
  );

  const clearAll = useCallback((): void => {
    clearURLFilters();
    setPage(1);
  }, [clearURLFilters]);

  return {
    isLoading,
    isError,
    error,
    traces,
    total: totalTraces,
    totalTraces,
    summary,
    errorTraces,
    errorRate,
    p50,
    p95,
    p99,
    trendBuckets: data?.trend ?? [],
    facets: data?.facets ?? EMPTY_TRACE_FACETS,
    maxDuration,
    searchText,
    selectedService,
    errorsOnly,
    mode,
    page,
    pageSize,
    filters,
    startTime,
    endTime,
    backendParams,
    setSearchText,
    setSelectedService,
    setErrorsOnly,
    setMode,
    setPage,
    setPageSize,
    setFilters,
    clearAll,
  };
}
