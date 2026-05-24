import { useMemo } from "react";

import { useTimeRange, useTimeRangeQuery } from "@shared/hooks/useTimeRangeQuery";

import {
  type ServiceLatestDeployment,
  deploymentsApi,
} from "@/features/overview/api/deploymentsApi";
import {
  type RedSummaryWithComparison,
  type RequestRatePoint,
  type SloRow,
  getRedSummaryWithComparison,
  getRequestRateSeries,
  getSloList,
} from "@/features/services/api/serviceCatalogApi";

import { type CatalogRow, buildCatalogRows } from "../catalog/buildCatalogRows";

export interface UseCatalogListResult {
  readonly rows: CatalogRow[];
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

function useSloListQuery() {
  return useTimeRangeQuery<SloRow[]>("service-hub.slo-list", (_team, s, e) => getSloList(s, e));
}

function useLatestDeploysQuery() {
  return useTimeRangeQuery<ServiceLatestDeployment[]>(
    "service-hub.latest-deploys",
    () => deploymentsApi.getLatestByService(),
    { staleTime: 60_000 }
  );
}

export function useCatalogList(): UseCatalogListResult {
  const { getTimeRange } = useTimeRange();
  const summary = useRedSummary();
  const series = useRateSeries();
  const slos = useSloListQuery();
  const latest = useLatestDeploysQuery();

  const rows = useMemo<CatalogRow[]>(() => {
    if (!summary.data) return [];
    const bounds = getTimeRange();
    const windowSec = Math.max(1, (Number(bounds.endTime) - Number(bounds.startTime)) / 1000);
    return buildCatalogRows({
      primary: summary.data.data,
      comparison: summary.data.comparison,
      rateSeries: series.data ?? [],
      slos: slos.data ?? [],
      latestDeploys: latest.data ?? [],
      windowSec,
    });
  }, [summary.data, series.data, slos.data, latest.data, getTimeRange]);

  return {
    rows,
    isPending: summary.isPending,
    isError: Boolean(summary.error || series.error || slos.error || latest.error),
  };
}
