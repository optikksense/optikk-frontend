import { useMemo } from "react";

import { useTimeRangeQuery } from "@shared/hooks/useTimeRangeQuery";

import {
  getLatencyByCollection,
  getLatencyByNamespace,
  getLatencyByOperation,
  getLatencyByServer,
} from "@/features/saturation/api/databaseLatencyApi";
import type {
  LatencySeriesPoint,
  OpsSeriesPoint,
  ReadWriteSeriesPoint,
} from "@/features/saturation/api/databaseSeriesSchemas";
import type { DatabaseFilters } from "@/features/saturation/api/databaseSlowQueriesApi";
import {
  getOpsByCollection,
  getOpsByNamespace,
  getOpsByOperation,
  getOpsReadVsWrite,
} from "@/features/saturation/api/databaseVolumeApi";
import {
  type GroupedSeriesResult,
  groupSeriesByLabel,
} from "@/features/saturation/series/groupSeriesByLabel";

function useLatencyP95Breakdown(
  key: string,
  system: string,
  fetcher: (
    s: string | number,
    e: string | number,
    f?: DatabaseFilters
  ) => Promise<LatencySeriesPoint[]>
): GroupedSeriesResult {
  const filters: DatabaseFilters = { db_system: system };
  const query = useTimeRangeQuery<LatencySeriesPoint[]>(key, (_t, s, e) => fetcher(s, e, filters), {
    extraKeys: [system],
  });
  return useMemo(
    () =>
      groupSeriesByLabel(
        (query.data ?? []).map((r) => ({
          timeBucket: r.time_bucket,
          label: r.group_by,
          value: r.p95_ms,
        }))
      ),
    [query.data]
  );
}

function useOpsBreakdown(
  key: string,
  system: string,
  fetcher: (
    s: string | number,
    e: string | number,
    f?: DatabaseFilters
  ) => Promise<OpsSeriesPoint[]>
): GroupedSeriesResult {
  const filters: DatabaseFilters = { db_system: system };
  const query = useTimeRangeQuery<OpsSeriesPoint[]>(key, (_t, s, e) => fetcher(s, e, filters), {
    extraKeys: [system],
  });
  return useMemo(
    () =>
      groupSeriesByLabel(
        (query.data ?? []).map((r) => ({
          timeBucket: r.time_bucket,
          label: r.group_by,
          value: r.ops_per_sec,
        }))
      ),
    [query.data]
  );
}

export interface ReadWriteSeries {
  readonly timestamps: number[];
  readonly readOps: number[];
  readonly writeOps: number[];
}

function useReadVsWrite(system: string): ReadWriteSeries {
  const filters: DatabaseFilters = { db_system: system };
  const query = useTimeRangeQuery<ReadWriteSeriesPoint[]>(
    "saturation-datastore.ops-read-vs-write",
    (_t, s, e) => getOpsReadVsWrite(s, e, filters),
    { extraKeys: [system] }
  );
  return useMemo(() => buildReadWrite(query.data ?? []), [query.data]);
}

function buildReadWrite(rows: ReadWriteSeriesPoint[]): ReadWriteSeries {
  const read = new Map<number, number>();
  const write = new Map<number, number>();
  for (const r of rows) {
    const ts = Math.floor(new Date(r.time_bucket).getTime() / 1000);
    if (!Number.isFinite(ts)) continue;
    read.set(ts, r.read_ops_per_sec ?? 0);
    write.set(ts, r.write_ops_per_sec ?? 0);
  }
  const timestamps = Array.from(new Set<number>([...read.keys(), ...write.keys()])).sort(
    (a, b) => a - b
  );
  return {
    timestamps,
    readOps: timestamps.map((t) => read.get(t) ?? 0),
    writeOps: timestamps.map((t) => write.get(t) ?? 0),
  };
}

/** Bundles the latency/ops breakdown series that drive the datastore breakdown panels. */
export function useDatastoreBreakdowns(system: string) {
  const latencyByOperation = useLatencyP95Breakdown(
    "saturation-datastore.latency-by-operation",
    system,
    getLatencyByOperation
  );
  const latencyByCollection = useLatencyP95Breakdown(
    "saturation-datastore.latency-by-collection",
    system,
    getLatencyByCollection
  );
  const latencyByNamespace = useLatencyP95Breakdown(
    "saturation-datastore.latency-by-namespace",
    system,
    getLatencyByNamespace
  );
  const latencyByServer = useLatencyP95Breakdown(
    "saturation-datastore.latency-by-server",
    system,
    getLatencyByServer
  );
  const opsByOperation = useOpsBreakdown(
    "saturation-datastore.ops-by-operation",
    system,
    getOpsByOperation
  );
  const opsByCollection = useOpsBreakdown(
    "saturation-datastore.ops-by-collection",
    system,
    getOpsByCollection
  );
  const opsByNamespace = useOpsBreakdown(
    "saturation-datastore.ops-by-namespace",
    system,
    getOpsByNamespace
  );
  const readVsWrite = useReadVsWrite(system);

  return {
    latencyByOperation,
    latencyByCollection,
    latencyByNamespace,
    latencyByServer,
    opsByOperation,
    opsByCollection,
    opsByNamespace,
    readVsWrite,
  };
}
