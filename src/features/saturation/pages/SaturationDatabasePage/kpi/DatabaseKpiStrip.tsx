import { KpiCard, type KpiTone } from "@shared/components/ui/dashboard/KpiCard";

import type { DatastoreSummary } from "@/features/saturation/api/datastoresExplorerSchemas";
import { fmtMs, fmtNum, fmtPct } from "@/features/services/pages/ServiceDetailPage/formatters";

import { useDatabaseLatencyPercentiles } from "../hooks/useDatabaseLatencyPercentiles";
import { useDatabaseQpsSeries } from "../hooks/useDatabaseQpsSeries";

function latencyTone(ms: number): KpiTone {
  if (ms >= 2000) return "err";
  if (ms >= 1000) return "warn";
  return "ok";
}

function last(values: readonly number[]): number {
  return values.length > 0 ? values[values.length - 1] : 0;
}

interface DatabaseKpiStripProps {
  readonly summary: DatastoreSummary | undefined;
}

// Design's data-backed tiles only (queries/s, active connections, p50/p95/p99).
// Cache-hit is per-system only (no aggregate source) and is omitted; the design's
// "% of pool" needs a max-pool figure the aggregate summary does not expose.
export function DatabaseKpiStrip({ summary }: DatabaseKpiStripProps) {
  const { series: qps } = useDatabaseQpsSeries();
  const { series: lat } = useDatabaseLatencyPercentiles();
  const qpsLast = last(qps.opsPerSec);
  const p50 = last(lat.p50Ms);
  const p95 = last(lat.p95Ms);
  const p99 = last(lat.p99Ms);
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
      <KpiCard
        label="Queries /s"
        value={fmtNum(qpsLast)}
        secondary="ops/s"
        subtext="across systems"
      />
      <KpiCard
        label="Active conn"
        value={summary ? fmtNum(summary.active_connections) : "—"}
        subtext={summary ? `error rate ${fmtPct(summary.error_rate)}` : undefined}
      />
      <KpiCard label="p50 latency" value={fmtMs(p50)} subtext="median" />
      <KpiCard label="p95 latency" value={fmtMs(p95)} tone={latencyTone(p95)} subtext="95th pct" />
      <KpiCard label="p99 latency" value={fmtMs(p99)} tone={latencyTone(p99)} subtext="99th pct" />
    </div>
  );
}
