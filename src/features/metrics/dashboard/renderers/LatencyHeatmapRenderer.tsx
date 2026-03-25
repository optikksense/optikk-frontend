import type {
  DashboardComponentSpec,
  DashboardDataSources,
} from '@/types/dashboardConfig';

import LatencyHeatmapChart from '@shared/components/ui/charts/specialized/LatencyHeatmapChart';
import { useDashboardData } from '@shared/components/ui/dashboard/hooks/useDashboardData';

/**
 *
 */
export function LatencyHeatmapRenderer({
  chartConfig,
  dataSources,
}: {
  chartConfig: DashboardComponentSpec;
  dataSources: DashboardDataSources;
}) {
  const { data } = useDashboardData(chartConfig, dataSources);

  return <LatencyHeatmapChart data={data} />;
}
