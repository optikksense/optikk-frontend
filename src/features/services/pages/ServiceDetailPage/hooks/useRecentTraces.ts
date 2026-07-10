import { useTimeRangeQuery } from "@shared/hooks/useTimeRangeQuery";

import { query } from "@shared/api/traces/tracesApi";
import type { TraceSummary } from "@shared/api/traces/types";
import type { TraceRecord, TracesResponse } from "@shared/entities/trace/model";

function toTraceRecord(summary: TraceSummary): TraceRecord {
  return {
    span_id: "",
    trace_id: summary.trace_id,
    service_name: summary.root_service,
    operation_name: summary.root_operation,
    start_time: new Date(summary.start_ms).toISOString(),
    end_time: new Date(summary.end_ms).toISOString(),
    duration_ms: summary.duration_ns / 1_000_000,
    status: summary.root_status,
    span_kind: "SERVER",
    http_method: summary.root_http_method,
    http_status_code: summary.root_http_status
      ? Number.parseInt(summary.root_http_status, 10) || undefined
      : undefined,
  };
}

export function useRecentTraces(serviceName: string, limit = 25, cursor?: string) {
  return useTimeRangeQuery<TracesResponse>(
    "service-detail.recent-traces",
    async (_tenantId, start, end) => {
      const response = await query({
        startTime: Number(start),
        endTime: Number(end),
        filters: [{ field: "service_name", op: "eq", value: serviceName }],
        limit,
        cursor,
      });
      return {
        traces: response.traces.map(toTraceRecord),
        has_more: Boolean(response.nextCursor),
        next_cursor: response.nextCursor,
        limit,
      };
    },
    { extraKeys: [serviceName, limit, cursor], enabled: Boolean(serviceName) }
  );
}
