import { Row, Col } from 'antd';
import { useMemo } from 'react';
import { Network, AlertTriangle, Layers, Clock } from 'lucide-react';
import { useTimeRangeQuery } from '@hooks/useTimeRangeQuery';
import { useDashboardConfig } from '@hooks/useDashboardConfig';
import { PageHeader, StatCard } from '@components/common';
import ConfigurableDashboard from '@components/dashboard/ConfigurableDashboard';
import { v1Service } from '@services/v1Service';

const n = (v) => (v == null || Number.isNaN(Number(v)) ? 0 : Number(v));
const queueSeriesKey = (row) => `${row?.queue_name || 'unknown'}::${row?.service_name || 'unknown'}`;

export default function MessagingQueueMonitoringPage() {
  const { config } = useDashboardConfig('messaging-queue');

  const { data, isLoading } = useTimeRangeQuery(
    'messaging-queue-insights',
    (teamId, start, end) => v1Service.getMessagingQueueInsights(teamId, start, end, '5m')
  );

  const summary = data?.summary || {};

  const serviceTimeseriesMap = useMemo(() => {
    const ts = Array.isArray(data?.timeseries) ? data.timeseries : [];
    const map = {};
    for (const row of ts) {
      const key = queueSeriesKey(row);
      if (!map[key]) map[key] = [];
      map[key].push(row);
    }
    return map;
  }, [data?.timeseries]);

  const uniqueQueues = Object.keys(serviceTimeseriesMap);

  // Provide data to ConfigurableDashboard keyed by data source id
  const dataSources = useMemo(() => ({
    'messaging-queue-insights': data,
  }), [data]);

  return (
    <div>
      <PageHeader
        title="Messaging / Queue Monitoring"
        icon={<Network size={24} />}
        subtitle="Throughput rates, consumer lag, queue depth, and processing errors per queue"
      />

      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={12} lg={6}>
          <StatCard title="Avg Queue Depth" value={n(summary.avg_queue_depth).toFixed(1)} icon={<Layers size={18} />} loading={isLoading} />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard title="Max Consumer Lag" value={n(summary.max_consumer_lag).toFixed(1)} icon={<Clock size={18} />} loading={isLoading} />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard title="Avg Processing Errors" value={n(summary.processing_errors).toFixed(0)} icon={<AlertTriangle size={18} />} loading={isLoading} />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard title="Total Queues" value={uniqueQueues.length} icon={<Network size={18} />} loading={isLoading} />
        </Col>
      </Row>

      <ConfigurableDashboard
        config={config}
        dataSources={dataSources}
        isLoading={isLoading}
      />
    </div>
  );
}
