import { useTimeRangeQuery } from "@shared/hooks/useTimeRangeQuery";

import {
  type ComparisonPayload,
  type TopEndpoint,
  getTopEndpoints,
} from "@/features/services/api/serviceDetailApi";

export interface EndpointWithDelta extends TopEndpoint {
  readonly p99_delta_pct: number | null;
}

function buildDelta(now: TopEndpoint, prev: TopEndpoint | undefined): number | null {
  if (!prev || !prev.p99_ms) return null;
  return (now.p99_ms - prev.p99_ms) / prev.p99_ms;
}

export function useTopEndpoints(serviceName: string, limit = 50) {
  return useTimeRangeQuery<EndpointWithDelta[]>(
    "service-detail.top-endpoints",
    async (_team, start, end): Promise<EndpointWithDelta[]> => {
      const payload: ComparisonPayload<TopEndpoint[]> = await getTopEndpoints(
        start,
        end,
        serviceName,
        limit,
        "previous_period"
      );
      const primary = payload.data ?? [];
      const previousByOp = new Map<string, TopEndpoint>();
      for (const row of payload.comparison ?? []) {
        previousByOp.set(row.operation_name, row);
      }
      return primary.map((row) => ({
        ...row,
        p99_delta_pct: buildDelta(row, previousByOp.get(row.operation_name)),
      }));
    },
    { extraKeys: [serviceName, limit], enabled: Boolean(serviceName) }
  );
}
