import { useQueries } from '@tanstack/react-query';
import { useMemo } from 'react';

import type {
  DashboardDataSourceValue,
  DashboardDataSources,
  DataSourceSpec,
} from '@/types/dashboardConfig';

import { api } from '@shared/api/api/client';
import type { ApiErrorShape } from '@shared/api/api/interceptors/errorInterceptor';
import { UNKNOWN_ERROR } from '@/shared/constants/errorCodes';
import type { ErrorCode } from '@/shared/constants/errorCodes';

import { resolveTimeRangeBounds } from '@/types';

import { useAppStore } from '@store/appStore';

interface DataSourceFailedRequest {
  dataSourceId: string;
  endpoint: string;
  method: string;
  error: ApiErrorShape;
}

interface UseDataSourceFetcherResult {
  data: DashboardDataSources;
  isLoading: boolean;
  errors: Record<string, ApiErrorShape | null>;
  hasError: boolean;
  failedRequests: DataSourceFailedRequest[];
}

function toApiErrorShape(error: unknown): ApiErrorShape {
  if (typeof error === 'object' && error !== null) {
    const record = error as Record<string, unknown>;
    return {
      status: typeof record.status === 'number' ? record.status : 0,
      code: (typeof record.code === 'string' && record.code.length > 0
        ? record.code
        : UNKNOWN_ERROR) as ErrorCode,
      message: typeof record.message === 'string' && record.message.length > 0
        ? record.message
        : 'An unexpected error occurred',
      data: record.data,
    };
  }

  if (error instanceof Error) {
    return {
      status: 0,
      code: UNKNOWN_ERROR,
      message: error.message || 'An unexpected error occurred',
    };
  }

  return {
    status: 0,
    code: 'UNKNOWN_ERROR',
    message: 'An unexpected error occurred',
  };
}

/**
 * Fetches all declared dataSources in parallel and returns a merged map.
 * Endpoints may contain path params like {traceId} which are resolved via pathParams.
 */
export function useDataSourceFetcher(
  dataSources: DataSourceSpec[],
  pathParams?: Record<string, string>,
): UseDataSourceFetcherResult {
  const { selectedTeamId, timeRange, refreshKey } = useAppStore();

  const { startMs, endMs } = useMemo(() => {
    void refreshKey;
    const { startTime, endTime } = resolveTimeRangeBounds(timeRange);
    return { startMs: startTime, endMs: endTime };
  }, [refreshKey, timeRange]);

  const results = useQueries({
    queries: dataSources.map((spec) => {
      const resolvedEndpoint = pathParams
        ? spec.endpoint.replace(/\{(\w+)\}/g, (_, key) => pathParams[key] ?? `{${key}}`)
        : spec.endpoint;

      return {
        queryKey: ['datasource', selectedTeamId, spec.id, resolvedEndpoint, startMs, endMs, refreshKey],
        queryFn: () => api.get(resolvedEndpoint, {
          params: {
            start: startMs,
            end: endMs,
            ...spec.params,
          },
        }),
        enabled: !!selectedTeamId,
        staleTime: 0,
        gcTime: 30_000,
        retry: false,
      };
    }),
  });

  const data: DashboardDataSources = {};
  const errors: Record<string, ApiErrorShape | null> = {};
  let isLoading = false;
  let hasError = false;
  const failedRequests: DataSourceFailedRequest[] = [];

  dataSources.forEach((spec, i) => {
    const result = results[i] as {
      data?: unknown;
      isLoading?: boolean;
      isError?: boolean;
      error?: unknown;
    } | undefined;
    if (result) {
      const normalizedError = result.isError ? toApiErrorShape(result.error) : null;
      data[spec.id] = (result.data ?? undefined) as DashboardDataSourceValue;
      errors[spec.id] = normalizedError;
      if (result.isLoading) isLoading = true;
      if (normalizedError) {
        hasError = true;
        failedRequests.push({
          dataSourceId: spec.id,
          endpoint: pathParams
            ? spec.endpoint.replace(/\{(\w+)\}/g, (_, key) => pathParams[key] ?? `{${key}}`)
            : spec.endpoint,
          method: 'GET',
          error: normalizedError,
        });
      }
    }
  });

  return { data, isLoading, errors, hasError, failedRequests };
}
