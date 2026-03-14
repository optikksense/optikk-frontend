import { useQuery } from '@tanstack/react-query';
import { Card, Row, Col, Tabs, Tag } from 'antd';
import { Timer } from 'lucide-react';
import { useState, useMemo } from 'react';

import StatCard from '@shared/components/ui/cards/StatCard';
import DataTable from '@shared/components/ui/data-display/DataTable';
import FilterBar from '@shared/components/ui/forms/FilterBar';
import PageHeader from '@shared/components/ui/layout/PageHeader';
import ConfigurableDashboard from '@shared/components/ui/dashboard/ConfigurableDashboard';

import { latencyService } from '@shared/api/latencyService';

import { useDashboardConfig } from '@shared/hooks/useDashboardConfig';
import { useTimeRange } from '@shared/hooks/useTimeRangeQuery';

import { formatNumber } from '@shared/utils/formatters';

import { APP_COLORS } from '@config/colorLiterals';

import type { ChangeEvent } from 'react';

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
  if (typeof label !== 'string') return APP_COLORS.hex_f04438;
  if (label.startsWith('0-') || label.startsWith('10-') || label.startsWith('25-')) return APP_COLORS.hex_73c991;
  if (label.startsWith('50-') || label.startsWith('100-')) return APP_COLORS.hex_06aed5;
  if (label.startsWith('250-') || label.startsWith('500')) return APP_COLORS.hex_f79009;
  return APP_COLORS.hex_f04438;
}

/**
 *
 * @param root0
 * @param root0.embedded
 */
export default function LatencyAnalysisPage({ embedded = false }) {
  const { selectedTeamId, timeRange, refreshKey } = (useTimeRange() as any) || {};
  const { startTime, endTime } = timeRange || {};
  const [serviceName, setServiceName] = useState('');
  const [operationName, setOperationName] = useState('');
  const [activeTab, setActiveTab] = useState('charts');

  const { config } = useDashboardConfig('latency-analysis');

  const { data: histogramData, isLoading: histLoading } = useQuery({
    queryKey: ['latency-histogram', selectedTeamId, startTime, endTime, serviceName, operationName, refreshKey],
    queryFn: () =>
      latencyService.getHistogram(selectedTeamId, startTime, endTime, {
        serviceName: serviceName || undefined,
        operationName: operationName || undefined,
      }),
    enabled: !!selectedTeamId,
  });

  const { data: heatmapData, isLoading: heatLoading } = useQuery({
    queryKey: ['latency-heatmap', selectedTeamId, startTime, endTime, serviceName, refreshKey],
    queryFn: () =>
      latencyService.getHeatmap(selectedTeamId, startTime, endTime, (serviceName || undefined) as any, '5m'),
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
            data={{
              columns: percentileColumns,
              rows: histogram,
              loading: histLoading,
              rowKey: (record: Record<string, unknown>, idx?: number) => {
                const bucket = record.bucket;
                return typeof bucket === 'string' ? bucket : `row-${idx ?? 0}`;
              },
            }}
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
            type: 'search',
            key: 'service',
            placeholder: 'Filter by service',
            value: serviceName || undefined,
            onChange: (event: ChangeEvent<HTMLInputElement>) => setServiceName(event.target.value),
            width: 200,
          },
          {
            type: 'search',
            key: 'operation',
            placeholder: 'Filter by operation',
            value: operationName || undefined,
            onChange: (event: ChangeEvent<HTMLInputElement>) => setOperationName(event.target.value),
            width: 200,
          },
        ]}
      />

      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            metric={{ title: 'P50 Latency', value: stats.p50, description: 'Median latency' }}
            visuals={{ icon: <Timer size={20} />, iconColor: APP_COLORS.hex_73c991 }}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            metric={{ title: 'P95 Latency', value: stats.p95, description: '95th percentile' }}
            visuals={{ icon: <Timer size={20} />, iconColor: APP_COLORS.hex_f79009 }}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            metric={{ title: 'P99 Latency', value: stats.p99, description: '99th percentile' }}
            visuals={{ icon: <Timer size={20} />, iconColor: APP_COLORS.hex_f04438 }}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            metric={{ title: 'Avg Latency', value: stats.avg, description: 'Mean latency' }}
            visuals={{ icon: <Timer size={20} />, iconColor: APP_COLORS.hex_5e60ce }}
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
