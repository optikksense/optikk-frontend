import { Row, Col, Card } from 'antd';
import { useMemo } from 'react';
import { Database, Timer, Layers3 } from 'lucide-react';
import { useTimeRangeQuery } from '@hooks/useTimeRangeQuery';
import { useDashboardConfig } from '@hooks/useDashboardConfig';
import { PageHeader, StatCard, DatabaseTopTablesList } from '@components/common';
import ConfigurableDashboard from '@components/dashboard/ConfigurableDashboard';
import { v1Service } from '@services/v1Service';

const n = (v) => (v == null || Number.isNaN(Number(v)) ? 0 : Number(v));

export default function DatabaseCachePerformancePage() {
  const { config } = useDashboardConfig('database-cache');

  const { data, isLoading } = useTimeRangeQuery(
    'database-cache-insights',
    (teamId, start, end) => v1Service.getDatabaseCacheInsights(teamId, start, end)
  );

  const summary = data?.summary || {};
  const cache = data?.cache || {};
  const topTables = Array.isArray(data?.tableMetrics) ? data.tableMetrics.map(t => ({ ...t, key: `${t.table_name}-${t.service_name}` })) : [];

  const dataSources = useMemo(() => ({ 'database-cache-insights': data }), [data]);

  return (
    <div>
      <PageHeader title="Database & Cache Performance" icon={<Database size={24} />} subtitle="Query latency, cache hit ratio, slow logs, replication lag" />

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}><StatCard title="Avg Query Latency" value={`${n(summary.avg_query_latency_ms).toFixed(1)} ms`} icon={<Timer size={18} />} loading={isLoading} /></Col>
        <Col xs={24} sm={12} lg={6}><StatCard title="P95 Query Latency" value={`${n(summary.p95_query_latency_ms).toFixed(1)} ms`} icon={<Timer size={18} />} loading={isLoading} /></Col>
        <Col xs={24} sm={12} lg={6}><StatCard title="Cache Hit Ratio" value={`${n(cache.cacheHitRatio).toFixed(1)}%`} icon={<Layers3 size={18} />} loading={isLoading} /></Col>
        <Col xs={24} sm={12} lg={6}><StatCard title="Replication Lag" value={`${n(summary.avg_replication_lag_ms).toFixed(1)} ms`} icon={<Database size={18} />} loading={isLoading} /></Col>
      </Row>

      <div style={{ marginBottom: 24 }}>
        <ConfigurableDashboard
          config={config}
          dataSources={dataSources}
          isLoading={isLoading}
        />
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24}>
          <Card title="Query Performance by Table" style={{ height: '100%' }} styles={{ body: { padding: '8px' } }}>
            <DatabaseTopTablesList tables={topTables} />
          </Card>
        </Col>
      </Row>
    </div>
  );
}
