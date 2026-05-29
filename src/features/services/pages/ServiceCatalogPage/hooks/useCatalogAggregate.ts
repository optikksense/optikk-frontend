import { useMemo } from "react";

import type { CatalogRow } from "../catalog/buildCatalogRows";

export interface CatalogAggregate {
  readonly totalServices: number;
  readonly totalRps: number;
}

function buildAggregate(rows: ReadonlyArray<CatalogRow>): CatalogAggregate {
  let totalRps = 0;
  for (const r of rows) totalRps += r.rps;
  return { totalServices: rows.length, totalRps };
}

export function useCatalogAggregate(rows: ReadonlyArray<CatalogRow>): CatalogAggregate {
  return useMemo(() => buildAggregate(rows), [rows]);
}
