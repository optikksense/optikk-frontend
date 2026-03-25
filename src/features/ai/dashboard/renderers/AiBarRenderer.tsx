import type {
  DashboardPanelSpec,
  DashboardDataSources,
  DashboardExtraContext,
} from '@/types/dashboardConfig';

import { BarRenderer } from '@shared/components/ui/dashboard/renderers/BarRenderer';

/**
 *
 */
export function AiBarRenderer({
  chartConfig,
  dataSources,
  extraContext,
}: {
  chartConfig: DashboardPanelSpec;
  dataSources: DashboardDataSources;
  extraContext?: DashboardExtraContext;
}) {
  return (
    <BarRenderer chartConfig={chartConfig} dataSources={dataSources} extraContext={extraContext} />
  );
}
