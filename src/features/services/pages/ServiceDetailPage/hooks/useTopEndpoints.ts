import { useTimeRangeQuery } from "@shared/hooks/useTimeRangeQuery";

import { type TopEndpoint, getTopEndpoints } from "@/features/services/api/redApi";
import type { PaginatedResponse } from "@/shared/api/service-types";

export interface EndpointWithDelta extends TopEndpoint {
  readonly p99_delta_pct: number | null;
}

function buildDelta(now: TopEndpoint, prev: TopEndpoint | undefined): number | null {
  if (!prev || !prev.p99_ms) return null;
  return (now.p99_ms - prev.p99_ms) / prev.p99_ms;
}

export function useTopEndpoints(serviceName: string, limit = 50, cursor?: string) {
  return useTimeRangeQuery<PaginatedResponse<EndpointWithDelta[]>>(
    "service-detail.top-endpoints",
    async (_tenant, start, end): Promise<PaginatedResponse<EndpointWithDelta[]>> => {
      const payload = await getTopEndpoints(
        start,
        end,
        serviceName,
        limit,
        "previous_period",
        cursor
      );
      const primary = payload.data?.results ?? [];
      const previousByOp = new Map<string, TopEndpoint>();
      for (const row of payload.comparison?.results ?? []) {
        previousByOp.set(row.operation_name, row);
      }
      const results = primary.map((row) => ({
        ...row,
        p99_delta_pct: buildDelta(row, previousByOp.get(row.operation_name)),
      }));
      return {
        results,
        pageInfo: payload.data?.pageInfo ?? { hasMore: false, limit },
      };
    },
    { extraKeys: [serviceName, limit, cursor], enabled: Boolean(serviceName) }
  );
}
