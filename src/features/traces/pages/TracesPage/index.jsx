import { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Switch, Tooltip, Select, Input, Spin } from 'antd';
import { useQuery } from '@tanstack/react-query';
import {
  GitBranch,
  Download,
  AlertCircle,
  Clock,
  Activity,
  Search,
  Zap,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  CheckCircle2,
  XCircle,
  BarChart3,
  FilterX,
  Server,
} from 'lucide-react';
import { useAppStore } from '@store/appStore';
import { v1Service } from '@services/v1Service';
import { PageHeader, StatusBadge } from '@components/common';
import { TRACE_STATUSES } from '@config/constants';
import { formatTimestamp, formatDuration, formatNumber } from '@utils/formatters';
import LatencyHistogram from '@components/charts/distributions/LatencyHistogram';
import { useDashboardConfig } from '@hooks/useDashboardConfig';
import { useTimeRangeQuery } from '@hooks/useTimeRangeQuery';
import ConfigurableDashboard from '@components/dashboard/ConfigurableDashboard';
import './TracesPage.css';

/* ─── Normalizers ─────────────────────────────────────────────────────────── */

const normalizeTrace = (trace = {}) => ({
  ...trace,
  trace_id: trace.trace_id ?? trace.traceId ?? '',
  service_name: trace.service_name ?? trace.serviceName ?? '',
  operation_name: trace.operation_name ?? trace.operationName ?? '',
  start_time: trace.start_time ?? trace.startTime ?? '',
  end_time: trace.end_time ?? trace.endTime ?? '',
  duration_ms: Number(trace.duration_ms ?? trace.durationMs ?? 0),
  status: trace.status ?? 'UNSET',
  http_method: trace.http_method ?? trace.httpMethod ?? '',
  http_status_code: Number(trace.http_status_code ?? trace.httpStatusCode ?? 0),
});

const normalizeTimeSeriesPoint = (point = {}) => ({
  ...point,
  timestamp: point.timestamp ?? point.time_bucket ?? point.timeBucket ?? '',
  request_count: Number(point.request_count ?? point.requestCount ?? 0),
  error_count: Number(point.error_count ?? point.errorCount ?? 0),
  avg_latency: Number(point.avg_latency ?? point.avgLatency ?? 0),
  p50: Number(point.p50 ?? point.p50_latency ?? point.p50Latency ?? 0),
  p95: Number(point.p95 ?? point.p95_latency ?? point.p95Latency ?? 0),
  p99: Number(point.p99 ?? point.p99_latency ?? point.p99Latency ?? 0),
});

const normalizeEndpointMetric = (metric = {}) => ({
  ...metric,
  service_name: metric.service_name ?? metric.serviceName ?? '',
  operation_name: metric.operation_name ?? metric.operationName ?? '',
  http_method: metric.http_method ?? metric.httpMethod ?? '',
  request_count: Number(metric.request_count ?? metric.requestCount ?? 0),
  error_count: Number(metric.error_count ?? metric.errorCount ?? 0),
  avg_latency: Number(metric.avg_latency ?? metric.avgLatency ?? 0),
  p50_latency: Number(metric.p50_latency ?? metric.p50Latency ?? 0),
  p95_latency: Number(metric.p95_latency ?? metric.p95Latency ?? 0),
  p99_latency: Number(metric.p99_latency ?? metric.p99Latency ?? 0),
});

/* ─── KPI CARD ────────────────────────────────────────────────────────────── */

function KpiCard({ title, value, icon: Icon, accentColor, accentBg, trend, trendLabel, isError }) {
  const trendPositive = trend > 0;
  const showTrend = trend != null && trend !== 0;

  return (
    <div
      className="traces-kpi-card"
      style={{
        '--kpi-accent': accentColor,
        '--kpi-accent-from': accentColor + '33',
        '--kpi-accent-bg': accentBg,
      }}
    >
      <div className="traces-kpi-card-header">
        <span className="traces-kpi-label">{title}</span>
        <span className="traces-kpi-icon" style={{ background: accentBg, color: accentColor }}>
          <Icon size={15} />
        </span>
      </div>
      <div className="traces-kpi-value">{value}</div>
      {showTrend && (
        <div
          className={`traces-kpi-pill ${isError ? (trendPositive ? 'up' : 'down') : (trendPositive ? 'up' : 'down')}`}
        >
          {trendPositive ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
          {Math.abs(trend).toFixed(1)}% {trendLabel}
        </div>
      )}
    </div>
  );
}

/* ─── SERVICE BREAKDOWN PILLS ─────────────────────────────────────────────── */

function ServicePills({ serviceBadges, total, selectedService, onSelect }) {
  return (
    <div className="traces-service-pills">
      <div
        className={`traces-service-pill ${!selectedService ? 'active' : ''}`}
        onClick={() => onSelect(null)}
      >
        All
        <span className="traces-service-pill-count">{total}</span>
      </div>
      {serviceBadges.map(([service, count]) => (
        <div
          key={service}
          className={`traces-service-pill ${selectedService === service ? 'active' : ''}`}
          onClick={() => onSelect(selectedService === service ? null : service)}
        >
          {service}
          <span className="traces-service-pill-count">{count}</span>
        </div>
      ))}
    </div>
  );
}

/* ─── STATUS BADGE (inline) ───────────────────────────────────────────────── */

function TraceStatusBadge({ status }) {
  const s = (status || 'UNSET').toUpperCase();
  const cls = s === 'OK' ? 'ok' : s === 'ERROR' ? 'error' : 'unset';
  return (
    <span className={`traces-status-badge ${cls}`}>
      <span className="traces-status-badge-dot" />
      {s}
    </span>
  );
}

/* ─── METHOD BADGE ────────────────────────────────────────────────────────── */

function MethodBadge({ method }) {
  if (!method) return null;
  const m = method.toUpperCase();
  return <span className={`traces-method-badge ${m}`}>{m}</span>;
}

/* ─── TOP SERVICES BREAKDOWN ──────────────────────────────────────────────── */

function TopServicesPanel({ serviceBadges }) {
  if (!serviceBadges.length) {
    return (
      <div className="traces-histogram-empty">No service data</div>
    );
  }
  const max = serviceBadges[0]?.[1] || 1;
  return (
    <div className="traces-top-services">
      {serviceBadges.slice(0, 7).map(([service, count]) => (
        <div key={service} className="traces-top-service-row">
          <span className="traces-top-service-name">{service}</span>
          <div className="traces-top-service-bar-bg">
            <div
              className="traces-top-service-bar-fill"
              style={{ width: `${(count / max) * 100}%` }}
            />
          </div>
          <span className="traces-top-service-count">{count}</span>
        </div>
      ))}
    </div>
  );
}

/* ─── MAIN PAGE ────────────────────────────────────────────────────────────── */

export default function TracesPage() {
  const navigate = useNavigate();
  const { selectedTeamId, timeRange, refreshKey } = useAppStore();

  const { config: dashboardConfig } = useDashboardConfig('traces');

  const { data: metricsTimeseriesRaw } = useTimeRangeQuery(
    'metrics-timeseries-traces',
    (teamId, start, end) => v1Service.getMetricsTimeSeries(teamId, start, end, null, '5m')
  );
  const { data: endpointTimeseriesRaw } = useTimeRangeQuery(
    'endpoints-timeseries-traces',
    (teamId, start, end) => v1Service.getEndpointTimeSeries(teamId, start, end)
  );
  const { data: endpointMetricsRaw } = useTimeRangeQuery(
    'endpoints-metrics-traces',
    (teamId, start, end) => v1Service.getEndpointMetrics(teamId, start, end)
  );

  const chartDataSources = useMemo(() => ({
    'metrics-timeseries': (Array.isArray(metricsTimeseriesRaw) ? metricsTimeseriesRaw : []).map(normalizeTimeSeriesPoint),
    'endpoints-timeseries': (Array.isArray(endpointTimeseriesRaw) ? endpointTimeseriesRaw : []).map(normalizeTimeSeriesPoint),
    'endpoints-metrics': (Array.isArray(endpointMetricsRaw) ? endpointMetricsRaw : []).map(normalizeEndpointMetric),
  }), [metricsTimeseriesRaw, endpointTimeseriesRaw, endpointMetricsRaw]);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [selectedService, setSelectedService] = useState(null);
  const [minDuration, setMinDuration] = useState(null);
  const [errorsOnly, setErrorsOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const offset = (page - 1) * pageSize;

  const { data, isLoading } = useQuery({
    queryKey: ['traces-v2', selectedTeamId, timeRange.value, page, pageSize, selectedStatus, selectedService, minDuration, errorsOnly, refreshKey],
    queryFn: () => {
      const endTime = Date.now();
      const startTime = endTime - timeRange.minutes * 60 * 1000;
      const statusFilter = errorsOnly ? 'ERROR' : selectedStatus;
      return v1Service.getTraces(selectedTeamId, startTime, endTime, {
        status: statusFilter || undefined,
        services: selectedService ? [selectedService] : undefined,
        minDuration: minDuration || undefined,
        limit: pageSize,
        offset,
      });
    },
    enabled: !!selectedTeamId,
  });

  const rawTraces = useMemo(() => {
    const rows = Array.isArray(data?.traces) ? data.traces : [];
    return rows.map(normalizeTrace);
  }, [data?.traces]);

  const traces = useMemo(() => {
    if (!searchQuery.trim()) return rawTraces;
    const q = searchQuery.toLowerCase();
    return rawTraces.filter(
      (t) =>
        t.trace_id?.toLowerCase().includes(q) ||
        t.service_name?.toLowerCase().includes(q) ||
        t.operation_name?.toLowerCase().includes(q)
    );
  }, [rawTraces, searchQuery]);

  const total = data?.total || 0;
  const summary = data?.summary || {};
  const totalTraces = summary.total_traces ?? summary.totalTraces ?? total ?? rawTraces.length;
  const errorTraces = summary.error_traces ?? summary.errorTraces ?? 0;
  const errorRate = totalTraces > 0 ? (errorTraces * 100) / totalTraces : 0;
  const p95 = summary.p95_duration ?? summary.p95Duration ?? 0;
  const p99 = summary.p99_duration ?? summary.p99Duration ?? 0;

  const handleTraceClick = useCallback((traceId) => {
    if (traceId) navigate(`/traces/${traceId}`);
  }, [navigate]);

  const serviceBadges = useMemo(() => {
    const counts = {};
    rawTraces.forEach((t) => {
      if (t.service_name) counts[t.service_name] = (counts[t.service_name] || 0) + 1;
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [rawTraces]);

  // Max duration across current page for bar scaling
  const maxDuration = useMemo(
    () => Math.max(...traces.map((t) => t.duration_ms), 1),
    [traces]
  );

  /* ── Columns ── */
  const columns = [
    {
      title: 'Trace ID',
      dataIndex: 'trace_id',
      key: 'trace_id',
      width: 185,
      render: (traceId) => (
        <span
          className="traces-trace-id"
          onClick={(e) => { e.stopPropagation(); handleTraceClick(traceId); }}
        >
          <ArrowUpRight size={11} />
          {traceId ? traceId.slice(0, 16) + '…' : '-'}
        </span>
      ),
    },
    {
      title: 'Service',
      dataIndex: 'service_name',
      key: 'service_name',
      width: 165,
      render: (name) => (
        <span className="traces-service-tag">
          <span className="traces-service-tag-dot" />
          {name || '-'}
        </span>
      ),
    },
    {
      title: 'Operation',
      dataIndex: 'operation_name',
      key: 'operation_name',
      render: (op, record) => (
        <div className="traces-operation-cell">
          <span className="traces-operation-name" title={op}>{op || '-'}</span>
          {record.http_status_code > 0 && (
            <div className="traces-http-meta">
              <MethodBadge method={record.http_method} />
              <span className="traces-http-code">HTTP {record.http_status_code}</span>
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 105,
      render: (status) => <TraceStatusBadge status={status} />,
    },
    {
      title: 'Duration',
      dataIndex: 'duration_ms',
      key: 'duration_ms',
      width: 130,
      sorter: (a, b) => a.duration_ms - b.duration_ms,
      render: (duration) => {
        const pct = maxDuration > 0 ? Math.min((duration / maxDuration) * 100, 100) : 0;
        const color =
          duration > 1000 ? '#F04438'
            : duration > 500 ? '#F79009'
              : '#73C991';
        return (
          <div className="traces-duration-cell">
            <span className="traces-duration-value" style={{ color }}>
              {formatDuration(duration)}
            </span>
            <div className="traces-duration-bar-wrapper">
              <div
                className="traces-duration-bar"
                style={{ width: `${pct}%`, background: color }}
              />
            </div>
          </div>
        );
      },
    },
    {
      title: 'Start Time',
      dataIndex: 'start_time',
      key: 'start_time',
      width: 175,
      render: (timestamp) => (
        <span className="traces-timestamp">{formatTimestamp(timestamp)}</span>
      ),
    },
  ];

  const statusOptions = (TRACE_STATUSES || []).map((s) => ({ label: s.label, value: s.value }));

  const durationOptions = [
    { label: 'Any duration', value: null },
    { label: '100ms+', value: 100 },
    { label: '500ms+', value: 500 },
    { label: '1s+', value: 1000 },
    { label: '5s+', value: 5000 },
    { label: '10s+', value: 10000 },
  ];

  const serviceOptions = useMemo(
    () =>
      [...new Set(rawTraces.map((t) => t.service_name))]
        .filter(Boolean)
        .map((s) => ({ label: s, value: s })),
    [rawTraces]
  );

  const hasFilters = selectedStatus || selectedService || minDuration || errorsOnly || searchQuery;

  const clearAllFilters = () => {
    setSelectedStatus(null);
    setSelectedService(null);
    setMinDuration(null);
    setErrorsOnly(false);
    setSearchQuery('');
    setPage(1);
  };

  return (
    <div className="traces-page">
      <PageHeader title="Traces" icon={<GitBranch size={24} />} />

      {/* ── KPI Row ── */}
      <div className="traces-kpi-row">
        <KpiCard
          title="Total Traces"
          value={formatNumber(totalTraces || 0)}
          icon={Activity}
          accentColor="#5E60CE"
          accentBg="rgba(94,96,206,0.12)"
          trendLabel="vs last period"
        />
        <KpiCard
          title="Error Rate"
          value={`${(errorRate || 0).toFixed(2)}%`}
          icon={AlertCircle}
          accentColor={errorRate > 5 ? '#F04438' : '#73C991'}
          accentBg={errorRate > 5 ? 'rgba(240,68,56,0.12)' : 'rgba(115,201,145,0.12)'}
          isError
          trendLabel="vs last period"
        />
        <KpiCard
          title="P95 Latency"
          value={formatDuration(p95 || 0)}
          icon={Zap}
          accentColor="#10B981"
          accentBg="rgba(16,185,129,0.12)"
          trendLabel="vs last period"
        />
        <KpiCard
          title="P99 Latency"
          value={formatDuration(p99 || 0)}
          icon={Clock}
          accentColor="#F59E0B"
          accentBg="rgba(245,158,11,0.12)"
          trendLabel="vs last period"
        />
      </div>

      {/* ── Configurable Charts ── */}
      {dashboardConfig && (
        <div className="traces-configurable-section">
          <ConfigurableDashboard
            config={dashboardConfig}
            dataSources={chartDataSources}
          />
        </div>
      )}

      {/* ── Histogram + Top Services ── */}
      <div className="traces-charts-row">
        <div className="traces-chart-card">
          <div className="traces-chart-card-header">
            <span className="traces-chart-card-title">
              <BarChart3 size={15} />
              Latency Distribution
            </span>
          </div>
          <div className="traces-chart-card-body" style={{ padding: '8px 12px' }}>
            {traces.length > 0 ? (
              <LatencyHistogram traces={traces} height={110} />
            ) : (
              <div className="traces-histogram-empty">
                {isLoading ? <Spin size="small" /> : 'No trace data for this time range'}
              </div>
            )}
          </div>
        </div>

        <div className="traces-chart-card">
          <div className="traces-chart-card-header">
            <span className="traces-chart-card-title">
              <Server size={15} />
              Services Breakdown
            </span>
          </div>
          <div className="traces-chart-card-body">
            <TopServicesPanel serviceBadges={serviceBadges} />
          </div>
        </div>
      </div>

      {/* ── Table Card ── */}
      <div className="traces-table-card">
        <div className="traces-table-card-header">
          <div className="traces-table-card-title">
            <GitBranch size={15} />
            Trace Explorer
            <span className="traces-count-badge">
              {formatNumber(traces.length)} of {formatNumber(total || rawTraces.length)}
            </span>
          </div>
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

        {/* Controls bar */}
        <div style={{ padding: '10px 18px', borderBottom: '1px solid var(--border-color)' }}>
          <div className="traces-controls">
            <div className="traces-controls-left">
              <Input
                className="traces-search-input"
                placeholder="Search trace ID, service, operation…"
                prefix={<Search size={14} style={{ color: 'var(--text-muted)' }} />}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                allowClear
              />
              <Select
                placeholder="Status"
                allowClear
                options={statusOptions}
                value={selectedStatus}
                onChange={(v) => { setSelectedStatus(v); setPage(1); }}
                style={{ width: 130 }}
              />
              <Select
                placeholder="Service"
                allowClear
                options={serviceOptions}
                value={selectedService}
                onChange={(v) => { setSelectedService(v); setPage(1); }}
                style={{ width: 160 }}
              />
              <Select
                placeholder="Min duration"
                allowClear
                options={durationOptions}
                value={minDuration}
                onChange={(v) => { setMinDuration(v); setPage(1); }}
                style={{ width: 140 }}
              />
              {hasFilters && (
                <Tooltip title="Clear all filters">
                  <button className="traces-export-btn" onClick={clearAllFilters} style={{ color: '#F59E0B', borderColor: 'rgba(245,158,11,0.3)' }}>
                    <FilterX size={14} />
                    Clear
                  </button>
                </Tooltip>
              )}
            </div>
            <div className="traces-controls-right">
              <Tooltip title="Show only traces with errors">
                <div
                  className={`traces-errors-toggle ${errorsOnly ? 'active' : ''}`}
                  onClick={() => { setErrorsOnly((v) => !v); setPage(1); }}
                >
                  <AlertCircle size={13} />
                  Errors only
                  <Switch size="small" checked={errorsOnly} onChange={(v) => { setErrorsOnly(v); setPage(1); }} onClick={(_, e) => e.stopPropagation()} />
                </div>
              </Tooltip>
              <button className="traces-export-btn">
                <Download size={14} />
                Export
              </button>
            </div>
          </div>
        </div>

        {/* Ant Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: 'var(--bg-secondary)' }}>
                {columns.map((col) => (
                  <th
                    key={col.key}
                    style={{
                      padding: '10px 16px',
                      textAlign: 'left',
                      fontSize: 11,
                      fontWeight: 600,
                      letterSpacing: '0.05em',
                      textTransform: 'uppercase',
                      color: 'var(--text-muted)',
                      borderBottom: '1px solid var(--border-color)',
                      whiteSpace: 'nowrap',
                      width: col.width || 'auto',
                    }}
                  >
                    {col.title}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border-light)' }}>
                    {columns.map((col) => (
                      <td key={col.key} style={{ padding: '14px 16px' }}>
                        <div className="traces-skeleton" style={{ width: `${60 + Math.random() * 30}%` }} />
                      </td>
                    ))}
                  </tr>
                ))
              ) : traces.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
                      <GitBranch size={32} style={{ opacity: 0.3 }} />
                      <span>No traces found for the selected filters</span>
                      {hasFilters && (
                        <button className="traces-export-btn" onClick={clearAllFilters}>
                          <FilterX size={13} /> Clear filters
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                traces.map((trace) => (
                  <tr
                    key={trace.trace_id}
                    className="traces-table-row"
                    onClick={() => handleTraceClick(trace.trace_id)}
                    style={{
                      borderBottom: '1px solid var(--border-light)',
                      transition: 'background 0.12s',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-hover)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = '')}
                  >
                    {columns.map((col) => (
                      <td
                        key={col.key}
                        style={{
                          padding: '12px 16px',
                          verticalAlign: 'middle',
                          width: col.width || 'auto',
                        }}
                      >
                        {col.render
                          ? col.render(trace[col.dataIndex], trace)
                          : (trace[col.dataIndex] ?? '-')}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!isLoading && (total > 0 || rawTraces.length > 0) && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 18px',
            borderTop: '1px solid var(--border-color)',
          }}>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              Showing {offset + 1}–{Math.min(offset + pageSize, total || rawTraces.length)} of {formatNumber(total || rawTraces.length)} traces
            </span>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <Select
                size="small"
                value={pageSize}
                onChange={(v) => { setPageSize(v); setPage(1); }}
                options={[10, 20, 50, 100].map((n) => ({ label: `${n} / page`, value: n }))}
                style={{ width: 110 }}
              />
              <button
                className="traces-export-btn"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                style={{ opacity: page <= 1 ? 0.4 : 1 }}
              >
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
    </div>
  );
}
