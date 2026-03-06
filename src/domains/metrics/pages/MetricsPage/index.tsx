import { BarChart3 } from 'lucide-react';

import { PageHeader } from '@components/common';
import DashboardPage from '@components/dashboard/DashboardPage';

/**
 * Metrics page — RED metrics tabs fully driven by backend YAML config.
 */
export default function MetricsPage() {
  return (
    <div className="metrics-page">
      <PageHeader
        title="Metrics"
        icon={<BarChart3 size={24} />}
        subtitle="System-wide performance metrics"
      />
      <DashboardPage pageId="metrics" />
    </div>
  );
}
