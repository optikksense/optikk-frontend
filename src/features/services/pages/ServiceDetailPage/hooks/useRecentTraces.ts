import { useTimeRangeQuery } from "@shared/hooks/useTimeRangeQuery";

import type { TraceRecord, TracesResponse } from "@shared/api/traces/schemas";
import { query } from "@shared/api/traces/tracesApi";
import type { TraceSummary } from "@shared/api/traces/types";

function toTraceRecord(summary: TraceSummary): TraceRecord {
  return {
    spanId: "",
    traceId: summary.traceId,
    serviceName: summary.rootService,
    operationName: summary.rootOperation,
    startTime: new Date(summary.startMs).toISOString(),
    endTime: new Date(summary.endMs).toISOString(),
    durationMs: summary.durationNs / 1_000_000,
    status: summary.rootStatus,
    spanKind: "SERVER",
    httpMethod: summary.rootHttpMethod,
    httpStatusCode: summary.rootHttpStatus
      ? Number.parseInt(summary.rootHttpStatus, 10) || undefined
      : undefined,
    hasError: summary.hasError,
    startNs: summary.startMs * 1_000_000,
  };
}

export function useRecentTraces(serviceName: string, limit = 25, cursor?: string) {
  return useTimeRangeQuery<TracesResponse>(
    "service-detail.recent-traces",
    async (_tenantId, start, end) => {
      const response = await query({
        startTime: Number(start),
        endTime: Number(end),
        filters: [{ field: "serviceName", op: "eq", value: serviceName }],
        limit,
        cursor,
      });
      return {
        traces: response.traces.map(toTraceRecord),
        hasMore: Boolean(response.nextCursor),
        nextCursor: response.nextCursor,
        limit,
      };
    },
    { extraKeys: [serviceName, limit, cursor], enabled: Boolean(serviceName) }
  );
}
