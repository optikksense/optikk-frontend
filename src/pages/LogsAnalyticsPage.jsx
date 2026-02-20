import { Row, Col, Card } from 'antd';
import { FileText, Link2, Activity } from 'lucide-react';
import { useTimeRangeQuery } from '@hooks/useTimeRangeQuery';
import { PageHeader, StatCard, DataTable } from '@components/common';
import { v1Service } from '@services/v1Service';

const n = (v) => (v == null || Number.isNaN(Number(v)) ? 0 : Number(v));

export default function LogsAnalyticsPage() {
  const { data, isLoading } = useTimeRangeQuery(
    'logs-stream-insights',
    (teamId, start, end) => v1Service.getLogsStreamInsights(teamId, start, end, '1m', 200)
  );

  const stream = Array.isArray(data?.stream) ? data.stream : [];
  const trends = Array.isArray(data?.volumeTrends) ? data.volumeTrends : [];
  const corr = data?.traceCorrelation || {};

  const cols = [
    { title: 'Timestamp', dataIndex: 'timestamp', key: 'timestamp', render: (v) => new Date(v).toLocaleString() },
    { title: 'Level', dataIndex: 'level', key: 'level' },
    { title: 'Service', dataIndex: 'service_name', key: 'service_name' },
    { title: 'Message', dataIndex: 'message', key: 'message', ellipsis: true },
    { title: 'Trace', dataIndex: 'trace_id', key: 'trace_id', render: (v) => (v ? String(v).slice(0, 16) : '-') },
  ];
  const trendCols = [
    { title: 'Timestamp', dataIndex: 'timestamp', key: 'timestamp', render: (v) => new Date(v).toLocaleString() },
    { title: 'Log Count', dataIndex: 'log_count', key: 'log_count' },
    { title: 'Correlated', dataIndex: 'correlated_log_count', key: 'correlated_log_count' },
  ];

  return (
    <div>
      <PageHeader title="Logs Stream & Aggregates" icon={<FileText size={24} />} subtitle="Near real-time stream, volume trends, and trace correlation" />

      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={12} lg={8}><StatCard title="Stream Size" value={stream.length} icon={<Activity size={18} />} loading={isLoading} /></Col>
        <Col xs={24} sm={12} lg={8}><StatCard title="Correlated Logs" value={n(corr.traceCorrelatedLogs)} icon={<Link2 size={18} />} loading={isLoading} /></Col>
        <Col xs={24} sm={12} lg={8}><StatCard title="Correlation Ratio" value={`${n(corr.correlationRatio).toFixed(1)}%`} icon={<Link2 size={18} />} loading={isLoading} /></Col>
      </Row>

      <Card title="Log Volume Trend" style={{ marginBottom: 16 }}>
        <DataTable columns={trendCols} data={trends.map((r, i) => ({ ...r, key: `trend-${i}` }))} rowKey="key" loading={isLoading} />
      </Card>

      <Card title="Recent Stream">
        <DataTable columns={cols} data={stream.map((r, i) => ({ ...r, key: `log-${i}` }))} rowKey="key" loading={isLoading} />
      </Card>
    </div>
  );
}
