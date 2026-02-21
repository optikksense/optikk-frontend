import { useMemo } from 'react';
import { Row, Col, Card, Progress, Tag, Table, Alert, Skeleton } from 'antd';
import { Line } from 'react-chartjs-2';
import { Target, ShieldCheck, Gauge, AlertTriangle, CheckCircle, TrendingDown } from 'lucide-react';
import { useTimeRangeQuery } from '@hooks/useTimeRangeQuery';
import { PageHeader, StatCard } from '@components/common';
import { v1Service } from '@services/v1Service';
import { createChartOptions, createLineDataset } from '@utils/chartHelpers';

const n = (v) => (v == null || Number.isNaN(Number(v)) ? 0 : Number(v));

const AVAILABILITY_TARGET = 99.9;
const P95_TARGET_MS = 300;

function SloGauge({ title, value, target, unit = '%', description }) {
  const pct = unit === 'ms'
    ? Math.min(100, (target / Math.max(value, 0.001)) * 100)
    : Math.min(100, value);

  const good = unit === 'ms' ? value <= target : value >= target;
  const strokeColor = good ? '#12B76A' : pct >= 80 ? '#F79009' : '#F04438';

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 8,
      padding: '20px 24px',
      background: 'var(--bg-tertiary, #1A1A1A)',
      borderRadius: 8,
      border: '1px solid var(--border-color, #2D2D2D)',
      minWidth: 160,
      flex: 1,
    }}>
      <Progress
        type="dashboard"
        percent={Number(pct.toFixed(1))}
        size={100}
        strokeColor={strokeColor}
        trailColor="#2D2D2D"
        format={() => (
          <div style={{ textAlign: 'center', lineHeight: 1.2 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: strokeColor }}>
              {unit === 'ms' ? `${n(value).toFixed(0)}ms` : `${n(value).toFixed(2)}%`}
            </div>
          </div>
        )}
      />
      <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-primary)', textAlign: 'center' }}>
        {title}
      </div>
      <div style={{ fontSize: 11, color: 'var(--text-muted)', textAlign: 'center' }}>
        Target: {unit === 'ms' ? `<${target}ms` : `≥${target}%`}
      </div>
      <Tag style={{
        fontSize: 11,
        borderRadius: 12,
        background: good ? 'rgba(18,183,106,0.12)' : 'rgba(240,68,56,0.12)',
        color: good ? '#12B76A' : '#F04438',
        border: `1px solid ${good ? 'rgba(18,183,106,0.3)' : 'rgba(240,68,56,0.3)'}`,
      }}>
        {good ? '✓ Meeting SLO' : '✗ Breaching SLO'}
      </Tag>
      {description && (
        <div style={{ fontSize: 11, color: 'var(--text-muted)', textAlign: 'center' }}>{description}</div>
      )}
    </div>
  );
}

export default function SloSliDashboardPage() {
  const { data, isLoading } = useTimeRangeQuery(
    'slo-sli-insights',
    (teamId, start, end) => v1Service.getSloSli(teamId, start, end, '5m')
  );

  const status = data?.status || {};
  const objectives = data?.objectives || {};
  const timeseries = useMemo(() =>
    Array.isArray(data?.timeseries) ? data.timeseries : []
  , [data]);

  const availabilityPct = n(status.availabilityPercent);
  const p95Ms = n(status.p95LatencyMs);
  const errorBudget = n(status.errorBudgetRemainingPercent);
  const isCompliant = availabilityPct >= AVAILABILITY_TARGET && p95Ms <= P95_TARGET_MS;

  const breachedCount = timeseries.filter(r => n(r.availability_percent) < AVAILABILITY_TARGET).length;
  const compliancePct = timeseries.length > 0
    ? ((timeseries.length - breachedCount) / timeseries.length * 100).toFixed(1)
    : '100.0';

  // Chart labels
  const chartLabels = useMemo(() =>
    timeseries.map((r) => {
      const d = new Date(r.timestamp);
      return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
    })
  , [timeseries]);

  const availabilityChartData = useMemo(() => ({
    labels: chartLabels,
    datasets: [
      createLineDataset('Availability %', timeseries.map(r => n(r.availability_percent)), '#12B76A', true),
      {
        label: `Target (${AVAILABILITY_TARGET}%)`,
        data: timeseries.map(() => AVAILABILITY_TARGET),
        borderColor: '#F04438',
        borderDash: [6, 3],
        borderWidth: 1.5,
        pointRadius: 0,
        fill: false,
        tension: 0,
      },
    ],
  }), [timeseries, chartLabels]);

  const latencyChartData = useMemo(() => ({
    labels: chartLabels,
    datasets: [
      createLineDataset('Avg Latency (ms)', timeseries.map(r => n(r.avg_latency_ms)), '#5E60CE', true),
      {
        label: `P95 Target (${P95_TARGET_MS}ms)`,
        data: timeseries.map(() => P95_TARGET_MS),
        borderColor: '#F79009',
        borderDash: [6, 3],
        borderWidth: 1.5,
        pointRadius: 0,
        fill: false,
        tension: 0,
      },
    ],
  }), [timeseries, chartLabels]);

  const errorBudgetChartData = useMemo(() => ({
    labels: chartLabels,
    datasets: [
      {
        ...createLineDataset('Error Rate %', timeseries.map(r => 100 - n(r.availability_percent)), '#F04438', true),
        fill: true,
      },
      {
        label: `Budget Limit (${(100 - AVAILABILITY_TARGET).toFixed(1)}%)`,
        data: timeseries.map(() => 100 - AVAILABILITY_TARGET),
        borderColor: '#F79009',
        borderDash: [6, 3],
        borderWidth: 1.5,
        pointRadius: 0,
        fill: false,
        tension: 0,
      },
    ],
  }), [timeseries, chartLabels]);

  const availChartOpts = createChartOptions({
    plugins: {
      legend: { display: true, labels: { color: '#666', font: { size: 11 }, boxWidth: 20, padding: 12 } },
      tooltip: { callbacks: { label: (ctx) => `${ctx.dataset.label}: ${ctx.parsed.y.toFixed(3)}%` } },
    },
    scales: {
      y: {
        ticks: { color: '#666', callback: (v) => `${v.toFixed(1)}%` },
        grid: { color: '#2D2D2D' },
        min: timeseries.length > 0
          ? Math.max(0, Math.min(...timeseries.map(r => n(r.availability_percent))) - 0.5)
          : 99,
      },
    },
  });

  const latencyChartOpts = createChartOptions({
    plugins: {
      legend: { display: true, labels: { color: '#666', font: { size: 11 }, boxWidth: 20, padding: 12 } },
      tooltip: { callbacks: { label: (ctx) => `${ctx.dataset.label}: ${ctx.parsed.y.toFixed(1)}ms` } },
    },
    scales: {
      y: {
        ticks: { color: '#666', callback: (v) => `${v}ms` },
        grid: { color: '#2D2D2D' },
        beginAtZero: true,
      },
    },
  });

  const errorBudgetOpts = createChartOptions({
    plugins: {
      legend: { display: true, labels: { color: '#666', font: { size: 11 }, boxWidth: 20, padding: 12 } },
      tooltip: { callbacks: { label: (ctx) => `${ctx.dataset.label}: ${ctx.parsed.y.toFixed(3)}%` } },
    },
    scales: {
      y: {
        ticks: { color: '#666', callback: (v) => `${v.toFixed(2)}%` },
        grid: { color: '#2D2D2D' },
        beginAtZero: true,
      },
    },
  });

  const complianceColumns = [
    {
      title: 'Timestamp',
      dataIndex: 'timestamp',
      key: 'timestamp',
      render: (v) => (
        <span style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'monospace' }}>
          {new Date(v).toLocaleString()}
        </span>
      ),
    },
    {
      title: 'Requests',
      dataIndex: 'request_count',
      key: 'request_count',
      align: 'right',
      render: (v) => <span style={{ fontWeight: 600 }}>{Number(v || 0).toLocaleString()}</span>,
    },
    {
      title: 'Errors',
      dataIndex: 'error_count',
      key: 'error_count',
      align: 'right',
      render: (v) => (
        <span style={{ color: Number(v) > 0 ? '#F04438' : 'var(--text-muted)', fontWeight: 600 }}>
          {Number(v || 0).toLocaleString()}
        </span>
      ),
    },
    {
      title: 'Availability',
      dataIndex: 'availability_percent',
      key: 'availability_percent',
      align: 'right',
      sorter: (a, b) => n(a.availability_percent) - n(b.availability_percent),
      render: (v) => {
        const val = n(v);
        return (
          <span style={{ color: val >= AVAILABILITY_TARGET ? '#12B76A' : '#F04438', fontWeight: 700 }}>
            {val.toFixed(3)}%
          </span>
        );
      },
    },
    {
      title: 'Avg Latency',
      dataIndex: 'avg_latency_ms',
      key: 'avg_latency_ms',
      align: 'right',
      sorter: (a, b) => n(a.avg_latency_ms) - n(b.avg_latency_ms),
      render: (v) => {
        const val = n(v);
        return (
          <span style={{ color: val > P95_TARGET_MS ? '#F04438' : val > 100 ? '#F79009' : '#12B76A', fontWeight: 600 }}>
            {val.toFixed(1)}ms
          </span>
        );
      },
    },
    {
      title: 'Status',
      key: 'status',
      align: 'center',
      render: (_, record) => {
        const ok = n(record.availability_percent) >= AVAILABILITY_TARGET;
        return (
          <Tag style={{
            background: ok ? 'rgba(18,183,106,0.12)' : 'rgba(240,68,56,0.12)',
            color: ok ? '#12B76A' : '#F04438',
            border: `1px solid ${ok ? 'rgba(18,183,106,0.3)' : 'rgba(240,68,56,0.3)'}`,
            borderRadius: 12,
            fontSize: 11,
          }}>
            {ok ? 'Compliant' : 'Breached'}
          </Tag>
        );
      },
    },
  ];

  return (
    <div>
      <PageHeader
        title="SLO / SLI Dashboard"
        icon={<Target size={24} />}
        subtitle="Service Level Objectives — availability targets, error budgets, and historical compliance"
      />

      {/* Compliance banner */}
      {!isLoading && timeseries.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <Alert
            type={isCompliant ? 'success' : 'error'}
            showIcon
            icon={isCompliant ? <CheckCircle size={16} /> : <AlertTriangle size={16} />}
            message={
              isCompliant
                ? `All SLOs are being met — ${compliancePct}% of windows compliant`
                : `SLO breach detected — ${breachedCount} window${breachedCount !== 1 ? 's' : ''} below ${AVAILABILITY_TARGET}% availability`
            }
            style={{ borderRadius: 8 }}
          />
        </div>
      )}

      {/* SLO Gauge Row */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24}>
          <Card title={<span><ShieldCheck size={16} style={{ marginRight: 8, verticalAlign: 'middle' }} />SLO Health</span>}>
            {isLoading ? (
              <Skeleton active paragraph={{ rows: 3 }} />
            ) : (
              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center' }}>
                <SloGauge
                  title="Availability"
                  value={availabilityPct}
                  target={AVAILABILITY_TARGET}
                  unit="%"
                  description={`${n(data?.summary?.total_requests).toLocaleString()} total requests`}
                />
                <SloGauge
                  title="P95 Latency"
                  value={p95Ms}
                  target={P95_TARGET_MS}
                  unit="ms"
                  description={`Avg: ${n(data?.summary?.avg_latency_ms).toFixed(1)}ms`}
                />
                <SloGauge
                  title="Error Budget"
                  value={errorBudget}
                  target={50}
                  unit="%"
                  description={`${(100 - AVAILABILITY_TARGET).toFixed(1)}% total budget`}
                />
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 8,
                  padding: '20px 24px',
                  background: 'var(--bg-tertiary, #1A1A1A)',
                  borderRadius: 8,
                  border: '1px solid var(--border-color, #2D2D2D)',
                  minWidth: 160,
                  flex: 1,
                  justifyContent: 'center',
                }}>
                  <div style={{ fontSize: 32, fontWeight: 700, color: isCompliant ? '#12B76A' : '#F04438' }}>
                    {compliancePct}%
                  </div>
                  <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-primary)' }}>Window Compliance</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                    {timeseries.length - breachedCount} / {timeseries.length} windows compliant
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>SLO Target: {AVAILABILITY_TARGET}%</div>
                </div>
              </div>
            )}
          </Card>
        </Col>
      </Row>

      {/* Trend Charts */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} lg={12}>
          <Card title={<span><ShieldCheck size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />Availability Over Time</span>}>
            {isLoading ? (
              <Skeleton active paragraph={{ rows: 4 }} />
            ) : timeseries.length === 0 ? (
              <div style={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
                No data — ensure services are sending OTLP traces
              </div>
            ) : (
              <div style={{ height: 220 }}>
                <Line data={availabilityChartData} options={availChartOpts} />
              </div>
            )}
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title={<span><Gauge size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />Latency vs Target</span>}>
            {isLoading ? (
              <Skeleton active paragraph={{ rows: 4 }} />
            ) : timeseries.length === 0 ? (
              <div style={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
                No data — ensure services are sending OTLP traces
              </div>
            ) : (
              <div style={{ height: 220 }}>
                <Line data={latencyChartData} options={latencyChartOpts} />
              </div>
            )}
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24}>
          <Card title={<span><TrendingDown size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />Error Budget Burn</span>}>
            {isLoading ? (
              <Skeleton active paragraph={{ rows: 3 }} />
            ) : timeseries.length === 0 ? (
              <div style={{ height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
                No data in selected time range
              </div>
            ) : (
              <div style={{ height: 180 }}>
                <Line data={errorBudgetChartData} options={errorBudgetOpts} />
              </div>
            )}
          </Card>
        </Col>
      </Row>

      {/* Historical compliance table */}
      <Card
        title={
          <span>
            Historical Compliance
            {timeseries.length > 0 && (
              <span style={{ fontSize: 12, fontWeight: 400, color: 'var(--text-muted)', marginLeft: 12 }}>
                {timeseries.length} windows
              </span>
            )}
          </span>
        }
      >
        <Table
          columns={complianceColumns}
          dataSource={timeseries.map((r, i) => ({ ...r, key: `slo-${i}` }))}
          rowKey="key"
          loading={isLoading}
          size="small"
          pagination={{ pageSize: 20, showSizeChanger: true }}
          rowClassName={(record) =>
            n(record.availability_percent) < AVAILABILITY_TARGET ? 'high-error-row' : ''
          }
          locale={{ emptyText: 'No compliance data — check that services are sending OTLP traces' }}
        />
      </Card>
    </div>
  );
}
