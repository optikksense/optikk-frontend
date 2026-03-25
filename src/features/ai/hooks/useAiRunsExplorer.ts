import { useState, useMemo, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';

import { toApiErrorShape } from '@shared/api/utils/errorNormalization';
import { useURLFilters } from '@shared/hooks/useURLFilters';
import { resolveTimeRangeBounds } from '@/types';
import { useAppStore } from '@app/store/appStore';
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
  const selectedOperation =
    typeof urlValues['operation'] === 'string' ? urlValues['operation'] : '';
  const selectedStatus = typeof urlValues['status'] === 'string' ? urlValues['status'] : '';
  const selectedService = typeof urlValues['service'] === 'string' ? urlValues['service'] : '';
  const traceIdFilter = typeof urlValues['traceId'] === 'string' ? urlValues['traceId'] : '';

  const setSelectedModel = (v: string) => urlSetters['model']?.(v);
  const setSelectedOperation = (v: string) => urlSetters['operation']?.(v);
  const setSelectedStatus = (v: string) => urlSetters['status']?.(v);
  const setSelectedService = (v: string) => urlSetters['service']?.(v);

  const [pageSize, setPageSize] = useState(50);

  const { startMs, endMs } = useMemo(() => {
    void refreshKey;
    const { startTime, endTime } = resolveTimeRangeBounds(timeRange);
    return { startMs: startTime, endMs: endTime };
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

  const runsQuery = useQuery({
    ...aiRunsQueries.list(selectedTeamId, startMs, endMs, backendFilters, refreshKey),
    placeholderData: (prev) => prev,
  });
  const runs = runsQuery.data ?? [];
  const isRunsLoading = runsQuery.isLoading;
  const runsError = runsQuery.error ? toApiErrorShape(runsQuery.error) : null;

  const summaryQuery = useQuery({
    ...aiRunsQueries.summary(selectedTeamId, startMs, endMs, backendFilters, refreshKey),
    placeholderData: (prev) => prev,
  });
  const summary = summaryQuery.data;
  const isSummaryLoading = summaryQuery.isLoading;
  const summaryError = summaryQuery.error ? toApiErrorShape(summaryQuery.error) : null;

  const modelsQuery = useQuery(aiRunsQueries.models(selectedTeamId, startMs, endMs));
  const models = modelsQuery.data ?? [];
  const isModelsLoading = modelsQuery.isLoading;
  const modelsError = modelsQuery.error ? toApiErrorShape(modelsQuery.error) : null;

  const operationsQuery = useQuery(aiRunsQueries.operations(selectedTeamId, startMs, endMs));
  const operations = operationsQuery.data ?? [];
  const isOperationsLoading = operationsQuery.isLoading;
  const operationsError = operationsQuery.error ? toApiErrorShape(operationsQuery.error) : null;

  const clearAll = useCallback(() => {
    clearURLFilters();
  }, [clearURLFilters]);

  const isLoading = isRunsLoading || isSummaryLoading || isModelsLoading || isOperationsLoading;
  const hasError = Boolean(runsError || summaryError || modelsError || operationsError);
  const primaryError = runsError ?? summaryError ?? modelsError ?? operationsError ?? null;

  return {
    isLoading,
    isRunsLoading,
    isSummaryLoading,
    runs,
    summary,
    models,
    operations,
    runsError,
    summaryError,
    modelsError,
    operationsError,
    hasError,
    primaryError,
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
