import { useTimeRangeQuery } from "@shared/hooks/useTimeRangeQuery";

import type { PaginatedResponse } from "@/shared/api/service-types";
import { type TopDBQuery, getTopDBQueries } from "@shared/api/red/redApi";

export interface DBQueryWithDelta extends TopDBQuery {
  readonly p99_delta_pct: number | null;
}

function buildDelta(now: TopDBQuery, prev: TopDBQuery | undefined): number | null {
  if (!prev || !prev.p99_ms) return null;
  return (now.p99_ms - prev.p99_ms) / prev.p99_ms;
}

export function useTopDBQueries(serviceName: string, limit = 50, cursor?: string) {
  return useTimeRangeQuery<PaginatedResponse<DBQueryWithDelta[]>>(
    "service-detail.top-db-queries",
    async (_tenant, start, end): Promise<PaginatedResponse<DBQueryWithDelta[]>> => {
      const payload = await getTopDBQueries(
        start,
        end,
        serviceName,
        limit,
        "previous_period",
        cursor
      );
      const primary = payload.data?.results ?? [];
      const previousByOp = new Map<string, TopDBQuery>();
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
