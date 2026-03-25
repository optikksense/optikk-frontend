import { Layers } from 'lucide-react';

import { PageHeader, PageShell } from '@shared/components/ui';
import DashboardPage from '@shared/components/ui/dashboard/DashboardPage';

export default function InfrastructureHubPage() {
  return (
    <PageShell>
      <PageHeader
        title="Infrastructure"
        subtitle="Hosts, JVMs, Kubernetes, and nodes in one consistent infrastructure workspace."
        icon={<Layers size={24} />}
      />
      <DashboardPage pageId="infrastructure" />
    </PageShell>
  );
}
