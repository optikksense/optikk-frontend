import { useEffect, useMemo, useRef } from "react";

import uPlot from "uplot";
import "uplot/dist/uPlot.min.css";

import { cn } from "@/lib/utils";

import type { ExplorerAnalyticsResult } from "../../api/explorerAnalyticsApi";
import { cellValue } from "../../utils/analyticsResult";

import "@/shared/components/ui/charts/uplot.css";

interface AnalyticsTimeseriesProps {
  result: ExplorerAnalyticsResult;
  className?: string;
}

export function AnalyticsTimeseries({
  result,
  className = "",
}: AnalyticsTimeseriesProps): JSX.Element {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const uRef = useRef<uPlot | null>(null);

  const { data, labels } = useMemo(() => {
    const { columns, rows } = result;
    if (!columns.includes("time_bucket") || rows.length === 0) {
      return { data: null as uPlot.AlignedData | null, labels: [] as string[] };
    }

    const timeIdx = columns.indexOf("time_bucket");
    const metricCols = columns.filter((c) => c !== "time_bucket");
    const times = [...new Set(rows.map((r) => String(cellValue(r, "time_bucket") ?? "")))].sort();

    const x = times.map((_, i) => i);
    const seriesKeys = metricCols.length > 0 ? metricCols : ["value"];
    const yArrays: number[][] = seriesKeys.map(() => times.map(() => 0));

    for (const row of rows) {
      const t = String(cellValue(row, "time_bucket") ?? "");
      const xi = times.indexOf(t);
      if (xi < 0) continue;
      seriesKeys.forEach((mk, si) => {
        const v = Number(cellValue(row, mk) ?? 0);
        yArrays[si][xi] = v;
      });
    }

    const aligned: uPlot.AlignedData = [x, ...yArrays];
    return { data: aligned, labels: seriesKeys };
  }, [result]);

  useEffect(() => {
    if (!rootRef.current || !data) return;

    const width = rootRef.current.clientWidth || 600;
    const height = 220;

    uRef.current?.destroy();
    uRef.current = new uPlot(
      {
        width,
        height,
        series: [
          {},
          ...labels.map((label, i) => ({
            label,
            stroke: `hsl(${180 + i * 35} 55% 55%)`,
            width: 1.5,
          })),
        ],
        axes: [
          {
            stroke: "rgba(255,255,255,0.2)",
            grid: { stroke: "rgba(255,255,255,0.06)" },
          },
          {
            stroke: "rgba(255,255,255,0.2)",
            grid: { stroke: "rgba(255,255,255,0.06)" },
          },
        ],
        scales: { x: { time: false } },
      },
      data,
      rootRef.current
    );

    return (): void => {
      uRef.current?.destroy();
      uRef.current = null;
    };
  }, [data, labels]);

  if (!data) {
    return (
      <div className={cn("text-[13px] text-[var(--text-muted)]", className)}>
        Timeseries needs a time_bucket column and metric columns.
      </div>
    );
  }

  return <div ref={rootRef} className={cn("min-h-[220px] w-full", className)} />;
}
