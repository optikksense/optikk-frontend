import { useMemo } from "react";

import { useCatalogList } from "./useCatalogList";

export interface CatalogAggregate {
  readonly totalServices: number;
  readonly healthy: number;
  readonly warn: number;
  readonly error: number;
  readonly totalRps: number;
  readonly avgP99Ms: number;
  readonly slosAtRisk: number;
  readonly deploys24h: number;
}

const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;

function countDeploysIn24h(rows: ReturnType<typeof useCatalogList>["rows"]): number {
  const cutoff = Date.now() - TWENTY_FOUR_HOURS_MS;
  let count = 0;
  for (const r of rows) {
    if (!r.lastDeployedAt) continue;
    const t = new Date(r.lastDeployedAt).getTime();
    if (Number.isFinite(t) && t >= cutoff) count += 1;
  }
  return count;
}

function countSlosAtRisk(rows: ReturnType<typeof useCatalogList>["rows"]): number {
  let count = 0;
  for (const r of rows) {
    const status = r.slo?.status ?? "";
    if (status === "at-risk" || status === "critical" || status === "burning") count += 1;
  }
  return count;
}

function buildAggregate(rows: ReturnType<typeof useCatalogList>["rows"]): CatalogAggregate {
  let totalRps = 0;
  let healthy = 0;
  let warn = 0;
  let errorCount = 0;
  let p99Weighted = 0;
  let weight = 0;
  for (const r of rows) {
    totalRps += r.rps;
    if (r.status === "healthy") healthy += 1;
    else if (r.status === "warn") warn += 1;
    else if (r.status === "error") errorCount += 1;
    if (r.requestCount > 0) {
      p99Weighted += r.p99Ms * r.requestCount;
      weight += r.requestCount;
    }
  }
  return {
    totalServices: rows.length,
    healthy,
    warn,
    error: errorCount,
    totalRps,
    avgP99Ms: weight > 0 ? p99Weighted / weight : 0,
    slosAtRisk: countSlosAtRisk(rows),
    deploys24h: countDeploysIn24h(rows),
  };
}

export function useCatalogAggregate(): { aggregate: CatalogAggregate; isPending: boolean } {
  const { rows, isPending } = useCatalogList();
  const aggregate = useMemo(() => buildAggregate(rows), [rows]);
  return { aggregate, isPending };
}
