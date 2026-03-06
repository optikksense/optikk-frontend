import { Spin } from 'antd';

import ConfigurableDashboard from './ConfigurableDashboard';
import DashboardStatCards from './DashboardStatCards';
import type { DataSourceSpec, DashboardComponentSpec, StatCardSpec } from '@/types/dashboardConfig';
import { useDataSourceFetcher } from '@hooks/useDataSourceFetcher';

interface TabLike {
  dataSources: DataSourceSpec[];
  statCards?: StatCardSpec[];
  charts: DashboardComponentSpec[];
}

interface DashboardTabContentProps {
  tab: TabLike;
  pathParams?: Record<string, string>;
}

/**
 * Renders a single tab's content: fetches its declared dataSources,
 * then renders statCards + charts driven entirely from config.
 */
export default function DashboardTabContent({ tab, pathParams }: DashboardTabContentProps) {
  const { data, isLoading } = useDataSourceFetcher(tab.dataSources, pathParams);

  return (
    <Spin spinning={isLoading}>
      {tab.statCards && tab.statCards.length > 0 && (
        <DashboardStatCards
          statCards={tab.statCards}
          dataSources={data}
          isLoading={isLoading}
        />
      )}
      <ConfigurableDashboard
        config={{ components: tab.charts }}
        dataSources={data}
        isLoading={isLoading}
      />
    </Spin>
  );
}
