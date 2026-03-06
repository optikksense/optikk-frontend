import { Card, Col, Row } from 'antd';
import { Radio } from 'lucide-react';
import { useMemo } from 'react';

import { PageHeader } from '@components/common';
import ConfigurableDashboard from '@components/dashboard/ConfigurableDashboard';

import { MessagingSystemsPills, TopQueuesTable } from '@features/metrics/components';

import { v1Service } from '@services/v1Service';

import { useDashboardConfig } from '@hooks/useDashboardConfig';
import { useTimeRangeQuery } from '@hooks/useTimeRangeQuery';


/**
 *
 */
export default function MessagingQueueMonitoringPage() {
  const { config } = useDashboardConfig('messaging-queue');

  const { data: consumerLagData, isLoading: isLoadingConsumer } = useTimeRangeQuery(
    'queue-consumer-lag',
    (teamId, start, end) => v1Service.getQueueConsumerLag(teamId, start, end),
  );

  const { data: topicLagData, isLoading: isLoadingTopic } = useTimeRangeQuery(
    'queue-topic-lag',
    (teamId, start, end) => v1Service.getQueueTopicLag(teamId, start, end),
  );

  const { data: productionRateData, isLoading: isLoadingProd } = useTimeRangeQuery(
    'kafka-production-rate',
    (teamId, start, end) => v1Service.getKafkaProductionRate(teamId, start, end),
  );

  const { data: consumptionRateData, isLoading: isLoadingConsump } = useTimeRangeQuery(
    'kafka-consumption-rate',
    (teamId, start, end) => v1Service.getKafkaConsumptionRate(teamId, start, end),
  );

  const { data: topQueuesData, isLoading: isLoadingTopQueues } = useTimeRangeQuery(
    'queue-top-queues',
    (teamId, start, end) => v1Service.getQueueTopQueuesStats(teamId, start, end),
  );

  const isLoading = isLoadingConsumer || isLoadingTopic || isLoadingTopQueues || isLoadingProd || isLoadingConsump;

  const topQueues = Array.isArray(topQueuesData) ? topQueuesData : [];

  const dataSources = useMemo(() => {
    // Append `topQueues` feature wrapper so that ConfigurableDashboard can build legends
    const withTop = (arr: any) => Object.assign(Array.isArray(arr) ? [...arr] : [], { topQueues });
    return {
      'queue-consumer-lag': withTop(consumerLagData),
      'queue-topic-lag': withTop(topicLagData),
      'kafka-production-rate': withTop(productionRateData),
      'kafka-consumption-rate': withTop(consumptionRateData),
    };
  }, [consumerLagData, topicLagData, productionRateData, consumptionRateData, topQueues]);

  // Detect unique messaging systems
  const messagingSystems = useMemo(() => {
    const systemSet = new Set<string>();
    topQueues.forEach((queue: any) => {
      if (queue.messaging_system) {
        systemSet.add(queue.messaging_system);
      }
    });
    return [...systemSet];
  }, [topQueues]);

  return (
    <div>
      <PageHeader title="Messaging Queue Monitoring" icon={<Radio size={24} />} subtitle="Queue depth, consumer lag, publish and receive rates across messaging systems" />

      <MessagingSystemsPills systems={messagingSystems} />

      {/* Configurable dashboard charts */}
      <div style={{ marginBottom: 24 }}>
        <ConfigurableDashboard
          config={config}
          dataSources={dataSources}
          isLoading={isLoading}
        />
      </div>

      {/* Top queues table */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24}>
          <Card
            title={
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Radio size={16} />
                Top Queues / Topics
              </span>
            }
            style={{ height: '100%' }}
            styles={{ body: { padding: '8px' } }}
          >
            <TopQueuesTable queues={topQueues} />
          </Card>
        </Col>
      </Row>
    </div>
  );
}
