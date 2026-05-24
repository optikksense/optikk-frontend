import { useMemo } from "react";

import { useTimeRangeQuery } from "@shared/hooks/useTimeRangeQuery";

import type { OpsSeriesPoint } from "@/features/saturation/api/databaseSeriesSchemas";
import { getOpsBySystem } from "@/features/saturation/api/databaseVolumeApi";

export interface QpsSeries {
  readonly timestamps: number[];
  readonly opsPerSec: number[];
}

function sumByTimestamp(rows: OpsSeriesPoint[]): QpsSeries {
  const map = new Map<number, number>();
  for (const r of rows) {
    const ts = Math.floor(new Date(r.time_bucket).getTime() / 1000);
    if (!Number.isFinite(ts)) continue;
    map.set(ts, (map.get(ts) ?? 0) + (r.ops_per_sec ?? 0));
  }
  const timestamps = Array.from(map.keys()).sort((a, b) => a - b);
  return { timestamps, opsPerSec: timestamps.map((t) => map.get(t) ?? 0) };
}

export function useDatabaseQpsSeries() {
  const query = useTimeRangeQuery<OpsSeriesPoint[]>("saturation-db.qps", (_team, s, e) =>
    getOpsBySystem(s, e)
  );
  const series = useMemo(() => sumByTimestamp(query.data ?? []), [query.data]);
  return { series, isPending: query.isPending, isError: Boolean(query.error) };
}
