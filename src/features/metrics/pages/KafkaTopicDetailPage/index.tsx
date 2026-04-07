import { Radio } from 'lucide-react';
import { useMemo } from 'react';
import { useParams } from '@tanstack/react-router';

import type { DashboardAdapterPageProps } from '@/app/registry/domainRegistry';

import { PageHeader } from '@shared/components/ui';
import DashboardPage from '@shared/components/ui/dashboard/DashboardPage';

import { ROUTES } from '@/shared/constants/routes';

export default function KafkaTopicDetailPage({
  pathParams: adapterPathParams,
}: DashboardAdapterPageProps) {
  const params = useParams({ strict: false });
  const topic = adapterPathParams?.topic ?? params.topic ?? '';

  const dashboardPathParams = useMemo(() => (topic ? { topic } : undefined), [topic]);

  return (
    <div>
      <PageHeader
        title={topic ? `Kafka Topic: ${topic}` : 'Kafka Topic Detail'}
        icon={<Radio size={24} />}
        subtitle="Production, consumption, lag, and error metrics for a single Kafka topic"
        breadcrumbs={[
          { label: 'Saturation', path: `${ROUTES.saturation}?tab=mq` },
          { label: 'Message Queue', path: `${ROUTES.saturation}?tab=mq` },
          { label: topic || 'Topic Detail' },
        ]}
      />
      <DashboardPage pageId="kafka-topic-detail" pathParams={dashboardPathParams} />
    </div>
  );
}
