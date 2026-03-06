import { Row, Col, Card, Select, Tag, Table, Skeleton, Empty, Progress, Tooltip } from 'antd';
import {
  Gauge, Database, Radio, Cpu, GitPullRequest,
} from 'lucide-react';
import { useMemo, useState } from 'react';

import StatCard from '@components/common/cards/StatCard';
import PageHeader from '@components/common/layout/PageHeader';
import ConfigurableDashboard from '@components/dashboard/ConfigurableDashboard';

import { v1Service } from '@services/v1Service';

import { useDashboardConfig } from '@hooks/useDashboardConfig';
import { useTimeRangeQuery } from '@hooks/useTimeRangeQuery';

import { useAppStore } from '@store/appStore';

import { formatNumber, formatDuration, normalizePercentage } from '@utils/formatters';
import './SaturationPage.css';

function pct(v: any) {
  const n = Number(v);
  return isNaN(n) ? 0 : Math.round(n * 100) / 100;
}

function normalizeKafkaMetric(row: any = {}) {
  return {
    ...row,
    queue: row.queue ?? row.topic ?? '',
    avg_consumer_lag: Number(row.avg_consumer_lag ?? 0),
    max_consumer_lag: Number(row.max_consumer_lag ?? 0),
    avg_queue_depth: Number(row.avg_queue_depth ?? 0),
    max_queue_depth: Number(row.max_queue_depth ?? 0),
    avg_publish_rate: Number(row.avg_publish_rate ?? 0),
    avg_receive_rate: Number(row.avg_receive_rate ?? 0),
  };
}

function normalizeDatabaseMetric(row: any = {}) {
  return {
    ...row,
    table_name: row.table_name ?? row.sql_table ?? '',
    avg_latency_ms: Number(row.avg_latency_ms ?? 0),
    p95_latency_ms: Number(row.p95_latency_ms ?? 0),
    query_count: Number(row.query_count ?? 0),
  };
}

/**
 *
 */
export default function SaturationPage() {
  const { selectedTeamId, refreshKey } = useAppStore();
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const { config } = useDashboardConfig('saturation');

  // Fetch saturation metrics
  const { data: metricsData, isLoading: metricsLoading } = useTimeRangeQuery(
    'saturation-metrics-summary',
    (teamId, start, end) => (v1Service as any).getSaturationMetrics(teamId, start, end, selectedService),
    { extraKeys: [selectedService, refreshKey] },
  );

  const { data: tsData, isLoading: tsLoading } = useTimeRangeQuery(
    'saturation-timeseries',
    (teamId, start, end) => (v1Service as any).getSaturationTimeSeries(teamId, start, end, selectedService, '5m'),
    { extraKeys: [selectedService, refreshKey] },
  );

  const { data: servicesRaw } = useTimeRangeQuery(
    'saturation-services',
    (teamId, start, end) => (v1Service as any).getServices(teamId, start, end),
  );

  const services = useMemo(() => {
    const raw = Array.isArray(servicesRaw) ? servicesRaw : [];
    return Array.from(new Set(raw.map((s: any) => s.service_name || s.name).filter(Boolean)));
  }, [servicesRaw]);

  // Request isolated dataset paths
  const { data: kafkaLagRaw, isLoading: lagLoading } = useTimeRangeQuery(
    'saturation-kafka-lag',
    (teamId, start, end) => v1Service.getKafkaQueueLag(teamId, start, end),
  );
  const { data: dbLatencyRaw, isLoading: dbLatencyLoading } = useTimeRangeQuery(
    'saturation-db-latency',
    (teamId, start, end) => v1Service.getDatabaseAvgLatency(teamId, start, end),
  );
  const { data: dbQueryRaw, isLoading: dbQueryLoading } = useTimeRangeQuery(
    'saturation-db-queries',
    (teamId, start, end) => v1Service.getDatabaseQueryByTable(teamId, start, end),
  );

  const kafkaLag = useMemo(() => {
    const raw = Array.isArray(kafkaLagRaw) ? kafkaLagRaw : [];
    return raw.map(normalizeKafkaMetric);
  }, [kafkaLagRaw]);

  const dbLatency = useMemo(() => {
    const raw = Array.isArray(dbLatencyRaw) ? dbLatencyRaw : [];
    return raw.map(normalizeDatabaseMetric);
  }, [dbLatencyRaw]);

  const dbQueries = useMemo(() => {
    const raw = Array.isArray(dbQueryRaw) ? dbQueryRaw : [];
    return raw.map(normalizeDatabaseMetric);
  }, [dbQueryRaw]);

  const summary = useMemo(() => {
    const metrics: any = metricsData || {};
    const maxLag = kafkaLag.length ? Math.max(...kafkaLag.map((m) => Number(m.max_consumer_lag) || 0)) : 0;
    const maxQueue = kafkaLag.length ? Math.max(...kafkaLag.map((m) => Number(m.max_queue_depth) || 0)) : 0;

    return {
      maxLag,
      maxQueue,
      maxDbPool: Number(metrics.max_db_pool_utilization || 0),
      maxThread: Number(metrics.max_thread_pool_utilization || metrics.max_thread_active || 0),
    };
  }, [kafkaLag, metricsData]);

  const kafkaColumns = [
    {
      title: 'Kafka Queue',
      dataIndex: 'queue',
      key: 'queue',
      render: (v: any) => (
        <Tag style={{ background: 'rgba(247,144,9,0.15)', color: '#F79009', border: '1px solid rgba(247,144,9,0.3)' }}>
          {v || 'unknown'}
        </Tag>
      ),
    },
    {
      title: 'Consumer Lag (Avg)',
      dataIndex: 'avg_consumer_lag',
      key: 'avg_consumer_lag',
      render: (v: any) => formatNumber(v),
      sorter: (a: any, b: any) => Number(a.avg_consumer_lag) - Number(b.avg_consumer_lag),
      align: 'right' as any,
    },
    {
      title: 'Queue Depth (Avg)',
      dataIndex: 'avg_queue_depth',
      key: 'avg_queue_depth',
      render: (v: any) => formatNumber(v),
      sorter: (a: any, b: any) => Number(a.avg_queue_depth) - Number(b.avg_queue_depth),
      align: 'right' as any,
    },
  ];

  const dbTableColumns = [
    {
      title: 'Table Name',
      dataIndex: 'table_name',
      key: 'table_name',
      render: (v: any) => (
        <Tag style={{ background: 'rgba(94,96,206,0.15)', color: '#5E60CE', border: '1px solid rgba(94,96,206,0.3)' }}>
          {v || 'unknown'}
        </Tag>
      ),
    },
    {
      title: 'Query Count',
      dataIndex: 'query_count',
      key: 'query_count',
      render: (v: any) => formatNumber(Number(v)),
      sorter: (a: any, b: any) => Number(a.query_count) - Number(b.query_count),
      align: 'right' as any,
    },
    {
      title: 'Avg Latency',
      dataIndex: 'avg_latency_ms',
      key: 'avg_latency_ms',
      render: (v: any) => formatDuration(Number(v)),
      sorter: (a: any, b: any) => Number(a.avg_latency_ms) - Number(b.avg_latency_ms),
      align: 'right' as any,
    },
  ];

  return (
    <div className="saturation-page">
      <PageHeader
        title="Saturation Metrics"
        subtitle="Leading indicators: queue depths, consumer lag, thread pools, and connection pool utilization"
        icon={<Gauge size={24} />}
        actions={
          <Select
            placeholder="All Services"
            allowClear
            style={{ width: 200 }}
            value={selectedService}
            onChange={setSelectedService}
            options={services.map((s) => ({ label: s, value: s }))}
          />
        }
      />

      {/* Summary stat cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Max DB Pool Util"
            value={`${Number(summary.maxDbPool).toFixed(1)}%`}
            icon={<Database size={20} />}
            iconColor={summary.maxDbPool > 80 ? '#F04438' : summary.maxDbPool > 60 ? '#F79009' : '#73C991'}
            loading={metricsLoading}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Max Consumer Lag"
            value={formatNumber(summary.maxLag)}
            icon={<Radio size={20} />}
            iconColor={summary.maxLag > 1000 ? '#F04438' : summary.maxLag > 100 ? '#F79009' : '#73C991'}
            loading={metricsLoading}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Max Thread Active"
            value={formatNumber(summary.maxThread)}
            icon={<Cpu size={20} />}
            iconColor={summary.maxThread > 200 ? '#F04438' : summary.maxThread > 100 ? '#F79009' : '#73C991'}
            loading={metricsLoading}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Max Queue Depth"
            value={formatNumber(summary.maxQueue)}
            icon={<GitPullRequest size={20} />}
            iconColor={summary.maxQueue > 1000 ? '#F04438' : summary.maxQueue > 100 ? '#F79009' : '#73C991'}
            loading={metricsLoading}
          />
        </Col>
      </Row>

      {/* Configurable timeseries charts */}
      <div style={{ marginBottom: 24 }}>
        <ConfigurableDashboard
          config={config}
          dataSources={{
            'saturation-timeseries': (tsData as any)?.timeseries || [],
            'saturation-metrics': metricsData,
            'services-metrics': (metricsData as any)?.service_metrics || [],
          }}
          isLoading={tsLoading}
        />
      </div>

      {/* Database saturation table */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24}>
          <Card
            title={
              <span>
                Database Utilization by Table
                <span style={{ fontSize: 11, fontWeight: 400, color: 'var(--text-muted)', marginLeft: 12 }}>
                  Derived from db.sql.table
                </span>
              </span>
            }
            className="sat-chart-card"
          >
            {dbQueryLoading ? (
              <Skeleton active paragraph={{ rows: 8 }} />
            ) : dbQueries.length === 0 ? (
              <Empty description="No saturation data in selected time range" />
            ) : (
              <Table
                dataSource={dbQueries.map((m, i) => ({ ...m, key: i }))}
                columns={dbTableColumns}
                size="small"
                pagination={{ pageSize: 20 }}
                scroll={{ x: 800 }}
              />
            )}
          </Card>
        </Col>
      </Row>

      {/* Kafka saturation table */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24}>
          <Card
            title={
              <span>
                Kafka Queue / Consumer Lag
              </span>
            }
            className="sat-chart-card"
          >
            {lagLoading ? (
              <Skeleton active paragraph={{ rows: 8 }} />
            ) : kafkaLag.length === 0 ? (
              <Empty description="No messaging data in selected time range" />
            ) : (
              <Table
                dataSource={kafkaLag.map((m, i) => ({ ...m, key: i }))}
                columns={kafkaColumns}
                size="small"
                pagination={{ pageSize: 20 }}
                scroll={{ x: 800 }}
              />
            )}
          </Card>
        </Col>
      </Row>

      {/* Instrumentation guide */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24}>
          <Card title="Instrumentation Guide" className="sat-chart-card">
            <div className="sat-guide">
              <div className="sat-guide-intro">
                Saturation metrics are extracted from OpenTelemetry span <strong>attributes</strong>.
                Add these attributes to your spans to populate the charts above:
              </div>
              <div className="sat-guide-items">
                {[
                  { icon: <Database size={16} />, attr: 'db.connection_pool.utilization', desc: 'DB connection pool utilization (0–100)', example: '72.5', color: '#06AED5' },
                  { icon: <Radio size={16} />, attr: 'messaging.kafka.consumer.lag', desc: 'Kafka consumer group lag (message count)', example: '3204', color: '#F79009' },
                  { icon: <Cpu size={16} />, attr: 'thread.pool.active', desc: 'Number of active threads in the pool', example: '42', color: '#5E60CE' },
                  { icon: <Cpu size={16} />, attr: 'thread.pool.size', desc: 'Maximum thread pool capacity', example: '100', color: '#5E60CE' },
                  { icon: <GitPullRequest size={16} />, attr: 'queue.depth', desc: 'Internal queue depth / pending item count', example: '847', color: '#E478FA' },
                ].map((item, i) => (
                  <div key={i} className="sat-guide-item">
                    <div className="sat-guide-icon" style={{ color: item.color }}>{item.icon}</div>
                    <div className="sat-guide-content">
                      <code className="sat-guide-attr">{item.attr}</code>
                      <div className="sat-guide-desc">{item.desc}</div>
                    </div>
                    <div className="sat-guide-example">
                      <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>e.g. </span>
                      <code style={{ fontSize: 11, color: item.color }}>{item.example}</code>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
