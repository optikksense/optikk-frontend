import { LayoutDashboard } from 'lucide-react';

import { PageHeader, PageShell } from '@shared/components/ui';
import DashboardPage from '@shared/components/ui/dashboard/DashboardPage';

export default function OverviewHubPage() {
  return (
    <PageShell>
      <PageHeader
        title="Overview"
        subtitle="System-wide golden signals and service health"
        icon={<LayoutDashboard size={24} />}
      />
      <DashboardPage pageId="overview" />
    </PageShell>
  );
}
