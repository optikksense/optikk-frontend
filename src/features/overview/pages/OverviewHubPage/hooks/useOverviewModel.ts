import { useMemo } from "react";

import type { ServiceMetricPoint } from "@/features/metrics/types";
import { deploymentsApi } from "@/features/overview/api/deploymentsApi";
import type { ServiceLatestDeployment } from "@/features/overview/api/deploymentsApi";
import { overviewHubApi } from "@/features/overview/api/overviewHubApi";
import { OVERVIEW_QUERY_STALE_MS } from "@/features/overview/overviewHubConstants";
import { groupTimeseries } from "@shared/components/ui/dashboard/utils/dashboardListBuilders";
import { useTimeRangeQuery } from "@shared/hooks/useTimeRangeQuery";
import type { UseQueryResult } from "@tanstack/react-query";

import { mapRedErrorPctRows, mapRedRequestRateRows, num } from "./mappers";

export type ServiceHealthStatus = "ok" | "warn" | "err";

export interface ServiceHealthCell {
  readonly name: string;
  readonly requestCount: number;
  readonly errorCount: number;
  readonly errorRate: number;
  readonly p95Latency: number;
  readonly p99Latency: number;
  readonly avgLatency: number;
  readonly status: ServiceHealthStatus;
}

export interface ErrorHotspotRow {
  readonly key: string;
  readonly serviceName: string;
  readonly operationName: string;
  readonly errorCount: number;
  readonly totalCount: number;
  readonly errorRate: number;
}

function statusFromRate(rate: number): ServiceHealthStatus {
  if (rate > 5) return "err";
  if (rate > 1) return "warn";
  return "ok";
}

function toCell(row: ServiceMetricPoint): ServiceHealthCell {
  const requestCount = num(row.request_count);
  const errorCount = num(row.error_count);
  const errorRate = requestCount > 0 ? (errorCount / requestCount) * 100 : 0;
  return {
    name: String(row.service_name ?? ""),
    requestCount,
    errorCount,
    errorRate,
    avgLatency: num(row.avg_latency),
    p95Latency: num(row.p95_latency),
    p99Latency: num(row.p99_latency),
    status: statusFromRate(errorRate),
  };
}

export function useOverviewSummaryQuery() {
  return useTimeRangeQuery(
    "overview-summary",
    (_team, start, end) => overviewHubApi.getRedSummary(start, end),
    { staleTime: OVERVIEW_QUERY_STALE_MS }
  );
}

export function useOverviewPerformanceQuery(enabled: boolean) {
  return useTimeRangeQuery(
    "overview-performance",
    async (_team, start, end) => {
      const [rr, er] = await Promise.all([
        overviewHubApi.getRedRequestRateSeries(start, end),
        overviewHubApi.getRedErrorRateSeries(start, end),
      ]);
      return { rr, er };
    },
    { staleTime: OVERVIEW_QUERY_STALE_MS, enabled }
  );
}

export function useTopErrorsQuery(enabled: boolean): UseQueryResult<ErrorHotspotRow[]> {
  return useTimeRangeQuery<ErrorHotspotRow[]>(
    "overview-top-errors",
    async (_team, start, end) => {
      const rows = await overviewHubApi.getErrorHotspot(start, end);
      return rows.map((raw) => {
        const r = raw as Record<string, unknown>;
        const errorCount = num(r.error_count);
        const totalCount = num(r.total_count);
        return {
          key: `${r.service_name}::${r.operation_name}`,
          serviceName: String(r.service_name ?? "unknown"),
          operationName: String(r.operation_name ?? "unknown"),
          errorCount,
          totalCount,
          errorRate: totalCount > 0 ? (errorCount / totalCount) * 100 : num(r.error_rate),
        };
      });
    },
    { staleTime: OVERVIEW_QUERY_STALE_MS, enabled }
  );
}

export function useRecentDeploysQuery(enabled: boolean): UseQueryResult<ServiceLatestDeployment[]> {
  return useTimeRangeQuery<ServiceLatestDeployment[]>(
    "overview-recent-deploys",
    () => deploymentsApi.getLatestByService(),
    { staleTime: OVERVIEW_QUERY_STALE_MS, enabled }
  );
}

export interface PerformanceSeries {
  readonly requestSeries: Record<string, Array<Record<string, unknown>>>;
  readonly errorSeries: Record<string, Array<Record<string, unknown>>>;
  readonly hasRequests: boolean;
  readonly hasErrors: boolean;
}

export function usePerformanceSeries(
  rrRaw: unknown[] | undefined,
  erRaw: unknown[] | undefined
): PerformanceSeries {
  return useMemo(() => {
    const rrRows = mapRedRequestRateRows(rrRaw ?? []);
    const erRows = mapRedErrorPctRows(erRaw ?? []);
    return {
      requestSeries: groupTimeseries(rrRows, "service_name"),
      errorSeries: groupTimeseries(erRows, "service_name"),
      hasRequests: rrRows.length > 0,
      hasErrors: erRows.length > 0,
    };
  }, [rrRaw, erRaw]);
}

export function useServiceHealthCells(
  rows: readonly ServiceMetricPoint[] | undefined
): readonly ServiceHealthCell[] {
  return useMemo(() => {
    if (!rows || rows.length === 0) return [];
    return rows
      .map(toCell)
      .filter((c) => c.name)
      .sort((a, b) => b.requestCount - a.requestCount);
  }, [rows]);
}

export function useRankedErrorRows(
  rows: readonly ErrorHotspotRow[] | undefined,
  limit = 6
): readonly ErrorHotspotRow[] {
  return useMemo(() => {
    if (!rows || rows.length === 0) return [];
    return [...rows]
      .filter((r) => r.errorCount > 0 || r.errorRate > 0)
      .sort((a, b) => b.errorCount - a.errorCount || b.errorRate - a.errorRate)
      .slice(0, limit);
  }, [rows, limit]);
}
