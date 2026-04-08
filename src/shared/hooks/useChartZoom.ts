import { useCallback } from "react";

import { useAppStore } from "@store/appStore";

/**
 * Hook that provides an ECharts onEvents handler for chart zoom.
 * When a user brush-selects a time region on a chart, the global time range
 * is updated to the selected region.
 *
 * Usage:
 *   const { onChartEvents } = useChartZoom(timestamps);
 *   <ReactECharts onEvents={onChartEvents} ... />
 *
 * @param timestamps Array of timestamps (ms or ISO strings) corresponding to x-axis data points
 */
export function useChartZoom(timestamps: (number | string)[]) {
  const setCustomTimeRange = useAppStore((s) => s.setCustomTimeRange);

  const handleDataZoom = useCallback(
    (params: any) => {
      if (!timestamps.length) return;

      // ECharts brush zoom event
      const batch = params.batch?.[0] ?? params;
      const startIdx = Math.max(0, Math.floor(((batch.start ?? 0) / 100) * timestamps.length));
      const endIdx = Math.min(
        timestamps.length - 1,
        Math.ceil(((batch.end ?? 100) / 100) * timestamps.length)
      );

      const startTs =
        typeof timestamps[startIdx] === "string"
          ? new Date(timestamps[startIdx]).getTime()
          : (timestamps[startIdx] as number);
      const endTs =
        typeof timestamps[endIdx] === "string"
          ? new Date(timestamps[endIdx]).getTime()
          : (timestamps[endIdx] as number);

      if (Number.isFinite(startTs) && Number.isFinite(endTs) && startTs < endTs) {
        setCustomTimeRange(startTs, endTs);
      }
    },
    [timestamps, setCustomTimeRange]
  );

  return {
    onChartEvents: {
      datazoom: handleDataZoom,
    },
  };
}
