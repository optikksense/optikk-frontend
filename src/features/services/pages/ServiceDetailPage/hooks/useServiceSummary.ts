import { useMemo } from "react";

import { useTimeRangeQuery } from "@shared/hooks/useTimeRangeQuery";

import {
  type RedSummary,
  type RedSummaryWithComparison,
  getRedSummaryWithComparison,
} from "@/features/services/api/serviceCatalogApi";

export interface ServiceSummary {
  readonly serviceName: string;
  readonly requestCount: number;
  readonly errorCount: number;
  readonly errorRate: number;
  readonly p50Ms: number;
  readonly p95Ms: number;
  readonly p99Ms: number;
  readonly rps: number;
}

function extractServiceRow(
  summary: RedSummary | undefined,
  serviceName: string,
  windowMs: number
): ServiceSummary | null {
  if (!summary || !summary.services) return null;
  const row = summary.services.find(
    (svc) => svc.service_name === serviceName
  );
  if (!row) return null;
  const reqCount = Number(row.request_count ?? 0);
  const errCount = Number(row.error_count ?? 0);
  const seconds = Math.max(1, windowMs / 1000);
  return {
    serviceName,
    requestCount: reqCount,
    errorCount: errCount,
    errorRate: reqCount > 0 ? errCount / reqCount : 0,
    p50Ms: Number(row.avg_latency ?? 0),
    p95Ms: Number(row.p95_latency ?? 0),
    p99Ms: Number(row.p99_latency ?? 0),
    rps: reqCount / seconds,
  };
}

/**
 * Per-service RED summary for the current window plus the prior comparison
 * window (shares the catalog's `service-hub.red-summary-cmp` query so they
 * dedupe). `previous` powers the KPI deltas and latency baselines.
 */
export function useServiceSummary(serviceName: string, windowMs: number) {
  const query = useTimeRangeQuery<RedSummaryWithComparison>(
    "service-hub.red-summary-cmp",
    (_team, start, end) => getRedSummaryWithComparison(start, end),
    { enabled: Boolean(serviceName) }
  );
  const summary = useMemo(
    () => extractServiceRow(query.data?.data, serviceName, windowMs),
    [query.data, serviceName, windowMs]
  );
  const previous = useMemo(
    () => extractServiceRow(query.data?.comparison, serviceName, windowMs),
    [query.data, serviceName, windowMs]
  );
  return { ...query, summary, previous };
}
