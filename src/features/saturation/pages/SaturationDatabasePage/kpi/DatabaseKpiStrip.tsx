import { KpiCard, type KpiTone } from "@shared/components/ui/dashboard/KpiCard";

import type { DatastoreSummary } from "@/features/saturation/api/datastoresExplorerSchemas";
import { fmtMs, fmtNum } from "@shared/utils/metricFormatters";

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
  readonly system?: string;
}

// Design's two headline tiles: queries/s and p99 latency.
export function DatabaseKpiStrip({ summary, system }: DatabaseKpiStripProps) {
  const { series: qps } = useDatabaseQpsSeries(system);
  const { series: lat } = useDatabaseLatencyPercentiles(system);
  const qpsLast = last(qps.opsPerSec);
  const p99 = last(lat.p99Ms);
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <KpiCard
        label="Queries /s"
        value={fmtNum(qpsLast)}
        secondary="ops/s"
        subtext={summary ? `across ${fmtNum(summary.databaseSystems)} systems` : "across systems"}
      />
      <KpiCard label="p99 latency" value={fmtMs(p99)} tone={latencyTone(p99)} subtext="99th pct" />
    </div>
  );
}
