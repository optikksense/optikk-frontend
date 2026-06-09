import { useMemo } from "react";
import type uPlot from "uplot";

import ObservabilityChart, {
  type ObservabilityChartSeries,
} from "@shared/components/ui/charts/ObservabilityChart";
import { tsMs } from "@shared/utils/chartDataUtils";

import type { LatencyPercentilesPoint } from "@/features/services/api/serviceDetailApi";

import { fmtMs } from "../formatters";
import { useLatencyPercentiles } from "../hooks/useLatencyPercentiles";
import { PanelCard } from "./PanelCard";

interface ChartData {
  timestamps: number[];
  series: ObservabilityChartSeries[];
}

function buildSeries(rows: LatencyPercentilesPoint[] | undefined): ChartData {
  const activeRows = rows ?? [];
  const timestamps = activeRows.map((r) => tsMs(r.timestamp) / 1000);

  return {
    timestamps,
    series: [
      {
        label: "p50",
        values: activeRows.map((r) => r.p50_ms),
        color: "var(--color-healthy,#73c991)",
      },
      {
        label: "p95",
        values: activeRows.map((r) => r.p95_ms),
        color: "var(--color-degraded,#f7b63a)",
      },
      {
        label: "p99",
        values: activeRows.map((r) => r.p99_ms),
        color: "var(--color-critical,#f04438)",
      },
    ],
  };
}

function ChartBody({ data, plugins }: { data: ChartData; plugins: uPlot.Plugin[] }) {
  if (data.timestamps.length === 0) {
    return (
      <div className="grid h-[180px] place-items-center text-[12px] text-foreground-muted">
        No latency samples in this window.
      </div>
    );
  }
  return (
    <ObservabilityChart
      timestamps={data.timestamps}
      series={data.series}
      height={200}
      yFormatter={(v) => fmtMs(v)}
      plugins={plugins}
    />
  );
}

export function LatencyPanel({ serviceName }: { serviceName: string }) {
  const query = useLatencyPercentiles(serviceName);
  const data = useMemo(() => buildSeries(query.data), [query.data]);
  return (
    <PanelCard title="Latency" subtitle="p50 / p95 / p99 · last 60m">
      <ChartBody data={data} plugins={[]} />
    </PanelCard>
  );
}
