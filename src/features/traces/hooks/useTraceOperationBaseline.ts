import api from "@/shared/api/api/client";
import type { RequestTime } from "@/shared/api/service-types";
import { API_CONFIG } from "@config/apiConfig";
import { useTimeRangeQuery } from "@shared/hooks/useTimeRangeQuery";

const V1 = API_CONFIG.ENDPOINTS.V1_BASE;

export interface OperationBaseline {
  readonly p50_ms: number;
  readonly p95_ms: number;
  readonly p99_ms: number;
  readonly span_count: number;
}

async function fetchOperationBaseline(
  s: RequestTime,
  e: RequestTime,
  service: string,
  operation: string
): Promise<OperationBaseline> {
  return api.get<OperationBaseline>(`${V1}/spans/red/operation-baseline`, {
    params: { startTime: s, endTime: e, service, operation },
  });
}

/**
 * Windowed p50/p95/p99 for the trace's root service+operation — feeds the
 * Trace Detail Duration card's "N× slower than p50" baseline.
 */
export function useTraceOperationBaseline(
  service: string | undefined,
  operation: string | undefined
) {
  return useTimeRangeQuery<OperationBaseline>(
    "trace-detail.operation-baseline",
    (_tenant, start, end) => fetchOperationBaseline(start, end, service ?? "", operation ?? ""),
    { extraKeys: [service ?? "", operation ?? ""], enabled: Boolean(service && operation) }
  );
}
