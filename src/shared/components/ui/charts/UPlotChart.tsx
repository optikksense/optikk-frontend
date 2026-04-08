import { useEffect, useMemo, useRef, useState } from "react";
import uPlot from "uplot";
import "uplot/dist/uPlot.min.css";
import "./uplot.css";

import { cn } from "@/lib/utils";
import { useChartTimeBuckets } from "@shared/hooks/useChartTimeBuckets";
import { resolveThemeColor } from "@shared/utils/chartTheme";

export interface UPlotChartProps {
  options: Omit<uPlot.Options, "width" | "height">;
  data: uPlot.AlignedData;
  height?: number;
  fillHeight?: boolean;
  className?: string;
  /** Pass a shared uPlot.SyncPubSub instance to synchronize cursors across charts */
  syncKey?: uPlot.SyncPubSub;
  /** Called when user drag-selects a time range on the chart */
  onTimeBrush?: (startMs: number, endMs: number) => void;
  tooltipContent?: (params: { u: uPlot; idx: number; data: uPlot.AlignedData }) => {
    title?: string;
    rows: Array<{ label: string; value: string; color?: string }>;
  } | null;
}

function seriesLikeLength(value: unknown): number {
  if (value == null) return 0;
  if (Array.isArray(value)) return value.length;
  if (typeof (value as ArrayLike<number>).length === "number") {
    return (value as ArrayLike<number>).length;
  }
  return 0;
}

function isAlignedDataShapeCompatible(next: uPlot.AlignedData, prev: uPlot.AlignedData): boolean {
  if (next.length !== prev.length) return false;
  for (let i = 0; i < next.length; i += 1) {
    if (seriesLikeLength(next[i]) !== seriesLikeLength(prev[i])) return false;
  }
  return true;
}

/**
 * Generic uPlot wrapper with auto-resize, theme-aware defaults, and cleanup.
 */
export default function UPlotChart({
  options,
  data,
  height = 260,
  fillHeight = false,
  className,
  syncKey,
  onTimeBrush,
  tooltipContent,
}: UPlotChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<uPlot | null>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);
  /** Latest series for tooltips / hooks without re-merging options on every data tick */
  const dataRef = useRef(data);
  dataRef.current = data;

  const [hoverState, setHoverState] = useState<{
    left: number;
    top: number;
    title?: string;
    rows: Array<{ label: string; value: string; color?: string }>;
  } | null>(null);

  /** When this changes, uPlot options/geometry must be rebuilt (not just setData). */
  const structureKey = useMemo(
    () =>
      [
        options.series?.length ?? 0,
        height,
        fillHeight ? 1 : 0,
        syncKey?.key ?? "",
        tooltipContent ? 1 : 0,
        onTimeBrush ? 1 : 0,
      ].join(":"),
    [options.series?.length, height, fillHeight, syncKey, tooltipContent, onTimeBrush]
  );

  // Memoize the merged options to avoid unnecessary re-renders
  const mergedOptions = useMemo(() => {
    const existingHooks = options.hooks ?? {};
    const setCursorHooks = existingHooks.setCursor ?? [];

    return {
      ...options,
      width: 100, // will be resized immediately
      height: fillHeight ? Math.max(height, 180) : height,
      cursor: {
        drag: { x: true, y: false, setScale: !onTimeBrush },
        sync: syncKey ? { key: syncKey.key } : undefined,
        ...options.cursor,
      },
      hooks: {
        ...existingHooks,
        setSelect: [
          ...(existingHooks.setSelect ?? []),
          ...(onTimeBrush
            ? [
                (u: uPlot) => {
                  const left = u.select.left;
                  const width = u.select.width;
                  if (width < 10) return; // ignore tiny drags
                  const startMs = u.posToVal(left, "x") * 1000;
                  const endMs = u.posToVal(left + width, "x") * 1000;
                  if (startMs < endMs) onTimeBrush(startMs, endMs);
                  // Reset the selection rectangle
                  u.setSelect({ left: 0, width: 0, top: 0, height: 0 }, false);
                },
              ]
            : []),
        ],
        setCursor: [
          ...setCursorHooks,
          (u: uPlot) => {
            if (!tooltipContent || !containerRef.current) {
              return;
            }

            const idx = u.cursor.idx;
            if (idx == null || idx < 0) {
              setHoverState(null);
              return;
            }

            const content = tooltipContent({ u, idx, data: dataRef.current });
            if (!content || content.rows.length === 0) {
              setHoverState(null);
              return;
            }

            const containerWidth = containerRef.current.clientWidth;
            const tooltipWidth = 220;
            const rawLeft = (u.cursor.left ?? 0) + 14;
            const left = Math.min(
              Math.max(rawLeft, 12),
              Math.max(containerWidth - tooltipWidth, 12)
            );
            const top = Math.max((u.cursor.top ?? 0) + 12, 12);

            setHoverState({
              left,
              top,
              title: content.title,
              rows: content.rows,
            });
          },
        ],
      },
    };
  }, [options, height, fillHeight, tooltipContent, syncKey, onTimeBrush]);

  /** Bumps when `data` series shape changes so the structural effect rebuilds the chart. */
  const [dataLayoutVersion, setDataLayoutVersion] = useState(0);

  /** Mount / rebuild chart when structure/options change. `data` is not a dep — data-only updates use `setData` in a separate effect. */
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    if (resizeObserverRef.current) {
      resizeObserverRef.current.disconnect();
      resizeObserverRef.current = null;
    }
    chartRef.current?.destroy();
    chartRef.current = null;

    const measuredHeight = fillHeight ? Math.max(el.clientHeight || height, 180) : height;
    const opts = { ...mergedOptions, width: el.clientWidth, height: measuredHeight };

    chartRef.current = new uPlot(opts, dataRef.current, el);

    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const w = entry.contentRect.width;
        if (w > 0 && chartRef.current) {
          const nextHeight = fillHeight
            ? Math.max(entry.contentRect.height || height, 180)
            : height;
          chartRef.current.setSize({ width: w, height: nextHeight });
        }
      }
    });
    ro.observe(el);
    resizeObserverRef.current = ro;

    const handleMouseLeave = () => setHoverState(null);
    el.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      el.removeEventListener("mouseleave", handleMouseLeave);
      ro.disconnect();
      resizeObserverRef.current = null;
      chartRef.current?.destroy();
      chartRef.current = null;
    };
  }, [mergedOptions, height, fillHeight, structureKey, dataLayoutVersion]);

  /** Data-only refetch: update series in place without destroying the canvas. */
  useEffect(() => {
    const u = chartRef.current;
    if (!u) return;
    if (!isAlignedDataShapeCompatible(data, u.data as uPlot.AlignedData)) {
      setDataLayoutVersion((v) => v + 1);
      return;
    }
    u.setData(data, false);
  }, [data]);

  return (
    <div
      ref={containerRef}
      className={cn("uplot-shell relative w-full", fillHeight && "h-full", className)}
    >
      {hoverState ? (
        <div
          className="pointer-events-none absolute z-20 min-w-[220px] rounded-[var(--card-radius)] border border-[var(--border-color)] bg-[rgba(20,23,31,0.96)] px-3 py-2 shadow-[var(--shadow-md)] backdrop-blur-[10px]"
          style={{ left: hoverState.left, top: hoverState.top }}
        >
          {hoverState.title ? (
            <div className="mb-2 font-semibold text-[11px] text-[var(--text-secondary)]">
              {hoverState.title}
            </div>
          ) : null}
          <div className="flex flex-col gap-1.5">
            {hoverState.rows.map((row) => (
              <div key={row.label} className="flex items-center justify-between gap-3 text-[11px]">
                <div className="flex min-w-0 items-center gap-2">
                  <span
                    className="h-2 w-2 shrink-0 rounded-full"
                    style={{ backgroundColor: row.color ?? "var(--text-muted)" }}
                  />
                  <span className="truncate text-[var(--text-secondary)]">{row.label}</span>
                </div>
                <span className="shrink-0 font-mono text-[var(--text-primary)]">{row.value}</span>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

/** Default axis styling matching the app's dark theme. */
export function defaultAxes(config?: { yAxisSize?: number }): uPlot.Axis[] {
  const gridColor = resolveThemeColor("--border-light", "rgba(255,255,255,0.08)");
  const labelColor = resolveThemeColor("--text-secondary", "#8e96a9");
  const font = "12px Inter, sans-serif";
  const yAxisSize = config?.yAxisSize ?? 60;

  return [
    {
      stroke: labelColor,
      grid: { stroke: gridColor, width: 1 },
      ticks: { show: false },
      font,
      gap: 10,
    },
    {
      stroke: labelColor,
      grid: { stroke: gridColor, width: 1 },
      ticks: { show: false },
      font,
      size: yAxisSize,
      gap: 10,
    },
  ];
}

/** Build a line series config for uPlot. */
export function uLine(
  label: string,
  color: string,
  opts?: { fill?: boolean; dash?: number[]; width?: number }
): uPlot.Series {
  return {
    label,
    stroke: color,
    width: opts?.width ?? 1.85,
    fill: opts?.fill ? `${color}14` : undefined,
    dash: opts?.dash,
    points: { show: false },
  };
}

/** Build a bars series config for uPlot. */
export function uBars(label: string, color: string): uPlot.Series {
  return {
    label,
    stroke: color,
    fill: `${color}CC`,
    points: { show: false },
    paths: uPlot.paths.bars?.({ size: [0.6], radius: 2 }),
  };
}

/** Re-export the time bucket hook for chart consumers. */
export { useChartTimeBuckets };
