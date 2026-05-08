import { useMemo } from "react";

import { deploymentsApi } from "@/features/overview/api/deploymentsApi";
import { getServiceMetrics } from "@/features/overview/api/serviceMetricsApi";
import { useTimeRangeQuery } from "@shared/hooks/useTimeRangeQuery";

export interface ServiceSummaryMetrics {
  readonly requestCount: number;
  readonly errorCount: number;
  readonly errorRatePct: number;
  readonly p50: number;
  readonly p95: number;
  readonly p99: number;
}

function normalize(name: string): string {
  return name.trim().toLowerCase();
}

export function useServiceSummary(serviceName: string) {
  const enabled = Boolean(serviceName);
  const target = normalize(serviceName);

  const metricsQuery = useTimeRangeQuery(
    "service-page-metrics",
    async (_teamId, startTime, endTime) => getServiceMetrics(startTime, endTime),
    { extraKeys: [serviceName], enabled }
  );

  const activeVersionQuery = useTimeRangeQuery(
    "service-page-active-version",
    async (_teamId, startTime, endTime) =>
      deploymentsApi.getActiveVersion(serviceName, startTime, endTime),
    { extraKeys: [serviceName], enabled }
  );

  const match = useMemo(
    () =>
      (metricsQuery.data ?? []).find((row) => normalize(String(row.service_name)) === target) ??
      null,
    [metricsQuery.data, target]
  );

  const summary = useMemo<ServiceSummaryMetrics | null>(() => {
    if (!match) return null;
    const requests = Number(match.request_count ?? 0);
    const errors = Number(match.error_count ?? 0);
    return {
      requestCount: requests,
      errorCount: errors,
      errorRatePct: requests > 0 ? (errors * 100) / requests : 0,
      p50: Number(match.p50_latency ?? 0),
      p95: Number(match.p95_latency ?? 0),
      p99: Number(match.p99_latency ?? 0),
    };
  }, [match]);

  return {
    summary,
    summaryLoading: metricsQuery.isLoading && !summary,
    activeVersion: activeVersionQuery.data ?? null,
    activeVersionLoading: activeVersionQuery.isLoading,
  };
}
