import { useMemo } from "react";

import { fmtMs, fmtNum, fmtPct } from "../../ServiceDetailPage/formatters";
import { useErrorRateSeries } from "../../ServiceDetailPage/hooks/useErrorRateSeries";
import { useLatencyPercentiles } from "../../ServiceDetailPage/hooks/useLatencyPercentiles";
import { useStatusTimeseries } from "../../ServiceDetailPage/hooks/useStatusTimeseries";
import { SigCard } from "./SigCard";
import type { CatalogRow } from "./buildCatalogRows";

function rpsSeries(rows: ReturnType<typeof useStatusTimeseries>["data"]): number[] {
  if (!rows) return [];
  return rows.map((r) => r.status_2xx + r.status_4xx + r.status_5xx);
}

function p99Series(rows: ReturnType<typeof useLatencyPercentiles>["data"]): number[] {
  if (!rows) return [];
  return rows.map((r) => r.p99_ms);
}

function errSeries(rows: ReturnType<typeof useErrorRateSeries>["data"]): number[] {
  if (!rows) return [];
  return rows.map((r) => (r.request_count > 0 ? r.error_count / r.request_count : 0));
}

interface CatalogDrawerSignalsProps {
  readonly row: CatalogRow;
}

export function CatalogDrawerSignals({ row }: CatalogDrawerSignalsProps) {
  const statusQ = useStatusTimeseries(row.serviceName);
  const latencyQ = useLatencyPercentiles(row.serviceName);
  const errQ = useErrorRateSeries(row.serviceName);
  const rps = useMemo(() => rpsSeries(statusQ.data), [statusQ.data]);
  const p99 = useMemo(() => p99Series(latencyQ.data), [latencyQ.data]);
  const errs = useMemo(() => errSeries(errQ.data), [errQ.data]);
  return (
    <div className="flex flex-col gap-2">
      <SigCard
        label="Request rate"
        displayValue={`${fmtNum(row.rps)} rps`}
        secondary="last 60m"
        values={rps}
        format={(v) => fmtNum(v)}
      />
      <SigCard
        label="Error rate"
        displayValue={fmtPct(row.errorRate, row.errorRate < 0.001 ? 3 : 2)}
        secondary="last 60m"
        values={errs}
        format={(v) => fmtPct(v, v < 0.001 ? 3 : 2)}
      />
      <SigCard
        label="Latency"
        displayValue={fmtMs(row.p99Ms)}
        secondary={`p50 ${fmtMs(row.p50Ms)} · p95 ${fmtMs(row.p95Ms)}`}
        values={p99}
        format={(v) => fmtMs(v)}
      />
    </div>
  );
}
