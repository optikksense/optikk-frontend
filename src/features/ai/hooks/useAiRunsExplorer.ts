import { useState, useMemo, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';

import { useURLFilters } from '@shared/hooks/useURLFilters';
import { useAppStore } from '@shared/store/appStore';
import { aiRunsQueries } from '../api/queryOptions';
import type { LLMRunFilters } from '../types';

const AI_RUNS_URL_FILTER_CONFIG = {
  params: [
    { key: 'model', type: 'string' as const, defaultValue: '' },
    { key: 'operation', type: 'string' as const, defaultValue: '' },
    { key: 'status', type: 'string' as const, defaultValue: '' },
    { key: 'service', type: 'string' as const, defaultValue: '' },
    { key: 'traceId', type: 'string' as const, defaultValue: '' },
  ],
  syncStructuredFilters: true,
};

export function useAiRunsExplorer() {
  const { selectedTeamId, timeRange, refreshKey } = useAppStore();

  const {
    values: urlValues,
    setters: urlSetters,
    structuredFilters: filters,
    setStructuredFilters: setFilters,
    clearAll: clearURLFilters,
  } = useURLFilters(AI_RUNS_URL_FILTER_CONFIG);

  const selectedModel = typeof urlValues['model'] === 'string' ? urlValues['model'] : '';
  const selectedOperation = typeof urlValues['operation'] === 'string' ? urlValues['operation'] : '';
  const selectedStatus = typeof urlValues['status'] === 'string' ? urlValues['status'] : '';
  const selectedService = typeof urlValues['service'] === 'string' ? urlValues['service'] : '';
  const traceIdFilter = typeof urlValues['traceId'] === 'string' ? urlValues['traceId'] : '';

  const setSelectedModel = (v: string) => urlSetters['model']?.(v);
  const setSelectedOperation = (v: string) => urlSetters['operation']?.(v);
  const setSelectedStatus = (v: string) => urlSetters['status']?.(v);
  const setSelectedService = (v: string) => urlSetters['service']?.(v);

  const [pageSize, setPageSize] = useState(50);

  const { startMs, endMs } = useMemo(() => {
    const resolvedEndMs =
      timeRange.value === 'custom' && timeRange.endTime != null ? Number(timeRange.endTime) : Date.now();
    const resolvedStartMs =
      timeRange.value === 'custom' && timeRange.startTime != null
        ? Number(timeRange.startTime)
        : resolvedEndMs - (timeRange.minutes ?? 60) * 60 * 1000;
    return { startMs: resolvedStartMs, endMs: resolvedEndMs };
  }, [refreshKey, timeRange]);

  const backendFilters: LLMRunFilters = useMemo(() => {
    const f: LLMRunFilters = { limit: pageSize };
    if (selectedModel) f.models = [selectedModel];
    if (selectedOperation) f.operations = [selectedOperation];
    if (selectedStatus) f.status = selectedStatus;
    if (selectedService) f.services = [selectedService];
    if (traceIdFilter) f.traceId = traceIdFilter;
    return f;
  }, [selectedModel, selectedOperation, selectedStatus, selectedService, traceIdFilter, pageSize]);

  const { data: runs = [], isLoading } = useQuery({
    ...aiRunsQueries.list(selectedTeamId, startMs, endMs, { ...backendFilters, refreshKey } as any),
    placeholderData: (prev) => prev,
  });

  const { data: summary } = useQuery({
    ...aiRunsQueries.summary(selectedTeamId, startMs, endMs, { ...backendFilters, refreshKey } as any),
    placeholderData: (prev) => prev,
  });

  const { data: models = [] } = useQuery(
    aiRunsQueries.models(selectedTeamId, startMs, endMs),
  );

  const { data: operations = [] } = useQuery(
    aiRunsQueries.operations(selectedTeamId, startMs, endMs),
  );

  const clearAll = useCallback(() => {
    clearURLFilters();
  }, [clearURLFilters]);

  return {
    isLoading,
    runs,
    summary: summary ?? {
      totalRuns: 0, errorRuns: 0, errorRate: 0,
      avgLatencyMs: 0, p95LatencyMs: 0, totalTokens: 0, uniqueModels: 0,
    },
    models,
    operations,
    selectedModel,
    selectedOperation,
    selectedStatus,
    selectedService,
    traceIdFilter,
    pageSize,
    filters,
    setSelectedModel,
    setSelectedOperation,
    setSelectedStatus,
    setSelectedService,
    setPageSize,
    setFilters,
    clearAll,
  };
}
