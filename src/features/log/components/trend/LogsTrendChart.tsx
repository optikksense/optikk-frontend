import ObservabilityChart, {
  type ObservabilityChartSeries,
} from "@shared/components/ui/charts/ObservabilityChart";
import { memo, useMemo } from "react";
import type { LogsTrendBucket } from "../../api/logsAnalyticsApi";
import { severityColor } from "../../utils/severity";
import { buildCumulativeSeries, prepareLogsTrendData } from "./logsTrendDataUtils";

interface Props {
  readonly trend: readonly LogsTrendBucket[] | undefined;
  readonly zoomed?: boolean;
  readonly onTimeRangeChange?: (fromMs: number, toMs: number) => void;
  readonly minTimeMs?: number;
  readonly maxTimeMs?: number;
}

const DEBUG_COLOR = severityColor(1);
const INFO_COLOR = severityColor(2);
const WARN_COLOR = severityColor(3);
const ERROR_COLOR = severityColor(4);

function compactY(v: number): string {
  if (v === 0) return "0";
  if (v >= 1000) return `${Math.round(v / 1000)}k`;
  return String(v);
}

function LogsTrendChartComponent({ trend, onTimeRangeChange, minTimeMs, maxTimeMs }: Props) {
  const chartData = useMemo(() => {
    const buckets = prepareLogsTrendData(trend);
    if (buckets.length === 0) return null;
    return buildCumulativeSeries(buckets);
  }, [trend]);

  const series = useMemo<ObservabilityChartSeries[]>(() => {
    if (!chartData) return [];
    const [, errSeries, warnSeries, infoSeries, debugSeries] = chartData;

    // Ordered from largest (drawn first in background) to smallest (drawn last in foreground)
    return [
      { label: "Errors", values: errSeries, color: ERROR_COLOR, fill: true },
      { label: "Warnings", values: warnSeries, color: WARN_COLOR, fill: true },
      { label: "Info", values: infoSeries, color: INFO_COLOR, fill: true },
      { label: "Debug", values: debugSeries, color: DEBUG_COLOR, fill: true },
    ];
  }, [chartData]);

  return (
    <div className="rounded-[8px] border border-[var(--line)] bg-[var(--bg-1)] pt-[14px] pr-[18px] pb-2 pl-[18px]">
      <div className="mb-2 flex items-center justify-between">
        <span className="font-semibold text-[var(--fg-0)] text-sm">Log Volume Over Time</span>
        <div className="flex gap-4">
          <span className="inline-flex items-center gap-1.5 text-[var(--fg-2)] text-xs">
            <i className="h-[7px] w-[7px] rounded-full" style={{ background: DEBUG_COLOR }} />
            Debug
          </span>
          <span className="inline-flex items-center gap-1.5 text-[var(--fg-2)] text-xs">
            <i className="h-[7px] w-[7px] rounded-full" style={{ background: INFO_COLOR }} />
            Info
          </span>
          <span className="inline-flex items-center gap-1.5 text-[var(--fg-2)] text-xs">
            <i className="h-[7px] w-[7px] rounded-full" style={{ background: WARN_COLOR }} />
            Warnings
          </span>
          <span className="inline-flex items-center gap-1.5 text-[var(--fg-2)] text-xs">
            <i className="h-[7px] w-[7px] rounded-full" style={{ background: ERROR_COLOR }} />
            Errors
          </span>
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
            timestamps={chartData[0]}
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

export const LogsTrendChart = memo(LogsTrendChartComponent);
