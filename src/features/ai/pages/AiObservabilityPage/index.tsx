import { Select, Tabs } from 'antd';
import { Activity, Brain, DollarSign, Eye, Shield, TrendingUp } from 'lucide-react';
import { useMemo, useState } from 'react';

import PageHeader from '@components/common/layout/PageHeader';

import {
  AiCostTab,
  AiGuideTab,
  AiOverviewTab,
  AiPerformanceTab,
  AiSecurityTab,
} from '@features/ai/components';

import { v1Service } from '@services/v1Service';

import { useDashboardConfig } from '@hooks/useDashboardConfig';
import { useTimeRangeQuery } from '@hooks/useTimeRangeQuery';

import './AiObservabilityPage.css';

/**
 *
 */
export default function AiObservabilityPage() {
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  const { config } = useDashboardConfig('ai-observability');

  // ── Data fetching ──────────────────────────────────────────────────────────
  const { data: summary, isLoading: summaryLoading } = useTimeRangeQuery(
    'ai-summary', (tid, s, e) => v1Service.getAiSummary(tid, s, e),
  );

  const { data: models } = useTimeRangeQuery(
    'ai-models', (tid, s, e) => v1Service.getAiActiveModels(tid, s, e),
  );

  const { data: perfMetrics, isLoading: perfMetricsLoading } = useTimeRangeQuery(
    'ai-perf-metrics', (tid, s, e) => v1Service.getAiPerformanceMetrics(tid, s, e),
  );

  const { data: perfTS } = useTimeRangeQuery(
    'ai-perf-ts', (tid, s, e) => v1Service.getAiPerformanceTimeSeries(tid, s, e, '5m'),
  );

  const { data: histRaw } = useTimeRangeQuery(
    'ai-lat-hist', (tid, s, e) => v1Service.getAiLatencyHistogram(tid, s, e, selectedModel || ''),
    { extraKeys: [selectedModel] },
  );

  const { data: costMetrics, isLoading: costMetricsLoading } = useTimeRangeQuery(
    'ai-cost-metrics', (tid, s, e) => v1Service.getAiCostMetrics(tid, s, e),
  );

  const { data: costTS } = useTimeRangeQuery(
    'ai-cost-ts', (tid, s, e) => v1Service.getAiCostTimeSeries(tid, s, e, '5m'),
  );

  const { data: tokenBreakdown } = useTimeRangeQuery(
    'ai-token-breakdown', (tid, s, e) => v1Service.getAiTokenBreakdown(tid, s, e),
  );

  const { data: secMetrics, isLoading: secMetricsLoading } = useTimeRangeQuery(
    'ai-sec-metrics', (tid, s, e) => v1Service.getAiSecurityMetrics(tid, s, e),
  );

  const { data: secTS } = useTimeRangeQuery(
    'ai-sec-ts', (tid, s, e) => v1Service.getAiSecurityTimeSeries(tid, s, e, '5m'),
  );

  const { data: piiCategories } = useTimeRangeQuery(
    'ai-pii-cats', (tid, s, e) => v1Service.getAiPiiCategories(tid, s, e),
  );

  // ── Build unified dataSources for ConfigurableDashboard ───────────────────
  const dataSources = useMemo(() => ({
    'ai-perf-ts': Array.isArray(perfTS) ? perfTS : [],
    'ai-cost-ts': Array.isArray(costTS) ? costTS : [],
    'ai-sec-ts': Array.isArray(secTS) ? secTS : [],
    'ai-lat-hist': Array.isArray(histRaw) ? histRaw : [],
    'ai-cost-metrics': Array.isArray(costMetrics) ? costMetrics : [],
    'ai-token-breakdown': Array.isArray(tokenBreakdown) ? tokenBreakdown : [],
    'ai-pii-cats': Array.isArray(piiCategories) ? piiCategories : [],
  }), [perfTS, costTS, secTS, histRaw, costMetrics, tokenBreakdown, piiCategories]);

  // ── Model options for the filter dropdown ─────────────────────────────────
  const modelOptions = useMemo(() => {
    const raw = Array.isArray(models) ? models : [];
    return raw.map((row: any) => ({ label: row.model_name || 'unknown', value: row.model_name }));
  }, [models]);

  const tabItems = [
    {
      key: 'overview',
      label: <span><Activity size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />Overview</span>,
      children: (
        <AiOverviewTab
          summary={summary}
          summaryLoading={summaryLoading}
          config={config}
          dataSources={dataSources}
          selectedModel={selectedModel}
        />
      ),
    },
    {
      key: 'performance',
      label: <span><TrendingUp size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />Performance</span>,
      children: (
        <AiPerformanceTab
          perfMetrics={Array.isArray(perfMetrics) ? perfMetrics : []}
          metricsLoading={perfMetricsLoading}
          config={config}
          dataSources={dataSources}
          selectedModel={selectedModel}
        />
      ),
    },
    {
      key: 'cost',
      label: <span><DollarSign size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />Cost</span>,
      children: (
        <AiCostTab
          costMetrics={Array.isArray(costMetrics) ? costMetrics : []}
          costLoading={costMetricsLoading}
          config={config}
          dataSources={dataSources}
          selectedModel={selectedModel}
        />
      ),
    },
    {
      key: 'security',
      label: <span><Shield size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />Security</span>,
      children: (
        <AiSecurityTab
          secMetrics={Array.isArray(secMetrics) ? secMetrics : []}
          secLoading={secMetricsLoading}
          config={config}
          dataSources={dataSources}
          selectedModel={selectedModel}
        />
      ),
    },
    {
      key: 'guide',
      label: <span><Eye size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />Instrumentation Guide</span>,
      children: <AiGuideTab />,
    },
  ];

  return (
    <div className="ai-observability-page">
      <PageHeader
        title="AI Observability"
        subtitle="Performance, cost, and security visibility for LLM / AI model calls"
        icon={<Brain size={24} />}
        actions={
          <Select
            placeholder="All Models"
            allowClear
            style={{ width: 230 }}
            value={selectedModel}
            onChange={setSelectedModel}
            options={modelOptions}
          />
        }
      />

      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={tabItems}
        className="ai-tabs"
      />
    </div>
  );
}
