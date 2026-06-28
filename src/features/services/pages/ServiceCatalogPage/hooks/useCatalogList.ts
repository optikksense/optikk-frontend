import { useMemo } from "react";

import { useTimeRange, useTimeRangeQuery } from "@shared/hooks/useTimeRangeQuery";

import {
  type RedSummaryWithComparison,
  type RequestRatePoint,
  type ServiceCatalogRedSummary,
  getRedSummaryWithComparison,
  getRequestRateSeries,
} from "@/features/services/api/redApi";

import { type CatalogRow, buildCatalogRows } from "../catalog/buildCatalogRows";

export interface UseCatalogListResult {
  readonly rows: CatalogRow[];
  /** Prior-window RED summary, when present — powers the KPI strip deltas. */
  readonly comparison?: ServiceCatalogRedSummary;
  readonly windowSec: number;
  readonly isPending: boolean;
  readonly isError: boolean;
}

function useRedSummary() {
  return useTimeRangeQuery<RedSummaryWithComparison>("service-hub.red-summary-cmp", (_team, s, e) =>
    getRedSummaryWithComparison(s, e)
  );
}

function useRateSeries() {
  return useTimeRangeQuery<RequestRatePoint[]>("service-hub.request-rate", (_team, s, e) =>
    getRequestRateSeries(s, e)
  );
}

export function useCatalogList(): UseCatalogListResult {
  const { getTimeRange } = useTimeRange();
  const summary = useRedSummary();
  const series = useRateSeries();

  const windowSec = useMemo(() => {
    const bounds = getTimeRange();
    return Math.max(1, (Number(bounds.endTime) - Number(bounds.startTime)) / 1000);
  }, [getTimeRange]);

  const rows = useMemo<CatalogRow[]>(() => {
    if (!summary.data) return [];
    return buildCatalogRows({
      primary: summary.data.data,
      comparison: summary.data.comparison,
      rateSeries: series.data ?? [],
      windowSec,
    });
  }, [summary.data, series.data, windowSec]);

  return {
    rows,
    comparison: summary.data?.comparison,
    windowSec,
    isPending: summary.isPending,
    isError: Boolean(summary.error || series.error),
  };
}
