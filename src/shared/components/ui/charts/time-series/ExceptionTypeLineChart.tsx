import { memo, useMemo } from "react";

import { extractTimeseries } from "@shared/utils/chartDataUtils";

import ObservabilityChart from "../ObservabilityChart";

export default memo(function ExceptionTypeLineChart({
  serviceTimeseriesMap = {},
  selectedEndpoints = [],
  height = 280,
  fillHeight = false,
}: {
  serviceTimeseriesMap?: Record<string, Record<string, unknown>[]>;
  selectedEndpoints?: string[];
  height?: number;
  fillHeight?: boolean;
}) {
  const { timestamps, chartData } = useMemo(
    () =>
      extractTimeseries(
        [],
        serviceTimeseriesMap,
        selectedEndpoints,
        ["count", "value"],
        "Exceptions",
        "var(--chart-1)",
        false
      ),
    [serviceTimeseriesMap, selectedEndpoints]
  );

  if (timestamps.length === 0) {
    return (
      <div className="flex h-full min-h-0 items-center justify-center">
        <div style={{ color: "var(--text-muted)" }}>No exception data in selected time range</div>
      </div>
    );
  }

  return (
    <div className="relative h-full min-h-0">
      <ObservabilityChart
        timestamps={timestamps}
        series={chartData}
        yMin={0}
        yFormatter={(value) => (Number.isInteger(value) ? String(value) : value.toFixed(1))}
        height={height}
        fillHeight={fillHeight}
      />
    </div>
  );
});
