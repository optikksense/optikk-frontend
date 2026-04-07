import { Server } from 'lucide-react';
import { lazy, Suspense, useMemo } from 'react';
import { useSearchParamsCompat as useSearchParams } from '@shared/hooks/useSearchParamsCompat';

import { PageHeader, PageShell } from '@shared/components/ui';
import { Tabs } from '@shared/components/primitives/ui';
import DashboardEntityDrawer from '@shared/components/ui/dashboard/DashboardEntityDrawer';
import DashboardPage from '@shared/components/ui/dashboard/DashboardPage';

const TopologyView = lazy(() => import('./TopologyView'));

const TAB_DASHBOARD = 'dashboard';
const TAB_TOPOLOGY = 'topology';

export default function ServiceHubPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const pathParams = useMemo(
    () => ({
      serviceName: searchParams.get('serviceName') ?? searchParams.get('service') ?? '',
    }),
    [searchParams]
  );

  const activeView = searchParams.get('view') === TAB_TOPOLOGY ? TAB_TOPOLOGY : TAB_DASHBOARD;

  const setActiveView = (key: string): void => {
    const next = new URLSearchParams(searchParams);
    if (key === TAB_TOPOLOGY) next.set('view', TAB_TOPOLOGY);
    else next.delete('view');
    setSearchParams(next);
  };

  return (
    <PageShell>
      <PageHeader
        title="Service"
        subtitle="Deployments, version impact, and runtime topology"
        icon={<Server size={24} />}
      />
      <Tabs
        activeKey={activeView}
        onChange={setActiveView}
        items={[
          { key: TAB_DASHBOARD, label: 'Dashboard' },
          { key: TAB_TOPOLOGY, label: 'Topology' },
        ]}
      />
      {activeView === TAB_DASHBOARD ? (
        <DashboardPage pageId="service" pathParams={pathParams} />
      ) : (
        <Suspense
          fallback={
            <div className="flex h-64 items-center justify-center text-[13px] text-[var(--text-muted)]">
              Loading topology…
            </div>
          }
        >
          <TopologyView />
        </Suspense>
      )}
      <DashboardEntityDrawer />
    </PageShell>
  );
}
