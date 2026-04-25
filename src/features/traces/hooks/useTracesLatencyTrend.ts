import { useMemo } from "react";

import type { AnalyticsAggregation, AnalyticsResponse, ExplorerFilter } from "@/features/explorer/types";

import { useTracesAnalytics } from "./useTracesAnalytics";

export interface LatencyTrendPoint {
  readonly ts: number;
  readonly p50Ms: number;
  readonly p95Ms: number;
  readonly p99Ms: number;
}

export interface LatencyTrendResult {
  readonly points: readonly LatencyTrendPoint[];
  readonly isPending: boolean;
  readonly isError: boolean;
  /** Population p50/p95 in ms — used by duration distribution cell (A2). */
  readonly overall: { readonly p50Ms: number; readonly p95Ms: number } | null;
}

const AGGS: readonly AnalyticsAggregation[] = [
  { fn: "p50", field: "duration_ns", alias: "p50" },
  { fn: "p95", field: "duration_ns", alias: "p95" },
  { fn: "p99", field: "duration_ns", alias: "p99" },
];

const EMPTY_GROUPS: readonly string[] = [];

/**
 * Timeseries of p50/p95/p99 trace durations, plus a population average used
 * for per-row distribution markers. One backend call serves both needs (A1 + A2).
 */
export function useTracesLatencyTrend(filters: readonly ExplorerFilter[]): LatencyTrendResult {
  const q = useTracesAnalytics({
    filters,
    groupBy: EMPTY_GROUPS,
    aggregations: AGGS,
    step: "auto",
    vizMode: "timeseries",
  });

  return useMemo(() => buildResult(q.data, q.isPending, q.isError), [q.data, q.isPending, q.isError]);
}

function buildResult(
  data: AnalyticsResponse | undefined,
  isPending: boolean,
  isError: boolean,
): LatencyTrendResult {
  const points = data ? toPoints(data) : [];
  const overall = computeOverall(points);
  return { points, isPending, isError, overall };
}

function toPoints(data: AnalyticsResponse): readonly LatencyTrendPoint[] {
  const idx = columnIndex(data);
  if (idx.ts < 0) return [];
  const out: LatencyTrendPoint[] = [];
  for (const row of data.rows) {
    const tsRaw = row[idx.ts];
    const ts = typeof tsRaw === "string" ? Date.parse(tsRaw.includes("T") ? tsRaw : tsRaw.replace(" ", "T")) : Number(tsRaw);
    if (!Number.isFinite(ts)) continue;
    out.push({
      ts,
      p50Ms: nsCellToMs(row[idx.p50]),
      p95Ms: nsCellToMs(row[idx.p95]),
      p99Ms: nsCellToMs(row[idx.p99]),
    });
  }
  return out.sort((a, b) => a.ts - b.ts);
}

function columnIndex(data: AnalyticsResponse): { ts: number; p50: number; p95: number; p99: number } {
  const find = (name: string) => data.columns.findIndex((c) => c.name === name);
  return { ts: find("time_bucket"), p50: find("p50"), p95: find("p95"), p99: find("p99") };
}

function nsCellToMs(v: string | number | undefined): number {
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n / 1_000_000 : 0;
}

function computeOverall(points: readonly LatencyTrendPoint[]): LatencyTrendResult["overall"] {
  if (points.length === 0) return null;
  const p50s = points.map((p) => p.p50Ms).filter((v) => v > 0).sort((a, b) => a - b);
  const p95s = points.map((p) => p.p95Ms).filter((v) => v > 0).sort((a, b) => a - b);
  if (p50s.length === 0 || p95s.length === 0) return null;
  return { p50Ms: median(p50s), p95Ms: median(p95s) };
}

function median(sorted: readonly number[]): number {
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 1 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}
