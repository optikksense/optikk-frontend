import { APP_COLORS } from '@config/colorLiterals';
import { Card, Empty, Skeleton, Table, Tag } from 'antd';
import { useMemo } from 'react';

import ConfigurableDashboard from '@components/dashboard/ConfigurableDashboard';

import { formatDuration, formatNumber } from '@utils/formatters';

import { latColor, n, naSpan, rateColor } from './tabHelpers';

interface AiPerformanceTabProps {
  perfMetrics: any[];
  metricsLoading: boolean;
  config: any;
  dataSources: Record<string, any>;
  selectedModel: string | null;
}

/**
 *
 * @param root0
 * @param root0.perfMetrics
 * @param root0.metricsLoading
 * @param root0.config
 * @param root0.dataSources
 * @param root0.selectedModel
 */
export default function AiPerformanceTab({
  perfMetrics,
  metricsLoading,
  config,
  dataSources,
  selectedModel,
}: AiPerformanceTabProps) {
  const tableColumns = [
    { title: 'Model', dataIndex: 'model_name', key: 'model_name', render: (value: any) => <Tag className="ai-model-tag">{value || 'unknown'}</Tag> },
    { title: 'Provider', dataIndex: 'model_provider', key: 'model_provider', render: (value: any) => value ? <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>{value}</span> : naSpan() },
    { title: 'Type', dataIndex: 'request_type', key: 'request_type', render: (value: any) => value ? <Tag style={{ fontSize: 11 }}>{value}</Tag> : naSpan() },
    { title: 'Requests', dataIndex: 'total_requests', key: 'total_requests', render: (value: any) => formatNumber(Number(value)), sorter: (a: any, b: any) => Number(a.total_requests) - Number(b.total_requests), align: 'right' as const },
    { title: 'QPS', dataIndex: 'avg_qps', key: 'avg_qps', render: (value: any) => { const normalized = n(value); return normalized == null ? naSpan() : <span style={{ fontWeight: 600 }}>{normalized.toFixed(3)}</span>; }, sorter: (a: any, b: any) => (n(a.avg_qps) ?? -1) - (n(b.avg_qps) ?? -1), align: 'right' as const },
    { title: 'Avg Latency', dataIndex: 'avg_latency_ms', key: 'avg_latency_ms', render: (value: any) => { const normalized = n(value); return normalized == null ? naSpan() : <span style={{ color: latColor(normalized), fontWeight: 600 }}>{formatDuration(normalized)}</span>; }, sorter: (a: any, b: any) => (n(a.avg_latency_ms) ?? -1) - (n(b.avg_latency_ms) ?? -1), align: 'right' as const },
    { title: 'P50', dataIndex: 'p50_latency_ms', key: 'p50_latency_ms', render: (value: any) => { const normalized = n(value); return normalized == null ? naSpan() : formatDuration(normalized); }, sorter: (a: any, b: any) => (n(a.p50_latency_ms) ?? -1) - (n(b.p50_latency_ms) ?? -1), align: 'right' as const },
    { title: 'P95', dataIndex: 'p95_latency_ms', key: 'p95_latency_ms', render: (value: any) => { const normalized = n(value); return normalized == null ? naSpan() : <span style={{ color: latColor(normalized), fontWeight: 600 }}>{formatDuration(normalized)}</span>; }, sorter: (a: any, b: any) => (n(a.p95_latency_ms) ?? -1) - (n(b.p95_latency_ms) ?? -1), align: 'right' as const },
    { title: 'P99', dataIndex: 'p99_latency_ms', key: 'p99_latency_ms', render: (value: any) => { const normalized = n(value); return normalized == null ? naSpan() : <span style={{ color: latColor(normalized * 1.2) }}>{formatDuration(normalized)}</span>; }, sorter: (a: any, b: any) => (n(a.p99_latency_ms) ?? -1) - (n(b.p99_latency_ms) ?? -1), align: 'right' as const },
    { title: 'Tokens/sec', dataIndex: 'avg_tokens_per_sec', key: 'avg_tokens_per_sec', render: (value: any) => { const normalized = n(value); return normalized == null ? naSpan() : <span style={{ fontWeight: 600, color: APP_COLORS.hex_9e77ed }}>{normalized.toFixed(1)}</span>; }, sorter: (a: any, b: any) => (n(a.avg_tokens_per_sec) ?? -1) - (n(b.avg_tokens_per_sec) ?? -1), align: 'right' as const },
    { title: 'Timeouts', dataIndex: 'timeout_count', key: 'timeout_count', render: (value: any) => { const normalized = n(value) ?? 0; return <span style={{ color: normalized > 0 ? APP_COLORS.hex_f04438 : APP_COLORS.hex_73c991, fontWeight: 600 }}>{formatNumber(normalized)}</span>; }, sorter: (a: any, b: any) => (n(a.timeout_count) ?? 0) - (n(b.timeout_count) ?? 0), align: 'right' as const },
    { title: 'Error Rate', dataIndex: 'error_rate', key: 'error_rate', render: (value: any) => { const normalized = n(value); return normalized == null ? naSpan() : <span style={{ color: rateColor(normalized), fontWeight: 600 }}>{normalized.toFixed(2)}%</span>; }, sorter: (a: any, b: any) => (n(a.error_rate) ?? -1) - (n(b.error_rate) ?? -1), align: 'right' as const },
  ];

  const data = useMemo(() => {
    const raw = Array.isArray(perfMetrics) ? perfMetrics : [];
    return selectedModel ? raw.filter((row: any) => row.model_name === selectedModel) : raw;
  }, [perfMetrics, selectedModel]);

  return (
    <>
      <ConfigurableDashboard config={config} dataSources={dataSources} extraContext={{ selectedModel }} />
      <Card title="Per-Model Performance" className="ai-chart-card" style={{ marginTop: 16 }}>
        {metricsLoading ? <Skeleton active paragraph={{ rows: 6 }} /> : data.length === 0 ? <Empty description="No data" /> : (
          <Table dataSource={data.map((row: any, index: number) => ({ ...row, key: index }))} columns={tableColumns as any} size="small" pagination={{ pageSize: 20 }} scroll={{ x: 1600 }} />
        )}
      </Card>
    </>
  );
}
