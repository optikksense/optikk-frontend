import { tracesApi } from "@/features/traces/api/tracesApi";
import type { TracesResponse } from "@entities/trace/model";
import type { TraceRecord } from "@entities/trace/model";
import { useTimeRangeQuery } from "@shared/hooks/useTimeRangeQuery";

export function useRecentErrorTraces(serviceName: string, limit = 10): {
  traces: readonly TraceRecord[];
  loading: boolean;
} {
  const enabled = Boolean(serviceName);
  const query = useTimeRangeQuery<TracesResponse>(
    "service-page-recent-error-traces",
    (teamId, startTime, endTime) =>
      tracesApi.getTraces(teamId, Number(startTime), Number(endTime), {
        services: [serviceName],
        status: "ERROR",
        limit,
        offset: 0,
      }),
    { extraKeys: [serviceName, limit], enabled }
  );

  const traces = query.data?.traces ?? [];
  return {
    traces,
    loading: query.isLoading && traces.length === 0,
  };
}
