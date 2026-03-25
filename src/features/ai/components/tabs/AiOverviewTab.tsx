import {
  Activity,
  AlertTriangle,
  Brain,
  CheckCircle,
  Clock,
  DollarSign,
  Shield,
  ShieldAlert,
  TrendingUp,
  Zap,
} from 'lucide-react';

import StatCard from '@shared/components/ui/cards/StatCard';
import ConfigurableDashboard from '@shared/components/ui/dashboard/ConfigurableDashboard';
import type {
  DashboardDataSources,
  DashboardRenderConfig,
} from '@shared/types/dashboardConfig';

import { formatDuration, formatNumber } from '@shared/utils/formatters';

import { APP_COLORS } from '@config/colorLiterals';

import { dollar, latColor, n, pct, rateColor } from './tabHelpers';

interface AiOverviewTabProps {
  summary: Record<string, unknown> | null;
  summaryLoading: boolean;
  config: DashboardRenderConfig | null;
  dataSources: DashboardDataSources;
  selectedModel: string | null;
}

/**
 *
 * @param root0
 * @param root0.summary
 * @param root0.summaryLoading
 * @param root0.config
 * @param root0.dataSources
 * @param root0.selectedModel
 */
export default function AiOverviewTab({
  summary,
  summaryLoading,
  config,
  dataSources,
  selectedModel,
}: AiOverviewTabProps) {
  const s = summary || {};

  return (
    <>
      <div className="ai-section-label">Performance</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16 }}>
        {[
          { title: 'Active Models', value: formatNumber(n(s.active_models) ?? 0), icon: <Brain size={20} />, color: APP_COLORS.hex_5e60ce, desc: 'Distinct models in window' },
          { title: 'Avg QPS', value: `${(n(s.avg_qps) ?? 0).toFixed(2)}/s`, icon: <TrendingUp size={20} />, color: APP_COLORS.hex_06aed5, desc: 'Queries per second' },
          { title: 'Avg Latency', value: formatDuration(n(s.avg_latency_ms) ?? 0), icon: <Clock size={20} />, color: latColor(n(s.avg_latency_ms) ?? 0), desc: 'End-to-end response time' },
          { title: 'P95 Latency', value: formatDuration(n(s.p95_latency_ms) ?? 0), icon: <Clock size={20} />, color: latColor(n(s.p95_latency_ms) ?? 0), desc: '95th percentile latency' },
        ].map((card) => (
          <div key={card.title}>
            <StatCard
              metric={{
                title: card.title,
                value: card.value,
                description: card.desc,
                formatter: (value: any) => value,
              }}
              visuals={{
                icon: card.icon,
                iconColor: card.color,
                loading: summaryLoading,
                sparklineData: [],
                sparklineColor: card.color,
              }}
              trend={{ value: 0 }}
            />
          </div>
        ))}
      </div>

      <div className="ai-section-label" style={{ marginTop: 16 }}>Cost</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16 }}>
        {[
          { title: 'Total Requests', value: formatNumber(n(s.total_requests) ?? 0), icon: <Activity size={20} />, color: APP_COLORS.hex_73c991, desc: 'AI model calls in window' },
          { title: 'Total Tokens', value: formatNumber(n(s.total_tokens) ?? 0), icon: <Zap size={20} />, color: APP_COLORS.hex_9e77ed, desc: 'Tokens consumed' },
          { title: 'Total Cost', value: dollar(s.total_cost_usd), icon: <DollarSign size={20} />, color: APP_COLORS.hex_f79009, desc: 'Estimated USD spend' },
          { title: 'Cache Hit Rate', value: pct(s.cache_hit_rate), icon: <CheckCircle size={20} />, color: (n(s.cache_hit_rate) ?? 0) > 50 ? APP_COLORS.hex_73c991 : APP_COLORS.hex_f79009, desc: 'Prompt cache utilisation' },
        ].map((card) => (
          <div key={card.title}>
            <StatCard
              metric={{
                title: card.title,
                value: card.value,
                description: card.desc,
                formatter: (value: any) => value,
              }}
              visuals={{
                icon: card.icon,
                iconColor: card.color,
                loading: summaryLoading,
                sparklineData: [],
                sparklineColor: card.color,
              }}
              trend={{ value: 0 }}
            />
          </div>
        ))}
      </div>

      <div className="ai-section-label" style={{ marginTop: 16 }}>Security</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16 }}>
        {[
          { title: 'Timeouts', value: formatNumber(n(s.timeout_count) ?? 0), icon: <AlertTriangle size={20} />, color: (n(s.timeout_count) ?? 0) > 0 ? APP_COLORS.hex_f04438 : APP_COLORS.hex_73c991, desc: 'Timed-out requests' },
          { title: 'Errors', value: formatNumber(n(s.error_count) ?? 0), icon: <AlertTriangle size={20} />, color: (n(s.error_count) ?? 0) > 0 ? APP_COLORS.hex_f04438 : APP_COLORS.hex_73c991, desc: 'Error status spans' },
          { title: 'PII Detection Rate', value: pct(s.pii_detection_rate), icon: <Shield size={20} />, color: rateColor(n(s.pii_detection_rate) ?? 0), desc: '% requests with PII' },
          { title: 'Guardrail Block Rate', value: pct(s.guardrail_block_rate), icon: <ShieldAlert size={20} />, color: rateColor(n(s.guardrail_block_rate) ?? 0), desc: '% requests blocked' },
        ].map((card) => (
          <div key={card.title}>
            <StatCard
              metric={{
                title: card.title,
                value: card.value,
                description: card.desc,
                formatter: (value: any) => value,
              }}
              visuals={{
                icon: card.icon,
                iconColor: card.color,
                loading: summaryLoading,
                sparklineData: [],
                sparklineColor: card.color,
              }}
              trend={{ value: 0 }}
            />
          </div>
        ))}
      </div>

      <div style={{ marginTop: 16 }}>
        <ConfigurableDashboard
          config={config ?? null}
          dataSources={dataSources}
          extraContext={{ selectedModel }}
        />
      </div>
    </>
  );
}
