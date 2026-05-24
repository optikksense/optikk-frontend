import { useTimeRangeQuery } from "@shared/hooks/useTimeRangeQuery";

import { tracesApi } from "@/features/traces/api/tracesApi";
import type { TracesResponse } from "@shared/entities/trace/model";

export function useRecentTraces(serviceName: string, limit = 25) {
  return useTimeRangeQuery<TracesResponse>(
    "service-detail.recent-traces",
    (teamId, start, end) =>
      tracesApi.getTraces(teamId, Number(start), Number(end), {
        services: [serviceName],
        limit,
      }),
    { extraKeys: [serviceName, limit], enabled: Boolean(serviceName) }
  );
}
