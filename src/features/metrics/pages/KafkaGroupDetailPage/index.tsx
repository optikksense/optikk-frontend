import { Users } from 'lucide-react';
import { useMemo } from 'react';
import { useParams } from '@tanstack/react-router';

import type { DashboardAdapterPageProps } from '@/app/registry/domainRegistry';

import { PageHeader } from '@shared/components/ui';
import DashboardPage from '@shared/components/ui/dashboard/DashboardPage';

import { ROUTES } from '@/shared/constants/routes';

export default function KafkaGroupDetailPage({
  pathParams: adapterPathParams,
}: DashboardAdapterPageProps) {
  const params = useParams({ strict: false });
  const groupId = adapterPathParams?.groupId ?? params.groupId ?? '';

  const dashboardPathParams = useMemo(() => (groupId ? { groupId } : undefined), [groupId]);

  return (
    <div>
      <PageHeader
        title={groupId ? `Consumer Group: ${groupId}` : 'Kafka Consumer Group Detail'}
        icon={<Users size={24} />}
        subtitle="Lag, partitions, and processing metrics for a single Kafka consumer group"
        breadcrumbs={[
          { label: 'Saturation', path: `${ROUTES.saturation}?tab=mq` },
          { label: 'Message Queue', path: `${ROUTES.saturation}?tab=mq` },
          { label: groupId || 'Consumer Group Detail' },
        ]}
      />
      <DashboardPage pageId="kafka-group-detail" pathParams={dashboardPathParams} />
    </div>
  );
}
