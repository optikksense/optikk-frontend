import { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Switch, Tooltip, Select, Spin } from 'antd';
import { useQuery } from '@tanstack/react-query';
import {
  GitBranch,
  AlertCircle,
  Clock,
  Activity,
  Zap,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  BarChart3,
  Server,
  GitBranch as TraceIcon,
  Layers,
} from 'lucide-react';
import { useAppStore } from '@store/appStore';
import { v1Service } from '@services/v1Service';
import { PageHeader, ObservabilityQueryBar, ObservabilityDataBoard, ObservabilityDetailPanel, boardHeight } from '@components/common';
import { formatTimestamp, formatDuration, formatNumber } from '@utils/formatters';
import LatencyHistogram from '@components/charts/distributions/LatencyHistogram';
import { useDashboardConfig } from '@hooks/useDashboardConfig';
import { useTimeRangeQuery } from '@hooks/useTimeRangeQuery';
import ConfigurableDashboard from '@components/dashboard/ConfigurableDashboard';
import { tsLabel, relativeTime } from '@features/log/components/log/LogRow';
import './TracesPage.css';

/* ─── Filter fields for the shared ObservabilityQueryBar ─────────────────── */
export const TRACE_FILTER_FIELDS = [
  {
    key: 'trace_id', label: 'Trace ID', icon: '🔗', group: 'Trace',
    operators: [{ key: 'equals', label: 'equals', symbol: '=' }, { key: 'contains', label: 'contains', symbol: '~' }],
  },
  {
    key: 'operation_name', label: 'Operation', icon: '⚡', group: 'Trace',
    operators: [{ key: 'equals', label: 'equals', symbol: '=' }, { key: 'contains', label: 'contains', symbol: '~' }],
  },
  {
    key: 'status', label: 'Status', icon: '🔵', group: 'Trace',
    operators: [{ key: 'equals', label: 'equals', symbol: '=' }],
  },
  {
    key: 'service_name', label: 'Service', icon: '⚙️', group: 'Service',
    operators: [{ key: 'equals', label: 'equals', symbol: '=' }, { key: 'contains', label: 'contains', symbol: '~' }],
  },
  {
    key: 'http_method', label: 'HTTP Method', icon: '🌐', group: 'HTTP',
    operators: [{ key: 'equals', label: 'equals', symbol: '=' }],
  },
  {
    key: 'http_status', label: 'HTTP Status Code', icon: '📡', group: 'HTTP',
    operators: [{ key: 'equals', label: 'equals', symbol: '=' }, { key: 'gt', label: 'greater than', symbol: '>' }, { key: 'lt', label: 'less than', symbol: '<' }],
  },
  {
    key: 'duration_ms', label: 'Duration (ms)', icon: '⏱', group: 'Performance',
    operators: [{ key: 'gt', label: 'greater than', symbol: '>' }, { key: 'lt', label: 'less than', symbol: '<' }],
  },
];

/* ─── Column definitions for ObservabilityDataBoard ──────────────────────── */
const TRACE_COLUMNS = [
  { key: 'trace_id', label: 'Trace ID', defaultWidth: 185, defaultVisible: true },
  { key: 'service_name', label: 'Service', defaultWidth: 155, defaultVisible: true },
  { key: 'status', label: 'Status', defaultWidth: 100, defaultVisible: true },
  { key: 'duration_ms', label: 'Duration', defaultWidth: 135, defaultVisible: true },
  { key: 'http_status_code', label: 'HTTP Code', defaultWidth: 90, defaultVisible: false },
  { key: 'start_time', label: 'Start Time', defaultWidth: 165, defaultVisible: true },
  { key: 'operation_name', label: 'Operation', defaultVisible: true, flex: true },
];

/* ─── Normalizers ─────────────────────────────────────────────────────────── */
const normalizeTrace = (t: any = {}) => ({
  ...t,
  span_id: t.span_id ?? t.spanId ?? '',
  trace_id: t.trace_id ?? t.traceId ?? '',
  service_name: t.service_name ?? t.serviceName ?? '',
  operation_name: t.operation_name ?? t.operationName ?? '',
  start_time: t.start_time ?? t.startTime ?? '',
  duration_ms: Number(t.duration_ms ?? t.durationMs ?? 0),
  status: t.status ?? 'UNSET',
  http_method: t.http_method ?? t.httpMethod ?? '',
  http_status_code: Number(t.http_status_code ?? t.httpStatusCode ?? 0),
});

const normalizeTimeSeriesPoint = (p: any = {}) => ({
  ...p,
  timestamp: p.timestamp ?? p.time_bucket ?? p.timeBucket ?? '',
  request_count: Number(p.request_count ?? p.requestCount ?? 0),
  error_count: Number(p.error_count ?? p.errorCount ?? 0),
  avg_latency: Number(p.avg_latency ?? p.avgLatency ?? 0),
  p50: Number(p.p50 ?? p.p50_latency ?? 0),
  p95: Number(p.p95 ?? p.p95_latency ?? 0),
  p99: Number(p.p99 ?? p.p99_latency ?? 0),
});

const normalizeEndpointMetric = (m: any = {}) => ({
  ...m,
  service_name: m.service_name ?? m.serviceName ?? '',
  operation_name: m.operation_name ?? m.operationName ?? '',
  request_count: Number(m.request_count ?? m.requestCount ?? 0),
  error_count: Number(m.error_count ?? m.errorCount ?? 0),
  avg_latency: Number(m.avg_latency ?? m.avgLatency ?? 0),
});

/* ─── Sub-components ──────────────────────────────────────────────────────── */
function KpiCard({ title, value, icon: Icon, accentColor, accentBg, trend }) {
  return (
    <div
      className="traces-kpi-card"
      style={{ '--kpi-accent': accentColor, '--kpi-accent-from': accentColor + '33', '--kpi-accent-bg': accentBg } as any}
    >
      <div className="traces-kpi-card-header">
        <span className="traces-kpi-label">{title}</span>
        <span className="traces-kpi-icon" style={{ background: accentBg, color: accentColor }}>
          <Icon size={15} />
        </span>
      </div>
      <div className="traces-kpi-value">{value}</div>
      {trend != null && trend !== 0 && (
        <div className={`traces-kpi-pill ${trend > 0 ? 'up' : 'down'}`}>
          {trend > 0 ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
          {Math.abs(trend).toFixed(1)}%
        </div>
      )}
    </div>
  );
}

function ServicePills({ serviceBadges, total, selectedService, onSelect }) {
  return (
    <div className="traces-service-pills">
      <div className={`traces-service-pill ${!selectedService ? 'active' : ''}`} onClick={() => onSelect(null)}>
        All <span className="traces-service-pill-count">{total}</span>
      </div>
      {serviceBadges.map(([svc, count]) => (
        <div
          key={svc}
          className={`traces-service-pill ${selectedService === svc ? 'active' : ''}`}
          onClick={() => onSelect(selectedService === svc ? null : svc)}
        >
          {svc}<span className="traces-service-pill-count">{count}</span>
        </div>
      ))}
    </div>
  );
}

function TraceStatusBadge({ status }) {
  const s = (status || 'UNSET').toUpperCase();
  const cls = s === 'OK' ? 'ok' : s === 'ERROR' ? 'error' : 'unset';
  return (
    <span className={`traces-status-badge ${cls}`}>
      <span className="traces-status-badge-dot" />{s}
    </span>
  );
}

function MethodBadge({ method }) {
  if (!method) return null;
  const m = method.toUpperCase();
  return <span className={`traces-method-badge ${m}`}>{m}</span>;
}

function TopServicesPanel({ serviceBadges }) {
  if (!serviceBadges.length) return <div className="traces-histogram-empty">No service data</div>;
  const max = serviceBadges[0]?.[1] || 1;
  return (
    <div className="traces-top-services">
      {serviceBadges.slice(0, 7).map(([svc, count]) => (
        <div key={svc} className="traces-top-service-row">
          <span className="traces-top-service-name">{svc}</span>
          <div className="traces-top-service-bar-bg">
            <div className="traces-top-service-bar-fill" style={{ width: `${(count / max) * 100}%` }} />
          </div>
          <span className="traces-top-service-count">{count}</span>
        </div>
      ))}
    </div>
  );
}

/* ─── Trace Row Renderer — passed to ObservabilityDataBoard ──────────────── */
function TraceRow({ trace, colWidths, visibleCols, maxDuration, onRowClick, onOpenDetail }) {
  const fixedCols = TRACE_COLUMNS.filter((c) => !c.flex && visibleCols[c.key]);
  const flexCol = TRACE_COLUMNS.find((c) => c.flex && visibleCols[c.key]);

  const renderCell = (colKey) => {
    switch (colKey) {
      case 'trace_id':
        return (
          <span
            className="traces-trace-id"
            onClick={(e) => { e.stopPropagation(); onRowClick(trace.span_id || trace.trace_id); }}
            title={trace.trace_id}
          >
            <ArrowUpRight size={11} />
            {trace.trace_id ? trace.trace_id.slice(0, 16) + '…' : '—'}
          </span>
        );
      case 'service_name':
        return (
          <span className="traces-service-tag">
            <span className="traces-service-tag-dot" />
            {trace.service_name || '—'}
          </span>
        );
      case 'status':
        return <TraceStatusBadge status={trace.status} />;
      case 'duration_ms': {
        const pct = maxDuration > 0 ? Math.min((trace.duration_ms / maxDuration) * 100, 100) : 0;
        const color = trace.duration_ms > 1000 ? '#F04438' : trace.duration_ms > 500 ? '#F79009' : '#73C991';
        return (
          <div className="traces-duration-cell">
            <span className="traces-duration-value" style={{ color }}>{formatDuration(trace.duration_ms)}</span>
            <div className="traces-duration-bar-wrapper">
              <div className="traces-duration-bar" style={{ width: `${pct}%`, background: color }} />
            </div>
          </div>
        );
      }
      case 'http_status_code': {
        if (!trace.http_status_code) return <span style={{ color: 'var(--text-muted)' }}>—</span>;
        const color = trace.http_status_code >= 500 ? '#F04438' : trace.http_status_code >= 400 ? '#F79009' : '#73C991';
        return <span style={{ fontFamily: 'monospace', fontWeight: 600, color }}>{trace.http_status_code}</span>;
      }
      case 'start_time':
        return <span className="traces-timestamp">{formatTimestamp(trace.start_time)}</span>;
      case 'operation_name':
        return (
          <div className="traces-operation-cell">
            <span className="traces-operation-name" title={trace.operation_name}>{trace.operation_name || '—'}</span>
            {(trace.http_method || trace.http_status_code > 0) && (
              <div className="traces-http-meta">
                <MethodBadge method={trace.http_method} />
                {trace.http_status_code > 0 && <span className="traces-http-code">HTTP {trace.http_status_code}</span>}
              </div>
            )}
          </div>
        );
      default:
        return <span>{trace[colKey] ?? '—'}</span>;
    }
  };

  return (
    <>
      {fixedCols.map((col) => (
        <div
          key={col.key}
          className="oboard__td"
          style={{ width: colWidths[col.key] }}
          onClick={() => onOpenDetail(trace)}
        >
          {renderCell(col.key)}
        </div>
      ))}
      {flexCol && (
        <div className="oboard__td oboard__td--flex" onClick={() => onOpenDetail(trace)}>
          {renderCell(flexCol.key)}
        </div>
      )}
    </>
  );
}

/* ─── Main Page ───────────────────────────────────────────────────────────── */
export default function TracesPage() {
  const navigate = useNavigate();
  const { selectedTeamId, timeRange, refreshKey } = useAppStore();
  const { config: dashboardConfig } = useDashboardConfig('traces');

  /* ── Chart sources ── */
  const { data: metricsTimeseriesRaw } = useTimeRangeQuery('metrics-timeseries-traces', (t, s, e) => v1Service.getMetricsTimeSeries(t, s, e, null, '5m'));
  const { data: endpointTimeseriesRaw } = useTimeRangeQuery('endpoints-timeseries-traces', (t: any, s: any, e: any) => v1Service.getEndpointTimeSeries(t, s, e, ''), { extraKeys: [] });
  const { data: endpointMetricsRaw } = useTimeRangeQuery('endpoints-metrics-traces', (t: any, s: any, e: any) => v1Service.getEndpointMetrics(t, s, e, ''), { extraKeys: [] });

  const chartDataSources = useMemo(() => ({
    'metrics-timeseries': (Array.isArray(metricsTimeseriesRaw) ? metricsTimeseriesRaw : []).map(normalizeTimeSeriesPoint),
    'endpoints-timeseries': (Array.isArray(endpointTimeseriesRaw) ? endpointTimeseriesRaw : []).map(normalizeTimeSeriesPoint),
    'endpoints-metrics': (Array.isArray(endpointMetricsRaw) ? endpointMetricsRaw : []).map(normalizeEndpointMetric),
  }), [metricsTimeseriesRaw, endpointTimeseriesRaw, endpointMetricsRaw]);

  /* ── Filter state ── */
  const [filters, setFilters] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [selectedService, setSelectedService] = useState(null);
  const [errorsOnly, setErrorsOnly] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [selectedTrace, setSelectedTrace] = useState(null);

  /* ── Backend params derived from structured filters ── */
  const backendParams = useMemo(() => {
    const params: any = { limit: pageSize, offset: (page - 1) * pageSize };
    if (errorsOnly) params.status = 'ERROR';
    if (selectedService) params.services = [selectedService];
    filters.forEach((f) => {
      if (f.field === 'status' && f.operator === 'equals') params.status = f.value;
      if (f.field === 'service_name' && f.operator === 'equals') params.services = [f.value];
      if (f.field === 'duration_ms' && f.operator === 'gt') params.minDuration = Number(f.value);
      if (f.field === 'duration_ms' && f.operator === 'lt') params.maxDuration = Number(f.value);
      if (f.field === 'trace_id' && f.operator === 'equals') params.traceId = f.value;
      if (f.field === 'operation_name' && (f.operator === 'equals' || f.operator === 'contains')) params.operationName = f.value;
      if (f.field === 'http_method' && f.operator === 'equals') params.httpMethod = f.value;
      if (f.field === 'http_status' && f.operator === 'equals') params.httpStatusCode = f.value;
    });
    return params;
  }, [filters, selectedService, errorsOnly, pageSize, page]);

  /* ── Trace fetch ── */
  const { data, isLoading } = useQuery({
    queryKey: ['traces-v3', selectedTeamId, timeRange.value, refreshKey, backendParams],
    queryFn: () => {
      const endTime = Date.now();
      const startTime = endTime - timeRange.minutes * 60 * 1000;
      return v1Service.getTraces(selectedTeamId, startTime, endTime, backendParams) as Promise<any>;
    },
    enabled: !!selectedTeamId,
  });

  const rawTraces = useMemo(
    () => (Array.isArray((data as any)?.traces) ? (data as any).traces : []).map(normalizeTrace),
    [data?.traces]
  );

  /* ── Client-side free-text ── */
  const traces = useMemo(() => {
    let filtered = rawTraces;

    if (searchText.trim()) {
      const q = searchText.toLowerCase();
      filtered = filtered.filter(
        (t) =>
          t.trace_id?.toLowerCase().includes(q) ||
          t.service_name?.toLowerCase().includes(q) ||
          t.operation_name?.toLowerCase().includes(q)
      );
    }

    for (const f of filters) {
      const value = String(f.value ?? '').toLowerCase();
      if (!value) continue;

      filtered = filtered.filter((t) => {
        if (f.field === 'trace_id') {
          return f.operator === 'contains'
            ? t.trace_id?.toLowerCase().includes(value)
            : t.trace_id?.toLowerCase() === value;
        }
        if (f.field === 'operation_name') {
          return f.operator === 'equals'
            ? t.operation_name?.toLowerCase() === value
            : t.operation_name?.toLowerCase().includes(value);
        }
        if (f.field === 'service_name' && f.operator === 'contains') {
          return t.service_name?.toLowerCase().includes(value);
        }
        if (f.field === 'http_method') {
          return t.http_method?.toLowerCase() === value;
        }
        if (f.field === 'http_status') {
          const code = Number(f.value);
          if (f.operator === 'gt') return t.http_status_code > code;
          if (f.operator === 'lt') return t.http_status_code < code;
          return t.http_status_code === code;
        }
        if (f.field === 'duration_ms') {
          const ms = Number(f.value);
          if (f.operator === 'gt') return t.duration_ms > ms;
          if (f.operator === 'lt') return t.duration_ms < ms;
        }
        return true;
      });
    }

    return filtered;
  }, [rawTraces, searchText, filters]);

  const total = (data as any)?.total || 0;
  const summary = (data as any)?.summary || {};
  const totalTraces = summary.total_traces ?? summary.totalTraces ?? total ?? rawTraces.length;
  const errorTraces = summary.error_traces ?? summary.errorTraces ?? 0;
  const errorRate = totalTraces > 0 ? (errorTraces * 100) / totalTraces : 0;
  const p95 = summary.p95_duration ?? summary.p95Duration ?? 0;
  const p99 = summary.p99_duration ?? summary.p99Duration ?? 0;

  const maxDuration = useMemo(() => Math.max(...traces.map((t) => t.duration_ms), 1), [traces]);

  const serviceBadges = useMemo(() => {
    const counts = {};
    rawTraces.forEach((t) => { if (t.service_name) counts[t.service_name] = (counts[t.service_name] || 0) + 1; });
    return Object.entries(counts).sort((a: any, b: any) => b[1] - a[1]);
  }, [rawTraces]);

  const clearAll = useCallback(() => {
    setFilters([]);
    setSearchText('');
    setSelectedService(null);
    setErrorsOnly(false);
    setPage(1);
  }, []);

  /* ── Board row renderer ── */
  const renderRow = useCallback(
    (trace, { colWidths, visibleCols }) => (
      <TraceRow
        trace={trace}
        colWidths={colWidths}
        visibleCols={visibleCols}
        maxDuration={maxDuration}
        onRowClick={(spanId) => navigate(`/traces/${spanId}`)}
        onOpenDetail={setSelectedTrace}
      />
    ),
    [maxDuration, navigate]
  );

  /* ── Detail panel fields ── */
  const detailFields = selectedTrace ? [
    { key: 'trace_id', label: 'Trace ID', value: selectedTrace.trace_id, filterable: true },
    { key: 'service_name', label: 'Service', value: selectedTrace.service_name, filterable: true },
    { key: 'operation_name', label: 'Operation', value: selectedTrace.operation_name, filterable: false },
    { key: 'status', label: 'Status', value: selectedTrace.status, filterable: true },
    { key: 'http_method', label: 'HTTP Method', value: selectedTrace.http_method, filterable: true },
    { key: 'http_status_code', label: 'HTTP Status Code', value: selectedTrace.http_status_code ? String(selectedTrace.http_status_code) : null, filterable: false },
    { key: 'duration_ms', label: 'Duration', value: formatDuration(selectedTrace.duration_ms), filterable: false },
    { key: 'start_time', label: 'Start Time', value: selectedTrace.start_time, filterable: false },
  ].filter((f) => f.value) : [];

  const offset = (page - 1) * pageSize;
  const hasFilters = filters.length > 0 || searchText || errorsOnly || selectedService;

  return (
    <div className="traces-page">
      <PageHeader title="Traces" icon={<GitBranch size={24} />} />

      {/* ── KPI Row ── */}
      <div className="traces-kpi-row">
        <KpiCard title="Total Traces" value={formatNumber(totalTraces || 0)} icon={Activity} accentColor="#5E60CE" accentBg="rgba(94,96,206,0.12)" trend={0} />
        <KpiCard title="Error Rate" value={`${(errorRate || 0).toFixed(2)}%`} icon={AlertCircle} accentColor={errorRate > 5 ? '#F04438' : '#73C991'} accentBg={errorRate > 5 ? 'rgba(240,68,56,0.12)' : 'rgba(115,201,145,0.12)'} trend={0} />
        <KpiCard title="P95 Latency" value={formatDuration(p95 || 0)} icon={Zap} accentColor="#10B981" accentBg="rgba(16,185,129,0.12)" trend={0} />
        <KpiCard title="P99 Latency" value={formatDuration(p99 || 0)} icon={Clock} accentColor="#F59E0B" accentBg="rgba(245,158,11,0.12)" trend={0} />
      </div>

      {/* ── Configurable Charts ── */}
      {dashboardConfig && (
        <ConfigurableDashboard config={dashboardConfig} dataSources={chartDataSources} />
      )}

      {/* ── Histogram + Top Services ── */}
      <div className="traces-charts-row">
        <div className="traces-chart-card">
          <div className="traces-chart-card-header">
            <span className="traces-chart-card-title"><BarChart3 size={15} />Latency Distribution</span>
          </div>
          <div className="traces-chart-card-body" style={{ padding: '8px 12px' }}>
            {traces.length > 0
              ? <LatencyHistogram traces={traces} height={110} />
              : <div className="traces-histogram-empty">{isLoading ? <Spin size="small" /> : 'No trace data for this time range'}</div>
            }
          </div>
        </div>
        <div className="traces-chart-card">
          <div className="traces-chart-card-header">
            <span className="traces-chart-card-title"><Server size={15} />Services Breakdown</span>
          </div>
          <div className="traces-chart-card-body">
            <TopServicesPanel serviceBadges={serviceBadges} />
          </div>
        </div>
      </div>

      {/* ── Trace Explorer ── */}
      <div className="traces-table-card">
        <div className="traces-table-card-header">
          <span className="traces-table-card-title">
            <GitBranch size={15} />
            Trace Explorer
            <span className="traces-count-badge">
              {formatNumber(traces.length)} of {formatNumber(total || rawTraces.length)}
            </span>
          </span>
        </div>

        {/* Service pills */}
        {serviceBadges.length > 0 && (
          <div style={{ padding: '10px 18px', borderBottom: '1px solid var(--border-color)' }}>
            <ServicePills
              serviceBadges={serviceBadges}
              total={total || rawTraces.length}
              selectedService={selectedService}
              onSelect={(s) => { setSelectedService(s); setPage(1); }}
            />
          </div>
        )}

        {/* Query Bar */}
        <div style={{ padding: '10px 18px', borderBottom: '1px solid var(--border-color)' }}>
          <ObservabilityQueryBar
            fields={TRACE_FILTER_FIELDS}
            filters={filters}
            setFilters={(f) => { setFilters(f); setPage(1); }}
            searchText={searchText}
            setSearchText={(v) => { setSearchText(v); setPage(1); }}
            onClearAll={clearAll}
            placeholder="Filter by trace ID, service, status, duration…"
            rightSlot={
              <>
                <Tooltip title="Show only traces with errors">
                  <div
                    className={`traces-errors-toggle ${errorsOnly ? 'active' : ''}`}
                    onClick={() => { setErrorsOnly((v) => !v); setPage(1); }}
                  >
                    <AlertCircle size={13} />
                    Errors only
                    <Switch
                      size="small"
                      checked={errorsOnly}
                      onChange={(v) => { setErrorsOnly(v); setPage(1); }}
                      onClick={(_, e) => e.stopPropagation()}
                    />
                  </div>
                </Tooltip>
              </>
            }
          />
        </div>

        {/* Shared Data Board */}
        <div style={{ height: boardHeight(pageSize), display: 'flex', flexDirection: 'column' }}>
          <ObservabilityDataBoard
            columns={TRACE_COLUMNS}
            rows={traces}
            rowKey={(t, i) => t.trace_id || i}
            renderRow={renderRow}
            entityName="trace"
            storageKey="traces_visible_cols_v2"
            isLoading={isLoading}
            serverTotal={total || rawTraces.length}
            emptyTips={[
              { num: 1, text: <>Widen the <strong>time range</strong> in the top bar</> },
              { num: 2, text: <>Remove active <strong>filters</strong> from the query bar</> },
              { num: 3, text: <>Ensure your services are sending traces via <strong>OTLP</strong></> },
            ]}
          />
        </div>

        {/* Pagination */}
        {!isLoading && (total > 0 || rawTraces.length > 0) && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '11px 18px', borderTop: '1px solid var(--border-color)' }}>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              Showing {offset + 1}–{Math.min(offset + pageSize, total || rawTraces.length)} of {formatNumber(total || rawTraces.length)}
            </span>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <Select
                size="small"
                value={pageSize}
                onChange={(v) => { setPageSize(v); setPage(1); }}
                options={[10, 20, 50, 100].map((n) => ({ label: `${n} / page`, value: n }))}
                style={{ width: 110 }}
              />
              <button className="traces-export-btn" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))} style={{ opacity: page <= 1 ? 0.4 : 1 }}>
                ← Prev
              </button>
              <span style={{ fontSize: 12, color: 'var(--text-secondary)', padding: '0 4px' }}>
                Page {page} of {Math.max(1, Math.ceil((total || rawTraces.length) / pageSize))}
              </span>
              <button
                className="traces-export-btn"
                disabled={page >= Math.ceil((total || rawTraces.length) / pageSize)}
                onClick={() => setPage((p) => p + 1)}
                style={{ opacity: page >= Math.ceil((total || rawTraces.length) / pageSize) ? 0.4 : 1 }}
              >
                Next →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Trace Detail Panel ── */}
      {selectedTrace && (
        <ObservabilityDetailPanel
          title="Trace Detail"
          titleBadge={<TraceStatusBadge status={selectedTrace.status} />}
          metaLine={selectedTrace.start_time ? formatTimestamp(selectedTrace.start_time) : undefined}
          metaRight={selectedTrace.start_time ? relativeTime(selectedTrace.start_time) : undefined}
          summaryNode={
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: 12.5 }}>
                {selectedTrace.operation_name}
              </span>
              <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                {selectedTrace.http_method && (
                  <span className={`traces-method-badge ${selectedTrace.http_method.toUpperCase()}`}>
                    {selectedTrace.http_method.toUpperCase()}
                  </span>
                )}
                <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>
                  {formatDuration(selectedTrace.duration_ms)}
                </span>
              </div>
            </div>
          }
          actions={
            <>
              <button
                className="oboard__detail-action-btn oboard__detail-action-btn--primary"
                onClick={() => { navigate(`/traces/${selectedTrace.span_id || selectedTrace.trace_id}`); setSelectedTrace(null); }}
              >
                <TraceIcon size={13} /> View Full Trace
              </button>
              <button
                className="oboard__detail-action-btn"
                onClick={() => { navigate(`/traces/${selectedTrace.span_id || selectedTrace.trace_id}`); setSelectedTrace(null); }}
              >
                <Layers size={13} /> Waterfall
              </button>
            </>
          }
          fields={detailFields}
          rawData={selectedTrace}
          onClose={() => setSelectedTrace(null)}
        />
      )}
    </div>
  );
}
