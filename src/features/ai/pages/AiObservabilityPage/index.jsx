import { useMemo, useState } from 'react';
import {
  Row, Col, Card, Select, Tabs, Table, Skeleton, Empty,
  Progress, Tooltip, Tag, Badge,
} from 'antd';
import {
  Brain, Zap, DollarSign, Shield, Clock, TrendingUp,
  AlertTriangle, CheckCircle, ShieldAlert, ShieldCheck,
  Activity, Eye,
} from 'lucide-react';
import { useTimeRangeQuery } from '@hooks/useTimeRangeQuery';
import { useDashboardConfig } from '@hooks/useDashboardConfig';
import { v1Service } from '@services/v1Service';
import PageHeader from '@components/common/layout/PageHeader';
import StatCard from '@components/common/cards/StatCard';
import ConfigurableDashboard from '@components/dashboard/ConfigurableDashboard';
import { formatNumber, formatDuration } from '@utils/formatters';
import './AiObservabilityPage.css';


// ─── helpers ────────────────────────────────────────────────────────────────

function n(v) {
  const num = Number(v);
  return isNaN(num) ? null : Math.round(num * 100000) / 100000;
}

function pct(v, decimals = 1) {
  const num = n(v);
  return num == null ? 'N/A' : `${num.toFixed(decimals)}%`;
}

function dollar(v, decimals = 4) {
  const num = n(v);
  return num == null ? 'N/A' : `$${num.toFixed(decimals)}`;
}

function naSpan(v) {
  return <span style={{ color: 'var(--text-muted)' }}>N/A</span>;
}


// ─── colour helpers ───────────────────────────────────────────────────────────

const latColor = (ms) => ms > 5000 ? '#F04438' : ms > 2000 ? '#F79009' : '#73C991';
const rateColor = (r) => r > 5 ? '#F04438' : r > 1 ? '#F79009' : '#73C991';

// ─── OVERVIEW TAB ────────────────────────────────────────────────────────────

function OverviewTab({ summary, summaryLoading, config, dataSources, selectedModel }) {
  const s = summary || {};

  return (
    <>
      {/* KPI stat cards */}
      <div className="ai-section-label">Performance</div>
      <Row gutter={[16, 16]}>
        {[
          { title: 'Active Models', value: formatNumber(n(s.active_models) ?? 0), icon: <Brain size={20} />, color: '#5E60CE', desc: 'Distinct models in window' },
          { title: 'Avg QPS', value: `${(n(s.avg_qps) ?? 0).toFixed(2)}/s`, icon: <TrendingUp size={20} />, color: '#06AED5', desc: 'Queries per second' },
          { title: 'Avg Latency', value: formatDuration(n(s.avg_latency_ms) ?? 0), icon: <Clock size={20} />, color: latColor(n(s.avg_latency_ms) ?? 0), desc: 'End-to-end response time' },
          { title: 'P95 Latency', value: formatDuration(n(s.p95_latency_ms) ?? 0), icon: <Clock size={20} />, color: latColor(n(s.p95_latency_ms) ?? 0), desc: '95th percentile latency' },
        ].map((c) => (
          <Col xs={24} sm={12} lg={6} key={c.title}>
            <StatCard title={c.title} value={c.value} icon={c.icon} iconColor={c.color} loading={summaryLoading} description={c.desc} />
          </Col>
        ))}
      </Row>

      <div className="ai-section-label" style={{ marginTop: 16 }}>Cost</div>
      <Row gutter={[16, 16]}>
        {[
          { title: 'Total Requests', value: formatNumber(n(s.total_requests) ?? 0), icon: <Activity size={20} />, color: '#73C991', desc: 'AI model calls in window' },
          { title: 'Total Tokens', value: formatNumber(n(s.total_tokens) ?? 0), icon: <Zap size={20} />, color: '#9E77ED', desc: 'Tokens consumed' },
          { title: 'Total Cost', value: dollar(s.total_cost_usd), icon: <DollarSign size={20} />, color: '#F79009', desc: 'Estimated USD spend' },
          { title: 'Cache Hit Rate', value: pct(s.cache_hit_rate), icon: <CheckCircle size={20} />, color: (n(s.cache_hit_rate) ?? 0) > 50 ? '#73C991' : '#F79009', desc: 'Prompt cache utilisation' },
        ].map((c) => (
          <Col xs={24} sm={12} lg={6} key={c.title}>
            <StatCard title={c.title} value={c.value} icon={c.icon} iconColor={c.color} loading={summaryLoading} description={c.desc} />
          </Col>
        ))}
      </Row>

      <div className="ai-section-label" style={{ marginTop: 16 }}>Security</div>
      <Row gutter={[16, 16]}>
        {[
          { title: 'Timeouts', value: formatNumber(n(s.timeout_count) ?? 0), icon: <AlertTriangle size={20} />, color: (n(s.timeout_count) ?? 0) > 0 ? '#F04438' : '#73C991', desc: 'Timed-out requests' },
          { title: 'Errors', value: formatNumber(n(s.error_count) ?? 0), icon: <AlertTriangle size={20} />, color: (n(s.error_count) ?? 0) > 0 ? '#F04438' : '#73C991', desc: 'Error status spans' },
          { title: 'PII Detection Rate', value: pct(s.pii_detection_rate), icon: <Shield size={20} />, color: rateColor(n(s.pii_detection_rate) ?? 0), desc: '% requests with PII' },
          { title: 'Guardrail Block Rate', value: pct(s.guardrail_block_rate), icon: <ShieldAlert size={20} />, color: rateColor(n(s.guardrail_block_rate) ?? 0), desc: '% requests blocked' },
        ].map((c) => (
          <Col xs={24} sm={12} lg={6} key={c.title}>
            <StatCard title={c.title} value={c.value} icon={c.icon} iconColor={c.color} loading={summaryLoading} description={c.desc} />
          </Col>
        ))}
      </Row>

      {/* Configurable charts — driven by backend YAML */}
      <div style={{ marginTop: 16 }}>
        <ConfigurableDashboard
          config={config}
          dataSources={dataSources}
          extraContext={{ selectedModel }}
        />
      </div>
    </>
  );
}

// ─── PERFORMANCE TAB ─────────────────────────────────────────────────────────

function PerformanceTab({ perfMetrics, metricsLoading, config, dataSources, selectedModel }) {
  const tableColumns = [
    { title: 'Model', dataIndex: 'model_name', key: 'model_name', render: (v) => <Tag className="ai-model-tag">{v || 'unknown'}</Tag> },
    { title: 'Provider', dataIndex: 'model_provider', key: 'model_provider', render: (v) => v ? <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>{v}</span> : naSpan() },
    { title: 'Type', dataIndex: 'request_type', key: 'request_type', render: (v) => v ? <Tag style={{ fontSize: 11 }}>{v}</Tag> : naSpan() },
    { title: 'Requests', dataIndex: 'total_requests', key: 'total_requests', render: (v) => formatNumber(Number(v)), sorter: (a, b) => Number(a.total_requests) - Number(b.total_requests), align: 'right' },
    { title: 'QPS', dataIndex: 'avg_qps', key: 'avg_qps', render: (v) => { const x = n(v); return x == null ? naSpan() : <span style={{ fontWeight: 600 }}>{x.toFixed(3)}</span>; }, sorter: (a, b) => (n(a.avg_qps) ?? -1) - (n(b.avg_qps) ?? -1), align: 'right' },
    { title: 'Avg Latency', dataIndex: 'avg_latency_ms', key: 'avg_latency_ms', render: (v) => { const x = n(v); return x == null ? naSpan() : <span style={{ color: latColor(x), fontWeight: 600 }}>{formatDuration(x)}</span>; }, sorter: (a, b) => (n(a.avg_latency_ms) ?? -1) - (n(b.avg_latency_ms) ?? -1), align: 'right' },
    { title: 'P50', dataIndex: 'p50_latency_ms', key: 'p50_latency_ms', render: (v) => { const x = n(v); return x == null ? naSpan() : formatDuration(x); }, sorter: (a, b) => (n(a.p50_latency_ms) ?? -1) - (n(b.p50_latency_ms) ?? -1), align: 'right' },
    { title: 'P95', dataIndex: 'p95_latency_ms', key: 'p95_latency_ms', render: (v) => { const x = n(v); return x == null ? naSpan() : <span style={{ color: latColor(x), fontWeight: 600 }}>{formatDuration(x)}</span>; }, sorter: (a, b) => (n(a.p95_latency_ms) ?? -1) - (n(b.p95_latency_ms) ?? -1), align: 'right' },
    { title: 'P99', dataIndex: 'p99_latency_ms', key: 'p99_latency_ms', render: (v) => { const x = n(v); return x == null ? naSpan() : <span style={{ color: latColor(x * 1.2) }}>{formatDuration(x)}</span>; }, sorter: (a, b) => (n(a.p99_latency_ms) ?? -1) - (n(b.p99_latency_ms) ?? -1), align: 'right' },
    { title: 'Tokens/sec', dataIndex: 'avg_tokens_per_sec', key: 'avg_tokens_per_sec', render: (v) => { const x = n(v); return x == null ? naSpan() : <span style={{ fontWeight: 600, color: '#9E77ED' }}>{x.toFixed(1)}</span>; }, sorter: (a, b) => (n(a.avg_tokens_per_sec) ?? -1) - (n(b.avg_tokens_per_sec) ?? -1), align: 'right' },
    { title: 'Timeouts', dataIndex: 'timeout_count', key: 'timeout_count', render: (v) => { const x = n(v) ?? 0; return <span style={{ color: x > 0 ? '#F04438' : '#73C991', fontWeight: 600 }}>{formatNumber(x)}</span>; }, sorter: (a, b) => (n(a.timeout_count) ?? 0) - (n(b.timeout_count) ?? 0), align: 'right' },
    { title: 'Error Rate', dataIndex: 'error_rate', key: 'error_rate', render: (v) => { const x = n(v); return x == null ? naSpan() : <span style={{ color: rateColor(x), fontWeight: 600 }}>{x.toFixed(2)}%</span>; }, sorter: (a, b) => (n(a.error_rate) ?? -1) - (n(b.error_rate) ?? -1), align: 'right' },
  ];

  const data = useMemo(() => {
    const raw = Array.isArray(perfMetrics) ? perfMetrics : [];
    return selectedModel ? raw.filter((r) => r.model_name === selectedModel) : raw;
  }, [perfMetrics, selectedModel]);

  return (
    <>
      <ConfigurableDashboard config={config} dataSources={dataSources} extraContext={{ selectedModel }} />
      <Card title="Per-Model Performance" className="ai-chart-card" style={{ marginTop: 16 }}>
        {metricsLoading ? <Skeleton active paragraph={{ rows: 6 }} /> : data.length === 0 ? <Empty description="No data" /> : (
          <Table dataSource={data.map((r, i) => ({ ...r, key: i }))} columns={tableColumns} size="small" pagination={{ pageSize: 20 }} scroll={{ x: 1600 }} />
        )}
      </Card>
    </>
  );
}


// ─── COST TAB ────────────────────────────────────────────────────────────────

function CostTab({ costMetrics, costLoading, config, dataSources, selectedModel }) {
  const data = useMemo(() => {
    const raw = Array.isArray(costMetrics) ? costMetrics : [];
    return selectedModel ? raw.filter((r) => r.model_name === selectedModel) : raw;
  }, [costMetrics, selectedModel]);

  const tableColumns = [
    { title: 'Model', dataIndex: 'model_name', key: 'model_name', render: (v) => <Tag className="ai-model-tag">{v || 'unknown'}</Tag> },
    { title: 'Provider', dataIndex: 'model_provider', key: 'model_provider', render: (v) => v ? <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>{v}</span> : naSpan() },
    { title: 'Requests', dataIndex: 'total_requests', key: 'total_requests', render: (v) => formatNumber(Number(v)), sorter: (a, b) => Number(a.total_requests) - Number(b.total_requests), align: 'right' },
    { title: 'Total Cost', dataIndex: 'total_cost_usd', key: 'total_cost_usd', render: (v) => { const x = n(v); return x == null ? naSpan() : <span style={{ color: '#F79009', fontWeight: 700 }}>{dollar(x)}</span>; }, sorter: (a, b) => (n(a.total_cost_usd) ?? -1) - (n(b.total_cost_usd) ?? -1), align: 'right' },
    { title: 'Cost / Query', dataIndex: 'avg_cost_per_query', key: 'avg_cost_per_query', render: (v) => { const x = n(v); return x == null ? naSpan() : <span style={{ color: '#FDB022', fontWeight: 600 }}>{dollar(x, 5)}</span>; }, sorter: (a, b) => (n(a.avg_cost_per_query) ?? -1) - (n(b.avg_cost_per_query) ?? -1), align: 'right' },
    { title: 'Prompt Tokens', dataIndex: 'total_prompt_tokens', key: 'total_prompt_tokens', render: (v) => { const x = n(v); return x == null ? naSpan() : formatNumber(x); }, sorter: (a, b) => (n(a.total_prompt_tokens) ?? -1) - (n(b.total_prompt_tokens) ?? -1), align: 'right' },
    { title: 'Completion Tokens', dataIndex: 'total_completion_tokens', key: 'total_completion_tokens', render: (v) => { const x = n(v); return x == null ? naSpan() : formatNumber(x); }, sorter: (a, b) => (n(a.total_completion_tokens) ?? -1) - (n(b.total_completion_tokens) ?? -1), align: 'right' },
    { title: 'Total Tokens', dataIndex: 'total_tokens', key: 'total_tokens', render: (v) => { const x = n(v); return x == null ? naSpan() : <span style={{ fontWeight: 600, color: '#9E77ED' }}>{formatNumber(x)}</span>; }, sorter: (a, b) => (n(a.total_tokens) ?? -1) - (n(b.total_tokens) ?? -1), align: 'right' },
    { title: 'Cache Hit %', dataIndex: 'cache_hit_rate', key: 'cache_hit_rate', render: (v) => { const x = n(v); if (x == null) return naSpan(); const color = x > 70 ? '#73C991' : x > 30 ? '#F79009' : '#F04438'; return <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Progress percent={Math.min(x, 100)} size="small" showInfo={false} strokeColor={color} style={{ width: 60 }} /><span style={{ color, fontWeight: 600, fontSize: 12 }}>{x.toFixed(1)}%</span></div>; }, sorter: (a, b) => (n(a.cache_hit_rate) ?? -1) - (n(b.cache_hit_rate) ?? -1) },
  ];

  return (
    <>
      <ConfigurableDashboard config={config} dataSources={dataSources} extraContext={{ selectedModel }} />
      <Card title="Per-Model Cost Breakdown" className="ai-chart-card" style={{ marginTop: 16 }}>
        {costLoading ? <Skeleton active paragraph={{ rows: 6 }} /> : data.length === 0 ? <Empty description="No data" /> : (
          <Table dataSource={data.map((r, i) => ({ ...r, key: i }))} columns={tableColumns} size="small" pagination={{ pageSize: 20 }} scroll={{ x: 1400 }} />
        )}
      </Card>
    </>
  );
}

// ─── SECURITY TAB ─────────────────────────────────────────────────────────────

function SecurityTab({ secMetrics, secLoading, config, dataSources, selectedModel }) {
  const data = useMemo(() => {
    const raw = Array.isArray(secMetrics) ? secMetrics : [];
    return selectedModel ? raw.filter((r) => r.model_name === selectedModel) : raw;
  }, [secMetrics, selectedModel]);

  const tableColumns = [
    { title: 'Model', dataIndex: 'model_name', key: 'model_name', render: (v) => <Tag className="ai-model-tag">{v || 'unknown'}</Tag> },
    { title: 'Requests', dataIndex: 'total_requests', key: 'total_requests', render: (v) => formatNumber(Number(v)), align: 'right' },
    { title: 'PII Detected', dataIndex: 'pii_detected_count', key: 'pii_detected_count', render: (v) => { const x = n(v) ?? 0; return <Tooltip title={`${x} requests with PII`}><span style={{ color: x > 0 ? '#F04438' : '#73C991', fontWeight: 600 }}>{formatNumber(x)}</span></Tooltip>; }, align: 'right' },
    { title: 'PII Rate', dataIndex: 'pii_detection_rate', key: 'pii_detection_rate', render: (v) => { const x = n(v); if (x == null) return naSpan(); const color = rateColor(x); return <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Progress percent={Math.min(x, 100)} size="small" showInfo={false} strokeColor={color} style={{ width: 60 }} /><span style={{ color, fontWeight: 600, fontSize: 12 }}>{x.toFixed(2)}%</span></div>; } },
    { title: 'Guardrail Blocks', dataIndex: 'guardrail_blocked_count', key: 'guardrail_blocked_count', render: (v) => { const x = n(v) ?? 0; return <span style={{ color: x > 0 ? '#F79009' : '#73C991', fontWeight: 600 }}>{formatNumber(x)}</span>; }, align: 'right' },
    { title: 'Block Rate', dataIndex: 'guardrail_block_rate', key: 'guardrail_block_rate', render: (v) => { const x = n(v); return x == null ? naSpan() : <span style={{ color: rateColor(x), fontWeight: 600 }}>{x.toFixed(2)}%</span>; }, align: 'right' },
    { title: 'Overall Safety', key: 'safety', render: (_, r) => { const piiRate = n(r.pii_detection_rate) ?? 0; const blockRate = n(r.guardrail_block_rate) ?? 0; const ok = piiRate < 1 && blockRate < 1; return <Tooltip title={`PII ${piiRate.toFixed(2)}%, Blocks ${blockRate.toFixed(2)}%`}><Badge status={ok ? 'success' : 'error'} text={ok ? 'Healthy' : 'Attention'} /></Tooltip>; } },
  ];

  return (
    <>
      <ConfigurableDashboard config={config} dataSources={dataSources} extraContext={{ selectedModel }} />
      <Card title="Per-Model Security" className="ai-chart-card" style={{ marginTop: 16 }}>
        {secLoading ? <Skeleton active paragraph={{ rows: 6 }} /> : data.length === 0 ? <Empty description="No data" /> : (
          <Table dataSource={data.map((r, i) => ({ ...r, key: i }))} columns={tableColumns} size="small" pagination={{ pageSize: 20 }} scroll={{ x: 1000 }} />
        )}
      </Card>
    </>
  );
}

// ─── INSTRUMENTATION GUIDE ────────────────────────────────────────────────────

function GuideTab() {
  const attrs = [
    { section: 'Identity', color: '#5E60CE', icon: <Brain size={15} />, attr: 'ai.model.name', desc: 'Model identifier — required to appear in the dashboard', example: 'gpt-4o' },
    { section: 'Identity', color: '#5E60CE', icon: <Brain size={15} />, attr: 'ai.model.provider', desc: 'Provider / vendor name', example: 'openai' },
    { section: 'Identity', color: '#5E60CE', icon: <Brain size={15} />, attr: 'ai.request.type', desc: 'Call type (chat, completion, embedding, rerank)', example: 'chat' },
    { section: 'Identity', color: '#5E60CE', icon: <Brain size={15} />, attr: 'ai.application', desc: 'Calling service or product area', example: 'search-api' },
    { section: 'Performance', color: '#06AED5', icon: <Clock size={15} />, attr: 'ai.latency.ms', desc: 'End-to-end latency in ms (usually equals span duration)', example: '1340' },
    { section: 'Performance', color: '#06AED5', icon: <AlertTriangle size={15} />, attr: 'ai.timeout', desc: '"true" if the request timed out', example: 'true' },
    { section: 'Performance', color: '#06AED5', icon: <Activity size={15} />, attr: 'ai.response.status', desc: 'HTTP or API status returned by the model endpoint', example: '200' },
    { section: 'Performance', color: '#06AED5', icon: <Activity size={15} />, attr: 'ai.retry.count', desc: 'Number of retries before success or final failure', example: '2' },
    { section: 'Cost', color: '#F79009', icon: <Zap size={15} />, attr: 'ai.tokens.prompt', desc: 'Input / prompt token count', example: '512' },
    { section: 'Cost', color: '#F79009', icon: <Zap size={15} />, attr: 'ai.tokens.completion', desc: 'Output / completion token count', example: '256' },
    { section: 'Cost', color: '#F79009', icon: <Zap size={15} />, attr: 'ai.tokens.system', desc: 'System-prompt token count (optional)', example: '128' },
    { section: 'Cost', color: '#F79009', icon: <DollarSign size={15} />, attr: 'ai.cost.usd', desc: 'Estimated request cost in USD', example: '0.00430' },
    { section: 'Cost', color: '#FDB022', icon: <CheckCircle size={15} />, attr: 'ai.cache.hit', desc: '"true" when a prompt cache was served', example: 'true' },
    { section: 'Cost', color: '#FDB022', icon: <Zap size={15} />, attr: 'ai.cache.tokens', desc: 'Number of tokens served from cache', example: '384' },
    { section: 'Security', color: '#F04438', icon: <Shield size={15} />, attr: 'ai.pii.detected', desc: '"true" if PII was found in the prompt or response', example: 'true' },
    { section: 'Security', color: '#F04438', icon: <Eye size={15} />, attr: 'ai.pii.categories', desc: 'Comma-separated PII types detected', example: 'email,phone' },
    { section: 'Security', color: '#F79009', icon: <ShieldAlert size={15} />, attr: 'ai.guardrail.blocked', desc: '"true" if a guardrail blocked / modified the request', example: 'true' },
    { section: 'Security', color: '#9E77ED', icon: <ShieldCheck size={15} />, attr: 'ai.content.policy.triggered', desc: '"true" if a content policy rule was triggered', example: 'true' },
  ];

  const sections = [...new Set(attrs.map((a) => a.section))];

  return (
    <Row gutter={[16, 16]}>
      {sections.map((section) => {
        const items = attrs.filter((a) => a.section === section);
        const color = items[0].color;
        return (
          <Col xs={24} lg={12} key={section}>
            <Card
              title={<span style={{ color }}>{section} Attributes</span>}
              className="ai-chart-card"
            >
              <div className="ai-guide-items">
                {items.map((item, i) => (
                  <div key={i} className="ai-guide-item">
                    <div className="ai-guide-icon" style={{ color: item.color }}>{item.icon}</div>
                    <div className="ai-guide-content">
                      <code className="ai-guide-attr">{item.attr}</code>
                      <div className="ai-guide-desc">{item.desc}</div>
                    </div>
                    <div className="ai-guide-example">
                      <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>e.g. </span>
                      <code style={{ fontSize: 11, color: item.color }}>{item.example}</code>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </Col>
        );
      })}
    </Row>
  );
}

// ─── ROOT PAGE ────────────────────────────────────────────────────────────────

export default function AiObservabilityPage() {
  const [selectedModel, setSelectedModel] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  const { config } = useDashboardConfig('ai-observability');

  // ── Data fetching ──────────────────────────────────────────────────────────
  const { data: summary, isLoading: summaryLoading } = useTimeRangeQuery(
    'ai-summary', (tid, s, e) => v1Service.getAiSummary(tid, s, e)
  );

  const { data: models } = useTimeRangeQuery(
    'ai-models', (tid, s, e) => v1Service.getAiActiveModels(tid, s, e)
  );

  const { data: perfMetrics, isLoading: perfMetricsLoading } = useTimeRangeQuery(
    'ai-perf-metrics', (tid, s, e) => v1Service.getAiPerformanceMetrics(tid, s, e)
  );

  const { data: perfTS, isLoading: perfTsLoading } = useTimeRangeQuery(
    'ai-perf-ts', (tid, s, e) => v1Service.getAiPerformanceTimeSeries(tid, s, e, '5m')
  );

  const { data: histRaw } = useTimeRangeQuery(
    'ai-lat-hist', (tid, s, e) => v1Service.getAiLatencyHistogram(tid, s, e, selectedModel),
    { extraKeys: [selectedModel] }
  );

  const { data: costMetrics, isLoading: costMetricsLoading } = useTimeRangeQuery(
    'ai-cost-metrics', (tid, s, e) => v1Service.getAiCostMetrics(tid, s, e)
  );

  const { data: costTS, isLoading: costTsLoading } = useTimeRangeQuery(
    'ai-cost-ts', (tid, s, e) => v1Service.getAiCostTimeSeries(tid, s, e, '5m')
  );

  const { data: tokenBreakdown } = useTimeRangeQuery(
    'ai-token-breakdown', (tid, s, e) => v1Service.getAiTokenBreakdown(tid, s, e)
  );

  const { data: secMetrics, isLoading: secMetricsLoading } = useTimeRangeQuery(
    'ai-sec-metrics', (tid, s, e) => v1Service.getAiSecurityMetrics(tid, s, e)
  );

  const { data: secTS, isLoading: secTsLoading } = useTimeRangeQuery(
    'ai-sec-ts', (tid, s, e) => v1Service.getAiSecurityTimeSeries(tid, s, e, '5m')
  );

  const { data: piiCategories } = useTimeRangeQuery(
    'ai-pii-cats', (tid, s, e) => v1Service.getAiPiiCategories(tid, s, e)
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
    return raw.map((r) => ({ label: r.model_name || 'unknown', value: r.model_name }));
  }, [models]);

  const tabItems = [
    {
      key: 'overview',
      label: <span><Activity size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />Overview</span>,
      children: (
        <OverviewTab
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
        <PerformanceTab
          perfMetrics={perfMetrics}
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
        <CostTab
          costMetrics={costMetrics}
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
        <SecurityTab
          secMetrics={secMetrics}
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
      children: <GuideTab />,
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
