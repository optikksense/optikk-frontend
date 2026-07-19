import type { LogsTrendBucket } from "@shared/logs/api/logsAnalyticsApi";
import { severityColor } from "@shared/logs/utils/severity";
import {
  TrendChart,
  type TrendChartBucket,
  type TrendChartSegment,
} from "@shared/search/components/trend/TrendChart";
import { memo, useMemo } from "react";
import { parseBucketMs } from "./logsTrendDataUtils";

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

const LOGS_SEGMENTS: readonly TrendChartSegment[] = [
  { key: "debug", label: "Debug", color: DEBUG_COLOR },
  { key: "info", label: "Info", color: INFO_COLOR },
  { key: "warn", label: "Warnings", color: WARN_COLOR },
  { key: "error", label: "Errors", color: ERROR_COLOR },
];

function LogsTrendChartComponent({ trend, onTimeRangeChange, minTimeMs, maxTimeMs }: Props) {
  const data = useMemo<readonly TrendChartBucket[] | undefined>(() => {
    if (!trend || trend.length === 0) return undefined;
    return trend
      .map((b, idx) => ({
        ts: parseBucketMs(b.timeBucket, idx),
        counts: {
          debug: b.debug,
          info: b.info,
          warn: b.warn,
          error: b.error,
        },
      }))
      .sort((a, b) => a.ts - b.ts);
  }, [trend]);

  return (
    <TrendChart
      title="Log Volume Over Time"
      segments={LOGS_SEGMENTS}
      data={data}
      minTimeMs={minTimeMs}
      maxTimeMs={maxTimeMs}
      onTimeRangeChange={onTimeRangeChange}
    />
  );
}

export const LogsTrendChart = memo(LogsTrendChartComponent);
