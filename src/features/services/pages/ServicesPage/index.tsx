import { Layers } from 'lucide-react';

import { PageHeader, PageShell } from '@shared/components/ui';
import DashboardPage from '@shared/components/ui/dashboard/DashboardPage';

export default function ServicesPage() {
  return (
    <PageShell>
      <PageHeader
        title="Services"
        subtitle="Global service health and dependency map"
        icon={<Layers size={24} />}
      />

      <DashboardPage pageId="services" />
    </PageShell>
  );
}
