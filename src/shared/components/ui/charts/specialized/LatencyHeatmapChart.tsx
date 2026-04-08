import { Tooltip } from "@/components/ui";
import { useMemo } from "react";

import { APP_COLORS } from "@config/colorLiterals";

const LATENCY_BUCKETS = ["0-50ms", "50-100ms", "100-250ms", "250-500ms", "500ms-1s", ">1s"];

export interface LatencyHeatmapDataPoint {
  time_bucket: string | number;
  latency_bucket: string;
  span_count?: number;
}

interface LatencyHeatmapChartProps {
  data?: LatencyHeatmapDataPoint[];
}

/**
 * 2D latency heatmap: time on X axis, latency bucket on Y axis, color intensity = span count.
 * Props:
 *   data: Array<{ time_bucket, latency_bucket, span_count }>
 * @param props Component props.
 * @returns Heatmap chart for latency bucket density by time.
 */
export default function LatencyHeatmapChart({ data = [] }: LatencyHeatmapChartProps): JSX.Element {
  const timeBuckets = useMemo(() => [...new Set(data.map((d) => d.time_bucket))].sort(), [data]);

  const maxCount = useMemo(
    () => Math.max(...data.map((d) => Number(d.span_count) || 0), 1),
    [data]
  );

  const getColor = (count: number): string => {
    const n = Number(count) || 0;
    if (n === 0) return `var(--bg-secondary, ${APP_COLORS.hex_1a1a2e})`;
    const intensity = Math.min(n / maxCount, 1);
    // Interpolate from blue-teal (low) to deep red (high) via orange
    const r = Math.round(30 + intensity * 187);
    const g = Math.round(100 * (1 - intensity));
    const b = Math.round(180 * (1 - intensity));
    return `rgb(${r}, ${g}, ${b})`;
  };

  if (!data.length) {
    return (
      <div className="py-10 text-center text-[color:var(--text-muted)]">
        No latency data available
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 py-2">
      {/* Grid */}
      <div className="flex flex-col gap-0.5">
        {LATENCY_BUCKETS.map((lb) => (
          <div key={lb} className="flex items-center gap-1">
            {/* Y label */}
            <div className="w-20 min-w-[80px] whitespace-nowrap pr-2 text-right text-[11px] text-[color:var(--text-muted)]">
              {lb}
            </div>
            {/* Cells */}
            <div className="flex flex-1 gap-px">
              {timeBuckets.map((tb) => {
                const cell = data.find(
                  (d) => d.latency_bucket === lb && String(d.time_bucket) === String(tb)
                );
                const count = Number(cell?.span_count) || 0;
                return (
                  <Tooltip
                    key={String(tb)}
                    content={`${lb} @ ${new Date(tb).toLocaleTimeString()}: ${count.toLocaleString()} spans`}
                  >
                    <div
                      className="h-6 flex-1 cursor-default rounded-[2px] transition-[opacity,transform] duration-150 ease-out hover:scale-y-[1.15] hover:opacity-85"
                      style={{ background: getColor(count) }}
                    />
                  </Tooltip>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* X axis */}
      <div className="mt-0.5 flex items-start gap-1">
        <div className="w-20 min-w-[80px]" />
        <div className="flex flex-1 justify-between">
          {timeBuckets
            .filter((_, i) => i % Math.max(1, Math.floor(timeBuckets.length / 8)) === 0)
            .map((tb) => (
              <span
                key={String(tb)}
                className="whitespace-nowrap text-[10px] text-[color:var(--text-muted)]"
              >
                {new Date(tb).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </span>
            ))}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-1 flex items-center gap-2 pl-[84px]">
        <span className="text-[color:var(--text-muted)] text-xs">Low</span>
        <div
          className="h-2 max-w-[160px] flex-1 rounded"
          style={{
            background:
              "linear-gradient(to right, var(--literal-rgb-30-100-180), var(--literal-rgb-130-50-90), var(--literal-rgb-217-0-0))",
          }}
        />
        <span className="text-[color:var(--text-muted)] text-xs">High</span>
      </div>
    </div>
  );
}
