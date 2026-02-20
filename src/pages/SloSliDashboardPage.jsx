import { Row, Col, Card } from 'antd';
import { Target, ShieldCheck, Gauge } from 'lucide-react';
import { useTimeRangeQuery } from '@hooks/useTimeRangeQuery';
import { PageHeader, StatCard, DataTable } from '@components/common';
import { v1Service } from '@services/v1Service';

const n = (v) => (v == null || Number.isNaN(Number(v)) ? 0 : Number(v));

export default function SloSliDashboardPage() {
  const { data, isLoading } = useTimeRangeQuery(
    'slo-sli-insights',
    (teamId, start, end) => v1Service.getSloSli(teamId, start, end, '5m')
  );

  const status = data?.status || {};
  const objectives = data?.objectives || {};
  const timeseries = Array.isArray(data?.timeseries) ? data.timeseries : [];
  const cols = [
    { title: 'Timestamp', dataIndex: 'timestamp', key: 'timestamp', render: (v) => new Date(v).toLocaleString() },
    { title: 'Requests', dataIndex: 'request_count', key: 'request_count' },
    { title: 'Errors', dataIndex: 'error_count', key: 'error_count' },
    { title: 'Availability %', dataIndex: 'availability_percent', key: 'availability_percent', render: (v) => n(v).toFixed(3) },
    { title: 'Avg Latency (ms)', dataIndex: 'avg_latency_ms', key: 'avg_latency_ms', render: (v) => n(v).toFixed(1) },
  ];

  return (
    <div>
      <PageHeader title="SLO / SLI Dashboard" icon={<Target size={24} />} subtitle="Objective progress, error budget, and historical compliance" />

      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={12} lg={6}><StatCard title="Availability" value={`${n(status.availabilityPercent).toFixed(3)}%`} icon={<ShieldCheck size={18} />} loading={isLoading} /></Col>
        <Col xs={24} sm={12} lg={6}><StatCard title="P95 Latency" value={`${n(status.p95LatencyMs).toFixed(1)} ms`} icon={<Gauge size={18} />} loading={isLoading} /></Col>
        <Col xs={24} sm={12} lg={6}><StatCard title="Error Budget" value={`${n(status.errorBudgetRemainingPercent).toFixed(1)}%`} icon={<Target size={18} />} loading={isLoading} /></Col>
        <Col xs={24} sm={12} lg={6}><StatCard title="SLO Target" value={`${n(objectives.availabilityTarget).toFixed(1)}%`} icon={<Target size={18} />} loading={isLoading} /></Col>
      </Row>

      <Card title="Historical Compliance">
        <DataTable columns={cols} data={timeseries.map((r, i) => ({ ...r, key: `slo-${i}` }))} rowKey="key" loading={isLoading} />
      </Card>
    </div>
  );
}
