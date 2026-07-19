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
  const requestCount = num(row.requestCount);
  const errorCount = num(row.errorCount);
  const errorRate = requestCount > 0 ? (errorCount / requestCount) * 100 : 0;
  return {
    name: String(row.serviceName ?? ""),
    requestCount,
    errorCount,
    errorRate,
    avgLatency: num(row.avgLatency),
    p95Latency: num(row.p95Latency),
    p99Latency: num(row.p99Latency),
    status: statusFromRate(errorRate),
  };
}

export function useOverviewSummaryQuery() {
  return useTimeRangeQuery(
    "overview-summary",
    (_tenant, start, end, signal) => overviewHubApi.getFleetRedMetrics(start, end, signal),
    { staleTime: OVERVIEW_QUERY_STALE_MS }
  );
}

export function useSystemPerformanceQuery(): UseQueryResult<RequestErrorRatePoint[]> {
  return useTimeRangeQuery<RequestErrorRatePoint[]>(
    "overview-performance",
    (_tenant, start, end, signal) =>
      overviewHubApi.getPerformanceSeries(start, end, undefined, signal),
    { staleTime: OVERVIEW_QUERY_STALE_MS }
  );
}

export function useTopErrorsQuery(enabled = true): UseQueryResult<ErrorHotspotRow[]> {
  return useTimeRangeQuery<ErrorHotspotRow[]>(
    "overview-top-errors",
    async (_tenant, start, end, signal) => {
      const rows = await overviewHubApi.getErrorHotspot(start, end, signal);
      return rows.map((raw) => {
        const r = raw as Record<string, unknown>;
        return {
          key: `${r.serviceName}::${r.groupId}`,
          groupId: String(r.groupId ?? ""),
          serviceName: String(r.serviceName ?? "unknown"),
          operationName: String(r.operationName ?? "unknown"),
          errorCount: num(r.errorCount),
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
