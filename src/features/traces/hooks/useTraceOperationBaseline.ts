import api from "@/shared/api/http/client";
import type { RequestTime } from "@/shared/api/service-types";
import { API_CONFIG } from "@config/apiConfig";
import { useTimeRangeQuery } from "@shared/hooks/useTimeRangeQuery";

const V1 = API_CONFIG.ENDPOINTS.V1_BASE;

export interface OperationBaseline {
  readonly p50Ms: number;
  readonly p95Ms: number;
  readonly p99Ms: number;
  readonly spanCount: number;
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
