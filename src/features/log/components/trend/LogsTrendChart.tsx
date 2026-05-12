import { memo, useMemo } from "react";

import { TrendHistogramStrip } from "@/features/explorer/components/trend/TrendHistogramStrip";
import { LOG_TREND_SERIES } from "@/features/explorer/utils/trend";
import { aggregateSeverityTrend, toTrendBuckets } from "@/features/explorer/utils/trend";
import type { LogsTrendBucket } from "../../api/logsAnalyticsApi";

interface Props {
  readonly trend: readonly LogsTrendBucket[] | undefined;
  readonly zoomed?: boolean;
  readonly onTimeRangeChange?: (fromMs: number, toMs: number) => void;
  readonly minTimeMs?: number;
  readonly maxTimeMs?: number;
}

/** Severity-stacked trend histogram above the log table. Reuses the shared
 *  TrendHistogramStrip with the logs severity series palette. */
function LogsTrendChartComponent({ trend, zoomed, onTimeRangeChange, minTimeMs, maxTimeMs }: Props) {
  const buckets = useMemo(
    () => toTrendBuckets(aggregateSeverityTrend(trend)),
    [trend]
  );

  if (buckets.length === 0) return null;

  return (
    <TrendHistogramStrip
      buckets={buckets}
      series={LOG_TREND_SERIES}
      zoomed={zoomed}
      onTimeRangeChange={onTimeRangeChange}
      minTimeMs={minTimeMs}
      maxTimeMs={maxTimeMs}
    />
  );
}

export const LogsTrendChart = memo(LogsTrendChartComponent);
