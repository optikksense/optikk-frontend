import { useMemo } from "react";
import type uPlot from "uplot";

import ObservabilityChart, {
  type ObservabilityChartSeries,
} from "@shared/components/ui/charts/ObservabilityChart";
import { useChartTimeBuckets } from "@shared/hooks/useChartTimeBuckets";
import { tsKey, tsMs } from "@shared/utils/chartDataUtils";

import type { LatencyPercentilesPoint } from "@/features/services/api/serviceDetailApi";

import { fmtMs } from "../formatters";
import { useDeployMarkers } from "../hooks/useDeployMarkers";
import { useLatencyPercentiles } from "../hooks/useLatencyPercentiles";
import { PanelCard } from "./PanelCard";

interface ChartData {
  timestamps: number[];
  series: ObservabilityChartSeries[];
}

function buildSeries(
  rows: LatencyPercentilesPoint[] | undefined,
  timeBuckets: string[]
): ChartData {
  const timestamps = timeBuckets.map((t) => tsMs(t) / 1000);

  if (!rows || rows.length === 0) {
    const zeros = timestamps.map(() => 0);
    return {
      timestamps,
      series: [
        { label: "p50", values: [...zeros], color: "var(--color-healthy,#73c991)" },
        { label: "p95", values: [...zeros], color: "var(--color-degraded,#f7b63a)" },
        { label: "p99", values: [...zeros], color: "var(--color-critical,#f04438)" },
      ],
    };
  }

  // Build lookup maps from API rows keyed by normalized timestamp
  const mapP50: Record<string, number> = {};
  const mapP95: Record<string, number> = {};
  const mapP99: Record<string, number> = {};
  for (const r of rows) {
    const key = tsKey(r.timestamp);
    // Use max for latency when multiple rows hit the same bucket
    mapP50[key] = Math.max(mapP50[key] ?? 0, r.p50_ms);
    mapP95[key] = Math.max(mapP95[key] ?? 0, r.p95_ms);
    mapP99[key] = Math.max(mapP99[key] ?? 0, r.p99_ms);
  }

  const p50 = timeBuckets.map((t) => mapP50[tsKey(t)] ?? 0);
  const p95 = timeBuckets.map((t) => mapP95[tsKey(t)] ?? 0);
  const p99 = timeBuckets.map((t) => mapP99[tsKey(t)] ?? 0);

  return {
    timestamps,
    series: [
      { label: "p50", values: p50, color: "var(--color-healthy,#73c991)" },
      { label: "p95", values: p95, color: "var(--color-degraded,#f7b63a)" },
      { label: "p99", values: p99, color: "var(--color-critical,#f04438)" },
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
  const { timeBuckets } = useChartTimeBuckets();
  const deployPlugins = useDeployMarkers(serviceName);
  const data = useMemo(() => buildSeries(query.data, timeBuckets), [query.data, timeBuckets]);
  return (
    <PanelCard title="Latency" subtitle="p50 / p95 / p99 · last 60m">
      <ChartBody data={data} plugins={deployPlugins} />
    </PanelCard>
  );
}
