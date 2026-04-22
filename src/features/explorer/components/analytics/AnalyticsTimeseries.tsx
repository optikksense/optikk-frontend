import { memo, useMemo } from "react";
import type uPlot from "uplot";

import UPlotChart, { defaultAxes, uLine } from "@shared/components/ui/charts/UPlotChart";

import type { AnalyticsResponse } from "../../types/analytics";

const SERIES_PALETTE = [
  "#3b82f6",
  "#ef4444",
  "#10b981",
  "#f59e0b",
  "#8b5cf6",
  "#14b8a6",
  "#ec4899",
  "#6366f1",
];

interface Props {
  readonly data: AnalyticsResponse;
  readonly height?: number;
}

/**
 * Wraps the shared UPlotChart leaf. Assumes `columns[0]` is the time bucket
 * and numeric-typed columns are plotted as lines; string columns (group-by
 * dims) are concatenated into the series label so group combinations surface
 * in the legend.
 */
function AnalyticsTimeseriesImpl({ data, height = 260 }: Props) {
  const { aligned, options } = useMemo(() => buildChart(data), [data]);
  if (!data.rows.length) {
    return <div className="flex h-full items-center justify-center text-sm text-[var(--text-secondary)]">No data</div>;
  }
  return <UPlotChart options={options} data={aligned} height={height} />;
}

export const AnalyticsTimeseries = memo(AnalyticsTimeseriesImpl);

function buildChart(data: AnalyticsResponse): {
  aligned: uPlot.AlignedData;
  options: Omit<uPlot.Options, "width" | "height">;
} {
  const { columns, rows } = data;
  const timeIdx = columns.findIndex((c) => c.type === "time");
  const valueIdxs = columns
    .map((c, i) => ({ c, i }))
    .filter(({ c, i }) => i !== timeIdx && c.type === "number")
    .map(({ i }) => i);
  const groupIdxs = columns
    .map((c, i) => ({ c, i }))
    .filter(({ c, i }) => i !== timeIdx && c.type === "string")
    .map(({ i }) => i);

  // Build unique series keyed by the group-by concat. Each key gets its own
  // time -> value map, then we align against the sorted timestamp set.
  const timestamps = new Set<number>();
  const seriesByKey = new Map<string, Map<number, number>>();
  for (const row of rows) {
    const ts = numberAt(row, timeIdx);
    timestamps.add(ts);
    const groupKey = groupIdxs.length === 0
      ? "value"
      : groupIdxs.map((g) => String(row[g] ?? "")).join(" / ");
    const valueSum = valueIdxs.reduce((acc, vi) => acc + numberAt(row, vi), 0);
    const slot = seriesByKey.get(groupKey) ?? new Map<number, number>();
    slot.set(ts, valueSum);
    seriesByKey.set(groupKey, slot);
  }

  const xs = [...timestamps].sort((a, b) => a - b);
  const seriesData: number[][] = [];
  const seriesDefs: uPlot.Series[] = [{}];
  let colorIdx = 0;
  for (const [label, values] of seriesByKey.entries()) {
    const line = xs.map((t) => values.get(t) ?? 0);
    seriesData.push(line);
    seriesDefs.push(uLine(label, SERIES_PALETTE[colorIdx % SERIES_PALETTE.length]));
    colorIdx += 1;
  }
  const aligned = [xs, ...seriesData] as uPlot.AlignedData;
  const options: Omit<uPlot.Options, "width" | "height"> = {
    series: seriesDefs,
    axes: defaultAxes(),
    scales: { x: { time: true } },
  };
  return { aligned, options };
}

function numberAt(row: ReadonlyArray<string | number>, idx: number): number {
  if (idx < 0) return 0;
  const raw = row[idx];
  if (typeof raw === "number") return raw;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : 0;
}
