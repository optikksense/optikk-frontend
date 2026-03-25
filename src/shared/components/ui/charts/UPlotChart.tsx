import { useEffect, useRef, useMemo } from 'react';
import uPlot from 'uplot';
import 'uplot/dist/uPlot.min.css';
import './uplot.css';

import { useChartTimeBuckets } from '@shared/hooks/useChartTimeBuckets';
import { resolveThemeColor } from '@shared/utils/chartTheme';
import { cn } from '@/lib/utils';

export interface UPlotChartProps {
  options: Omit<uPlot.Options, 'width' | 'height'>;
  data: uPlot.AlignedData;
  height?: number;
  fillHeight?: boolean;
  className?: string;
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
}: UPlotChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<uPlot | null>(null);

  // Memoize the merged options to avoid unnecessary re-renders
  const mergedOptions = useMemo(() => ({
    ...options,
    width: 100, // will be resized immediately
    height: fillHeight ? Math.max(height, 180) : height,
    cursor: {
      drag: { x: true, y: false, setScale: true },
      ...options.cursor,
    },
  }), [options, height, fillHeight]);

  useEffect(() => {
    if (!containerRef.current) return;

    const el = containerRef.current;
    const measuredHeight = fillHeight
      ? Math.max(el.clientHeight || height, 180)
      : height;
    const opts = { ...mergedOptions, width: el.clientWidth, height: measuredHeight };

    chartRef.current = new uPlot(opts, data, el);

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

    return () => {
      ro.disconnect();
      chartRef.current?.destroy();
      chartRef.current = null;
    };
  }, [mergedOptions, data, height, fillHeight]);

  return (
    <div
      ref={containerRef}
      className={cn('uplot-shell w-full', fillHeight && 'h-full', className)}
    />
  );
}

// ── Shared helpers for building uPlot options ──────────────────────────────

/** Default axis styling matching the app's dark theme. */
export function defaultAxes(config?: { yAxisSize?: number }): uPlot.Axis[] {
  const gridColor = resolveThemeColor('--border-light', 'rgba(255,255,255,0.08)');
  const labelColor = resolveThemeColor('--text-secondary', '#8e96a9');
  const font = '12px Inter, sans-serif';
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
  opts?: { fill?: boolean; dash?: number[]; width?: number },
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
    paths: uPlot.paths.bars!({ size: [0.6, 100], radius: 2 }),
  };
}

/** Re-export the time bucket hook for chart consumers. */
export { useChartTimeBuckets };
