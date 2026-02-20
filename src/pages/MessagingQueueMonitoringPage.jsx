import { Row, Col, Card } from 'antd';
import { Network, Activity, AlertTriangle } from 'lucide-react';
import { useTimeRangeQuery } from '@hooks/useTimeRangeQuery';
import { PageHeader, StatCard, DataTable } from '@components/common';
import { v1Service } from '@services/v1Service';

const n = (v) => (v == null || Number.isNaN(Number(v)) ? 0 : Number(v));

export default function MessagingQueueMonitoringPage() {
  const { data, isLoading } = useTimeRangeQuery(
    'messaging-queue-insights',
    (teamId, start, end) => v1Service.getMessagingQueueInsights(teamId, start, end, '5m')
  );

  const summary = data?.summary || {};
  const ts = Array.isArray(data?.timeseries) ? data.timeseries : [];
  const cols = [
    { title: 'Timestamp', dataIndex: 'timestamp', key: 'timestamp', render: (v) => new Date(v).toLocaleString() },
    { title: 'Queue', dataIndex: 'queue_name', key: 'queue_name', render: (v) => v || '-' },
    { title: 'Service', dataIndex: 'service_name', key: 'service_name', render: (v) => v || '-' },
    { title: 'Queue Depth', dataIndex: 'avg_queue_depth', key: 'avg_queue_depth', render: (v) => n(v).toFixed(2) },
    { title: 'Consumer Lag', dataIndex: 'avg_consumer_lag', key: 'avg_consumer_lag', render: (v) => n(v).toFixed(2) },
    { title: 'Message Rate', dataIndex: 'avg_message_rate', key: 'avg_message_rate', render: (v) => n(v).toFixed(2) },
  ];

  return (
    <div>
      <PageHeader title="Messaging / Queue Monitoring" icon={<Network size={24} />} subtitle="Queue depth, consumer lag, message rates, processing errors" />

      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={12} lg={6}><StatCard title="Avg Queue Depth" value={n(summary.avg_queue_depth).toFixed(1)} icon={<Activity size={18} />} loading={isLoading} /></Col>
        <Col xs={24} sm={12} lg={6}><StatCard title="Max Consumer Lag" value={n(summary.max_consumer_lag).toFixed(1)} icon={<Activity size={18} />} loading={isLoading} /></Col>
        <Col xs={24} sm={12} lg={6}><StatCard title="Msg Rate" value={n(summary.avg_message_rate).toFixed(1)} icon={<Network size={18} />} loading={isLoading} /></Col>
        <Col xs={24} sm={12} lg={6}><StatCard title="Processing Errors" value={n(summary.processing_errors).toFixed(0)} icon={<AlertTriangle size={18} />} loading={isLoading} /></Col>
      </Row>

      <Card title="Queue & Consumer Trends">
        <DataTable columns={cols} data={ts.map((r, i) => ({ ...r, key: `mq-${r.timestamp || 'na'}-${r.queue_name || 'unknown'}-${r.service_name || 'unknown'}-${i}` }))} rowKey="key" loading={isLoading} />
      </Card>
    </div>
  );
}
