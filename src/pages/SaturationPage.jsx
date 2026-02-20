import { useMemo, useState } from 'react';
import { Row, Col, Card, Select, Tag, Table, Skeleton, Empty, Progress, Tooltip } from 'antd';
import {
  Gauge, Database, Radio, Cpu, GitPullRequest,
} from 'lucide-react';
import { Line } from 'react-chartjs-2';
import { useTimeRangeQuery } from '@hooks/useTimeRangeQuery';
import { v1Service } from '@services/v1Service';
import PageHeader from '@components/common/PageHeader';
import StatCard from '@components/common/StatCard';
import { formatNumber, formatDuration } from '@utils/formatters';
import { createChartOptions, createLineDataset, getChartColor } from '@utils/chartHelpers';
import './SaturationPage.css';

function pct(v) {
  const n = Number(v);
  return isNaN(n) ? null : Math.round(n * 100) / 100;
}

function SatGauge({ label, value, max, color }) {
  const pctVal = max > 0 ? Math.min((value / max) * 100, 100) : value;
  const status = pctVal > 80 ? 'exception' : pctVal > 60 ? 'normal' : 'success';
  return (
    <div className="sat-gauge">
      <div className="sat-gauge-label">{label}</div>
      <Progress
        type="circle"
        percent={Math.round(pctVal)}
        size={72}
        status={status}
        strokeColor={color}
        format={() => (
          <span style={{ fontSize: 11, color: 'var(--text-primary)' }}>
            {max > 0 ? `${Number(value).toFixed(0)}%` : `${Number(pctVal).toFixed(1)}%`}
          </span>
        )}
      />
    </div>
  );
}

// Build a chart.js Line dataset from a pivoted timeseries map
function buildLineChartData(timeseriesRaw, metricKey, selectedService) {
  const raw = Array.isArray(timeseriesRaw) ? timeseriesRaw : [];
  const filtered = selectedService ? raw.filter((r) => r.service_name === selectedService) : raw;

  const tsSet = new Set();
  const svcSet = new Set();
  for (const row of filtered) {
    if (row[metricKey] != null && row[metricKey] !== '') {
      tsSet.add(row.timestamp);
      svcSet.add(row.service_name || 'unknown');
    }
  }

  const timestamps = Array.from(tsSet).sort((a, b) => new Date(a) - new Date(b));
  const svcNames = Array.from(svcSet);

  const lookup = {};
  for (const row of filtered) {
    const svc = row.service_name || 'unknown';
    if (!lookup[svc]) lookup[svc] = {};
    if (row[metricKey] != null && row[metricKey] !== '') {
      lookup[svc][row.timestamp] = pct(row[metricKey]);
    }
  }

  const labels = timestamps.map((ts) => {
    const d = new Date(ts);
    return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
  });

  const datasets = svcNames.map((svc, i) =>
    createLineDataset(
      svc,
      timestamps.map((ts) => lookup[svc]?.[ts] ?? null),
      getChartColor(i),
      false
    )
  );

  return { labels, datasets, hasData: datasets.length > 0 };
}

const lineOptions = createChartOptions({
  plugins: {
    legend: { display: true, labels: { color: '#666', font: { size: 11 } } },
  },
  scales: {
    y: { ticks: { color: '#666' }, grid: { color: '#2D2D2D' }, beginAtZero: true },
  },
});

export default function SaturationPage() {
  const [selectedService, setSelectedService] = useState(null);

  const { data: metricsRaw, isLoading: metricsLoading } = useTimeRangeQuery(
    'saturation-metrics',
    (teamId, start, end) => v1Service.getSaturationMetrics(teamId, start, end)
  );

  const { data: timeseriesRaw, isLoading: tsLoading } = useTimeRangeQuery(
    'saturation-timeseries',
    (teamId, start, end) => v1Service.getSaturationTimeSeries(teamId, start, end, '5m')
  );

  const { data: serviceMetricsRaw } = useTimeRangeQuery(
    'services-metrics-sat',
    (teamId, start, end) => v1Service.getServiceMetrics(teamId, start, end)
  );

  const services = useMemo(() => {
    const raw = Array.isArray(serviceMetricsRaw) ? serviceMetricsRaw : [];
    return raw.map((s) => s.service_name).filter(Boolean);
  }, [serviceMetricsRaw]);

  const metrics = useMemo(() => {
    const raw = Array.isArray(metricsRaw) ? metricsRaw : [];
    return selectedService ? raw.filter((r) => r.service_name === selectedService) : raw;
  }, [metricsRaw, selectedService]);

  const summary = useMemo(() => {
    if (!metrics.length) return { maxDbPool: 0, maxLag: 0, maxThread: 0, maxQueue: 0 };
    const maxDbPool = Math.max(...metrics.map((m) => pct(m.max_db_pool_util) ?? 0));
    const maxLag = Math.max(...metrics.map((m) => pct(m.max_consumer_lag) ?? 0));
    const maxThread = Math.max(...metrics.map((m) => pct(m.avg_thread_pool_active) ?? 0));
    const maxQueue = Math.max(...metrics.map((m) => pct(m.max_queue_depth) ?? 0));
    return { maxDbPool, maxLag, maxThread, maxQueue };
  }, [metrics]);

  const lagChart = useMemo(
    () => buildLineChartData(timeseriesRaw, 'avg_consumer_lag', selectedService),
    [timeseriesRaw, selectedService]
  );
  const threadChart = useMemo(
    () => buildLineChartData(timeseriesRaw, 'avg_thread_active', selectedService),
    [timeseriesRaw, selectedService]
  );
  const queueChart = useMemo(
    () => buildLineChartData(timeseriesRaw, 'avg_queue_depth', selectedService),
    [timeseriesRaw, selectedService]
  );

  const tableColumns = [
    {
      title: 'Service',
      dataIndex: 'service_name',
      key: 'service_name',
      render: (v) => (
        <Tag style={{ background: 'rgba(94,96,206,0.15)', color: '#5E60CE', border: '1px solid rgba(94,96,206,0.3)' }}>
          {v}
        </Tag>
      ),
    },
    {
      title: 'Span Count',
      dataIndex: 'span_count',
      key: 'span_count',
      render: (v) => formatNumber(Number(v)),
      sorter: (a, b) => Number(a.span_count) - Number(b.span_count),
      align: 'right',
    },
    {
      title: 'Avg Duration',
      dataIndex: 'avg_duration_ms',
      key: 'avg_duration_ms',
      render: (v) => formatDuration(Number(v)),
      sorter: (a, b) => Number(a.avg_duration_ms) - Number(b.avg_duration_ms),
      align: 'right',
    },
    {
      title: 'P95 Duration',
      dataIndex: 'p95_duration_ms',
      key: 'p95_duration_ms',
      render: (v) => {
        const n = Number(v);
        return (
          <span style={{ color: n > 1000 ? '#F04438' : n > 500 ? '#F79009' : 'var(--text-primary)' }}>
            {formatDuration(n)}
          </span>
        );
      },
      sorter: (a, b) => Number(a.p95_duration_ms) - Number(b.p95_duration_ms),
      align: 'right',
    },
    {
      title: 'DB Pool %',
      dataIndex: 'avg_db_pool_util',
      key: 'avg_db_pool_util',
      render: (v) => {
        const n = pct(v);
        if (n == null || isNaN(n)) return <span style={{ color: 'var(--text-muted)' }}>N/A</span>;
        const color = n > 80 ? '#F04438' : n > 60 ? '#F79009' : '#73C991';
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Progress percent={Math.min(n, 100)} size="small" showInfo={false} strokeColor={color} style={{ width: 80 }} />
            <span style={{ color, fontSize: 12, fontWeight: 600 }}>{n.toFixed(1)}%</span>
          </div>
        );
      },
      sorter: (a, b) => (pct(a.avg_db_pool_util) ?? -1) - (pct(b.avg_db_pool_util) ?? -1),
    },
    {
      title: 'Consumer Lag',
      dataIndex: 'max_consumer_lag',
      key: 'max_consumer_lag',
      render: (v) => {
        const n = pct(v);
        if (n == null || isNaN(n)) return <span style={{ color: 'var(--text-muted)' }}>N/A</span>;
        const color = n > 1000 ? '#F04438' : n > 100 ? '#F79009' : '#73C991';
        return <span style={{ color, fontWeight: 600, fontSize: 13 }}>{formatNumber(n)}</span>;
      },
      sorter: (a, b) => (pct(a.max_consumer_lag) ?? -1) - (pct(b.max_consumer_lag) ?? -1),
      align: 'right',
    },
    {
      title: 'Thread Pool Active',
      dataIndex: 'avg_thread_pool_active',
      key: 'avg_thread_pool_active',
      render: (v, record) => {
        const active = pct(v);
        const max = pct(record.max_thread_pool_size);
        if (active == null || isNaN(active)) return <span style={{ color: 'var(--text-muted)' }}>N/A</span>;
        const pctVal = max > 0 ? (active / max) * 100 : 0;
        const color = pctVal > 80 ? '#F04438' : pctVal > 60 ? '#F79009' : '#73C991';
        return (
          <Tooltip title={max ? `${active} / ${max} threads` : `${active} active`}>
            <span style={{ color, fontWeight: 600, fontSize: 13 }}>
              {active.toFixed(0)}{max ? `/${max.toFixed(0)}` : ''}
            </span>
          </Tooltip>
        );
      },
      sorter: (a, b) => (pct(a.avg_thread_pool_active) ?? -1) - (pct(b.avg_thread_pool_active) ?? -1),
      align: 'right',
    },
    {
      title: 'Queue Depth',
      dataIndex: 'max_queue_depth',
      key: 'max_queue_depth',
      render: (v) => {
        const n = pct(v);
        if (n == null || isNaN(n)) return <span style={{ color: 'var(--text-muted)' }}>N/A</span>;
        const color = n > 1000 ? '#F04438' : n > 100 ? '#F79009' : '#73C991';
        return <span style={{ color, fontWeight: 600, fontSize: 13 }}>{formatNumber(n)}</span>;
      },
      sorter: (a, b) => (pct(a.max_queue_depth) ?? -1) - (pct(b.max_queue_depth) ?? -1),
      align: 'right',
    },
  ];

  function NoData({ icon, attr }) {
    return (
      <div className="sat-no-data">
        {icon}
        <div>No data available</div>
        <div className="sat-no-data-hint">
          Instrument spans with <code>{attr}</code> attribute
        </div>
      </div>
    );
  }

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
      <Row gutter={[16, 16]}>
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

      {/* Timeseries charts */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={12}>
          <Card title="Consumer Lag (avg, per service)" className="sat-chart-card">
            {tsLoading ? (
              <Skeleton active paragraph={{ rows: 4 }} />
            ) : !lagChart.hasData ? (
              <NoData icon={<Radio size={32} style={{ color: 'var(--text-muted)' }} />} attr="messaging.kafka.consumer.lag" />
            ) : (
              <div style={{ height: 220 }}>
                <Line data={lagChart} options={lineOptions} />
              </div>
            )}
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card title="Thread Pool Active (avg, per service)" className="sat-chart-card">
            {tsLoading ? (
              <Skeleton active paragraph={{ rows: 4 }} />
            ) : !threadChart.hasData ? (
              <NoData icon={<Cpu size={32} style={{ color: 'var(--text-muted)' }} />} attr="thread.pool.active" />
            ) : (
              <div style={{ height: 220 }}>
                <Line data={threadChart} options={lineOptions} />
              </div>
            )}
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card title="Queue Depth (avg, per service)" className="sat-chart-card">
            {tsLoading ? (
              <Skeleton active paragraph={{ rows: 4 }} />
            ) : !queueChart.hasData ? (
              <NoData icon={<GitPullRequest size={32} style={{ color: 'var(--text-muted)' }} />} attr="queue.depth" />
            ) : (
              <div style={{ height: 220 }}>
                <Line data={queueChart} options={lineOptions} />
              </div>
            )}
          </Card>
        </Col>

        {/* DB pool utilization gauges */}
        {metrics.length > 0 && (
          <Col xs={24} lg={12}>
            <Card title="Per-Service DB Pool Utilization" className="sat-chart-card">
              {metricsLoading ? (
                <Skeleton active paragraph={{ rows: 4 }} />
              ) : metrics.every((m) => pct(m.avg_db_pool_util) == null) ? (
                <NoData icon={<Database size={32} style={{ color: 'var(--text-muted)' }} />} attr="db.connection_pool.utilization" />
              ) : (
                <div className="sat-gauges-row">
                  {metrics.slice(0, 8).map((m, i) => {
                    const v = pct(m.avg_db_pool_util);
                    if (v == null) return null;
                    const color = v > 80 ? '#F04438' : v > 60 ? '#F79009' : '#73C991';
                    return (
                      <div key={i} className="sat-gauge-wrapper">
                        <SatGauge label={m.service_name} value={v} max={100} color={color} />
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          </Col>
        )}
      </Row>

      {/* Per-service saturation table */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24}>
          <Card
            title={
              <span>
                Saturation by Service
                <span style={{ fontSize: 11, fontWeight: 400, color: 'var(--text-muted)', marginLeft: 12 }}>
                  Derived from OpenTelemetry span attributes
                </span>
              </span>
            }
            className="sat-chart-card"
          >
            {metricsLoading ? (
              <Skeleton active paragraph={{ rows: 8 }} />
            ) : metrics.length === 0 ? (
              <Empty description="No saturation data in selected time range" />
            ) : (
              <Table
                dataSource={metrics.map((m, i) => ({ ...m, key: i }))}
                columns={tableColumns}
                size="small"
                pagination={{ pageSize: 20 }}
                scroll={{ x: 1000 }}
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
