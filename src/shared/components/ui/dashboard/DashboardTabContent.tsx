import { Alert } from 'antd';

import type { ComponentGroup, DashboardComponentSpec } from '@/types/dashboardConfig';

import { useComponentDataFetcher } from '@shared/hooks/useComponentDataFetcher';

import ConfigurableDashboard from './ConfigurableDashboard';

interface DashboardTabContentProps {
  components: DashboardComponentSpec[];
  groups?: ComponentGroup[];
  pathParams?: Record<string, string>;
}

/**
 * Renders a single tab's content by fetching each component's query contract.
 */
export default function DashboardTabContent({
  components,
  groups,
  pathParams,
}: DashboardTabContentProps) {
  const { data, isLoading, hasError, failedRequests } = useComponentDataFetcher(components, pathParams);

  return (
    <div className="dashboard-tab-content page-section">
      {hasError && (
        <div style={{ marginBottom: 16 }}>
          <Alert
            type="error"
            showIcon
            message="Some dashboard data could not be loaded"
            description={failedRequests
              .map((request) => `${request.method} ${request.endpoint}: ${request.error.message}`)
              .join(' ')}
          />
        </div>
      )}
      <ConfigurableDashboard
        config={{ components, groups }}
        dataSources={data}
        isLoading={isLoading}
      />
    </div>
  );
}
