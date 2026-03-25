import { useMemo } from 'react';

import type {
  DashboardComponentSpec,
  DashboardDataSources,
} from '@/types/dashboardConfig';

import ServiceGraph from '@shared/components/ui/charts/specialized/ServiceGraph';
import { useDashboardData } from '@shared/components/ui/dashboard/hooks/useDashboardData';

/**
 *
 */
export function ServiceMapRenderer({
  chartConfig,
  dataSources,
}: {
  chartConfig: DashboardComponentSpec;
  dataSources: DashboardDataSources;
}) {
  const { rawData } = useDashboardData(chartConfig, dataSources);
  const nodes = useMemo(() => (rawData as any)?.nodes ?? [], [rawData]);
  const edges = useMemo(() => (rawData as any)?.edges ?? [], [rawData]);

  if (nodes.length === 0) {
    return <div className="text-muted" style={{ textAlign: 'center', padding: 32 }}>No data</div>;
  }
  return (
    <div style={{ height: '100%' }}>
      <ServiceGraph nodes={nodes} edges={edges} />
    </div>
  );
}
