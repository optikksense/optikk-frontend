import { Skeleton } from 'antd';
import { Navigate, useLocation } from 'react-router-dom';

import AiObservabilityPage from '@/pages/ai';
import InfrastructureHubPage from '@/pages/infrastructure';
import LogsHubPage from '@/pages/logs';
import ServicesPage from '@/pages/services';
import TracesPage from '@/pages/traces';
import MetricsPage from '@/features/metrics/pages/MetricsPage';
import { ROUTES } from '@/shared/constants/routes';

import { DashboardPage } from '@shared/components/ui';

import { usePagesConfig } from '@shared/hooks/usePagesConfig';

const CUSTOM_SHELLS = {
  'ai-observability': AiObservabilityPage,
  infrastructure: InfrastructureHubPage,
  logs: LogsHubPage,
  metrics: MetricsPage,
  services: ServicesPage,
  traces: TracesPage,
} as const;

export default function BackendDrivenPage(): JSX.Element {
  const location = useLocation();
  const { pages, isLoading } = usePagesConfig();

  if (isLoading && pages.length === 0) {
    return (
      <div style={{ padding: 24 }}>
        <Skeleton active paragraph={{ rows: 6 }} />
      </div>
    );
  }

  const matchedPage = pages.find((page) => page.path === location.pathname);
  if (!matchedPage) {
    return <Navigate to={pages[0]?.path || ROUTES.overview} replace />;
  }

  const Shell = CUSTOM_SHELLS[matchedPage.id as keyof typeof CUSTOM_SHELLS];
  if (Shell) {
    return <Shell />;
  }

  return (
    <div style={{ padding: '24px', maxWidth: '1600px', margin: '0 auto' }}>
      <DashboardPage pageId={matchedPage.id} />
    </div>
  );
}
