import { useMemo } from 'react';

import type { DashboardPanelSpec, DashboardDataSources } from '@/types/dashboardConfig';

import LatencyHeatmapChart, {
  type LatencyHeatmapDataPoint,
} from '@shared/components/ui/charts/specialized/LatencyHeatmapChart';
import { useDashboardData } from '@shared/components/ui/dashboard/hooks/useDashboardData';

/**
 *
 */
export function LatencyHeatmapRenderer({
  chartConfig,
  dataSources,
}: {
  chartConfig: DashboardPanelSpec;
  dataSources: DashboardDataSources;
}) {
  const { data } = useDashboardData(chartConfig, dataSources);
  const chartData = useMemo<LatencyHeatmapDataPoint[]>(
    () =>
      data
        .map((row) => ({
          time_bucket: String(row.time_bucket ?? row.timestamp ?? ''),
          latency_bucket: String(row.latency_bucket ?? row.bucket ?? ''),
          span_count: Number(row.span_count ?? row.value ?? 0),
        }))
        .filter((row) => row.time_bucket && row.latency_bucket),
    [data]
  );

  return <LatencyHeatmapChart data={chartData} />;
}
