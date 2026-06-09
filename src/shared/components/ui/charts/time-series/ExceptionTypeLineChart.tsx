import { memo, useMemo } from "react";

import { tsMs } from "@shared/utils/chartDataUtils";
import { getChartColor } from "@shared/utils/charting";

import ObservabilityChart from "../ObservabilityChart";

export default memo(function ExceptionTypeLineChart({
  serviceTimeseriesMap = {},
  endpoints = [],
  selectedEndpoints = [],
  height = 280,
  fillHeight = false,
}: any) {
  const { timestamps, chartData } = useMemo(() => {
    const groupMap = serviceTimeseriesMap as Record<string, any[]>;
    const groups = Object.keys(groupMap);

    if (groups.length === 0) {
      return { timestamps: [], chartData: [] };
    }

    const activeGroups =
      selectedEndpoints.length > 0 ? groups.filter((g) => selectedEndpoints.includes(g)) : groups;

    const firstGroupRows = groupMap[activeGroups[0]] ?? [];
    const activeTimestamps = firstGroupRows
      .map((row) => tsMs(row.timestamp ?? row.time_bucket ?? row.timeBucket ?? "") / 1000)
      .filter((t) => !Number.isNaN(t));

    const seriesList = activeGroups.map((exceptionType, idx) => {
      const rows = groupMap[exceptionType] || [];
      const values = rows.map((row) => Number(row.count ?? row.value ?? 0));

      return {
        label: exceptionType,
        values,
        color: getChartColor(idx),
      };
    });

    return { timestamps: activeTimestamps, chartData: seriesList };
  }, [serviceTimeseriesMap, selectedEndpoints]);

  const maxVal = useMemo(() => {
    let max = 0;
    for (const s of chartData) {
      for (const v of s.values) {
        if (v > max) max = v;
      }
    }
    return max;
  }, [chartData]);

  const yMax = Math.max(Math.ceil(maxVal * 1.2), 1);

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
        yMax={yMax}
        yFormatter={(value) => (Number.isInteger(value) ? String(value) : value.toFixed(1))}
        height={height}
        fillHeight={fillHeight}
      />
    </div>
  );
});
