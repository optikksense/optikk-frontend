import { useMemo } from 'react';

import { Radio } from 'lucide-react';

import { PageHeader } from '@shared/components/ui';
import ConfigurableDashboard from '@shared/components/ui/dashboard/ConfigurableDashboard';

import { useTabComponents } from '@shared/hooks/useTabComponents';

import type { DashboardRenderConfig } from '@/types/dashboardConfig';

export default function MessagingQueueMonitoringPage() {
  const { components, groups, isLoading } = useTabComponents('saturation', 'queue');

  const config = useMemo<DashboardRenderConfig | null>(() => {
    if (!components.length && !isLoading) return null;
    return {
      components: components.map((c) => ({ ...c, dataSource: c.dataSource || c.id })),
      groups,
    };
  }, [components, groups, isLoading]);

  return (
    <div>
      <PageHeader
        title="Messaging Queue Monitoring"
        icon={<Radio size={24} />}
        subtitle="Produce/consume rates, consumer lag, rebalancing, latency, and error rates across Kafka topics and consumer groups"
      />
      <ConfigurableDashboard config={config} isLoading={isLoading} />
    </div>
  );
}
