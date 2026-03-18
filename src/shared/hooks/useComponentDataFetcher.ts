import { useQueries, keepPreviousData } from '@tanstack/react-query';
import { useMemo } from 'react';

import type { DashboardComponentSpec } from '@/types/dashboardConfig';

import { api } from '@shared/api/api/client';
import type { ApiErrorShape } from '@shared/api/api/interceptors/errorInterceptor';

import { useAppStore } from '@store/appStore';

interface ComponentFailedRequest {
  componentIds: string[];
  endpoint: string;
  method: string;
  error: ApiErrorShape;
}

interface UseComponentDataFetcherResult {
  data: Record<string, any>;
  isLoading: boolean;
  errors: Record<string, ApiErrorShape | null>;
  hasError: boolean;
  failedRequests: ComponentFailedRequest[];
}

function toApiErrorShape(error: unknown): ApiErrorShape {
  if (typeof error === 'object' && error !== null) {
    const record = error as Record<string, unknown>;
    return {
      status: typeof record.status === 'number' ? record.status : 0,
      message: typeof record.message === 'string' && record.message.length > 0
        ? record.message
        : 'An unexpected error occurred',
      data: record.data,
    };
  }

  if (error instanceof Error) {
    return {
      status: 0,
      message: error.message || 'An unexpected error occurred',
    };
  }

  return {
    status: 0,
    message: 'An unexpected error occurred',
  };
}

function buildRequestKey(
  component: DashboardComponentSpec,
  resolvedEndpoint: string,
  startMs: number,
  endMs: number,
) {
  return JSON.stringify({
    method: component.query!.method || 'GET',
    endpoint: resolvedEndpoint,
    params: component.query!.params || {},
    startMs,
    endMs,
  });
}

/**
 *
 */
export function useComponentDataFetcher(
  components: DashboardComponentSpec[],
  pathParams?: Record<string, string>,
): UseComponentDataFetcherResult {
  const { selectedTeamId, timeRange, refreshKey } = useAppStore();

  const { startMs, endMs } = useMemo(() => {
    void refreshKey;

    const resolvedEndMs = timeRange.value === 'custom' && timeRange.endTime != null
      ? Number(timeRange.endTime)
      : Date.now();
    const resolvedStartMs = timeRange.value === 'custom' && timeRange.startTime != null
      ? Number(timeRange.startTime)
      : resolvedEndMs - (timeRange.minutes || 60) * 60 * 1000;

    return { startMs: resolvedStartMs, endMs: resolvedEndMs };
  }, [
    refreshKey,
    timeRange.endTime,
    timeRange.minutes,
    timeRange.startTime,
    timeRange.value,
  ]);

  const requestEntries = useMemo(() => {
    const entries = new Map<string, {
      componentIds: string[];
      endpoint: string;
      method: string;
      params: Record<string, unknown>;
    }>();

    components.forEach((component) => {
      if (!component.query) return;
      const resolvedEndpoint = pathParams
        ? component.query.endpoint.replace(/\{(\w+)\}/g, (_, key) => pathParams[key] ?? `{${key}}`)
        : component.query.endpoint;
      const method = String(component.query.method || 'GET').toUpperCase();
      const requestKey = buildRequestKey(component, resolvedEndpoint, startMs, endMs);

      const current = entries.get(requestKey);
      if (current) {
        current.componentIds.push(component.id);
        return;
      }

      entries.set(requestKey, {
        componentIds: [component.id],
        endpoint: resolvedEndpoint,
        method,
        params: component.query.params || {},
      });
    });

    return Array.from(entries.values());
  }, [components, endMs, pathParams, startMs]);

  const results = useQueries({
    queries: requestEntries.map((entry) => ({
      queryKey: ['component-query', selectedTeamId, entry.method, entry.endpoint, entry.params, startMs, endMs, refreshKey],
      queryFn: () => api.request({
        url: entry.endpoint,
        method: entry.method,
        params: {
          start: startMs,
          end: endMs,
          ...entry.params,
        },
      }),
      enabled: !!selectedTeamId,
      staleTime: 0,
      gcTime: 30_000,
      placeholderData: keepPreviousData,
    })),
  });

  const data: Record<string, any> = {};
  const errors: Record<string, ApiErrorShape | null> = {};
  let isLoading = false;
  let hasError = false;
  const failedRequests: ComponentFailedRequest[] = [];

  requestEntries.forEach((entry, index) => {
    const result = results[index] as {
      data?: unknown;
      isLoading?: boolean;
      isError?: boolean;
      error?: unknown;
    } | undefined;

    if (result?.isLoading) {
      isLoading = true;
    }

    const normalizedError = result?.isError ? toApiErrorShape(result.error) : null;
    if (normalizedError) {
      hasError = true;
      failedRequests.push({
        componentIds: entry.componentIds,
        endpoint: entry.endpoint,
        method: entry.method,
        error: normalizedError,
      });
    }

    entry.componentIds.forEach((componentId) => {
      data[componentId] = result?.data;
      errors[componentId] = normalizedError;
    });
  });

  return { data, isLoading, errors, hasError, failedRequests };
}
