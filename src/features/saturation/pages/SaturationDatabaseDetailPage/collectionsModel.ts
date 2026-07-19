import type { SlowQueryPatternRow } from "@/features/saturation/api/databaseSlowQueriesApi";

import type { InstanceStatus } from "@/features/saturation/pages/SaturationDatabasePage/databaseInstanceModel";

export interface CollectionRow {
  readonly name: string;
  readonly queryCount: number;
  readonly calls: number;
  readonly p99Ms: number;
  readonly totalMs: number;
  readonly status: InstanceStatus;
}

const P99_WARN_MS = 1000;
const P99_CRIT_MS = 2000;

function statusForP99(p99: number): InstanceStatus {
  if (p99 >= P99_CRIT_MS) return "err";
  if (p99 >= P99_WARN_MS) return "warn";
  return "ok";
}

// Aggregate query fingerprints into per-collection rows (no backend
// collections endpoint exists, so this is a pure client-side reduce).
export function aggregateCollections(rows: SlowQueryPatternRow[]): CollectionRow[] {
  const byName = new Map<
    string,
    { queryCount: number; calls: number; p99: number; totalMs: number }
  >();
  for (const row of rows) {
    const name = row.collectionName || "—";
    const agg = byName.get(name) ?? { queryCount: 0, calls: 0, p99: 0, totalMs: 0 };
    agg.queryCount += 1;
    agg.calls += row.callCount;
    agg.p99 = Math.max(agg.p99, row.p99Ms ?? 0);
    agg.totalMs += row.callCount * (row.p95Ms ?? 0);
    byName.set(name, agg);
  }
  return Array.from(byName.entries())
    .map(([name, a]) => ({
      name,
      queryCount: a.queryCount,
      calls: a.calls,
      p99Ms: a.p99,
      totalMs: a.totalMs,
      status: statusForP99(a.p99),
    }))
    .sort((a, b) => b.totalMs - a.totalMs);
}
