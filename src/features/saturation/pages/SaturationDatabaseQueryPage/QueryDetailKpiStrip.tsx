import { KpiCard, type KpiTone } from "@shared/components/ui/cards/StatCard";
import SparklineChart from "@shared/components/ui/charts/micro/SparklineChart";

import type { QueryTimeseriesPoint } from "@/features/saturation/api/databaseQueryDetailApi";
import { fmtMs, fmtNum, fmtPct, ratioFromCounts } from "@shared/utils/formatters";

import type { QueryDetailView } from "./viewModel";

function latencyTone(ms: number): KpiTone {
  if (ms >= 2000) return "err";
  if (ms >= 1000) return "warn";
  return "ok";
}

function spark(values: number[], color: string) {
  return <SparklineChart data={values} color={color} calm />;
}

export function QueryDetailKpiStrip({
  view,
  timeseries = [],
}: {
  view: QueryDetailView;
  timeseries?: QueryTimeseriesPoint[];
}) {
  const errorRate = ratioFromCounts(view.errorCount, view.callCount);
  const calls = timeseries.map((p) => p.callCount);
  const avg = timeseries.map((p) => p.avgMs ?? 0);
  const p99 = timeseries.map((p) => p.p99Ms ?? 0);
  const totalTime = timeseries.map((p) => (p.avgMs ?? 0) * p.callCount);
  const showRows = view.avgRows != null;
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      <KpiCard
        label="Calls"
        value={fmtNum(view.callCount)}
        subtext="in window"
        sparkline={spark(calls, "var(--color-info,#3b82f6)")}
      />
      <KpiCard
        label="Avg time"
        value={fmtMs(view.avgMs)}
        subtext="per call"
        sparkline={spark(avg, "var(--color-info,#3b82f6)")}
      />
      <KpiCard
        label="p99"
        value={fmtMs(view.p99Ms)}
        tone={latencyTone(view.p99Ms ?? 0)}
        subtext="99th pct"
        sparkline={spark(p99, "var(--color-warning,#f59e0b)")}
      />
      <KpiCard
        label="Total time"
        value={fmtMs(view.totalTimeMs)}
        subtext="in window"
        sparkline={spark(totalTime, "var(--color-info,#3b82f6)")}
      />
      {showRows && <KpiCard label="Rows / call" value={fmtNum(view.avgRows)} subtext="returned" />}
      <KpiCard
        label="Error rate"
        value={fmtPct(errorRate)}
        tone={errorRate > 0 ? "err" : "ok"}
        subtext={`${fmtNum(view.errorCount)} errors`}
      />
    </div>
  );
}
