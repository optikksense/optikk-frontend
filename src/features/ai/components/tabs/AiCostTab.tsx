import { Badge, Skeleton, Surface, SimpleTable } from '@/components/ui';
import { useMemo } from 'react';

import ConfigurableDashboard from '@shared/components/ui/dashboard/ConfigurableDashboard';
import type {
  DashboardDataSources,
  DashboardRenderConfig,
} from '@shared/types/dashboardConfig';

import { formatNumber } from '@shared/utils/formatters';

import { APP_COLORS } from '@config/colorLiterals';

import { dollar, n, naSpan } from './tabHelpers';

type AiCostMetricRow = Record<string, unknown>;

interface AiCostTabProps {
  costMetrics: AiCostMetricRow[];
  costLoading: boolean;
  config: DashboardRenderConfig | null;
  dataSources: DashboardDataSources;
  selectedModel: string | null;
}

/**
 *
 * @param root0
 * @param root0.costMetrics
 * @param root0.costLoading
 * @param root0.config
 * @param root0.dataSources
 * @param root0.selectedModel
 */
export default function AiCostTab({
  costMetrics,
  costLoading,
  config,
  dataSources,
  selectedModel,
}: AiCostTabProps) {
  const data = useMemo(() => {
    const raw = Array.isArray(costMetrics) ? costMetrics : [];
    return selectedModel ? raw.filter((row: any) => row.model_name === selectedModel) : raw;
  }, [costMetrics, selectedModel]);

  const tableColumns = [
    { title: 'Model', dataIndex: 'model_name', key: 'model_name', render: (value: any) => <Badge variant="default" className="ai-model-tag">{value || 'unknown'}</Badge> },
    { title: 'Provider', dataIndex: 'model_provider', key: 'model_provider', render: (value: any) => value ? <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>{value}</span> : naSpan() },
    { title: 'Requests', dataIndex: 'total_requests', key: 'total_requests', render: (value: any) => formatNumber(Number(value)), sorter: (a: any, b: any) => Number(a.total_requests) - Number(b.total_requests), align: 'right' as const },
    { title: 'Total Cost', dataIndex: 'total_cost_usd', key: 'total_cost_usd', render: (value: any) => { const normalized = n(value); return normalized == null ? naSpan() : <span style={{ color: APP_COLORS.hex_f79009, fontWeight: 700 }}>{dollar(normalized)}</span>; }, sorter: (a: any, b: any) => (n(a.total_cost_usd) ?? -1) - (n(b.total_cost_usd) ?? -1), align: 'right' as const },
    { title: 'Cost / Query', dataIndex: 'avg_cost_per_query', key: 'avg_cost_per_query', render: (value: any) => { const normalized = n(value); return normalized == null ? naSpan() : <span style={{ color: APP_COLORS.hex_fdb022, fontWeight: 600 }}>{dollar(normalized, 5)}</span>; }, sorter: (a: any, b: any) => (n(a.avg_cost_per_query) ?? -1) - (n(b.avg_cost_per_query) ?? -1), align: 'right' as const },
    { title: 'Prompt Tokens', dataIndex: 'total_prompt_tokens', key: 'total_prompt_tokens', render: (value: any) => { const normalized = n(value); return normalized == null ? naSpan() : formatNumber(normalized); }, sorter: (a: any, b: any) => (n(a.total_prompt_tokens) ?? -1) - (n(b.total_prompt_tokens) ?? -1), align: 'right' as const },
    { title: 'Completion Tokens', dataIndex: 'total_completion_tokens', key: 'total_completion_tokens', render: (value: any) => { const normalized = n(value); return normalized == null ? naSpan() : formatNumber(normalized); }, sorter: (a: any, b: any) => (n(a.total_completion_tokens) ?? -1) - (n(b.total_completion_tokens) ?? -1), align: 'right' as const },
    { title: 'Total Tokens', dataIndex: 'total_tokens', key: 'total_tokens', render: (value: any) => { const normalized = n(value); return normalized == null ? naSpan() : <span style={{ fontWeight: 600, color: APP_COLORS.hex_9e77ed }}>{formatNumber(normalized)}</span>; }, sorter: (a: any, b: any) => (n(a.total_tokens) ?? -1) - (n(b.total_tokens) ?? -1), align: 'right' as const },
    {
      title: 'Cache Hit %',
      dataIndex: 'cache_hit_rate',
      key: 'cache_hit_rate',
      render: (value: any) => {
        const normalized = n(value);
        if (normalized == null) return naSpan();
        const color = normalized > 70 ? APP_COLORS.hex_73c991 : normalized > 30 ? APP_COLORS.hex_f79009 : APP_COLORS.hex_f04438;
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 60, height: 6, borderRadius: 3, background: 'var(--bg-tertiary, #2d2d2d)', overflow: 'hidden' }}><div style={{ width: `${Math.min(normalized, 100)}%`, height: '100%', background: color, borderRadius: 3 }} /></div>
            <span style={{ color, fontWeight: 600, fontSize: 12 }}>{normalized.toFixed(1)}%</span>
          </div>
        );
      },
      sorter: (a: any, b: any) => (n(a.cache_hit_rate) ?? -1) - (n(b.cache_hit_rate) ?? -1),
    },
  ];

  return (
    <>
      <ConfigurableDashboard config={config ?? null} dataSources={dataSources} extraContext={{ selectedModel }} />
      <Surface elevation={1} padding="md" className="ai-chart-card" style={{ marginTop: 16 }}>
        <h4>Per-Model Cost Breakdown</h4>
        {costLoading ? <Skeleton /> : data.length === 0 ? <div className="text-muted" style={{textAlign:'center',padding:32}}>No data</div> : (
          <SimpleTable dataSource={data.map((row: any, index: number) => ({ ...row, key: index }))} columns={tableColumns as any} size="small" pagination={{ pageSize: 20 }} scroll={{ x: 1400 }} />
        )}
      </Surface>
    </>
  );
}
