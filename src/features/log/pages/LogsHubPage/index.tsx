import { useQuery } from '@tanstack/react-query';
import {
  FileText,
  GitBranch,
} from 'lucide-react';
import { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import { PageHeader, ObservabilityDetailPanel } from '@components/common';

import LogRow, { LevelBadge } from '@features/log/components/log/LogRow';
import LogsLevelDistributionCard from '@features/log/components/charts/LogsLevelDistributionCard';
import LogsVolumeSection from '@features/log/components/charts/LogsVolumeSection';
import LogsKpiRow from '@features/log/components/kpi/LogsKpiRow';
import LogsTableSection from '@features/log/components/table/LogsTableSection';

import { v1Service } from '@services/v1Service';

import { useTimeRangeQuery } from '@hooks/useTimeRangeQuery';
import { useURLFilters } from '@hooks/useURLFilters';

import { useAppStore } from '@store/appStore';

import { relativeTime, tsLabel } from '@utils/time';

import './LogsHubPage.css';

/* ─── Filter fields ───────────────────────────────────────────────────────── */
export /**
        *
        */
const LOG_FILTER_FIELDS = [
  {
    key: 'service_name', label: 'Service', icon: '⚙️', group: 'Service',
    operators: [{ key: 'equals', label: 'equals', symbol: '=' }, { key: 'not_equals', label: 'not equals', symbol: '!=' }],
  },
  {
    key: 'level', label: 'Level', icon: '🎚️', group: 'Log',
    operators: [{ key: 'equals', label: 'equals', symbol: '=' }, { key: 'not_equals', label: 'not equals', symbol: '!=' }],
  },
  {
    key: 'host', label: 'Host', icon: '🖥️', group: 'Infrastructure',
    operators: [{ key: 'equals', label: 'equals', symbol: '=' }, { key: 'not_equals', label: 'not equals', symbol: '!=' }],
  },
  {
    key: 'pod', label: 'Pod', icon: '📦', group: 'Infrastructure',
    operators: [{ key: 'equals', label: 'equals', symbol: '=' }],
  },
  {
    key: 'container', label: 'Container', icon: '🐳', group: 'Infrastructure',
    operators: [{ key: 'equals', label: 'equals', symbol: '=' }],
  },
  {
    key: 'logger', label: 'Logger', icon: '📝', group: 'Log',
    operators: [{ key: 'equals', label: 'equals', symbol: '=' }],
  },
  {
    key: 'trace_id', label: 'Trace ID', icon: '🔗', group: 'Correlation',
    operators: [{ key: 'equals', label: 'equals', symbol: '=' }],
  },
  {
    key: 'span_id', label: 'Span ID', icon: '🔀', group: 'Correlation',
    operators: [{ key: 'equals', label: 'equals', symbol: '=' }],
  },
];

/* ─── Column definitions ──────────────────────────────────────────────────── */
const LOG_COLUMNS = [
  { key: 'timestamp', label: 'Time', defaultWidth: 175, defaultVisible: true },
  { key: 'level', label: 'Level', defaultWidth: 80, defaultVisible: true },
  { key: 'service_name', label: 'Service', defaultWidth: 160, defaultVisible: true },
  { key: 'host', label: 'Host/Pod', defaultWidth: 140, defaultVisible: false },
  { key: 'logger', label: 'Logger', defaultWidth: 160, defaultVisible: false },
  { key: 'trace_id', label: 'Trace ID', defaultWidth: 220, defaultVisible: false },
  { key: 'thread', label: 'Thread', defaultWidth: 120, defaultVisible: false },
  { key: 'container', label: 'Container', defaultWidth: 140, defaultVisible: false },
  { key: 'message', label: 'Message', defaultVisible: true, flex: true },
];

/* ─── URL filter config ────────────────────────────────────────────────── */
const LOGS_URL_FILTER_CONFIG = {
  params: [
    { key: 'search', type: 'string' as const, defaultValue: '' },
    { key: 'service', type: 'string' as const, defaultValue: '' },
    { key: 'errorsOnly', type: 'boolean' as const, defaultValue: false },
  ],
  syncStructuredFilters: true,
};

/* ─── Main page ───────────────────────────────────────────────────────────── */
/**
 *
 */
export default function LogsHubPage() {
  const { selectedTeamId, timeRange, refreshKey } = useAppStore();
  const navigate = useNavigate();

  /* ── URL-synced filter state ── */
  const {
    values: urlValues,
    setters: urlSetters,
    structuredFilters: filters,
    setStructuredFilters: setFilters,
    clearAll: clearURLFilters,
  } = useURLFilters(LOGS_URL_FILTER_CONFIG);

  const searchText = urlValues.search;
  const setSearchText = urlSetters.search;
  const selectedService = urlValues.service || null;
  const setSelectedService = (v: string | null) => urlSetters.service(v || '');
  const errorsOnly = urlValues.errorsOnly;
  const setErrorsOnly = urlSetters.errorsOnly;

  /* ── Local-only state (not worth putting in URL) ── */
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [selectedLog, setSelectedLog] = useState(null);

  /* ── Backend params derived from filters ── */
  const backendParams: any = useMemo(() => {
    const params: any = { limit: pageSize, offset: (page - 1) * pageSize };
    if (searchText.trim()) params.search = searchText.trim();
    if (errorsOnly) params.levels = ['ERROR', 'FATAL'];
    if (selectedService) params.services = [selectedService];
    filters.forEach((f) => {
      if (f.field === 'level' && f.operator === 'equals') params.levels = [f.value.toUpperCase()];
      if (f.field === 'level' && f.operator === 'not_equals') params.excludeLevels = [f.value.toUpperCase()];
      if (f.field === 'service_name' && f.operator === 'equals') params.services = [f.value];
      if (f.field === 'service_name' && f.operator === 'not_equals') params.excludeServices = [f.value];
      if (f.field === 'host' && f.operator === 'equals') params.hosts = [f.value];
      if (f.field === 'host' && f.operator === 'not_equals') params.excludeHosts = [f.value];
      if (f.field === 'pod') params.pods = [f.value];
      if (f.field === 'container') params.containers = [f.value];
      if (f.field === 'logger') params.loggers = [f.value];
      if (f.field === 'trace_id') params.traceId = f.value;
      if (f.field === 'span_id') params.spanId = f.value;
    });
    return params;
  }, [filters, selectedService, errorsOnly, searchText, pageSize, page]);

  /* ── Stats query (for KPI + level facets) ── */
  const { data: statsData, isLoading: statsLoading } = useTimeRangeQuery(
    'logs-stats',
    (t, s, e) => v1Service.getLogStats(t, s, e, backendParams),
    { extraKeys: [JSON.stringify(backendParams)] },
  );

  /* ── Volume query ── */
  const { data: volumeData, isLoading: volumeLoading } = useTimeRangeQuery(
    'logs-volume',
    (t, s, e) => v1Service.getLogVolume(t, s, e, undefined, backendParams),
    { extraKeys: [JSON.stringify(backendParams)] },
  );

  /* ── Logs query ── */
  const { data: logsData, isLoading: logsLoading } = useQuery({
    queryKey: ['logs-list', selectedTeamId, timeRange.value, refreshKey, backendParams],
    queryFn: () => {
      const endTime = Date.now();
      const startTime = endTime - timeRange.minutes * 60 * 1000;
      return v1Service.getLogs(selectedTeamId, startTime, endTime, backendParams);
    },
    enabled: !!selectedTeamId,
  }) as any;

  /* ── Derived data ── */
  const logs = useMemo(() => Array.isArray((logsData)?.logs) ? (logsData).logs : [], [logsData]);
  const total = (logsData)?.total || 0;
  const levelFacets = useMemo(() => (statsData as any)?.fields?.level || [], [statsData]);
  const serviceFacets = useMemo(() => (statsData as any)?.fields?.service_name || [], [statsData]);

  // Client-side gap fill: ensure ~30 evenly spaced bars even if backend has sparse data
  const volumeBuckets = useMemo(() => {
    const raw = Array.isArray((volumeData as any)?.buckets) ? (volumeData as any).buckets : [];
    const step = (volumeData as any)?.step || '';
    if (!raw.length || !step) return raw;

    const stepMs = {
      '1m': 60_000, '2m': 120_000, '5m': 300_000, '10m': 600_000,
      '15m': 900_000, '30m': 1_800_000, '1h': 3_600_000,
      '2h': 7_200_000, '6h': 21_600_000, '12h': 43_200_000,
    }[step] || 60_000;

    const endMs = Date.now();
    const startMs = endMs - timeRange.minutes * 60 * 1000;

    const byKey = {};
    for (const b of raw) {
      const k = b.timeBucket || b.time_bucket || '';
      if (k) byKey[k] = b;
    }

    const fmtKey = (d) => {
      const pad = (n) => String(n).padStart(2, '0');
      const date = `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
      const time = `${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}:00`;
      return `${date} ${time}`;
    };

    const result = [];
    const slotStart = Math.floor(startMs / stepMs) * stepMs;
    for (let t = slotStart; t <= endMs; t += stepMs) {
      const key = fmtKey(new Date(t));
      result.push(byKey[key] || { timeBucket: key, total: 0, errors: 0, warnings: 0, infos: 0, debugs: 0, fatals: 0 });
    }
    return result;
  }, [volumeData, timeRange.minutes]);

  const errorCount = useMemo(() => {
    return levelFacets
      .filter((f) => ['ERROR', 'FATAL'].includes((f.value || '').toUpperCase()))
      .reduce((sum, f) => sum + (f.count || 0), 0);
  }, [levelFacets]);

  const warnCount = useMemo(() => {
    return levelFacets
      .filter((f) => ['WARN', 'WARNING'].includes((f.value || '').toUpperCase()))
      .reduce((sum, f) => sum + (f.count || 0), 0);
  }, [levelFacets]);

  const totalCount = (statsData as any)?.total || total || logs.length;

  const clearAll = useCallback(() => {
    clearURLFilters();
    setPage(1);
  }, [clearURLFilters]);

  /* ── Board row renderer ── */
  const renderRow = useCallback(
    (log, { colWidths, visibleCols }) => (
      <LogRow
        log={log}
        colWidths={colWidths}
        visibleCols={visibleCols}
        columns={LOG_COLUMNS}
        onOpenDetail={setSelectedLog}
      />
    ),
    [],
  );

  /* ── Detail panel fields ── */
  const detailFields = selectedLog ? [
    { key: 'timestamp', label: 'Timestamp', value: tsLabel(selectedLog.timestamp) },
    { key: 'level', label: 'Level', value: selectedLog.level, filterable: true },
    { key: 'service_name', label: 'Service', value: selectedLog.service_name || selectedLog.serviceName, filterable: true },
    { key: 'host', label: 'Host', value: selectedLog.host, filterable: true },
    { key: 'pod', label: 'Pod', value: selectedLog.pod },
    { key: 'container', label: 'Container', value: selectedLog.container },
    { key: 'logger', label: 'Logger', value: selectedLog.logger },
    { key: 'thread', label: 'Thread', value: selectedLog.thread },
    { key: 'trace_id', label: 'Trace ID', value: selectedLog.traceId || selectedLog.trace_id, filterable: true },
    { key: 'span_id', label: 'Span ID', value: selectedLog.spanId || selectedLog.span_id },
  ].filter((f) => f.value) : [];

  return (
    <div className="logs-page">
      <PageHeader title="Logs" icon={<FileText size={24} />} />

      <LogsKpiRow
        errorCount={errorCount}
        warnCount={warnCount}
        serviceCount={serviceFacets.length}
        totalCount={totalCount}
      />

      <div className="logs-charts-row">
        <LogsVolumeSection volumeBuckets={volumeBuckets} isLoading={volumeLoading} />
        <LogsLevelDistributionCard isLoading={statsLoading} levelFacets={levelFacets} />
      </div>

      <LogsTableSection
        columns={LOG_COLUMNS}
        logs={logs}
        total={total}
        page={page}
        pageSize={pageSize}
        logsLoading={logsLoading}
        serviceFacets={serviceFacets}
        selectedService={selectedService}
        filters={filters}
        searchText={searchText}
        errorsOnly={errorsOnly}
        filterFields={LOG_FILTER_FIELDS}
        onSelectService={(value) => {
          setSelectedService(value);
          setPage(1);
        }}
        onSetFilters={(nextFilters) => {
          setFilters(nextFilters);
          setPage(1);
        }}
        onSetSearchText={(value) => {
          setSearchText(value);
          setPage(1);
        }}
        onToggleErrorsOnly={(value) => {
          setErrorsOnly(value);
          setPage(1);
        }}
        onClearAll={clearAll}
        onSetPage={setPage}
        onSetPageSize={setPageSize}
        renderRow={renderRow}
      />

      {/* ── Log detail panel ── */}
      {selectedLog && (
        <ObservabilityDetailPanel
          title="Log Detail"
          titleBadge={<LevelBadge level={selectedLog.level} />}
          metaLine={tsLabel(selectedLog.timestamp)}
          metaRight={relativeTime(selectedLog.timestamp)}
          summaryNode={
            <span
              style={{
                fontFamily: 'monospace',
                fontSize: 12,
                color: 'var(--text-primary)',
                wordBreak: 'break-word',
                whiteSpace: 'pre-wrap',
              }}
            >
              {selectedLog.message || '—'}
            </span>
          }
          actions={
            (selectedLog.traceId || selectedLog.trace_id) ? (
              <button
                className="logs-view-trace-btn"
                onClick={() => navigate(`/traces/${selectedLog.traceId || selectedLog.trace_id}`)}
              >
                <GitBranch size={13} />
                View Trace
              </button>
            ) : null
          }
          fields={detailFields}
          rawData={selectedLog}
          onClose={() => setSelectedLog(null)}
        />
      )}
    </div>
  );
}
