import ObservabilityChart from "@shared/components/ui/charts/ObservabilityChart";

import { fmtNum } from "@/features/services/pages/ServiceDetailPage/formatters";
import { PanelCard } from "@/features/services/pages/ServiceDetailPage/panels/PanelCard";

import { useDatabaseQpsSeries } from "../hooks/useDatabaseQpsSeries";

function ChartBody({ timestamps, opsPerSec }: { timestamps: number[]; opsPerSec: number[] }) {
  if (timestamps.length === 0) {
    return (
      <div className="grid h-[200px] place-items-center text-[12px] text-[var(--text-muted)]">
        No query traffic in this window.
      </div>
    );
  }
  return (
    <ObservabilityChart
      type="area"
      timestamps={timestamps}
      series={[{ label: "QPS", values: opsPerSec, color: "var(--color-info,#3b82f6)", fill: true }]}
      height={220}
      yFormatter={(v) => fmtNum(v)}
    />
  );
}

export function QpsChart() {
  const { series } = useDatabaseQpsSeries();
  return (
    <PanelCard title="Queries / second" subtitle="aggregate across systems">
      <ChartBody timestamps={series.timestamps} opsPerSec={series.opsPerSec} />
    </PanelCard>
  );
}
