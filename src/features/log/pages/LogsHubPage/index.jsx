import { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Switch, Tooltip, Select, Spin } from 'antd';
import { useQuery } from '@tanstack/react-query';
import {
  FileText,
  AlertCircle,
  Info,
  Bug,
  TrendingDown,
  TrendingUp,
  BarChart3,
  Server,
  GitBranch,
} from 'lucide-react';
import { useAppStore } from '@store/appStore';
import { v1Service } from '@services/v1Service';
import { PageHeader, ObservabilityQueryBar, ObservabilityDataBoard, ObservabilityDetailPanel, boardHeight } from '@components/common';
import { formatNumber } from '@utils/formatters';
import { useTimeRangeQuery } from '@hooks/useTimeRangeQuery';
import { LevelBadge, tsLabel, relativeTime } from '@features/log/components/log/LogRow';
import LogRow from '@features/log/components/log/LogRow';
import './LogsHubPage.css';

/* ─── Filter fields ───────────────────────────────────────────────────────── */
export const LOG_FILTER_FIELDS = [
  { key: 'service_name', label: 'Service', icon: '⚙️', group: 'Service' },
  {
    key: 'level', label: 'Level', icon: '🎚️', group: 'Log',
    operators: [{ key: 'equals', label: 'equals', symbol: '=' }, { key: 'not_equals', label: 'not equals', symbol: '!=' }],
  },
  { key: 'host', label: 'Host', icon: '🖥️', group: 'Infrastructure' },
  { key: 'pod', label: 'Pod', icon: '📦', group: 'Infrastructure' },
  { key: 'container', label: 'Container', icon: '🐳', group: 'Infrastructure' },
  { key: 'logger', label: 'Logger', icon: '📝', group: 'Log' },
  { key: 'trace_id', label: 'Trace ID', icon: '🔗', group: 'Correlation' },
  { key: 'span_id', label: 'Span ID', icon: '🔀', group: 'Correlation' },
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

/* ─── Level colours ───────────────────────────────────────────────────────── */
const LEVEL_COLORS = {
  errors: '#F04438',
  warnings: '#F79009',
  infos: '#06AED5',
  debugs: '#5E60CE',
  fatals: '#D92D20',
  traces: '#98A2B3',
};

/* ─── Volume bar chart ────────────────────────────────────────────────────── */
// Backend returns camelCase: timeBucket, total, errors, warnings, infos, debugs, fatals
function VolumeBar({ bucket, maxTotal }) {
  if (!bucket || !maxTotal) return null;
  const totalCount = bucket.total || 0;
  // Zero-count bars render as a thin baseline; non-zero bars scale up to 100%
  const heightPct = totalCount > 0 ? Math.max((totalCount / maxTotal) * 100, 4) : 0;
  const label = (bucket.timeBucket || bucket.time_bucket || '').replace(/:00$/, ''); // strip trailing :00 seconds

  const hasLevels = bucket.fatals > 0 || bucket.errors > 0 || bucket.warnings > 0 || bucket.infos > 0 || bucket.debugs > 0;

  return (
    <div
      className={`logs-volume-bar-wrapper${totalCount === 0 ? ' logs-volume-bar-wrapper--empty' : ''}`}
      title={totalCount > 0 ? `${label}  •  ${totalCount.toLocaleString()} logs` : label}
    >
      {totalCount > 0 && (
        <div className="logs-volume-bar-stack" style={{ height: `${heightPct}%` }}>
          {bucket.fatals > 0 && <div style={{ flex: bucket.fatals, background: LEVEL_COLORS.fatals }} />}
          {bucket.errors > 0 && <div style={{ flex: bucket.errors, background: LEVEL_COLORS.errors }} />}
          {bucket.warnings > 0 && <div style={{ flex: bucket.warnings, background: LEVEL_COLORS.warnings }} />}
          {bucket.infos > 0 && <div style={{ flex: bucket.infos, background: LEVEL_COLORS.infos }} />}
          {bucket.debugs > 0 && <div style={{ flex: bucket.debugs, background: LEVEL_COLORS.debugs }} />}
          {!hasLevels && <div style={{ flex: 1, background: '#98A2B3' }} />}
        </div>
      )}
    </div>
  );
}

// Pick ~5 evenly spaced tick indices from the buckets array
function pickTickIndices(count, desired = 5) {
  if (count <= desired) return Array.from({ length: count }, (_, i) => i);
  const indices = [];
  for (let i = 0; i < desired; i++) {
    indices.push(Math.round((i / (desired - 1)) * (count - 1)));
  }
  return [...new Set(indices)];
}

// Format bucket label into a short time string for the axis
function shortTimeLabel(raw) {
  if (!raw) return '';
  // raw: "2024-01-15 14:35:00"
  const parts = raw.split(' ');
  if (parts.length < 2) return raw;
  // Show "HH:MM" or "MM-DD HH:MM" if first/last
  return parts[1].slice(0, 5); // "HH:MM"
}

function LogVolumeChart({ buckets, isLoading }) {
  const maxTotal = useMemo(
    () => Math.max(...(buckets || []).map((b) => b.total || 0), 1),
    [buckets]
  );

  if (isLoading) return <div className="logs-chart-empty"><Spin size="small" /></div>;
  if (!buckets || buckets.length === 0) return <div className="logs-chart-empty">No volume data</div>;

  const tickIndices = new Set(pickTickIndices(buckets.length, 6));

  return (
    <div className="logs-volume-chart-wrap">
      <div className="logs-volume-chart">
        {buckets.map((b, i) => (
          <VolumeBar key={b.timeBucket || b.time_bucket || i} bucket={b} maxTotal={maxTotal} />
        ))}
      </div>
      <div className="logs-volume-axis">
        {buckets.map((b, i) => {
          const label = b.timeBucket || b.time_bucket || '';
          return (
            <div
              key={i}
              className="logs-volume-axis-tick"
              style={{ visibility: tickIndices.has(i) ? 'visible' : 'hidden' }}
            >
              {shortTimeLabel(label)}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Volume chart legend ─────────────────────────────────────────────────── */
function VolumeLegend({ buckets }) {
  if (!buckets || !buckets.length) return null;
  const totals = buckets.reduce(
    (acc, b) => ({
      fatals: acc.fatals + (b.fatals || 0),
      errors: acc.errors + (b.errors || 0),
      warnings: acc.warnings + (b.warnings || 0),
      infos: acc.infos + (b.infos || 0),
      debugs: acc.debugs + (b.debugs || 0),
    }),
    { fatals: 0, errors: 0, warnings: 0, infos: 0, debugs: 0 }
  );

  const items = [
    { key: 'fatals', label: 'Fatal', color: LEVEL_COLORS.fatals },
    { key: 'errors', label: 'Error', color: LEVEL_COLORS.errors },
    { key: 'warnings', label: 'Warn', color: LEVEL_COLORS.warnings },
    { key: 'infos', label: 'Info', color: LEVEL_COLORS.infos },
    { key: 'debugs', label: 'Debug', color: LEVEL_COLORS.debugs },
  ].filter((item) => totals[item.key] > 0);

  if (!items.length) return null;

  return (
    <div className="logs-volume-legend">
      {items.map(({ key, label, color }) => (
        <div key={key} className="logs-volume-legend-item">
          <span className="logs-volume-legend-dot" style={{ background: color }} />
          <span>{label}</span>
          <span className="logs-volume-legend-count">{formatNumber(totals[key])}</span>
        </div>
      ))}
    </div>
  );
}

/* ─── Level distribution bar ──────────────────────────────────────────────── */
function LevelDistribution({ facets }) {
  if (!facets || !facets.length) return <div className="logs-chart-empty">No data</div>;
  const total = facets.reduce((sum, f) => sum + (f.count || 0), 0) || 1;
  return (
    <div className="logs-level-dist">
      {facets.map((f) => {
        const lvl = (f.value || 'INFO').toUpperCase();
        const color = LEVEL_COLORS[lvl.toLowerCase() + 's'] || '#98A2B3';
        const pct = ((f.count / total) * 100).toFixed(1);
        return (
          <div key={f.value} className="logs-level-dist-row">
            <LevelBadge level={lvl} />
            <div className="logs-level-dist-bar-bg">
              <div className="logs-level-dist-bar-fill" style={{ width: `${pct}%`, background: color }} />
            </div>
            <span className="logs-level-dist-count">{formatNumber(f.count)}</span>
          </div>
        );
      })}
    </div>
  );
}

/* ─── Service pills ───────────────────────────────────────────────────────── */
function ServicePills({ facets, selectedService, onSelect }) {
  if (!facets || !facets.length) return null;
  const total = facets.reduce((sum, f) => sum + (f.count || 0), 0);
  return (
    <div className="logs-service-pills">
      <div className={`logs-service-pill ${!selectedService ? 'active' : ''}`} onClick={() => onSelect(null)}>
        All <span className="logs-service-pill-count">{formatNumber(total)}</span>
      </div>
      {facets.slice(0, 8).map((f) => (
        <div
          key={f.value}
          className={`logs-service-pill ${selectedService === f.value ? 'active' : ''}`}
          onClick={() => onSelect(selectedService === f.value ? null : f.value)}
        >
          {f.value}<span className="logs-service-pill-count">{formatNumber(f.count)}</span>
        </div>
      ))}
    </div>
  );
}

/* ─── KPI card ────────────────────────────────────────────────────────────── */
function KpiCard({ title, value, icon: Icon, accentColor, accentBg, trend, subtitle }) {
  return (
    <div className="logs-kpi-card" style={{ '--kpi-accent': accentColor, '--kpi-accent-bg': accentBg }}>
      <div className="logs-kpi-card-header">
        <span className="logs-kpi-label">{title}</span>
        <span className="logs-kpi-icon" style={{ background: accentBg, color: accentColor }}>
          <Icon size={15} />
        </span>
      </div>
      <div className="logs-kpi-value">{value}</div>
      {subtitle && <div className="logs-kpi-subtitle">{subtitle}</div>}
      {trend != null && trend !== 0 && (
        <div className={`logs-kpi-pill ${trend > 0 ? 'up' : 'down'}`}>
          {trend > 0 ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
          {Math.abs(trend).toFixed(1)}%
        </div>
      )}
    </div>
  );
}

/* ─── Main page ───────────────────────────────────────────────────────────── */
export default function LogsHubPage() {
  const { selectedTeamId, timeRange, refreshKey } = useAppStore();
  const navigate = useNavigate();

  /* ── State ── */
  const [filters, setFilters] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [selectedService, setSelectedService] = useState(null);
  const [errorsOnly, setErrorsOnly] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [selectedLog, setSelectedLog] = useState(null);

  /* ── Backend params derived from filters ── */
  const backendParams = useMemo(() => {
    const params = { limit: pageSize, offset: (page - 1) * pageSize };
    if (searchText.trim()) params.search = searchText.trim();
    if (errorsOnly) params.levels = ['ERROR', 'FATAL'];
    if (selectedService) params.services = [selectedService];
    filters.forEach((f) => {
      if (f.field === 'level' && f.operator === 'equals') params.levels = [f.value.toUpperCase()];
      if (f.field === 'level' && f.operator === 'not_equals') params.excludeLevels = [f.value.toUpperCase()];
      if (f.field === 'service_name' && f.operator === 'equals') params.services = [f.value];
      if (f.field === 'service_name' && f.operator === 'not_equals') params.excludeServices = [f.value];
      if (f.field === 'host') params.hosts = [f.value];
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
    { extraKeys: [JSON.stringify(backendParams)] }
  );

  /* ── Volume query ── */
  const { data: volumeData, isLoading: volumeLoading } = useTimeRangeQuery(
    'logs-volume',
    (t, s, e) => v1Service.getLogVolume(t, s, e, undefined, backendParams),
    { extraKeys: [JSON.stringify(backendParams)] }
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
  });

  /* ── Derived data ── */
  const logs = useMemo(() => Array.isArray(logsData?.logs) ? logsData.logs : [], [logsData]);
  const total = logsData?.total || 0;
  const levelFacets = useMemo(() => statsData?.fields?.level || [], [statsData]);
  const serviceFacets = useMemo(() => statsData?.fields?.service_name || [], [statsData]);

  // Client-side gap fill: ensure ~30 evenly spaced bars even if backend has sparse data
  const volumeBuckets = useMemo(() => {
    const raw = Array.isArray(volumeData?.buckets) ? volumeData.buckets : [];
    const step = volumeData?.step || '';
    if (!raw.length || !step) return raw;

    const stepMs = {
      '1m': 60_000, '2m': 120_000, '5m': 300_000, '10m': 600_000,
      '15m': 900_000, '30m': 1_800_000, '1h': 3_600_000,
      '2h': 7_200_000, '6h': 21_600_000, '12h': 43_200_000,
    }[step] || 60_000;

    const endMs = Date.now();
    const startMs = endMs - timeRange.minutes * 60 * 1000;

    // Build lookup by timeBucket label
    const byKey = {};
    for (const b of raw) {
      const k = b.timeBucket || b.time_bucket || '';
      if (k) byKey[k] = b;
    }

    // Format a Date into the same label format the backend uses
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

  // Sum all ERROR + FATAL facets (not just first match)
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

  const totalCount = statsData?.total || total || logs.length;

  const clearAll = useCallback(() => {
    setFilters([]);
    setSearchText('');
    setSelectedService(null);
    setErrorsOnly(false);
    setPage(1);
  }, []);

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
    []
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

  const offset = (page - 1) * pageSize;

  return (
    <div className="logs-page">
      <PageHeader title="Logs" icon={<FileText size={24} />} />

      {/* ── KPI Row (3 cards — no Total Logs) ── */}
      <div className="logs-kpi-row">
        <KpiCard
          title="Errors & Fatals"
          value={formatNumber(errorCount)}
          icon={AlertCircle}
          accentColor={errorCount > 0 ? '#F04438' : '#73C991'}
          accentBg={errorCount > 0 ? 'rgba(240,68,56,0.12)' : 'rgba(115,201,145,0.12)'}
          subtitle={errorCount > 0 ? 'Needs attention' : 'All clear'}
        />
        <KpiCard
          title="Warnings"
          value={formatNumber(warnCount)}
          icon={Info}
          accentColor={warnCount > 0 ? '#F79009' : '#73C991'}
          accentBg={warnCount > 0 ? 'rgba(247,144,9,0.12)' : 'rgba(115,201,145,0.12)'}
        />
        <KpiCard
          title="Services"
          value={formatNumber(serviceFacets.length)}
          icon={Server}
          accentColor="#06AED5"
          accentBg="rgba(6,174,213,0.12)"
          subtitle={totalCount > 0 ? `${formatNumber(totalCount)} total logs` : undefined}
        />
      </div>

      {/* ── Charts row ── */}
      <div className="logs-charts-row">
        <div className="logs-chart-card logs-chart-card--wide">
          <div className="logs-chart-card-header">
            <span className="logs-chart-card-title"><BarChart3 size={15} />Log Volume</span>
            <VolumeLegend buckets={volumeBuckets} />
          </div>
          <div className="logs-chart-card-body">
            <LogVolumeChart buckets={volumeBuckets} isLoading={volumeLoading} />
          </div>
        </div>
        <div className="logs-chart-card">
          <div className="logs-chart-card-header">
            <span className="logs-chart-card-title"><Bug size={15} />By Level</span>
          </div>
          <div className="logs-chart-card-body">
            {statsLoading
              ? <div className="logs-chart-empty"><Spin size="small" /></div>
              : <LevelDistribution facets={levelFacets} />
            }
          </div>
        </div>
      </div>

      {/* ── Log Explorer ── */}
      <div className="logs-table-card">
        <div className="logs-table-card-header">
          <span className="logs-table-card-title">
            <FileText size={15} />
            Log Explorer
            <span className="logs-count-badge">
              {formatNumber(logs.length)} of {formatNumber(total || logs.length)}
            </span>
          </span>
        </div>

        {/* Service pills */}
        {serviceFacets.length > 0 && (
          <div className="logs-service-pills-row">
            <ServicePills
              facets={serviceFacets}
              selectedService={selectedService}
              onSelect={(s) => { setSelectedService(s); setPage(1); }}
            />
          </div>
        )}

        {/* Query bar */}
        <div className="logs-querybar-row">
          <ObservabilityQueryBar
            fields={LOG_FILTER_FIELDS}
            filters={filters}
            setFilters={(f) => { setFilters(f); setPage(1); }}
            searchText={searchText}
            setSearchText={(v) => { setSearchText(v); setPage(1); }}
            onClearAll={clearAll}
            placeholder="Search log messages, filter by service, level, host…"
            rightSlot={
              <Tooltip title="Show only error and fatal logs">
                <div
                  className={`logs-errors-toggle ${errorsOnly ? 'active' : ''}`}
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
            }
          />
        </div>

        {/* Data board */}
        <div style={{ height: boardHeight(pageSize), display: 'flex', flexDirection: 'column' }}>
          <ObservabilityDataBoard
            columns={LOG_COLUMNS}
            rows={logs}
            rowKey={(log, i) => log.id ? `log-${log.id}` : `log-${i}-${log.timestamp}`}
            renderRow={renderRow}
            entityName="log"
            storageKey="logs_visible_cols_v2"
            isLoading={logsLoading}
            serverTotal={total || logs.length}
            emptyTips={[
              { num: 1, text: <>Widen the <strong>time range</strong> in the top bar</> },
              { num: 2, text: <>Remove active <strong>filters</strong> or clear the search</> },
              { num: 3, text: <>Ensure your services emit logs via <strong>OTLP</strong></> },
            ]}
          />
        </div>

        {/* Pagination */}
        {!logsLoading && (total > 0 || logs.length > 0) && (
          <div className="logs-pagination">
            <span className="logs-pagination-info">
              Showing {offset + 1}–{Math.min(offset + pageSize, total || logs.length)} of {formatNumber(total || logs.length)}
            </span>
            <div className="logs-pagination-controls">
              <Select
                size="small"
                value={pageSize}
                onChange={(v) => { setPageSize(v); setPage(1); }}
                options={[20, 50, 100, 200].map((n) => ({ label: `${n} / page`, value: n }))}
                style={{ width: 110 }}
              />
              <button className="logs-nav-btn" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
                ← Prev
              </button>
              <span className="logs-pagination-pages">
                Page {page} of {Math.max(1, Math.ceil((total || logs.length) / pageSize))}
              </span>
              <button
                className="logs-nav-btn"
                disabled={page >= Math.ceil((total || logs.length) / pageSize)}
                onClick={() => setPage((p) => p + 1)}
              >
                Next →
              </button>
            </div>
          </div>
        )}
      </div>

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
