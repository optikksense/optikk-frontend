import ObservabilityChart from "@shared/components/ui/charts/ObservabilityChart";

import { PanelCard } from "@shared/components/ui/PanelCard";
import { fmtMs, fmtNum } from "@shared/utils/formatters";

import type { QueryPerformanceChartModel } from "./queryPerformanceModel";

function EmptyChart() {
  return (
    <div className="grid h-[220px] place-items-center text-[12px] text-foreground-muted">
      No samples for the selected queries in this window.
    </div>
  );
}

export function QueryPerformanceCharts({
  model,
  mode,
}: {
  readonly model: QueryPerformanceChartModel;
  readonly mode: "collection" | "query";
}) {
  const empty = model.timestamps.length === 0;
  return (
    <div className="flex flex-col gap-4">
      <PanelCard
        title="Query latency"
        subtitle={mode === "collection" ? "p95 / p99 · ≥20 calls/bucket" : "p50 / p95 / p99"}
      >
        {empty ? (
          <EmptyChart />
        ) : (
          <ObservabilityChart
            timestamps={model.timestamps}
            series={model.latency}
            height={240}
            legend
            yFormatter={fmtMs}
          />
        )}
      </PanelCard>
      <PanelCard title="Query throughput" subtitle="operations / sec per query">
        {empty ? (
          <EmptyChart />
        ) : (
          <ObservabilityChart
            timestamps={model.timestamps}
            series={model.throughput}
            height={240}
            legend
            yFormatter={fmtNum}
          />
        )}
      </PanelCard>
    </div>
  );
}
