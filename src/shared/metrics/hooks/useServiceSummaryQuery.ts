import { useMemo } from "react";

import {
  type Comparable,
  type ServiceSummaryResponse,
  getServiceSummary,
} from "@shared/api/red/redApi";
import { useTimeRangeQuery } from "@shared/hooks/useTimeRangeQuery";

   
                                                                            
                                                                          
                                                                     
                                                               
   
export interface ServiceSummary {
  readonly serviceName: string;
  readonly requestCount: number;
  readonly errorCount: number;
  readonly errorRate: number;
  readonly p50Ms: number;
  readonly p95Ms: number;
  readonly p99Ms: number;
  readonly rps: number;
  readonly cpuUtilization: number;
  readonly memoryUtilization: number;
  readonly diskUtilization: number;
}

function extractServiceRow(row: ServiceSummaryResponse | undefined): ServiceSummary | null {
  if (!row) return null;
  return {
    serviceName: row.serviceName,
    requestCount: Number(row.requestCount ?? 0),
    errorCount: Number(row.errorCount ?? 0),
    errorRate: Number(row.errorRate ?? 0),
    p50Ms: Number(row.p50Ms ?? 0),
    p95Ms: Number(row.p95Ms ?? 0),
    p99Ms: Number(row.p99Ms ?? 0),
    rps: Number(row.rps ?? 0),
    cpuUtilization: Number(row.cpuUtilization ?? 0),
    memoryUtilization: Number(row.memoryUtilization ?? 0),
    diskUtilization: Number(row.diskUtilization ?? 0),
  };
}

export function useServiceSummaryQuery(serviceName: string) {
  const query = useTimeRangeQuery<Comparable<ServiceSummaryResponse>>(
    `service-summary:${serviceName}`,
    (_tenant, start, end) => getServiceSummary(start, end, serviceName),
    { enabled: Boolean(serviceName) }
  );
  const summary = useMemo(() => extractServiceRow(query.data?.data), [query.data]);
  return { ...query, summary };
}
