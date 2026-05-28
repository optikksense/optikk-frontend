import ObservabilityChart from "@shared/components/ui/charts/ObservabilityChart";

import { fmtMs } from "@/features/services/pages/ServiceDetailPage/formatters";
import { PanelCard } from "@/features/services/pages/ServiceDetailPage/panels/PanelCard";

import { useDatabaseLatencyPercentiles } from "../hooks/useDatabaseLatencyPercentiles";

function ChartBody({
  timestamps,
  p50,
  p95,
  p99,
}: {
  timestamps: number[];
  p50: number[];
  p95: number[];
  p99: number[];
}) {
  if (timestamps.length === 0) {
    return (
      <div className="grid h-[200px] place-items-center text-[12px] text-[var(--text-muted)]">
        No latency samples in this window.
      </div>
    );
  }
  return (
    <ObservabilityChart
      timestamps={timestamps}
      series={[
        { label: "p50", values: p50, color: "var(--color-info,#3b82f6)" },
        { label: "p95", values: p95, color: "var(--color-warning,#f59e0b)" },
        { label: "p99", values: p99, color: "var(--color-error,#ef4444)" },
      ]}
      height={220}
      yFormatter={(v) => fmtMs(v)}
    />
  );
}

export function LatencyPercentilesChart() {
  const { series } = useDatabaseLatencyPercentiles();
  return (
    <PanelCard title="Latency percentiles" subtitle="p50 / p95 / p99">
      <ChartBody
        timestamps={series.timestamps}
        p50={series.p50Ms}
        p95={series.p95Ms}
        p99={series.p99Ms}
      />
    </PanelCard>
  );
}
