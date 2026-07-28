import { useMemo } from "react";

import LatencyHeatmapChart, {
  type LatencyHeatmapDataPoint,
} from "@shared/components/ui/charts/specialized/LatencyHeatmapChart";
import type { DashboardPanelRendererProps } from "@shared/components/ui/dashboard/dashboardPanelRegistry";
import { useDashboardData } from "@shared/components/ui/dashboard/hooks/useDashboardData";

/**
 *
 */
export function LatencyHeatmapRenderer({
  chartConfig,
  dataSources,
  fillHeight: _fillHeight,
}: DashboardPanelRendererProps) {
  const { data } = useDashboardData(chartConfig, dataSources);
  const chartData = useMemo<LatencyHeatmapDataPoint[]>(
    () =>
      data
        .map((row) => ({
          timeBucket: String(row.timeBucket ?? row.timestamp ?? ""),
          latencyBucket: String(row.latencyBucket ?? row.bucket ?? ""),
          spanCount: Number(row.spanCount ?? row.value ?? 0),
        }))
        .filter((row) => row.timeBucket && row.latencyBucket),
    [data]
  );

  return (
    <div className="h-full min-h-0 overflow-auto">
      <LatencyHeatmapChart data={chartData} />
    </div>
  );
}
