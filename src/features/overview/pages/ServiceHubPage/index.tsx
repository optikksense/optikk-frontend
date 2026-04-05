import { Server } from 'lucide-react';
import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

import { PageHeader, PageShell } from '@shared/components/ui';
import DashboardEntityDrawer from '@shared/components/ui/dashboard/DashboardEntityDrawer';
import DashboardPage from '@shared/components/ui/dashboard/DashboardPage';

export default function ServiceHubPage() {
  const [searchParams] = useSearchParams();
  const pathParams = useMemo(
    () => ({
      serviceName: searchParams.get('serviceName') ?? searchParams.get('service') ?? '',
    }),
    [searchParams]
  );

  return (
    <PageShell>
      <PageHeader
        title="Service"
        subtitle="Deployments and version impact (set ?serviceName= in the URL)"
        icon={<Server size={24} />}
      />
      <DashboardPage pageId="service" pathParams={pathParams} />
      <DashboardEntityDrawer />
    </PageShell>
  );
}
