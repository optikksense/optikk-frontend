import { useMemo } from "react";

import { overviewHubApi } from "@/features/overview/api/overviewHubApi";
import { OVERVIEW_QUERY_STALE_MS } from "@/features/overview/overviewHubConstants";
import type { RequestErrorRatePoint } from "@shared/api/red/redApi";
import type { ServiceMetricPoint } from "@shared/metrics/types";

import { useTimeRangeQuery } from "@shared/hooks/useTimeRangeQuery";
import type { UseQueryResult } from "@tanstack/react-query";

import { num } from "./mappers";

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
  readonly groupId: string;
  readonly serviceName: string;
  readonly operationName: string;
  readonly errorCount: number;
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
    (_tenant, start, end) => overviewHubApi.getFleetRedMetrics(start, end),
    { staleTime: OVERVIEW_QUERY_STALE_MS }
  );
}

export function useSystemPerformanceQuery(): UseQueryResult<RequestErrorRatePoint[]> {
  return useTimeRangeQuery<RequestErrorRatePoint[]>(
    "overview-performance",
    (_tenant, start, end) => overviewHubApi.getPerformanceSeries(start, end),
    { staleTime: OVERVIEW_QUERY_STALE_MS }
  );
}

export function useTopErrorsQuery(enabled: boolean): UseQueryResult<ErrorHotspotRow[]> {
  return useTimeRangeQuery<ErrorHotspotRow[]>(
    "overview-top-errors",
    async (_tenant, start, end) => {
      const rows = await overviewHubApi.getErrorHotspot(start, end);
      return rows.map((raw) => {
        const r = raw as Record<string, unknown>;
        return {
          key: `${r.service_name}::${r.group_id}`,
          groupId: String(r.group_id ?? ""),
          serviceName: String(r.service_name ?? "unknown"),
          operationName: String(r.operation_name ?? "unknown"),
          errorCount: num(r.error_count),
        };
      });
    },
    { staleTime: OVERVIEW_QUERY_STALE_MS, enabled }
  );
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
      .filter((r) => r.errorCount > 0)
      .sort((a, b) => b.errorCount - a.errorCount)
      .slice(0, limit);
  }, [rows, limit]);
}
