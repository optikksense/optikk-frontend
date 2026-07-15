import ObservabilityChart, {
  type ObservabilityChartSeries,
} from "@shared/components/ui/charts/ObservabilityChart";
import { memo, useMemo } from "react";

export interface TrendChartSegment {
  key: string;
  label: string;
  color: string;
}

export interface TrendChartBucket {
  ts: number;
  counts: Record<string, number>;
}

interface TrendChartProps {
  title: string;
  segments: readonly TrendChartSegment[]; // Ordered visually from bottom to top of the stack
  data: readonly TrendChartBucket[] | undefined;
  minTimeMs?: number;
  maxTimeMs?: number;
  onTimeRangeChange?: (fromMs: number, toMs: number) => void;
}

function compactY(v: number): string {
  if (v === 0) return "0";
  if (v >= 1000) return `${Math.round(v / 1000)}k`;
  return String(v);
}

function TrendChartComponent({
  title,
  segments,
  data,
  minTimeMs,
  maxTimeMs,
  onTimeRangeChange,
}: TrendChartProps) {
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return null;
    
    // Build cumulative series based on segment order (bottom to top).
    // The series that encompasses all counts must be drawn first (in the background).
    const timestamps: number[] = [];
    const seriesValues: number[][] = segments.map(() => []);

    for (const b of data) {
      timestamps.push(b.ts / 1000);
      let cumulative = 0;
      for (let i = 0; i < segments.length; i++) {
        const seg = segments[i];
        cumulative += b.counts[seg.key] ?? 0;
        seriesValues[i].push(cumulative);
      }
    }

    return [timestamps, ...seriesValues];
  }, [data, segments]);

  const series = useMemo<ObservabilityChartSeries[]>(() => {
    if (!chartData) return [];
    
    // chartData is [timestamps, segment0_cumulative, segment1_cumulative, ...]
    // We want to draw the largest cumulative series first (which is the last segment).
    const out: ObservabilityChartSeries[] = [];
    for (let i = segments.length - 1; i >= 0; i--) {
      const seg = segments[i];
      out.push({
        label: seg.label,
        values: chartData[i + 1] as number[],
        color: seg.color,
        fill: true,
      });
    }
    return out;
  }, [chartData, segments]);

  return (
    <div className="rounded-[8px] border border-[var(--line)] bg-[var(--bg-1)] pt-[14px] pr-[18px] pb-2 pl-[18px]">
      <div className="mb-2 flex items-center justify-between">
        <span className="font-semibold text-[var(--fg-0)] text-sm">{title}</span>
        <div className="flex gap-4">
          {segments.map((seg) => (
            <span key={seg.key} className="inline-flex items-center gap-1.5 text-[var(--fg-2)] text-xs">
              <i className="h-[7px] w-[7px] rounded-full" style={{ background: seg.color }} />
              {seg.label}
            </span>
          ))}
        </div>
      </div>

      <div className="h-[180px] w-full">
        {!chartData ? (
          <div className="flex h-full items-center justify-center text-[var(--fg-3)] text-sm">
            —
          </div>
        ) : (
          <ObservabilityChart
            type="bar"
            timestamps={chartData[0] as number[]}
            series={series}
            yFormatter={compactY}
            xMin={minTimeMs ? minTimeMs / 1000 : undefined}
            xMax={maxTimeMs ? maxTimeMs / 1000 : undefined}
            onTimeBrush={onTimeRangeChange}
            yAxisSize={40}
            fillHeight
          />
        )}
      </div>
    </div>
  );
}

export const TrendChart = memo(TrendChartComponent);
