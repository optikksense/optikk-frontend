import type { DatastoreSummary } from "@/features/saturation/api/datastoresExplorerSchemas";
import { fmtMs, fmtNum, fmtPct } from "@/features/services/pages/ServiceDetailPage/formatters";
import { KpiCard, type KpiTone } from "@/features/services/pages/ServiceDetailPage/kpi/KpiCard";

import { useDatabaseLatencyPercentiles } from "../hooks/useDatabaseLatencyPercentiles";
import { useDatabaseQpsSeries } from "../hooks/useDatabaseQpsSeries";

function p99Tone(p99Ms: number): KpiTone {
  if (p99Ms >= 2000) return "err";
  if (p99Ms >= 1000) return "warn";
  return "ok";
}

function last(values: number[]): number {
  return values.length > 0 ? values[values.length - 1] : 0;
}

interface DatabaseKpiStripProps {
  readonly summary: DatastoreSummary | undefined;
}

export function DatabaseKpiStrip({ summary }: DatabaseKpiStripProps) {
  const { series: qps } = useDatabaseQpsSeries();
  const { series: lat } = useDatabaseLatencyPercentiles();
  const qpsLast = last(qps.opsPerSec);
  const p50 = last(lat.p50Ms);
  const p95 = last(lat.p95Ms);
  const p99 = last(lat.p99Ms);
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
      <KpiCard label="QPS" value={fmtNum(qpsLast)} secondary="ops/s" subtext="across systems" />
      <KpiCard label="p50" value={fmtMs(p50)} subtext="median latency" />
      <KpiCard label="p95" value={fmtMs(p95)} subtext="95th percentile" />
      <KpiCard label="p99" value={fmtMs(p99)} tone={p99Tone(p99)} subtext="99th percentile" />
      <KpiCard
        label="Connections"
        value={summary ? fmtNum(summary.active_connections) : "—"}
        subtext={summary ? `error rate ${fmtPct(summary.error_rate)}` : undefined}
      />
    </div>
  );
}
