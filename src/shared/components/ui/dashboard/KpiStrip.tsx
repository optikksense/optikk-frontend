import type {
  DashboardDataSources,
  DashboardExtraContext,
  DashboardPanelSpec,
} from '@/types/dashboardConfig';

import type { ApiErrorShape } from '@shared/api/api/interceptors/errorInterceptor';

import ConfigurableChartCard from './ConfigurableChartCard';

interface KpiStripProps {
  panels: DashboardPanelSpec[];
  dataSources: DashboardDataSources;
  errors: Record<string, ApiErrorShape | null>;
  isLoading: boolean;
  extraContext: DashboardExtraContext;
}

export default function KpiStrip(props: KpiStripProps) {
  const orderedPanels = [...props.panels].sort((left, right) => {
    if (left.order === right.order) {
      return left.id.localeCompare(right.id);
    }
    return left.order - right.order;
  });

  return (
    <div className="grid grid-cols-1 gap-[var(--space-md)] md:grid-cols-2 xl:grid-cols-4">
      {orderedPanels.map((panelConfig) => (
        <div key={panelConfig.id} className="min-h-[152px] min-w-0">
          <ConfigurableChartCard
            componentConfig={panelConfig}
            dataSources={props.dataSources}
            error={props.errors[panelConfig.id] ?? null}
            isLoading={props.isLoading}
            extraContext={props.extraContext}
          />
        </div>
      ))}
    </div>
  );
}
