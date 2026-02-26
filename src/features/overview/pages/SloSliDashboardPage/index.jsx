import { useMemo, useState } from 'react';
import { Row, Col, Card, Progress, Tag, Table, Alert, Skeleton } from 'antd';
import { Target, ShieldCheck, Gauge, AlertTriangle, CheckCircle, TrendingDown } from 'lucide-react';
import { useTimeRangeQuery } from '@hooks/useTimeRangeQuery';
import { useDashboardConfig } from '@hooks/useDashboardConfig';
import { PageHeader, StatCard, FilterBar } from '@components/common';
import { v1Service } from '@services/v1Service';
import ConfigurableDashboard from '@components/dashboard/ConfigurableDashboard';
import { useAppStore } from '@store/appStore';
import { dashboardService } from '@services/dashboardService';
import { useQuery } from '@tanstack/react-query';

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
  const [selectedService, setSelectedService] = useState(null);
  const { selectedTeamId, timeRange, refreshKey } = useAppStore();
  const { config } = useDashboardConfig('slo-sli');

  const getTimeRange = () => {
    const endTime = Date.now();
    const startTime = endTime - timeRange.minutes * 60 * 1000;
    return { startTime, endTime };
  };

  const { data: servicesData } = useQuery({
    queryKey: ['services', selectedTeamId, timeRange.value, refreshKey],
    queryFn: () => {
      const { startTime, endTime } = getTimeRange();
      return dashboardService.getServices(selectedTeamId, startTime, endTime);
    },
    enabled: !!selectedTeamId,
  });

  const services = servicesData || [];
  const serviceOptions = [
    { label: 'All Services', value: null },
    ...services.map((s) => ({ label: s.name || s.service_name || s.serviceName, value: s.name || s.service_name || s.serviceName })),
  ];

  const { data, isLoading } = useTimeRangeQuery(
    `slo-sli-insights-${selectedService || 'all'}`,
    (teamId, start, end) => v1Service.getSloSli(teamId, start, end, selectedService, '5m')
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

  const chartLabels = useMemo(() =>
    timeseries.map((r) => {
      const d = new Date(r.timestamp);
      return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
    })
    , [timeseries]);

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

      <FilterBar
        filters={[
          {
            type: 'select',
            key: 'service',
            placeholder: 'All Services',
            options: serviceOptions,
            value: selectedService,
            onChange: setSelectedService,
            width: 200,
          },
        ]}
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

      {/* Trend Charts — driven by YAML backend config */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24}>
          <ConfigurableDashboard
            config={config}
            dataSources={{
              'slo-sli-insights': data,
            }}
            isLoading={isLoading}
          />
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
