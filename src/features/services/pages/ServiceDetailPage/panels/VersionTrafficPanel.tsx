import { useMemo } from "react";

import type { DeploymentVersionTrafficPoint } from "@shared/api/deployments/deploymentsApi";
import ObservabilityChart, {
  type ObservabilityChartSeries,
} from "@shared/components/ui/charts/ObservabilityChart";
import { tsMs } from "@shared/utils/chartDataUtils";
import { CHART_COLORS } from "@config/constants";

import { useServiceVersionTraffic } from "../hooks/useServiceVersionTraffic";
import { PanelCard } from "./PanelCard";

interface ChartData {
  timestamps: number[];
  series: ObservabilityChartSeries[];
}

/**
 * Pivots flat (timestamp, version, rps) points into one aligned series per
 * version, sharing the chart's unified timestamp axis. Mirrors the overview
 * deployment-compare timeline so request-rate-by-version reads consistently.
 */
function buildSeries(points: DeploymentVersionTrafficPoint[] | undefined): ChartData {
  if (!points || points.length === 0) return { timestamps: [], series: [] };

  const timestamps = Array.from(
    new Set(points.map((point) => tsMs(point.timestamp)).filter(Number.isFinite))
  ).sort((a, b) => a - b);

  const versionMap = new Map<string, Map<number, number>>();
  for (const point of points) {
    const ts = tsMs(point.timestamp);
    if (!Number.isFinite(ts)) continue;
    if (!versionMap.has(point.version)) versionMap.set(point.version, new Map<number, number>());
    versionMap.get(point.version)?.set(ts, point.rps);
  }

  const versions = Array.from(versionMap.keys()).sort((a, b) => a.localeCompare(b));

  return {
    timestamps: timestamps.map((t) => t / 1000),
    series: versions.map((version, index) => ({
      label: version,
      values: timestamps.map((t) => versionMap.get(version)?.get(t) ?? null),
      color: CHART_COLORS[index % CHART_COLORS.length],
      fill: true,
    })),
  };
}

function ChartBody({ data, isPending }: { data: ChartData; isPending: boolean }) {
  if (data.series.length === 0) {
    return (
      <div className="grid h-[200px] place-items-center text-[12px] text-[var(--text-muted)]">
        {isPending ? "Loading…" : "No version traffic in selected range."}
      </div>
    );
  }
  return (
    <ObservabilityChart
      type="area"
      timestamps={data.timestamps}
      series={data.series}
      height={220}
      yFormatter={(value) => `${value.toFixed(value >= 10 ? 0 : 1)} rps`}
      legend
    />
  );
}

export function VersionTrafficPanel({
  serviceName,
  title = "Traffic by version",
}: {
  readonly serviceName: string;
  readonly title?: string;
}) {
  const { data, isPending } = useServiceVersionTraffic(serviceName);
  const chart = useMemo(() => buildSeries(data), [data]);
  return (
    <PanelCard
      title={title}
      subtitle={chart.series.length > 0 ? `${chart.series.length} versions · rps` : undefined}
    >
      <ChartBody data={chart} isPending={isPending} />
    </PanelCard>
  );
}
