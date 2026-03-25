import { Badge, Skeleton, Surface, Tooltip, SimpleTable } from '@/components/ui';
import { useMemo } from 'react';

import ConfigurableDashboard from '@shared/components/ui/dashboard/ConfigurableDashboard';
import type {
  DashboardDataSources,
  DashboardRenderConfig,
} from '@shared/types/dashboardConfig';

import { formatNumber } from '@shared/utils/formatters';

import { APP_COLORS } from '@config/colorLiterals';

import { n, naSpan, rateColor } from './tabHelpers';

type AiSecurityMetricRow = Record<string, unknown>;

interface AiSecurityTabProps {
  secMetrics: AiSecurityMetricRow[];
  secLoading: boolean;
  config: DashboardRenderConfig | null;
  dataSources: DashboardDataSources;
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
    { title: 'Model', dataIndex: 'model_name', key: 'model_name', render: (value: any) => <Badge variant="default" className="ai-model-tag">{value || 'unknown'}</Badge> },
    { title: 'Requests', dataIndex: 'total_requests', key: 'total_requests', render: (value: any) => formatNumber(Number(value)), align: 'right' as const },
    {
      title: 'PII Detected',
      dataIndex: 'pii_detected_count',
      key: 'pii_detected_count',
      render: (value: any) => {
        const normalized = n(value) ?? 0;
        return (
          <Tooltip content={`${normalized} requests with PII`}>
            <span style={{ color: normalized > 0 ? APP_COLORS.hex_f04438 : APP_COLORS.hex_73c991, fontWeight: 600 }}>{formatNumber(normalized)}</span>
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
            <div style={{ width: 60, height: 6, borderRadius: 3, background: 'var(--bg-tertiary, #2d2d2d)', overflow: 'hidden' }}><div style={{ width: `${Math.min(normalized, 100)}%`, height: '100%', background: color, borderRadius: 3 }} /></div>
            <span style={{ color, fontWeight: 600, fontSize: 12 }}>{normalized.toFixed(2)}%</span>
          </div>
        );
      },
    },
    { title: 'Guardrail Blocks', dataIndex: 'guardrail_blocked_count', key: 'guardrail_blocked_count', render: (value: any) => { const normalized = n(value) ?? 0; return <span style={{ color: normalized > 0 ? APP_COLORS.hex_f79009 : APP_COLORS.hex_73c991, fontWeight: 600 }}>{formatNumber(normalized)}</span>; }, align: 'right' as const },
    { title: 'Block Rate', dataIndex: 'guardrail_block_rate', key: 'guardrail_block_rate', render: (value: any) => { const normalized = n(value); return normalized == null ? naSpan() : <span style={{ color: rateColor(normalized), fontWeight: 600 }}>{normalized.toFixed(2)}%</span>; }, align: 'right' as const },
    {
      title: 'Overall Safety',
      key: 'safety',
      render: (_value: any, row: any) => {
        const piiRate = n(row.pii_detection_rate) ?? 0;
        const blockRate = n(row.guardrail_block_rate) ?? 0;
        const ok = piiRate < 1 && blockRate < 1;
        return (
          <Tooltip content={`PII ${piiRate.toFixed(2)}%, Blocks ${blockRate.toFixed(2)}%`}>
            <Badge variant={ok ? 'success' : 'error'}>{ok ? 'Healthy' : 'Attention'}</Badge>
          </Tooltip>
        );
      },
    },
  ];

  return (
    <>
      <ConfigurableDashboard config={config ?? null} dataSources={dataSources} extraContext={{ selectedModel }} />
      <Surface elevation={1} padding="md" className="ai-chart-card" style={{ marginTop: 16 }}>
        <h4>Per-Model Security</h4>
        {secLoading ? <Skeleton /> : data.length === 0 ? <div className="text-muted" style={{textAlign:'center',padding:32}}>No data</div> : (
          <SimpleTable dataSource={data.map((row: any, index: number) => ({ ...row, key: index }))} columns={tableColumns as any} size="small" pagination={{ pageSize: 20 }} scroll={{ x: 1000 }} />
        )}
      </Surface>
    </>
  );
}
