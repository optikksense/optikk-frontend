import { KpiCard, type KpiTone } from "@shared/components/ui/dashboard/KpiCard";

import type { SlowQueryPatternRow } from "@/features/saturation/api/databaseSlowQueriesApi";
import {
  fmtMs,
  fmtNum,
  fmtPct,
  ratioFromCounts,
} from "@/features/services/pages/ServiceDetailPage/formatters";

function latencyTone(ms: number): KpiTone {
  if (ms >= 2000) return "err";
  if (ms >= 1000) return "warn";
  return "ok";
}

export function QueryDetailKpiStrip({ row }: { row: SlowQueryPatternRow }) {
  const errorRate = ratioFromCounts(row.error_count, row.call_count);
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      <KpiCard label="Calls" value={fmtNum(row.call_count)} subtext="in window" />
      <KpiCard label="p50" value={fmtMs(row.p50_ms)} subtext="median" />
      <KpiCard label="p95" value={fmtMs(row.p95_ms)} subtext="95th pct" />
      <KpiCard
        label="p99"
        value={fmtMs(row.p99_ms)}
        tone={latencyTone(row.p99_ms ?? 0)}
        subtext="99th pct"
      />
      <KpiCard
        label="Error rate"
        value={fmtPct(errorRate)}
        tone={errorRate > 0 ? "err" : "ok"}
        subtext={`${fmtNum(row.error_count)} errors`}
      />
    </div>
  );
}
