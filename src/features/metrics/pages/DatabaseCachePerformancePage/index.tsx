import { Row, Col, Card } from 'antd';
import { Database, Layers3, Timer, Zap } from 'lucide-react';
import { useMemo } from 'react';

import { PageHeader, StatCard, DatabaseTopTablesList } from '@components/common';
import ConfigurableDashboard from '@components/dashboard/ConfigurableDashboard';

import { DatabaseSystemBreakdown } from '@features/metrics/components';

import { v1Service } from '@services/v1Service';

import { useDashboardConfig } from '@hooks/useDashboardConfig';
import { useTimeRangeQuery } from '@hooks/useTimeRangeQuery';

import { formatNumber, formatPercentage } from '@utils/formatters';

const n = (v: any) => (v == null || Number.isNaN(Number(v)) ? 0 : Number(v));

/**
 *
 */
export default function DatabaseCachePerformancePage() {
  const { config } = useDashboardConfig('database-cache');

  const { data: summaryData, isLoading: isLoadingSummary } = useTimeRangeQuery(
    'database-cache-summary',
    (teamId, start, end) => (v1Service as any).getDatabaseCacheSummary(teamId, start, end),
  );

  const { data: systemsData, isLoading: isLoadingSystems } = useTimeRangeQuery(
    'database-systems-breakdown',
    (teamId, start, end) => (v1Service as any).getDatabaseSystemsBreakdown(teamId, start, end),
  );

  const { data: topTablesData, isLoading: isLoadingTables } = useTimeRangeQuery(
    'database-top-tables',
    (teamId, start, end) => (v1Service as any).getDatabaseTopTablesMetrics(teamId, start, end),
  );

  const { data: queryByTableData, isLoading: isLoadingQueryVolume } = useTimeRangeQuery(
    'database-query-by-table',
    (teamId, start, end) => (v1Service as any).getDatabaseQueryByTable(teamId, start, end),
  );

  const { data: avgLatencyData, isLoading: isLoadingLatencySeries } = useTimeRangeQuery(
    'database-avg-latency-series',
    (teamId, start, end) => (v1Service as any).getDatabaseAvgLatency(teamId, start, end),
  );

  const isLoading = isLoadingSummary || isLoadingSystems || isLoadingTables || isLoadingQueryVolume || isLoadingLatencySeries;

  const summary = (summaryData as any) || {};
  const cache = summaryData ? {
    cacheHits: (summaryData as any).cache_hits,
    cacheMisses: (summaryData as any).cache_misses,
    cacheHitRatio: (summaryData as any).cache_hits + (summaryData as any).cache_misses > 0 ? ((summaryData as any).cache_hits * 100.0) / ((summaryData as any).cache_hits + (summaryData as any).cache_misses) : 0,
  } : { cacheHits: 0, cacheMisses: 0, cacheHitRatio: 0 };
  const systemBreakdown = Array.isArray(systemsData) ? systemsData : [];
  const queryByTable = Array.isArray(queryByTableData)
    ? queryByTableData.map((row: any) => ({
      ...row,
      table_name: row.table_name ?? row.table ?? 'unknown',
      query_count: Number(row.query_count ?? 0),
      avg_latency_ms: Number(row.avg_latency_ms ?? 0),
      p95_latency_ms: Number(row.p95_latency_ms ?? 0),
      timestamp: row.timestamp ?? row.time_bucket ?? row.timeBucket ?? '',
    }))
    : [];
  const avgLatency = Array.isArray(avgLatencyData)
    ? avgLatencyData.map((row: any) => ({
      ...row,
      timestamp: row.timestamp ?? row.time_bucket ?? row.timeBucket ?? '',
      avg_latency_ms: Number(row.avg_latency_ms ?? 0),
      p95_latency_ms: Number(row.p95_latency_ms ?? 0),
    }))
    : [];
  const topTables = Array.isArray(topTablesData) ? topTablesData.map((t: any) => ({ ...t, key: `${t.table_name}-${t.service_name}` })) : [];

  const dataSources = useMemo(() => ({
    'database-query-table': queryByTable,
    'database-avg-latency': avgLatency,
    'database-cache-insights': { summary, tableMetrics: topTables, systemBreakdown, cache },
  }), [summary, topTables, systemBreakdown, cache, queryByTable, avgLatency]);

  const totalSystems = systemBreakdown.length;
  const totalSpans = systemBreakdown.reduce((acc: number, s: any) => acc + (s.span_count || 0), 0);

  return (
    <div>
      <PageHeader title="Database & Cache Performance" icon={<Database size={24} />} subtitle="Mongo query latency, SQL pool latency, cache hit ratio, database system breakdown, and collection or pool metrics" />

      {/* Stat cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <StatCard title="Avg DB / Pool Latency" value={`${n(summary.avg_query_latency_ms).toFixed(1)} ms`} icon={<Timer size={18} />} loading={isLoading} description="Mongo query latency plus SQL pool usage latency" />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard title="P95 DB / Pool Latency" value={`${n(summary.p95_query_latency_ms).toFixed(1)} ms`} icon={<Zap size={18} />} loading={isLoading} description="95th percentile Mongo query or SQL pool usage latency" />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard title="Cache Hit Ratio" value={formatPercentage(cache.cacheHitRatio, 1)} icon={<Layers3 size={18} />} loading={isLoading} description={`${formatNumber(cache.cacheHits || 0)} hits / ${formatNumber((cache.cacheHits || 0) + (cache.cacheMisses || 0))} total`} />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard title="Database Systems" value={totalSystems} icon={<Database size={18} />} loading={isLoading} description={`${formatNumber(totalSpans)} total spans`} />
        </Col>
      </Row>

      <DatabaseSystemBreakdown systems={systemBreakdown} />

      {/* Configurable dashboard charts */}
      <div style={{ marginBottom: 24 }}>
        <ConfigurableDashboard
          config={config}
          dataSources={dataSources}
          isLoading={isLoading}
        />
      </div>

      {/* Top tables */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24}>
          <Card
            title={
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Database size={16} />
                Collection / Pool Performance
              </span>
            }
            style={{ height: '100%' }}
            styles={{ body: { padding: '8px' } }}
          >
            <DatabaseTopTablesList tables={topTables} onToggle={() => { }} />
          </Card>
        </Col>
      </Row>
    </div>
  );
}
