import { useMemo } from "react";

import type { ServiceCatalogRedSummary } from "@shared/api/red/redApi";

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

function deltaPct(now: number, prev: number): number | null {
  if (prev <= 0) return null;
  return (now - prev) / prev;
}

function buildAggregate(
  rows: ReadonlyArray<CatalogRow>,
  summary: ServiceCatalogRedSummary | undefined,
  comparison: ServiceCatalogRedSummary | undefined
): CatalogAggregate {
  let healthy = 0;
  let unhealthy = 0;
  for (const r of rows) {
    if (r.status === "healthy") healthy += 1;
    else if (r.status === "warn" || r.status === "error") unhealthy += 1;
  }

  const totalRps = summary?.totalRps ?? 0;
  const nowP99 = summary?.avgP99Ms ?? 0;
  const prevRps = comparison?.totalRps ?? 0;
  const prevP99 = comparison?.avgP99Ms ?? 0;

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
  summary: ServiceCatalogRedSummary | undefined,
  comparison: ServiceCatalogRedSummary | undefined
): CatalogAggregate {
  return useMemo(() => buildAggregate(rows, summary, comparison), [rows, summary, comparison]);
}
