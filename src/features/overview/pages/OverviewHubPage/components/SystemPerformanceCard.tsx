import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import uPlot from "uplot";
import "uplot/dist/uPlot.min.css";

import { Surface } from "@shared/components/primitives/ui";
import ChartNoDataOverlay from "@shared/components/ui/feedback/ChartNoDataOverlay";
import { resolveThemeColor } from "@shared/utils/chartTheme";

import type { PerformanceSeries } from "../hooks/useOverviewModel";
import { usePerformanceChartData } from "../hooks/usePerformanceChartData";
import { type HoverState, SystemPerformanceTooltip } from "./SystemPerformanceTooltip";

const CHART_HEIGHT = 200;

interface Props {
  readonly series: PerformanceSeries;
  readonly loading: boolean;
}

function formatAxisValue(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) return "—";
  const abs = Math.abs(value);
  if (abs >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `${(value / 1_000).toFixed(1)}k`;
  return String(Math.round(value));
}

export default function SystemPerformanceCard({ series, loading }: Props) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<uPlot | null>(null);

  const [hoverState, setHoverState] = useState<HoverState | null>(null);

  const showEmpty = !loading && !series.hasRequests && !series.hasErrors;

  // Resolve dynamic colors based on theme
  const requestColor = useMemo(() => resolveThemeColor("var(--literal-hex-3b82f6)", "#3b82f6"), []);
  const errorColor = useMemo(() => resolveThemeColor("var(--err)", "#ef4444"), []);

  const alignedData = usePerformanceChartData(series);

  const currentData = useRef<uPlot.AlignedData>(alignedData);
  useLayoutEffect(() => {
    currentData.current = alignedData;
  }, [alignedData]);

  useEffect(() => {
    const el = chartContainerRef.current;
    if (!el || showEmpty) return;

    const labelColor = resolveThemeColor("--chart-axis", "#b9c0cf");
    const gridColor = resolveThemeColor("--chart-grid", "rgba(20, 26, 36, 0.08)");

    const requestFill = requestColor.startsWith("#") ? `${requestColor}1E` : undefined;

    const opts: uPlot.Options = {
      width: el.clientWidth || 400,
      height: CHART_HEIGHT,
      padding: [10, 12, 4, 0],
      legend: { show: false },
      scales: {
        y: { min: 0 },
      },
      cursor: {
        drag: { x: true, y: false, setScale: true },
      },
      series: [
        {},
        {
          label: "Requests",
          stroke: requestColor,
          width: 2,
          fill: requestFill,
          points: { show: false },
        },
        {
          label: "Errors",
          stroke: errorColor,
          width: 1.5,
          points: { show: false },
        },
      ],
      axes: [
        {
          stroke: labelColor,
          grid: { stroke: gridColor, width: 1 },
          ticks: { show: false },
          font: "11px Inter, sans-serif",
          gap: 8,
          values: (u: uPlot, splits: number[]) => {
            const minTs = u.scales.x.min ?? splits[0] ?? 0;
            const maxTs = u.scales.x.max ?? splits[splits.length - 1] ?? 0;
            const rangeS = maxTs - minTs;

            return splits.map((ts, idx) => {
              const d = new Date(ts * 1000);
              if (rangeS <= 3600) {
                return d.toLocaleTimeString(undefined, {
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                  hour12: false,
                });
              }
              if (rangeS <= 86400) {
                const time = d.toLocaleTimeString(undefined, {
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: false,
                });
                if (idx === 0) {
                  const date = d.toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                  });
                  return `${date} ${time}`;
                }
                return time;
              }
              if (rangeS <= 3 * 86400) {
                return d.toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: false,
                });
              }
              if (rangeS <= 14 * 86400) {
                return d.toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                });
              }
              return d.toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
              });
            });
          },
        },
        {
          stroke: labelColor,
          grid: { stroke: gridColor, width: 1 },
          ticks: { show: false },
          font: "11px Inter, sans-serif",
          size: 60,
          gap: 8,
          values: (_u: uPlot, splits: number[]) => splits.map(formatAxisValue),
        },
      ],
      hooks: {
        setCursor: [
          (u: uPlot) => {
            const idx = u.cursor.idx;
            if (idx == null || idx < 0) {
              setHoverState(null);
              return;
            }

            const timestampSeconds = currentData.current[0][idx];
            if (timestampSeconds == null) {
              setHoverState(null);
              return;
            }

            const title = new Intl.DateTimeFormat(undefined, {
              month: "short",
              day: "numeric",
              hour: "numeric",
              minute: "2-digit",
            }).format(new Date(timestampSeconds * 1000));

            const rows = [
              {
                label: "Requests",
                value:
                  currentData.current[1][idx] != null && !Number.isNaN(currentData.current[1][idx])
                    ? currentData.current[1][idx]!.toLocaleString()
                    : "—",
                color: requestColor,
              },
              {
                label: "Errors",
                value:
                  currentData.current[2][idx] != null && !Number.isNaN(currentData.current[2][idx])
                    ? currentData.current[2][idx]!.toLocaleString()
                    : "—",
                color: errorColor,
              },
            ];

            const containerWidth = el.clientWidth ?? 0;
            const tooltipWidth = 220;
            const rawLeft = (u.cursor.left ?? 0) + 14;
            const left = Math.min(
              Math.max(rawLeft, 12),
              Math.max(containerWidth - tooltipWidth, 12)
            );
            const top = Math.max((u.cursor.top ?? 0) + 12, 12);

            setHoverState({ left, top, title, rows });
          },
        ],
      },
    };

    const chart = new uPlot(opts, currentData.current, el);
    chartRef.current = chart;

    const handleMouseLeave = () => setHoverState(null);
    el.addEventListener("mouseleave", handleMouseLeave);

    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const w = entry.contentRect.width;
        if (w > 0 && chartRef.current) {
          chartRef.current.setSize({ width: w, height: CHART_HEIGHT });
        }
      }
    });
    ro.observe(el);

    return () => {
      el.removeEventListener("mouseleave", handleMouseLeave);
      ro.disconnect();
      chart.destroy();
      chartRef.current = null;
    };
  }, [showEmpty, requestColor, errorColor]);

  useEffect(() => {
    const chart = chartRef.current;
    if (chart && !showEmpty) {
      chart.setData(alignedData, true);
    }
  }, [alignedData, showEmpty]);

  return (
    <Surface elevation={1} padding="md" className="relative flex flex-col gap-3">
      <div className="flex items-end justify-between">
        <div>
          <div className="font-semibold text-[13px] text-foreground">System performance</div>
          <div className="text-[11px] text-foreground-muted">
            Requests and errors over the selected time range
          </div>
        </div>
        <div className="flex items-center gap-3 text-[11px] text-foreground-muted">
          <span className="flex items-center gap-1.5">
            <span className="h-0.5 w-3" style={{ backgroundColor: requestColor }} />
            requests
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-0.5 w-3" style={{ backgroundColor: errorColor }} />
            errors
          </span>
        </div>
      </div>

      {showEmpty ? (
        <div className="h-[200px]">
          <ChartNoDataOverlay />
        </div>
      ) : (
        <div ref={chartContainerRef} className="relative w-full" style={{ height: CHART_HEIGHT }}>
          {hoverState ? <SystemPerformanceTooltip hoverState={hoverState} /> : null}
        </div>
      )}
    </Surface>
  );
}
