import { useMemo } from "react";

import { useTimeRangeQuery } from "@shared/hooks/useTimeRangeQuery";

import {
  type ComparisonPayload,
  type ServiceSummaryResponse,
  getServiceSummary,
} from "@shared/api/red/redApi";

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
    serviceName: row.service_name,
    requestCount: Number(row.request_count ?? 0),
    errorCount: Number(row.error_count ?? 0),
    errorRate: Number(row.error_rate ?? 0) / 100, // percentage (0-100) -> decimal (0-1)
    p50Ms: Number(row.p50_ms ?? 0),
    p95Ms: Number(row.p95_ms ?? 0),
    p99Ms: Number(row.p99_ms ?? 0),
    rps: Number(row.rps ?? 0),
    cpuUtilization: Number(row.cpu_utilization ?? 0),
    memoryUtilization: Number(row.memory_utilization ?? 0),
    diskUtilization: Number(row.disk_utilization ?? 0),
  };
}

export function useServiceSummary(serviceName: string, _windowMs?: number) {
  const query = useTimeRangeQuery<ComparisonPayload<ServiceSummaryResponse>>(
    `service-detail.summary:${serviceName}`,
    (_tenant, start, end) => getServiceSummary(start, end, serviceName, "previous_period"),
    { enabled: Boolean(serviceName) }
  );
  const summary = useMemo(() => extractServiceRow(query.data?.data), [query.data]);
  const previous = useMemo(() => extractServiceRow(query.data?.comparison), [query.data]);
  return { ...query, summary, previous };
}
