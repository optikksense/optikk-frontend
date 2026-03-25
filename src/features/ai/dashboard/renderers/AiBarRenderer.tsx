import type {
  DashboardComponentSpec,
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
  chartConfig: DashboardComponentSpec;
  dataSources: DashboardDataSources;
  extraContext?: DashboardExtraContext;
}) {
  return (
    <BarRenderer
      chartConfig={chartConfig}
      dataSources={dataSources}
      extraContext={extraContext}
    />
  );
}
