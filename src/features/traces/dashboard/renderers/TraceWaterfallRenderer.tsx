import type {
  DashboardComponentSpec,
  DashboardDataSources,
} from '@/types/dashboardConfig';

import WaterfallChart from '@shared/components/ui/charts/specialized/WaterfallChart';
import { useDashboardData } from '@shared/components/ui/dashboard/hooks/useDashboardData';

/**
 *
 */
export function TraceWaterfallRenderer({
  chartConfig,
  dataSources,
}: {
  chartConfig: DashboardComponentSpec;
  dataSources: DashboardDataSources;
}) {
  const { data: spans } = useDashboardData(chartConfig, dataSources);

  if (spans.length === 0) {
    return <div className="text-muted" style={{ textAlign: 'center', padding: 32 }}>No data</div>;
  }
  return (
    <div style={{ height: '100%', overflow: 'auto' }}>
      <WaterfallChart spans={spans} />
    </div>
  );
}
