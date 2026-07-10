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
          time_bucket: String(row.time_bucket ?? row.timestamp ?? ""),
          latency_bucket: String(row.latency_bucket ?? row.bucket ?? ""),
          span_count: Number(row.span_count ?? row.value ?? 0),
        }))
        .filter((row) => row.time_bucket && row.latency_bucket),
    [data]
  );

  return (
    <div className="h-full min-h-0 overflow-auto">
      <LatencyHeatmapChart data={chartData} />
    </div>
  );
}
