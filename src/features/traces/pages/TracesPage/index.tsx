import { useQuery } from '@tanstack/react-query';
import { Switch, Tooltip, Select, Spin } from 'antd';
import {
  GitBranch,
  AlertCircle,
  Clock,
  Activity,
  Zap,
  BarChart3,
  Server,
  GitBranch as TraceIcon,
  Layers,
} from 'lucide-react';
import { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import LatencyHistogram from '@components/charts/distributions/LatencyHistogram';
import {
  PageHeader,
  ObservabilityQueryBar,
  ObservabilityDataBoard,
  ObservabilityDetailPanel,
  boardHeight,
} from '@components/common';
import ConfigurableDashboard from '@components/dashboard/ConfigurableDashboard';

import { v1Service } from '@services/v1Service';
import type { QueryParams } from '@services/service-types';

import { useDashboardConfig } from '@hooks/useDashboardConfig';
import { useTimeRangeQuery } from '@hooks/useTimeRangeQuery';
import { useURLFilters, type StructuredFilter } from '@hooks/useURLFilters';

import { useAppStore } from '@store/appStore';

import { formatTimestamp, formatDuration, formatNumber } from '@utils/formatters';
import { relativeTime } from '@utils/time';

import {
  TopServicesPanel,
  TracesServicePills,
  TracesKpiCard,
  TraceStatusBadge,
  TracesTableRow,
} from '../../components';
import type { ServiceBadge, TraceColumn, TraceRecord } from '../../types';

import './TracesPage.css';

interface TraceFilterOperator {
  key: string;
  label: string;
  symbol: string;
}

interface TraceFilterField {
  key: string;
  label: string;
  icon: string;
  group: string;
  operators: TraceFilterOperator[];
}

interface TraceTimeSeriesPoint extends Record<string, unknown> {
  timestamp: string;
  request_count: number;
  error_count: number;
  avg_latency: number;
  p50: number;
  p95: number;
  p99: number;
}

interface TraceEndpointMetric extends Record<string, unknown> {
  service_name: string;
  operation_name: string;
  request_count: number;
  error_count: number;
  avg_latency: number;
}

interface TracesSummary extends Record<string, unknown> {
  total_traces?: number;
  totalTraces?: number;
  error_traces?: number;
  errorTraces?: number;
  p95_duration?: number;
  p95Duration?: number;
  p99_duration?: number;
  p99Duration?: number;
}

interface TracesResponse {
  traces: unknown[];
  total: number;
  summary: TracesSummary;
}

function asRecord(value: unknown): Record<string, unknown> {
  if (typeof value !== 'object' || value === null) {
    return {};
  }

  const record: Record<string, unknown> = {};
  for (const [key, entryValue] of Object.entries(value)) {
    record[key] = entryValue;
  }
  return record;
}

function toNumber(value: unknown): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function toStringValue(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

function normalizeTracesResponse(value: unknown): TracesResponse {
  const row = asRecord(value);
  const traces = Array.isArray(row.traces) ? row.traces : [];
  const total = toNumber(row.total);
  const summary = asRecord(row.summary) as TracesSummary;
  return { traces, total, summary };
}

function normalizeTrace(input: unknown): TraceRecord {
  const row = asRecord(input);
  return {
    ...row,
    span_id: toStringValue(row.span_id ?? row.spanId),
    trace_id: toStringValue(row.trace_id ?? row.traceId),
    service_name: toStringValue(row.service_name ?? row.serviceName),
    operation_name: toStringValue(row.operation_name ?? row.operationName),
    start_time: toStringValue(row.start_time ?? row.startTime),
    duration_ms: toNumber(row.duration_ms ?? row.durationMs),
    status: toStringValue(row.status) || 'UNSET',
    http_method: toStringValue(row.http_method ?? row.httpMethod),
    http_status_code: toNumber(row.http_status_code ?? row.httpStatusCode),
  };
}

function normalizeTimeSeriesPoint(input: unknown): TraceTimeSeriesPoint {
  const row = asRecord(input);
  return {
    ...row,
    timestamp: toStringValue(row.timestamp ?? row.time_bucket ?? row.timeBucket),
    request_count: toNumber(row.request_count ?? row.requestCount),
    error_count: toNumber(row.error_count ?? row.errorCount),
    avg_latency: toNumber(row.avg_latency ?? row.avgLatency),
    p50: toNumber(row.p50 ?? row.p50_latency),
    p95: toNumber(row.p95 ?? row.p95_latency),
    p99: toNumber(row.p99 ?? row.p99_latency),
  };
}

function normalizeEndpointMetric(input: unknown): TraceEndpointMetric {
  const row = asRecord(input);
  return {
    ...row,
    service_name: toStringValue(row.service_name ?? row.serviceName),
    operation_name: toStringValue(row.operation_name ?? row.operationName),
    request_count: toNumber(row.request_count ?? row.requestCount),
    error_count: toNumber(row.error_count ?? row.errorCount),
    avg_latency: toNumber(row.avg_latency ?? row.avgLatency),
  };
}

/**
 * Filter fields used by the shared ObservabilityQueryBar on traces page.
 */
export const TRACE_FILTER_FIELDS: TraceFilterField[] = [
  {
    key: 'trace_id',
    label: 'Trace ID',
    icon: '🔗',
    group: 'Trace',
    operators: [
      { key: 'equals', label: 'equals', symbol: '=' },
      { key: 'contains', label: 'contains', symbol: '~' },
    ],
  },
  {
    key: 'operation_name',
    label: 'Operation',
    icon: '⚡',
    group: 'Trace',
    operators: [
      { key: 'equals', label: 'equals', symbol: '=' },
      { key: 'contains', label: 'contains', symbol: '~' },
    ],
  },
  {
    key: 'status',
    label: 'Status',
    icon: '🔵',
    group: 'Trace',
    operators: [{ key: 'equals', label: 'equals', symbol: '=' }],
  },
  {
    key: 'service_name',
    label: 'Service',
    icon: '⚙️',
    group: 'Service',
    operators: [
      { key: 'equals', label: 'equals', symbol: '=' },
      { key: 'contains', label: 'contains', symbol: '~' },
    ],
  },
  {
    key: 'http_method',
    label: 'HTTP Method',
    icon: '🌐',
    group: 'HTTP',
    operators: [{ key: 'equals', label: 'equals', symbol: '=' }],
  },
  {
    key: 'http_status',
    label: 'HTTP Status Code',
    icon: '📡',
    group: 'HTTP',
    operators: [
      { key: 'equals', label: 'equals', symbol: '=' },
      { key: 'gt', label: 'greater than', symbol: '>' },
      { key: 'lt', label: 'less than', symbol: '<' },
    ],
  },
  {
    key: 'duration_ms',
    label: 'Duration (ms)',
    icon: '⏱',
    group: 'Performance',
    operators: [
      { key: 'gt', label: 'greater than', symbol: '>' },
      { key: 'lt', label: 'less than', symbol: '<' },
    ],
  },
];

const TRACE_COLUMNS: TraceColumn[] = [
  { key: 'trace_id', label: 'Trace ID', defaultWidth: 185, defaultVisible: true },
  { key: 'service_name', label: 'Service', defaultWidth: 155, defaultVisible: true },
  { key: 'status', label: 'Status', defaultWidth: 100, defaultVisible: true },
  { key: 'duration_ms', label: 'Duration', defaultWidth: 135, defaultVisible: true },
  { key: 'http_status_code', label: 'HTTP Code', defaultWidth: 90, defaultVisible: false },
  { key: 'start_time', label: 'Start Time', defaultWidth: 165, defaultVisible: true },
  { key: 'operation_name', label: 'Operation', defaultVisible: true, flex: true },
];

const TRACES_URL_FILTER_CONFIG = {
  params: [
    { key: 'search', type: 'string' as const, defaultValue: '' },
    { key: 'service', type: 'string' as const, defaultValue: '' },
    { key: 'errorsOnly', type: 'boolean' as const, defaultValue: false },
  ],
  syncStructuredFilters: true,
};

/**
 * Traces hub page with KPIs, charts, and structured trace explorer.
 * @returns Traces page.
 */
export default function TracesPage(): JSX.Element {
  const navigate = useNavigate();
  const { selectedTeamId, timeRange, refreshKey } = useAppStore();
  const { config: dashboardConfig } = useDashboardConfig('traces');

  const { data: metricsTimeseriesRaw } = useTimeRangeQuery(
    'metrics-timeseries-traces',
    (teamId, startTime, endTime) =>
      v1Service.getMetricsTimeSeries(teamId, startTime, endTime, undefined, '5m'),
  );
  const { data: endpointTimeseriesRaw } = useTimeRangeQuery(
    'endpoints-timeseries-traces',
    (teamId, startTime, endTime) =>
      v1Service.getEndpointTimeSeries(teamId, startTime, endTime, ''),
    { extraKeys: [] },
  );
  const { data: endpointMetricsRaw } = useTimeRangeQuery(
    'endpoints-metrics-traces',
    (teamId, startTime, endTime) =>
      v1Service.getEndpointMetrics(teamId, startTime, endTime, ''),
    { extraKeys: [] },
  );

  const chartDataSources = useMemo(
    () => ({
      'metrics-timeseries': (Array.isArray(metricsTimeseriesRaw) ? metricsTimeseriesRaw : []).map(
        normalizeTimeSeriesPoint,
      ),
      'endpoints-timeseries': (
        Array.isArray(endpointTimeseriesRaw) ? endpointTimeseriesRaw : []
      ).map(normalizeTimeSeriesPoint),
      'endpoints-metrics': (Array.isArray(endpointMetricsRaw) ? endpointMetricsRaw : []).map(
        normalizeEndpointMetric,
      ),
    }),
    [metricsTimeseriesRaw, endpointTimeseriesRaw, endpointMetricsRaw],
  );

  const {
    values: urlValues,
    setters: urlSetters,
    structuredFilters: filters,
    setStructuredFilters: setFilters,
    clearAll: clearURLFilters,
  } = useURLFilters(TRACES_URL_FILTER_CONFIG);

  const searchText = typeof urlValues.search === 'string' ? urlValues.search : '';
  const selectedService =
    typeof urlValues.service === 'string' && urlValues.service.length > 0 ? urlValues.service : null;
  const errorsOnly = urlValues.errorsOnly === true;

  const setSearchText = (value: string): void => {
    urlSetters.search(value);
  };

  const setSelectedService = (value: string | null): void => {
    urlSetters.service(value || '');
  };

  const setErrorsOnly = (value: boolean): void => {
    urlSetters.errorsOnly(value);
  };

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [selectedTrace, setSelectedTrace] = useState<TraceRecord | null>(null);

  const backendParams = useMemo((): QueryParams => {
    const params: QueryParams = {
      limit: pageSize,
      offset: (page - 1) * pageSize,
    };

    if (errorsOnly) params.status = 'ERROR';
    if (selectedService) params.services = [selectedService];

    for (const filter of filters) {
      if (filter.field === 'status' && filter.operator === 'equals') params.status = filter.value;
      if (filter.field === 'service_name' && filter.operator === 'equals') {
        params.services = [filter.value];
      }
      if (filter.field === 'duration_ms' && filter.operator === 'gt') {
        params.minDuration = Number(filter.value);
      }
      if (filter.field === 'duration_ms' && filter.operator === 'lt') {
        params.maxDuration = Number(filter.value);
      }
      if (filter.field === 'trace_id' && filter.operator === 'equals') params.traceId = filter.value;
      if (
        filter.field === 'operation_name' &&
        (filter.operator === 'equals' || filter.operator === 'contains')
      ) {
        params.operationName = filter.value;
      }
      if (filter.field === 'http_method' && filter.operator === 'equals') {
        params.httpMethod = filter.value;
      }
      if (filter.field === 'http_status' && filter.operator === 'equals') {
        params.httpStatusCode = filter.value;
      }
    }

    return params;
  }, [filters, selectedService, errorsOnly, pageSize, page]);

  const { data, isLoading } = useQuery<TracesResponse>({
    queryKey: ['traces-v3', selectedTeamId, timeRange.value, refreshKey, backendParams],
    queryFn: async (): Promise<TracesResponse> => {
      const endTime = Date.now();
      const timeRangeMinutes = timeRange.minutes ?? 0;
      const startTime = endTime - timeRangeMinutes * 60 * 1000;
      const response = await v1Service.getTraces(selectedTeamId, startTime, endTime, backendParams);
      return normalizeTracesResponse(response);
    },
    enabled: !!selectedTeamId,
  });

  const rawTraces = useMemo(
    () => (Array.isArray(data?.traces) ? data.traces : []).map(normalizeTrace),
    [data?.traces],
  );

  const traces = useMemo((): TraceRecord[] => {
    let filteredTraces = rawTraces;

    if (searchText.trim()) {
      const query = searchText.toLowerCase();
      filteredTraces = filteredTraces.filter(
        (trace) =>
          trace.trace_id.toLowerCase().includes(query) ||
          trace.service_name.toLowerCase().includes(query) ||
          trace.operation_name.toLowerCase().includes(query),
      );
    }

    for (const filter of filters) {
      const value = String(filter.value ?? '').toLowerCase();
      if (!value) continue;

      filteredTraces = filteredTraces.filter((trace) => {
        if (filter.field === 'trace_id') {
          return filter.operator === 'contains'
            ? trace.trace_id.toLowerCase().includes(value)
            : trace.trace_id.toLowerCase() === value;
        }

        if (filter.field === 'operation_name') {
          return filter.operator === 'equals'
            ? trace.operation_name.toLowerCase() === value
            : trace.operation_name.toLowerCase().includes(value);
        }

        if (filter.field === 'service_name' && filter.operator === 'contains') {
          return trace.service_name.toLowerCase().includes(value);
        }

        if (filter.field === 'http_method') {
          return trace.http_method.toLowerCase() === value;
        }

        if (filter.field === 'http_status') {
          const code = Number(filter.value);
          if (filter.operator === 'gt') return trace.http_status_code > code;
          if (filter.operator === 'lt') return trace.http_status_code < code;
          return trace.http_status_code === code;
        }

        if (filter.field === 'duration_ms') {
          const duration = Number(filter.value);
          if (filter.operator === 'gt') return trace.duration_ms > duration;
          if (filter.operator === 'lt') return trace.duration_ms < duration;
        }

        return true;
      });
    }

    return filteredTraces;
  }, [rawTraces, searchText, filters]);

  const total = data?.total || 0;
  const summary = data?.summary || {};
  const totalTraces = toNumber(summary.total_traces ?? summary.totalTraces ?? total ?? rawTraces.length);
  const errorTraces = toNumber(summary.error_traces ?? summary.errorTraces);
  const errorRate = totalTraces > 0 ? (errorTraces * 100) / totalTraces : 0;
  const p95 = toNumber(summary.p95_duration ?? summary.p95Duration);
  const p99 = toNumber(summary.p99_duration ?? summary.p99Duration);

  const maxDuration = useMemo(
    () => Math.max(...traces.map((trace) => trace.duration_ms), 1),
    [traces],
  );

  const serviceBadges = useMemo<ServiceBadge[]>(() => {
    const counts: Record<string, number> = {};

    for (const trace of rawTraces) {
      if (trace.service_name) {
        counts[trace.service_name] = (counts[trace.service_name] || 0) + 1;
      }
    }

    return Object.entries(counts).sort((left, right) => right[1] - left[1]);
  }, [rawTraces]);

  const clearAll = useCallback((): void => {
    clearURLFilters();
    setPage(1);
  }, [clearURLFilters]);

  const renderRow = useCallback(
    (
      trace: TraceRecord,
      context: { colWidths: Record<string, number>; visibleCols: Record<string, boolean> },
    ): JSX.Element => (
      <TracesTableRow
        trace={trace}
        colWidths={context.colWidths}
        visibleCols={context.visibleCols}
        maxDuration={maxDuration}
        columns={TRACE_COLUMNS}
        onRowClick={(spanId: string) => navigate(`/traces/${spanId}`)}
        onOpenDetail={setSelectedTrace}
      />
    ),
    [maxDuration, navigate],
  );

  const detailFields = selectedTrace
    ? [
        {
          key: 'trace_id',
          label: 'Trace ID',
          value: selectedTrace.trace_id,
          filterable: true,
        },
        {
          key: 'service_name',
          label: 'Service',
          value: selectedTrace.service_name,
          filterable: true,
        },
        {
          key: 'operation_name',
          label: 'Operation',
          value: selectedTrace.operation_name,
          filterable: false,
        },
        { key: 'status', label: 'Status', value: selectedTrace.status, filterable: true },
        {
          key: 'http_method',
          label: 'HTTP Method',
          value: selectedTrace.http_method,
          filterable: true,
        },
        {
          key: 'http_status_code',
          label: 'HTTP Status Code',
          value: selectedTrace.http_status_code ? String(selectedTrace.http_status_code) : null,
          filterable: false,
        },
        {
          key: 'duration_ms',
          label: 'Duration',
          value: formatDuration(selectedTrace.duration_ms),
          filterable: false,
        },
        {
          key: 'start_time',
          label: 'Start Time',
          value: selectedTrace.start_time,
          filterable: false,
        },
      ].filter((field) => Boolean(field.value))
    : [];

  const offset = (page - 1) * pageSize;
  const hasDashboardConfig = Boolean(dashboardConfig && typeof dashboardConfig === 'object');

  return (
    <div className="traces-page">
      <PageHeader title="Traces" icon={<GitBranch size={24} />} />

      <div className="traces-kpi-row">
        <TracesKpiCard
          title="Total Traces"
          value={formatNumber(totalTraces || 0)}
          icon={Activity}
          accentColor="#5E60CE"
          accentBg="rgba(94,96,206,0.12)"
          trend={0}
        />
        <TracesKpiCard
          title="Error Rate"
          value={`${(errorRate || 0).toFixed(2)}%`}
          icon={AlertCircle}
          accentColor={errorRate > 5 ? '#F04438' : '#73C991'}
          accentBg={errorRate > 5 ? 'rgba(240,68,56,0.12)' : 'rgba(115,201,145,0.12)'}
          trend={0}
        />
        <TracesKpiCard
          title="P95 Latency"
          value={formatDuration(p95 || 0)}
          icon={Zap}
          accentColor="#10B981"
          accentBg="rgba(16,185,129,0.12)"
          trend={0}
        />
        <TracesKpiCard
          title="P99 Latency"
          value={formatDuration(p99 || 0)}
          icon={Clock}
          accentColor="#F59E0B"
          accentBg="rgba(245,158,11,0.12)"
          trend={0}
        />
      </div>

      {hasDashboardConfig ? (
        <ConfigurableDashboard config={dashboardConfig} dataSources={chartDataSources} />
      ) : null}

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

        {serviceBadges.length > 0 && (
          <div style={{ padding: '10px 18px', borderBottom: '1px solid var(--border-color)' }}>
            <TracesServicePills
              serviceBadges={serviceBadges}
              total={total || rawTraces.length}
              selectedService={selectedService}
              onSelect={(serviceName: string | null) => {
                setSelectedService(serviceName);
                setPage(1);
              }}
            />
          </div>
        )}

        <div style={{ padding: '10px 18px', borderBottom: '1px solid var(--border-color)' }}>
          <ObservabilityQueryBar
            fields={TRACE_FILTER_FIELDS}
            filters={filters as StructuredFilter[]}
            setFilters={(nextFilters) => {
              setFilters(nextFilters as StructuredFilter[]);
              setPage(1);
            }}
            searchText={searchText}
            setSearchText={(value: string) => {
              setSearchText(value);
              setPage(1);
            }}
            onClearAll={clearAll}
            placeholder="Filter by trace ID, service, status, duration…"
            rightSlot={
              <Tooltip title="Show only traces with errors">
                <div
                  className={`traces-errors-toggle ${errorsOnly ? 'active' : ''}`}
                  onClick={() => {
                    setErrorsOnly(!errorsOnly);
                    setPage(1);
                  }}
                >
                  <AlertCircle size={13} />
                  Errors only
                  <Switch
                    size="small"
                    checked={errorsOnly}
                    onChange={(checked: boolean) => {
                      setErrorsOnly(checked);
                      setPage(1);
                    }}
                    onClick={(_, event) => event.stopPropagation()}
                  />
                </div>
              </Tooltip>
            }
          />
        </div>

        <div style={{ height: boardHeight(pageSize), display: 'flex', flexDirection: 'column' }}>
          <ObservabilityDataBoard
            columns={TRACE_COLUMNS}
            rows={traces}
            rowKey={(trace, index) => trace.trace_id || index}
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

        {!isLoading && (total > 0 || rawTraces.length > 0) && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '11px 18px',
              borderTop: '1px solid var(--border-color)',
            }}
          >
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              Showing {offset + 1}–{Math.min(offset + pageSize, total || rawTraces.length)} of{' '}
              {formatNumber(total || rawTraces.length)}
            </span>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <Select
                size="small"
                value={pageSize}
                onChange={(value: number) => {
                  setPageSize(value);
                  setPage(1);
                }}
                options={[10, 20, 50, 100].map((value) => ({
                  label: `${value} / page`,
                  value,
                }))}
                style={{ width: 110 }}
              />
              <button
                className="traces-export-btn"
                disabled={page <= 1}
                onClick={() => setPage((previousPage) => Math.max(1, previousPage - 1))}
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
                onClick={() => setPage((previousPage) => previousPage + 1)}
                style={{
                  opacity: page >= Math.ceil((total || rawTraces.length) / pageSize) ? 0.4 : 1,
                }}
              >
                Next →
              </button>
            </div>
          </div>
        )}
      </div>

      {selectedTrace && (
        <ObservabilityDetailPanel
          title="Trace Detail"
          titleBadge={<TraceStatusBadge status={selectedTrace.status} />}
          metaLine={selectedTrace.start_time ? formatTimestamp(selectedTrace.start_time) : undefined}
          metaRight={selectedTrace.start_time ? relativeTime(selectedTrace.start_time) : undefined}
          summaryNode={
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <span
                style={{
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  fontSize: 12.5,
                }}
              >
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
                onClick={() => {
                  navigate(`/traces/${selectedTrace.span_id || selectedTrace.trace_id}`);
                  setSelectedTrace(null);
                }}
              >
                <TraceIcon size={13} /> View Full Trace
              </button>
              <button
                className="oboard__detail-action-btn"
                onClick={() => {
                  navigate(`/traces/${selectedTrace.span_id || selectedTrace.trace_id}`);
                  setSelectedTrace(null);
                }}
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
