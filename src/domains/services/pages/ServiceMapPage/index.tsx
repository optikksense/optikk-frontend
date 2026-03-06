import { Network } from 'lucide-react';

import PageHeader from '@components/common/layout/PageHeader';
import DashboardPage from '@components/dashboard/DashboardPage';

/**
 * Service map page — tabs (Graph / Dependencies / Latency Gap) fully driven by backend YAML config.
 */
export default function ServiceMapPage() {
  return (
    <div className="service-map-page">
      <PageHeader
        title="Service Map"
        icon={<Network size={24} />}
        subtitle="Visualize service dependencies and health"
      />
      <DashboardPage pageId="service-map" />
    </div>
  );
}
