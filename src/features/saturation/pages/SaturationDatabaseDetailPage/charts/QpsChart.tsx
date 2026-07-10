import ObservabilityChart from "@shared/components/ui/charts/ObservabilityChart";

import { useDatabaseQpsSeries } from "@/features/saturation/pages/SaturationDatabasePage/hooks/useDatabaseQpsSeries";
import { PanelCard } from "@shared/components/ui/PanelCard";
import { fmtNum } from "@shared/utils/metricFormatters";

export function QpsChart({ system }: { system?: string }) {
  const { series } = useDatabaseQpsSeries(system);
  return (
    <PanelCard title="Query throughput" subtitle="operations / sec">
      {series.timestamps.length === 0 ? (
        <div className="grid h-[200px] place-items-center text-[12px] text-foreground-muted">
          No throughput samples in this window.
        </div>
      ) : (
        <ObservabilityChart
          timestamps={series.timestamps}
          series={[
            { label: "ops/s", values: series.opsPerSec, color: "var(--color-info,#3b82f6)" },
          ]}
          height={220}
          yFormatter={(v) => fmtNum(v)}
        />
      )}
    </PanelCard>
  );
}
