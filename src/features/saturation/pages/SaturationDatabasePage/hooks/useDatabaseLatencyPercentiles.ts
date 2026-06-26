import { useMemo } from "react";

import { useTimeRangeQuery } from "@shared/hooks/useTimeRangeQuery";

import { getLatencyBySystem } from "@/features/saturation/api/databaseLatencyApi";
import type { LatencySeriesPoint } from "@/features/saturation/api/databaseSeriesSchemas";

export interface LatencyPercentileSeries {
  readonly timestamps: number[];
  readonly p50Ms: number[];
  readonly p95Ms: number[];
  readonly p99Ms: number[];
}

interface Buckets {
  readonly p50: Map<number, number[]>;
  readonly p95: Map<number, number[]>;
  readonly p99: Map<number, number[]>;
}

function emptyBuckets(): Buckets {
  return { p50: new Map(), p95: new Map(), p99: new Map() };
}

function pushValue(map: Map<number, number[]>, key: number, value: number | null) {
  if (value == null) return;
  const list = map.get(key) ?? [];
  list.push(value);
  map.set(key, list);
}

function ingestRow(buckets: Buckets, row: LatencySeriesPoint) {
  const ts = Math.floor(new Date(row.time_bucket).getTime() / 1000);
  if (!Number.isFinite(ts)) return;
  pushValue(buckets.p50, ts, row.p50_ms);
  pushValue(buckets.p95, ts, row.p95_ms);
  pushValue(buckets.p99, ts, row.p99_ms);
}

function maxAt(map: Map<number, number[]>, key: number): number {
  const list = map.get(key);
  if (!list || list.length === 0) return 0;
  return Math.max(...list);
}

function buildSeries(rows: LatencySeriesPoint[]): LatencyPercentileSeries {
  const buckets = emptyBuckets();
  for (const row of rows) ingestRow(buckets, row);
  const allKeys = new Set<number>([
    ...buckets.p50.keys(),
    ...buckets.p95.keys(),
    ...buckets.p99.keys(),
  ]);
  const timestamps = Array.from(allKeys).sort((a, b) => a - b);
  return {
    timestamps,
    p50Ms: timestamps.map((t) => maxAt(buckets.p50, t)),
    p95Ms: timestamps.map((t) => maxAt(buckets.p95, t)),
    p99Ms: timestamps.map((t) => maxAt(buckets.p99, t)),
  };
}

export function useDatabaseLatencyPercentiles(system?: string) {
  const filters = system ? { db_system: system } : undefined;
  const query = useTimeRangeQuery<LatencySeriesPoint[]>(
    "saturation-db.latency-percentiles",
    (_team, s, e) => getLatencyBySystem(s, e, filters),
    { extraKeys: [system ?? "all"] }
  );
  const series = useMemo(() => buildSeries(query.data ?? []), [query.data]);
  return { series, isPending: query.isPending, isError: Boolean(query.error) };
}
