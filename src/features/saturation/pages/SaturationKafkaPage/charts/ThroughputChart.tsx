import ObservabilityChart from "@shared/components/ui/charts/ObservabilityChart";

import { fmtNum } from "@/features/services/pages/ServiceDetailPage/formatters";
import { PanelCard } from "@/features/services/pages/ServiceDetailPage/panels/PanelCard";

import { useKafkaThroughputSeries } from "../hooks/useKafkaThroughputSeries";

function ChartBody({
  timestamps,
  produce,
  consume,
}: {
  timestamps: number[];
  produce: number[];
  consume: number[];
}) {
  if (timestamps.length === 0) {
    return (
      <div className="grid h-[200px] place-items-center text-[12px] text-[var(--text-muted)]">
        No throughput data in this window.
      </div>
    );
  }
  return (
    <ObservabilityChart
      timestamps={timestamps}
      series={[
        { label: "msgs in", values: produce, color: "var(--color-info,#3b82f6)" },
        { label: "msgs out", values: consume, color: "var(--color-warning,#f59e0b)" },
      ]}
      height={220}
      yFormatter={(v) => fmtNum(v)}
    />
  );
}

export function ThroughputChart() {
  const { series } = useKafkaThroughputSeries();
  return (
    <PanelCard title="Cluster throughput" subtitle="msgs / second · last window">
      <ChartBody timestamps={series.timestamps} produce={series.produce} consume={series.consume} />
    </PanelCard>
  );
}
