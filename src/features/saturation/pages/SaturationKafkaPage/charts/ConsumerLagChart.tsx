import ObservabilityChart from "@shared/components/ui/charts/ObservabilityChart";

import { fmtNum } from "@/features/services/pages/ServiceDetailPage/formatters";
import { PanelCard } from "@/features/services/pages/ServiceDetailPage/panels/PanelCard";

import { useKafkaConsumerLagSeries } from "../hooks/useKafkaConsumerLagSeries";

function ChartBody({ timestamps, totalLag }: { timestamps: number[]; totalLag: number[] }) {
  if (timestamps.length === 0) {
    return (
      <div className="grid h-[200px] place-items-center text-[12px] text-[var(--text-muted)]">
        No consumer-lag data in this window.
      </div>
    );
  }
  return (
    <ObservabilityChart
      type="area"
      timestamps={timestamps}
      series={[
        { label: "total lag", values: totalLag, color: "var(--color-warning,#f59e0b)", fill: true },
      ]}
      height={220}
      yFormatter={(v) => fmtNum(v)}
    />
  );
}

export function ConsumerLagChart() {
  const { series } = useKafkaConsumerLagSeries();
  return (
    <PanelCard title="Total consumer lag" subtitle="all groups · msgs behind">
      <ChartBody timestamps={series.timestamps} totalLag={series.totalLag} />
    </PanelCard>
  );
}
