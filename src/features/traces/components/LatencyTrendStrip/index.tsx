import { memo, useMemo } from "react";
import type uPlot from "uplot";

import UPlotChart from "@shared/components/ui/charts/UPlotChart";

import type { LatencyTrendPoint } from "../../hooks/useTracesLatencyTrend";

interface Props {
  readonly points: readonly LatencyTrendPoint[];
  readonly height?: number;
}

const SERIES: ReadonlyArray<{ key: "p50Ms" | "p95Ms" | "p99Ms"; label: string; color: string }> = [
  { key: "p50Ms", label: "p50", color: "#4e9fdd" },
  { key: "p95Ms", label: "p95", color: "#e0b400" },
  { key: "p99Ms", label: "p99", color: "#e8494d" },
];

function toAlignedData(points: readonly LatencyTrendPoint[]): uPlot.AlignedData {
  const xs = points.map((p) => Math.floor(p.ts / 1000));
  return [xs, ...SERIES.map((s) => points.map((p) => p[s.key]))];
}

function toSeriesOptions(): uPlot.Series[] {
  return [
    { label: "time" } satisfies uPlot.Series,
    ...SERIES.map<uPlot.Series>((s) => ({
      label: s.label,
      stroke: s.color,
      width: 1.5,
      points: { show: false },
    })),
  ];
}

/** Latency p50/p95/p99 timeseries strip. Sits under the count histogram (A1). */
function LatencyTrendStripComponent({ points, height = 90 }: Props) {
  const data = useMemo(() => toAlignedData(points), [points]);
  const options = useMemo<Omit<uPlot.Options, "width" | "height">>(
    () => ({
      series: toSeriesOptions(),
      legend: { show: false },
      cursor: { drag: { x: false, y: false } },
      scales: { x: { time: true } },
      axes: [
        { stroke: "var(--text-muted)" },
        { stroke: "var(--text-muted)", values: (_u, vals) => vals.map((v) => formatMs(v)) },
      ],
    }),
    [],
  );

  if (points.length === 0) return null;

  return (
    <div className="flex flex-col border-b border-[var(--border-color)] bg-[var(--bg-primary)]">
      <div className="flex items-center gap-3 px-3 py-1 text-[10px] uppercase tracking-wide text-[var(--text-muted)]">
        <span>Latency</span>
        {SERIES.map((s) => (
          <span key={s.key} className="flex items-center gap-1">
            <span className="h-0.5 w-3" style={{ backgroundColor: s.color }} />
            {s.label}
          </span>
        ))}
      </div>
      <UPlotChart options={options} data={data} height={height} />
    </div>
  );
}

function formatMs(ms: number): string {
  if (!Number.isFinite(ms)) return "";
  if (ms >= 1000) return `${(ms / 1000).toFixed(1)}s`;
  if (ms >= 1) return `${Math.round(ms)}ms`;
  return `${ms.toFixed(2)}ms`;
}

export const LatencyTrendStrip = memo(LatencyTrendStripComponent);
