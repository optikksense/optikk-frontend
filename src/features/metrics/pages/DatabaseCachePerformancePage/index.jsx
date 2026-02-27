import { Row, Col, Card } from 'antd';
import { useMemo } from 'react';
import { Database, Timer, Layers3, AlertTriangle, Activity, Zap } from 'lucide-react';
import { useTimeRangeQuery } from '@hooks/useTimeRangeQuery';
import { useDashboardConfig } from '@hooks/useDashboardConfig';
import { PageHeader, StatCard, DatabaseTopTablesList } from '@components/common';
import ConfigurableDashboard from '@components/dashboard/ConfigurableDashboard';
import { v1Service } from '@services/v1Service';
import { formatNumber, formatDuration, formatPercentage, normalizePercentage } from '@utils/formatters';

const n = (v) => (v == null || Number.isNaN(Number(v)) ? 0 : Number(v));

const DB_SYSTEM_META = {
  postgresql: { label: 'PostgreSQL', color: '#336791', gradient: 'linear-gradient(135deg, #336791 0%, #5E9ED6 100%)' },
  mysql: { label: 'MySQL', color: '#00758F', gradient: 'linear-gradient(135deg, #00758F 0%, #F29111 100%)' },
  redis: { label: 'Redis', color: '#DC382D', gradient: 'linear-gradient(135deg, #DC382D 0%, #FF6B6B 100%)' },
  mongodb: { label: 'MongoDB', color: '#13AA52', gradient: 'linear-gradient(135deg, #13AA52 0%, #6EDB8F 100%)' },
  elasticsearch: { label: 'Elasticsearch', color: '#FEC514', gradient: 'linear-gradient(135deg, #00BFB3 0%, #FEC514 100%)' },
  memcached: { label: 'Memcached', color: '#6DB33F', gradient: 'linear-gradient(135deg, #6DB33F 0%, #98D660 100%)' },
  cassandra: { label: 'Cassandra', color: '#1287B1', gradient: 'linear-gradient(135deg, #1287B1 0%, #66C7E0 100%)' },
  mssql: { label: 'SQL Server', color: '#CC2927', gradient: 'linear-gradient(135deg, #CC2927 0%, #E86B69 100%)' },
  oracle: { label: 'Oracle', color: '#F80000', gradient: 'linear-gradient(135deg, #F80000 0%, #FF6B35 100%)' },
  sqlite: { label: 'SQLite', color: '#0F80CC', gradient: 'linear-gradient(135deg, #0F80CC 0%, #5EB8FF 100%)' },
};

function getDbMeta(system) {
  const key = (system || 'unknown').toLowerCase();
  return DB_SYSTEM_META[key] || {
    label: system || 'Unknown',
    color: '#8e8e8e',
    gradient: 'linear-gradient(135deg, #5E60CE 0%, #48CAE4 100%)',
  };
}

function SystemBreakdownCard({ system }) {
  const meta = getDbMeta(system.db_system);
  const avgLatency = n(system.avg_query_latency_ms);
  const errorRate = system.span_count > 0 ? normalizePercentage((system.error_count / system.span_count) * 100) : 0;

  return (
    <div
      style={{
        background: 'rgba(255, 255, 255, 0.03)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(255, 255, 255, 0.06)',
        borderRadius: '14px',
        padding: '18px 20px',
        position: 'relative',
        overflow: 'hidden',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        cursor: 'default',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)';
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = `0 8px 32px ${meta.color}22`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      {/* Gradient accent bar */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: '3px',
        background: meta.gradient, borderRadius: '14px 14px 0 0',
      }} />

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
        <div style={{
          width: '36px', height: '36px', borderRadius: '10px',
          background: `${meta.color}18`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Database size={18} color={meta.color} />
        </div>
        <div>
          <div style={{ color: '#e0e0e0', fontWeight: 600, fontSize: '14px' }}>{meta.label}</div>
          <div style={{ color: '#8e8e8e', fontSize: '11px' }}>{system.db_system}</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
        <div>
          <div style={{ color: '#8e8e8e', fontSize: '11px', marginBottom: '2px' }}>Queries</div>
          <div style={{ color: '#e0e0e0', fontWeight: 600, fontSize: '16px', fontFamily: 'monospace' }}>
            {formatNumber(system.query_count)}
          </div>
        </div>
        <div>
          <div style={{ color: '#8e8e8e', fontSize: '11px', marginBottom: '2px' }}>Avg Latency</div>
          <div style={{
            color: avgLatency > 100 ? '#F04438' : avgLatency > 50 ? '#F79009' : '#12B76A',
            fontWeight: 600, fontSize: '16px', fontFamily: 'monospace',
          }}>
            {formatDuration(avgLatency)}
          </div>
        </div>
        <div>
          <div style={{ color: '#8e8e8e', fontSize: '11px', marginBottom: '2px' }}>Spans</div>
          <div style={{ color: '#e0e0e0', fontWeight: 600, fontSize: '14px', fontFamily: 'monospace' }}>
            {formatNumber(system.span_count)}
          </div>
        </div>
        <div>
          <div style={{ color: '#8e8e8e', fontSize: '11px', marginBottom: '2px' }}>Error Rate</div>
          <div style={{
            color: errorRate > 5 ? '#F04438' : errorRate > 1 ? '#F79009' : '#12B76A',
            fontWeight: 600, fontSize: '14px', fontFamily: 'monospace',
          }}>
            {errorRate.toFixed(1)}%
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DatabaseCachePerformancePage() {
  const { config } = useDashboardConfig('database-cache');

  const { data: summaryData, isLoading: isLoadingSummary } = useTimeRangeQuery(
    'database-cache-summary',
    (teamId, start, end) => v1Service.getDatabaseCacheSummary(teamId, start, end)
  );

  const { data: systemsData, isLoading: isLoadingSystems } = useTimeRangeQuery(
    'database-systems-breakdown',
    (teamId, start, end) => v1Service.getDatabaseSystemsBreakdown(teamId, start, end)
  );

  const { data: topTablesData, isLoading: isLoadingTables } = useTimeRangeQuery(
    'database-top-tables',
    (teamId, start, end) => v1Service.getDatabaseTopTablesMetrics(teamId, start, end)
  );

  const isLoading = isLoadingSummary || isLoadingSystems || isLoadingTables;

  const summary = summaryData || {};
  const cache = summaryData ? {
    cacheHits: summaryData.cache_hits,
    cacheMisses: summaryData.cache_misses,
    cacheHitRatio: summaryData.cache_hits + summaryData.cache_misses > 0 ? (summaryData.cache_hits * 100.0) / (summaryData.cache_hits + summaryData.cache_misses) : 0
  } : {};
  const systemBreakdown = Array.isArray(systemsData) ? systemsData : [];
  const topTables = Array.isArray(topTablesData) ? topTablesData.map(t => ({ ...t, key: `${t.table_name}-${t.service_name}` })) : [];

  const dataSources = useMemo(() => ({
    'database-cache-insights': { summary, tableMetrics: topTables, systemBreakdown, cache }
  }), [summary, topTables, systemBreakdown, cache]);

  const totalSystems = systemBreakdown.length;
  const totalSpans = systemBreakdown.reduce((acc, s) => acc + (s.span_count || 0), 0);

  return (
    <div>
      <PageHeader title="Database & Cache Performance" icon={<Database size={24} />} subtitle="Query latency, cache hit ratio, database system breakdown, and per-table metrics" />

      {/* Stat cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <StatCard title="Avg Query Latency" value={`${n(summary.avg_query_latency_ms).toFixed(1)} ms`} icon={<Timer size={18} />} loading={isLoading} description="Across all database systems" />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard title="P95 Query Latency" value={`${n(summary.p95_query_latency_ms).toFixed(1)} ms`} icon={<Zap size={18} />} loading={isLoading} description="95th percentile response" />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard title="Cache Hit Ratio" value={formatPercentage(cache.cacheHitRatio, 1)} icon={<Layers3 size={18} />} loading={isLoading} description={`${formatNumber(cache.cacheHits || 0)} hits / ${formatNumber((cache.cacheHits || 0) + (cache.cacheMisses || 0))} total`} />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard title="Database Systems" value={totalSystems} icon={<Database size={18} />} loading={isLoading} description={`${formatNumber(totalSpans)} total spans`} />
        </Col>
      </Row>

      {/* Database system breakdown */}
      {systemBreakdown.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            marginBottom: '14px', paddingLeft: '2px',
          }}>
            <Activity size={16} color="#8e8e8e" />
            <span style={{ color: '#b0b0b0', fontSize: '13px', fontWeight: 500, letterSpacing: '0.5px', textTransform: 'uppercase' }}>
              Database Systems Detected
            </span>
          </div>
          <Row gutter={[14, 14]}>
            {systemBreakdown.map((sys) => (
              <Col key={sys.db_system} xs={24} sm={12} lg={8} xl={6}>
                <SystemBreakdownCard system={sys} />
              </Col>
            ))}
          </Row>
        </div>
      )}

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
                Query Performance by Table
              </span>
            }
            style={{ height: '100%' }}
            styles={{ body: { padding: '8px' } }}
          >
            <DatabaseTopTablesList tables={topTables} />
          </Card>
        </Col>
      </Row>
    </div>
  );
}
