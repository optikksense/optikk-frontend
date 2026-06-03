import { useEffect, useMemo, useRef, useState } from "react";
import uPlot from "uplot";
import "uplot/dist/uPlot.min.css";

import { Surface } from "@/components/ui";
import ChartNoDataOverlay from "@shared/components/ui/feedback/ChartNoDataOverlay";
import { useChartTimeBuckets } from "@shared/hooks/useChartTimeBuckets";
import { alignChartData, tsMs } from "@shared/utils/chartDataUtils";
import { resolveThemeColor } from "@shared/utils/chartTheme";
import { useTheme } from "@store/appStore";

import type { PerformanceSeries } from "../hooks/useOverviewModel";

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
  const { timeBuckets } = useChartTimeBuckets();
  const theme = useTheme();
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<uPlot | null>(null);

  const [hoverState, setHoverState] = useState<{
    left: number;
    top: number;
    title?: string;
    rows: Array<{ label: string; value: string; color?: string }>;
  } | null>(null);

  const showEmpty = !loading && !series.hasRequests && !series.hasErrors;

  // Resolve dynamic colors based on theme
  const requestColor = useMemo(
    () => resolveThemeColor("var(--literal-hex-3b82f6)", "#3b82f6"),
    [theme]
  );
  const errorColor = useMemo(() => resolveThemeColor("var(--err)", "#ef4444"), [theme]);

  // Process data streams
  const timestamps = useMemo(() => timeBuckets.map((t) => tsMs(t) / 1000), [timeBuckets]);
  const reqValues = useMemo(
    () => alignChartData(series.requestRows, ["request_count", "value", "rps"], timeBuckets),
    [series.requestRows, timeBuckets]
  );
  const errValues = useMemo(
    () => alignChartData(series.errorRows, ["error_count"], timeBuckets),
    [series.errorRows, timeBuckets]
  );

  const alignedData = useMemo<uPlot.AlignedData>(
    () => [timestamps, reqValues, errValues],
    [timestamps, reqValues, errValues]
  );

  // Keep a mutable reference of data for uPlot cursor hooks
  const currentData = useRef<uPlot.AlignedData>(alignedData);
  currentData.current = alignedData;

  // Re-instantiate uPlot on mount, theme change, or empty state transitions
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
          values: (u: uPlot, splits: number[]) => splits.map(formatAxisValue),
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
  }, [showEmpty, theme, requestColor, errorColor]);

  // Data update effect
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
          {hoverState ? (
            <div
              className="pointer-events-none absolute z-20 min-w-[220px] rounded-[var(--card-radius)] border border-border bg-surface-overlay px-3 py-2 shadow-[var(--shadow-md)] backdrop-blur-[10px]"
              style={{ left: hoverState.left, top: hoverState.top }}
            >
              {hoverState.title ? (
                <div className="mb-2 font-semibold text-[11px] text-foreground-secondary">
                  {hoverState.title}
                </div>
              ) : null}
              <div className="flex flex-col gap-1.5">
                {hoverState.rows.map((row) => (
                  <div
                    key={row.label}
                    className="flex items-center justify-between gap-3 text-[11px]"
                  >
                    <div className="flex min-w-0 items-center gap-2">
                      <span
                        className="h-2 w-2 shrink-0 rounded-full"
                        style={{ backgroundColor: row.color ?? "var(--text-muted)" }}
                      />
                      <span className="truncate text-foreground-secondary">{row.label}</span>
                    </div>
                    <span className="shrink-0 font-mono text-foreground">{row.value}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      )}
    </Surface>
  );
}
