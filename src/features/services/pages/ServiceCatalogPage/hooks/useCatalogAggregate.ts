import { useMemo } from "react";

import type { ServiceCatalogRedSummary } from "@/features/services/api/serviceCatalogApi";

import type { CatalogRow } from "../catalog/buildCatalogRows";

export interface CatalogAggregate {
  readonly totalServices: number;
  readonly totalRps: number;
  readonly healthy: number;
  readonly unhealthy: number;
  readonly weightedP99Ms: number;
  /** Fractional change vs the comparison window (null when no prior data). */
  readonly rpsDeltaPct: number | null;
  readonly p99DeltaPct: number | null;
}

function weightedP99(rows: ReadonlyArray<{ p99: number; req: number }>): number {
  let num = 0;
  let den = 0;
  for (const r of rows) {
    num += r.p99 * r.req;
    den += r.req;
  }
  return den > 0 ? num / den : 0;
}

function deltaPct(now: number, prev: number): number | null {
  if (prev <= 0) return null;
  return (now - prev) / prev;
}

function buildAggregate(
  rows: ReadonlyArray<CatalogRow>,
  comparison: ServiceCatalogRedSummary | undefined,
  windowSec: number
): CatalogAggregate {
  let totalRps = 0;
  let totalReq = 0;
  let healthy = 0;
  let unhealthy = 0;
  for (const r of rows) {
    totalRps += r.rps;
    totalReq += r.requestCount;
    if (r.status === "healthy") healthy += 1;
    else if (r.status === "warn" || r.status === "error") unhealthy += 1;
  }

  const nowP99 = weightedP99(rows.map((r) => ({ p99: r.p99Ms, req: r.requestCount })));

  const prev = comparison?.services ?? [];
  const prevReq = prev.reduce((acc, s) => acc + s.request_count, 0);
  const prevRps = windowSec > 0 ? prevReq / windowSec : 0;
  const prevP99 = weightedP99(prev.map((s) => ({ p99: s.p99_latency, req: s.request_count })));

  return {
    totalServices: rows.length,
    totalRps,
    healthy,
    unhealthy,
    weightedP99Ms: nowP99,
    rpsDeltaPct: deltaPct(totalRps, prevRps),
    p99DeltaPct: deltaPct(nowP99, prevP99),
  };
}

export function useCatalogAggregate(
  rows: ReadonlyArray<CatalogRow>,
  comparison: ServiceCatalogRedSummary | undefined,
  windowSec: number
): CatalogAggregate {
  return useMemo(() => buildAggregate(rows, comparison, windowSec), [rows, comparison, windowSec]);
}
