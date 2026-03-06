import { useQuery } from '@tanstack/react-query';
import { Card, Row, Col, Tabs, Tag } from 'antd';
import { Timer } from 'lucide-react';
import { useState, useMemo } from 'react';

import StatCard from '@components/common/cards/StatCard';
import DataTable from '@components/common/data-display/DataTable';
import FilterBar from '@components/common/forms/FilterBar';
import PageHeader from '@components/common/layout/PageHeader';
import ConfigurableDashboard from '@components/dashboard/ConfigurableDashboard';

import { v1Service } from '@services/v1Service';

import { useDashboardConfig } from '@hooks/useDashboardConfig';
import { useTimeRange } from '@hooks/useTimeRangeQuery';

import { formatNumber } from '@utils/formatters';

const HISTOGRAM_BUCKETS = [
  { label: '0-10ms', key: '0_10ms' },
  { label: '10-25ms', key: '10_25ms' },
  { label: '25-50ms', key: '25_50ms' },
  { label: '50-100ms', key: '50_100ms' },
  { label: '100-250ms', key: '100_250ms' },
  { label: '250-500ms', key: '250_500ms' },
  { label: '500ms-1s', key: '500ms_1s' },
  { label: '1s-2.5s', key: '1s_2500ms' },
  { label: '2.5s-5s', key: '2500ms_5s' },
  { label: '>5s', key: 'gt_5s' },
];

function bucketColor(label: string) {
  if (typeof label !== 'string') return '#F04438';
  if (label.startsWith('0-') || label.startsWith('10-') || label.startsWith('25-')) return '#73C991';
  if (label.startsWith('50-') || label.startsWith('100-')) return '#06AED5';
  if (label.startsWith('250-') || label.startsWith('500')) return '#F79009';
  return '#F04438';
}

/**
 *
 * @param root0
 * @param root0.embedded
 */
export default function LatencyAnalysisPage({ embedded = false }) {
  const { selectedTeamId, timeRange, refreshKey } = (useTimeRange() as any) || {};
  const { startTime, endTime } = timeRange || {};
  const [serviceName, setServiceName] = useState<string | null>(null);
  const [operationName, setOperationName] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('charts');

  const { config } = useDashboardConfig('latency-analysis');

  const { data: histogramData, isLoading: histLoading } = useQuery({
    queryKey: ['latency-histogram', selectedTeamId, startTime, endTime, serviceName, operationName, refreshKey],
    queryFn: () =>
      v1Service.getLatencyHistogram(selectedTeamId, startTime, endTime, {
        serviceName: serviceName || undefined,
        operationName: operationName || undefined,
      }),
    enabled: !!selectedTeamId,
  });

  const { data: heatmapData, isLoading: heatLoading } = useQuery({
    queryKey: ['latency-heatmap', selectedTeamId, startTime, endTime, serviceName, refreshKey],
    queryFn: () =>
      v1Service.getLatencyHeatmap(selectedTeamId, startTime, endTime, (serviceName || undefined) as any, '5m'),
    enabled: !!selectedTeamId && activeTab === 'charts',
  });

  const histogram = (Array.isArray(histogramData) ? histogramData : []);
  const heatmap = (Array.isArray(heatmapData) ? heatmapData : []);

  // Build dataSources map for ConfigurableDashboard
  const dataSources = useMemo(() => ({
    'latency-histogram': histogram,
    'latency-heatmap': heatmap,
  }), [histogram, heatmap]);

  // Derive summary stats from histogram
  const stats = useMemo(() => {
    const total = histogram.reduce((s: number, b: any) => s + (Number(b.span_count) || 0), 0);
    if (total === 0) return { p50: 'N/A', p95: 'N/A', p99: 'N/A', avg: 'N/A' };

    let p50 = 'N/A'; let p95 = 'N/A'; let p99 = 'N/A';
    if (histogram[0]?.p50_ms != null) {
      p50 = `${Number(histogram[0].p50_ms).toFixed(1)}ms`;
      p95 = `${Number(histogram[0].p95_ms).toFixed(1)}ms`;
      p99 = `${Number(histogram[0].p99_ms).toFixed(1)}ms`;
    }
    const avg = histogram[0]?.avg_ms != null
      ? `${Number(histogram[0].avg_ms).toFixed(1)}ms`
      : 'N/A';

    return { p50, p95, p99, avg };
  }, [histogram]);

  // Percentile table columns
  const percentileColumns = [
    {
      title: 'Bucket', dataIndex: 'bucket', key: 'bucket',
      render: (b: any) => {
        const found = HISTOGRAM_BUCKETS.find((hb) => hb.key === b);
        const label = found?.label || b;
        return <Tag color={bucketColor(label)}>{label}</Tag>;
      },
    },
    { title: 'Span Count', dataIndex: 'span_count', key: 'span_count', render: (v: any) => formatNumber(Number(v) || 0) },
    { title: 'P50', dataIndex: 'p50_ms', key: 'p50_ms', render: (v: any) => v != null ? `${Number(v).toFixed(1)}ms` : '-' },
    { title: 'P95', dataIndex: 'p95_ms', key: 'p95_ms', render: (v: any) => v != null ? `${Number(v).toFixed(1)}ms` : '-' },
    { title: 'P99', dataIndex: 'p99_ms', key: 'p99_ms', render: (v: any) => v != null ? `${Number(v).toFixed(1)}ms` : '-' },
    { title: 'Max', dataIndex: 'max_ms', key: 'max_ms', render: (v: any) => v != null ? `${Number(v).toFixed(1)}ms` : '-' },
    { title: 'Avg', dataIndex: 'avg_ms', key: 'avg_ms', render: (v: any) => v != null ? `${Number(v).toFixed(1)}ms` : '-' },
  ];

  const tabItems = [
    {
      key: 'charts',
      label: 'Histogram & Heatmap',
      children: (
        <ConfigurableDashboard
          config={config}
          dataSources={dataSources}
          isLoading={histLoading || heatLoading}
        />
      ),
    },
    {
      key: 'table',
      label: 'Percentile Table',
      children: (
        <Card>
          <DataTable
            columns={percentileColumns}
            data={histogram}
            loading={histLoading}
            rowKey={(record: any, idx: number) => record?.bucket || `row-${idx}`}
          />
        </Card>
      ),
    },
  ];

  return (
    <div className="latency-analysis-page">
      {!embedded && <PageHeader title="Latency Analysis" icon={<Timer size={24} />} />}

      <FilterBar
        filters={[
          {
            type: 'input',
            key: 'service',
            placeholder: 'Filter by service',
            value: serviceName,
            onChange: setServiceName,
            width: 200,
          },
          {
            type: 'input',
            key: 'operation',
            placeholder: 'Filter by operation',
            value: operationName,
            onChange: setOperationName,
            width: 200,
          },
        ]}
      />

      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="P50 Latency"
            value={stats.p50}
            icon={<Timer size={20} />}
            iconColor="#73C991"
            description="Median latency"
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="P95 Latency"
            value={stats.p95}
            icon={<Timer size={20} />}
            iconColor="#F79009"
            description="95th percentile"
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="P99 Latency"
            value={stats.p99}
            icon={<Timer size={20} />}
            iconColor="#F04438"
            description="99th percentile"
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Avg Latency"
            value={stats.avg}
            icon={<Timer size={20} />}
            iconColor="#5E60CE"
            description="Mean latency"
          />
        </Col>
      </Row>

      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={tabItems}
      />
    </div>
  );
}
