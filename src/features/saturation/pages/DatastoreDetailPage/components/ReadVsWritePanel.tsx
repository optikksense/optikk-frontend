import { Card } from "@shared/components/primitives/ui";
import ObservabilityChart from "@shared/components/ui/charts/ObservabilityChart";
import { formatNumber } from "@shared/utils/formatters";

import type { ReadWriteSeries } from "../hooks/useDatastoreBreakdowns";

export function ReadVsWritePanel({ series }: { series: ReadWriteSeries }) {
  return (
    <Card padding="lg" className="min-h-[300px] border-border">
      <div className="mb-3">
        <div className="text-[11px] text-foreground-muted uppercase tracking-[0.08em]">Volume</div>
        <div className="mt-1 font-semibold text-[15px] text-foreground">Read vs write</div>
      </div>
      {series.timestamps.length === 0 ? (
        <div className="grid h-[220px] place-items-center text-[12px] text-foreground-muted">
          No read/write volume in this window.
        </div>
      ) : (
        <ObservabilityChart
          timestamps={series.timestamps}
          series={[
            { label: "read ops/s", values: series.readOps, color: "var(--color-info,#3b82f6)" },
            {
              label: "write ops/s",
              values: series.writeOps,
              color: "var(--color-warning,#f59e0b)",
            },
          ]}
          height={240}
          legend
          yFormatter={(v) => formatNumber(v)}
        />
      )}
    </Card>
  );
}
