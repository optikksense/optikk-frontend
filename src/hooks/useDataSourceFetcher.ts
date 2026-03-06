import { useQueries } from '@tanstack/react-query';

import { api } from '@services/api/client';
import type { DataSourceSpec } from '@/types/dashboardConfig';
import { useAppStore } from '@store/appStore';

interface UseDataSourceFetcherResult {
  data: Record<string, any>;
  isLoading: boolean;
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

  const endMs = timeRange.value === 'custom' && timeRange.endTime != null
    ? Number(timeRange.endTime)
    : Date.now();
  const startMs = timeRange.value === 'custom' && timeRange.startTime != null
    ? Number(timeRange.startTime)
    : endMs - (timeRange.minutes || 60) * 60 * 1000;

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
      };
    }),
  });

  const data: Record<string, any> = {};
  let isLoading = false;

  dataSources.forEach((spec, i) => {
    const result = results[i];
    if (result) {
      data[spec.id] = (result as any).data ?? undefined;
      if ((result as any).isLoading) isLoading = true;
    }
  });

  return { data, isLoading };
}
