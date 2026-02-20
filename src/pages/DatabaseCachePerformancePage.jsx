import { Row, Col, Card } from 'antd';
import { Database, Timer, Layers3 } from 'lucide-react';
import { useTimeRangeQuery } from '@hooks/useTimeRangeQuery';
import { PageHeader, StatCard, DataTable } from '@components/common';
import { v1Service } from '@services/v1Service';

const n = (v) => (v == null || Number.isNaN(Number(v)) ? 0 : Number(v));

export default function DatabaseCachePerformancePage() {
  const { data, isLoading } = useTimeRangeQuery(
    'database-cache-insights',
    (teamId, start, end) => v1Service.getDatabaseCacheInsights(teamId, start, end)
  );

  const summary = data?.summary || {};
  const cache = data?.cache || {};
  const slowLogs = Array.isArray(data?.slowLogs?.logs) ? data.slowLogs.logs : [];

  const cols = [
    { title: 'Timestamp', dataIndex: 'timestamp', key: 'timestamp', render: (v) => new Date(v).toLocaleString() },
    { title: 'Level', dataIndex: 'level', key: 'level' },
    { title: 'Service', dataIndex: 'service_name', key: 'service_name' },
    { title: 'Message', dataIndex: 'message', key: 'message', ellipsis: true },
  ];

  return (
    <div>
      <PageHeader title="Database & Cache Performance" icon={<Database size={24} />} subtitle="Query latency, cache hit ratio, slow logs, replication lag" />

      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={12} lg={6}><StatCard title="Avg Query Latency" value={`${n(summary.avg_query_latency_ms).toFixed(1)} ms`} icon={<Timer size={18} />} loading={isLoading} /></Col>
        <Col xs={24} sm={12} lg={6}><StatCard title="P95 Query Latency" value={`${n(summary.p95_query_latency_ms).toFixed(1)} ms`} icon={<Timer size={18} />} loading={isLoading} /></Col>
        <Col xs={24} sm={12} lg={6}><StatCard title="Cache Hit Ratio" value={`${n(cache.cacheHitRatio).toFixed(1)}%`} icon={<Layers3 size={18} />} loading={isLoading} /></Col>
        <Col xs={24} sm={12} lg={6}><StatCard title="Replication Lag" value={`${n(summary.avg_replication_lag_ms).toFixed(1)} ms`} icon={<Database size={18} />} loading={isLoading} /></Col>
      </Row>

      <Card title="Slow Logs">
        <DataTable columns={cols} data={slowLogs.map((r, i) => ({ ...r, key: `slow-${i}` }))} rowKey="key" loading={isLoading} />
      </Card>
    </div>
  );
}
