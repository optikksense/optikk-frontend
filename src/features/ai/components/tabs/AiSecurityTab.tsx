import { Badge, Card, Empty, Progress, Skeleton, Table, Tag, Tooltip } from 'antd';
import { useMemo } from 'react';

import ConfigurableDashboard from '@components/dashboard/ConfigurableDashboard';

import { formatNumber } from '@utils/formatters';

import { n, naSpan, rateColor } from './tabHelpers';

interface AiSecurityTabProps {
  secMetrics: any[];
  secLoading: boolean;
  config: any;
  dataSources: Record<string, any>;
  selectedModel: string | null;
}

/**
 *
 * @param root0
 * @param root0.secMetrics
 * @param root0.secLoading
 * @param root0.config
 * @param root0.dataSources
 * @param root0.selectedModel
 */
export default function AiSecurityTab({
  secMetrics,
  secLoading,
  config,
  dataSources,
  selectedModel,
}: AiSecurityTabProps) {
  const data = useMemo(() => {
    const raw = Array.isArray(secMetrics) ? secMetrics : [];
    return selectedModel ? raw.filter((row: any) => row.model_name === selectedModel) : raw;
  }, [secMetrics, selectedModel]);

  const tableColumns = [
    { title: 'Model', dataIndex: 'model_name', key: 'model_name', render: (value: any) => <Tag className="ai-model-tag">{value || 'unknown'}</Tag> },
    { title: 'Requests', dataIndex: 'total_requests', key: 'total_requests', render: (value: any) => formatNumber(Number(value)), align: 'right' as const },
    {
      title: 'PII Detected',
      dataIndex: 'pii_detected_count',
      key: 'pii_detected_count',
      render: (value: any) => {
        const normalized = n(value) ?? 0;
        return (
          <Tooltip title={`${normalized} requests with PII`}>
            <span style={{ color: normalized > 0 ? '#F04438' : '#73C991', fontWeight: 600 }}>{formatNumber(normalized)}</span>
          </Tooltip>
        );
      },
      align: 'right' as const,
    },
    {
      title: 'PII Rate',
      dataIndex: 'pii_detection_rate',
      key: 'pii_detection_rate',
      render: (value: any) => {
        const normalized = n(value);
        if (normalized == null) return naSpan();
        const color = rateColor(normalized);
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Progress percent={Math.min(normalized, 100)} size="small" showInfo={false} strokeColor={color} style={{ width: 60 }} />
            <span style={{ color, fontWeight: 600, fontSize: 12 }}>{normalized.toFixed(2)}%</span>
          </div>
        );
      },
    },
    { title: 'Guardrail Blocks', dataIndex: 'guardrail_blocked_count', key: 'guardrail_blocked_count', render: (value: any) => { const normalized = n(value) ?? 0; return <span style={{ color: normalized > 0 ? '#F79009' : '#73C991', fontWeight: 600 }}>{formatNumber(normalized)}</span>; }, align: 'right' as const },
    { title: 'Block Rate', dataIndex: 'guardrail_block_rate', key: 'guardrail_block_rate', render: (value: any) => { const normalized = n(value); return normalized == null ? naSpan() : <span style={{ color: rateColor(normalized), fontWeight: 600 }}>{normalized.toFixed(2)}%</span>; }, align: 'right' as const },
    {
      title: 'Overall Safety',
      key: 'safety',
      render: (_value: any, row: any) => {
        const piiRate = n(row.pii_detection_rate) ?? 0;
        const blockRate = n(row.guardrail_block_rate) ?? 0;
        const ok = piiRate < 1 && blockRate < 1;
        return (
          <Tooltip title={`PII ${piiRate.toFixed(2)}%, Blocks ${blockRate.toFixed(2)}%`}>
            <Badge status={ok ? 'success' : 'error'} text={ok ? 'Healthy' : 'Attention'} />
          </Tooltip>
        );
      },
    },
  ];

  return (
    <>
      <ConfigurableDashboard config={config} dataSources={dataSources} extraContext={{ selectedModel }} />
      <Card title="Per-Model Security" className="ai-chart-card" style={{ marginTop: 16 }}>
        {secLoading ? <Skeleton active paragraph={{ rows: 6 }} /> : data.length === 0 ? <Empty description="No data" /> : (
          <Table dataSource={data.map((row: any, index: number) => ({ ...row, key: index }))} columns={tableColumns as any} size="small" pagination={{ pageSize: 20 }} scroll={{ x: 1000 }} />
        )}
      </Card>
    </>
  );
}
