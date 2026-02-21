import { useMemo, useState, useRef, useCallback } from 'react';
import {
  Button, Switch, Select, Input, Tag, Tooltip, Spin,
} from 'antd';
import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import {
  Search, Download, Radio, ChevronRight, ChevronDown,
  Link2, AlertTriangle, Copy, ExternalLink, X, WrapText,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { v1Service } from '@services/v1Service';
import { useAppStore } from '@store/appStore';
import { LOG_LEVELS } from '@config/constants';
import { formatNumber } from '@utils/formatters';
import LogHistogram from '@components/charts/LogHistogram';

// ─── helpers ────────────────────────────────────────────────────────────────

function safeLower(v) {
  return String(v || '').toLowerCase();
}

function tsLabel(ts) {
  try {
    const d = new Date(ts);
    return d.toLocaleString([], {
      month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit',
      fractionalSecondDigits: 3,
    });
  } catch {
    return String(ts || '');
  }
}

function copyToClipboard(text) {
  navigator.clipboard?.writeText(text).catch(() => { });
}

// ─── log level badge ─────────────────────────────────────────────────────────

function LevelBadge({ level }) {
  const cfg = LOG_LEVELS[String(level).toUpperCase()] || { label: level, color: '#98A2B3', bg: '#2b2d31' };

  // Create a high-contrast Datadog-style badge
  let bgColor = cfg.color + '1A'; // 10% opacity
  let textColor = cfg.color;
  if (/ERROR|FATAL/.test(level)) {
    bgColor = '#F04438';
    textColor = '#FFFFFF';
  } else if (/WARN/.test(level)) {
    bgColor = '#F79009';
    textColor = '#FFFFFF';
  }

  return (
    <span style={{
      display: 'inline-block',
      width: 50,
      padding: '2px 0',
      fontSize: 10,
      fontWeight: 800,
      letterSpacing: '0.05em',
      textTransform: 'uppercase',
      borderRadius: 2,
      background: bgColor,
      color: textColor,
      lineHeight: '14px',
      textAlign: 'center',
      flexShrink: 0,
      fontFamily: '"SF Pro Text", -apple-system, sans-serif'
    }}>
      {cfg.label}
    </span>
  );
}

// ─── syntax-highlight a log message ──────────────────────────────────────────

function HighlightedMessage({ message, wrap }) {
  if (!message) return <span style={{ color: 'var(--text-muted)' }}>—</span>;
  const msg = String(message);
  const parts = msg.split(
    /("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|\b\d+(?:\.\d+)?\b|\b(?:ERROR|WARN|FATAL|null|true|false|undefined|NULL)\b)/g
  );
  return (
    <span style={{
      fontFamily: '"JetBrains Mono", "Fira Code", "Cascadia Code", monospace',
      fontSize: 12,
      whiteSpace: wrap ? 'pre-wrap' : 'nowrap',
      overflow: wrap ? 'visible' : 'hidden',
      textOverflow: wrap ? 'clip' : 'ellipsis',
      wordBreak: 'break-all',
    }}>
      {parts.map((part, i) => {
        if (/^["']/.test(part)) return <span key={i} style={{ color: '#06AED5' }}>{part}</span>;
        if (/^\d/.test(part)) return <span key={i} style={{ color: '#73C991' }}>{part}</span>;
        if (/^(ERROR|FATAL)$/i.test(part)) return <span key={i} style={{ color: '#F04438', fontWeight: 700 }}>{part}</span>;
        if (/^WARN$/i.test(part)) return <span key={i} style={{ color: '#F79009', fontWeight: 700 }}>{part}</span>;
        if (/^(null|true|false|undefined|NULL)$/.test(part)) return <span key={i} style={{ color: '#9E77ED' }}>{part}</span>;
        return <span key={i} style={{ color: 'var(--text-primary)' }}>{part}</span>;
      })}
    </span>
  );
}

// ─── expanded log detail panel ────────────────────────────────────────────────

function LogDetailPanel({ log, contextLogs, navigate }) {
  const [tab, setTab] = useState('fields');

  const fields = [
    { k: 'timestamp', label: 'timestamp', v: tsLabel(log.timestamp) },
    { k: 'level', label: 'level', v: log.level },
    { k: 'service_name', label: 'service', v: log.service_name },
    { k: 'host', label: 'host', v: log.host },
    { k: 'pod', label: 'pod', v: log.pod },
    { k: 'container', label: 'container', v: log.container },
    { k: 'trace_id', label: 'trace_id', v: log.trace_id },
    { k: 'span_id', label: 'span_id', v: log.span_id },
    { k: 'logger', label: 'logger', v: log.logger },
    { k: 'exception', label: 'exception', v: log.exception },
  ].filter((f) => f.v);

  const tabStyle = (t) => ({
    padding: '4px 8px',
    cursor: 'pointer',
    opacity: tab === t ? 1 : 0.6,
    background: 'none',
    border: 'none',
    borderBottom: tab === t ? '2px solid var(--primary-color)' : '2px solid transparent',
  });

  return (
    <div style={{
      background: '#0D0D0D', // Very dark background for expanded area
      borderTop: '1px solid #1A1A1A',
      borderBottom: '1px solid #1A1A1A',
      padding: '16px 24px',
      boxShadow: 'inset 0 4px 6px -4px rgba(0,0,0,0.5)',
    }}>
      {/* mini tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 10, borderBottom: '1px solid #2D2D2D', paddingBottom: 0 }}>
        {['fields', 'context', 'json'].map((t) => (
          <button key={t} style={tabStyle(t)} onClick={() => setTab(t)}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
        {log.trace_id && (
          <Tooltip title="Open trace">
            <button
              style={{ ...tabStyle('x'), marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 4 }}
              onClick={() => navigate(`/traces/${log.trace_id}`)}
            >
              <ExternalLink size={12} /> Trace
            </button>
          </Tooltip>
        )}
        <Tooltip title="Copy JSON">
          <button
            style={{ ...tabStyle('x'), display: 'flex', alignItems: 'center', gap: 4 }}
            onClick={() => copyToClipboard(JSON.stringify(log, null, 2))}
          >
            <Copy size={12} /> Copy
          </button>
        </Tooltip>
      </div>

      {tab === 'fields' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '4px 24px' }}>
          {fields.map(({ k, label, v }) => (
            <div key={k} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', fontSize: 12, padding: '3px 0' }}>
              <span style={{
                color: '#5E60CE',
                fontFamily: 'monospace',
                whiteSpace: 'nowrap',
                minWidth: 100,
                flexShrink: 0,
              }}>
                {label}
              </span>
              <span style={{
                color: 'var(--text-primary)',
                fontFamily: 'monospace',
                wordBreak: 'break-all',
                flex: 1,
              }}>
                {k === 'exception'
                  ? <pre style={{ margin: 0, whiteSpace: 'pre-wrap', fontSize: 11, color: '#F04438' }}>{v}</pre>
                  : String(v)
                }
              </span>
              <Tooltip title="Copy value">
                <Copy
                  size={11}
                  style={{ color: 'var(--text-muted)', cursor: 'pointer', flexShrink: 0, marginTop: 2 }}
                  onClick={() => copyToClipboard(String(v))}
                />
              </Tooltip>
            </div>
          ))}
        </div>
      )}

      {tab === 'context' && (
        <div style={{ maxHeight: 260, overflow: 'auto', fontFamily: 'monospace', fontSize: 11 }}>
          {contextLogs.length === 0
            ? <span style={{ color: 'var(--text-muted)' }}>No surrounding logs (requires trace_id)</span>
            : contextLogs.map((cl, i) => {
              const isCurrent = cl.timestamp === log.timestamp && cl.span_id === log.span_id;
              const cfg = LOG_LEVELS[String(cl.level).toUpperCase()] || { color: '#98A2B3', label: cl.level };
              return (
                <div key={i} style={{
                  display: 'flex', gap: 8, padding: '3px 6px',
                  background: isCurrent ? 'rgba(94,96,206,0.12)' : 'transparent',
                  borderLeft: `3px solid ${isCurrent ? '#5E60CE' : 'transparent'}`,
                }}>
                  <span style={{ color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{tsLabel(cl.timestamp)}</span>
                  <span style={{ color: cfg.color, minWidth: 38, textAlign: 'center' }}>{cfg.label}</span>
                  <span style={{ color: 'var(--text-primary)', wordBreak: 'break-all' }}>{cl.message}</span>
                </div>
              );
            })}
        </div>
      )}

      {tab === 'json' && (
        <pre style={{
          margin: 0, fontSize: 11, fontFamily: 'monospace',
          color: 'var(--text-primary)', whiteSpace: 'pre-wrap',
          maxHeight: 300, overflow: 'auto',
        }}>
          {JSON.stringify(log, null, 2)}
        </pre>
      )}
    </div>
  );
}

// ─── single log row ───────────────────────────────────────────────────────────

function LogRow({ log, isExpanded, onToggle, wrap, contextLogs, navigate }) {
  const levelKey = String(log.level || '').toUpperCase();
  const cfg = LOG_LEVELS[levelKey] || { color: '#98A2B3' };

  return (
    <div style={{ borderBottom: '1px solid #1A1A1A' }}>
      {/* ── main row ── */}
      <div
        onClick={onToggle}
        style={{
          display: 'flex',
          alignItems: 'baseline',
          gap: 0,
          cursor: 'pointer',
          padding: '4px 8px',
          background: isExpanded ? '#141414' : 'transparent',
          borderLeft: `4px solid ${isExpanded ? '#5E60CE' : 'transparent'}`,
          transition: 'background 0.05s ease',
          fontFamily: '"JetBrains Mono", "Fira Code", monospace',
        }}
        onMouseEnter={(e) => { if (!isExpanded) e.currentTarget.style.background = '#1A1A1A'; }}
        onMouseLeave={(e) => { if (!isExpanded) e.currentTarget.style.background = 'transparent'; }}
      >
        {/* expand chevron */}
        <span style={{ color: 'var(--text-muted)', padding: '2px 6px', flexShrink: 0, marginTop: 1 }}>
          {isExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
        </span>

        {/* timestamp */}
        <span style={{
          fontSize: 12,
          color: '#888',
          whiteSpace: 'nowrap',
          padding: '0 12px 0 0',
          flexShrink: 0,
          width: 175,
        }}>
          {tsLabel(log.timestamp)}
        </span>

        {/* level */}
        <span style={{ padding: '0 12px 0 0', flexShrink: 0 }}>
          <LevelBadge level={log.level} />
        </span>

        {/* service */}
        {log.service_name ? (
          <span style={{
            fontSize: 12,
            color: '#A0A0A0', // Muted color like Datadog hosts/services
            padding: '0 16px 0 0',
            flexShrink: 0,
            width: 180,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>
            {log.service_name}
          </span>
        ) : (
          <span style={{ width: 180, padding: '0 16px 0 0', flexShrink: 0 }} />
        )}

        {/* message */}
        <span style={{ flex: 1, padding: '3px 8px 3px 0', minWidth: 0 }}>
          <HighlightedMessage message={log.message} wrap={wrap} />
        </span>

        {/* trace pill */}
        {log.trace_id && (
          <span style={{ flexShrink: 0, padding: '3px 8px 3px 0' }}>
            <Tooltip title={`Trace: ${log.trace_id}`}>
              <Link2 size={11} style={{ color: '#5E60CE', opacity: 0.7 }} />
            </Tooltip>
          </span>
        )}
        {log.exception && (
          <span style={{ flexShrink: 0, padding: '3px 8px 3px 0' }}>
            <Tooltip title="Has exception">
              <AlertTriangle size={11} style={{ color: '#F04438', opacity: 0.8 }} />
            </Tooltip>
          </span>
        )}
      </div>

      {/* ── expanded detail ── */}
      {isExpanded && (
        <LogDetailPanel log={log} contextLogs={contextLogs} navigate={navigate} />
      )}
    </div>
  );
}

// ─── facet section ────────────────────────────────────────────────────────────

function FacetSection({ title, items, selected, onToggle, colorMap, total }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div style={{ marginBottom: 16 }}>
      <div
        style={{ display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer', marginBottom: 6, userSelect: 'none' }}
        onClick={() => setCollapsed((c) => !c)}
      >
        {collapsed ? <ChevronRight size={12} /> : <ChevronDown size={12} />}
        <span style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)' }}>
          {title}
        </span>
      </div>
      {!collapsed && (
        <div>
          {items.map(([key, count]) => {
            const pct = total > 0 ? (Number(count) / total) * 100 : 0;
            const color = colorMap?.[String(key).toUpperCase()]?.color || '#98A2B3';
            const isSelected = selected.includes(key);
            return (
              <div
                key={key}
                onClick={() => onToggle(key)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '3px 6px',
                  borderRadius: 4,
                  cursor: 'pointer',
                  background: isSelected ? 'rgba(94,96,206,0.15)' : 'transparent',
                  marginBottom: 1,
                  position: 'relative',
                  overflow: 'hidden',
                }}
                onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
                onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.background = 'transparent'; }}
              >
                {/* background fill bar */}
                <div style={{
                  position: 'absolute', left: 0, top: 0, bottom: 0,
                  width: `${pct}%`,
                  background: color + '18',
                  borderRadius: 4,
                  pointerEvents: 'none',
                }} />

                <span style={{
                  display: 'inline-block',
                  width: 8, height: 8, borderRadius: '50%',
                  background: color,
                  flexShrink: 0,
                  position: 'relative',
                }} />
                <span style={{
                  flex: 1, fontSize: 12, color: isSelected ? '#fff' : 'var(--text-primary)',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  position: 'relative',
                }}>
                  {key}
                </span>
                <span style={{ fontSize: 11, color: 'var(--text-muted)', flexShrink: 0, position: 'relative' }}>
                  {formatNumber(count)}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── main page ────────────────────────────────────────────────────────────────

export default function LogsPage() {
  const { selectedTeamId, timeRange, refreshKey } = useAppStore();
  const navigate = useNavigate();

  // ── server-side filter state
  const [searchText, setSearchText] = useState('');
  const [selectedLevels, setSelectedLevels] = useState([]);
  const [selectedServices, setSelectedServices] = useState([]);

  // ── client-side filter state
  const [hostFilter, setHostFilter] = useState('');
  const [traceFilter, setTraceFilter] = useState('');
  const [hasExceptionOnly, setHasExceptionOnly] = useState(false);
  const [correlatedOnly, setCorrelatedOnly] = useState(false);

  // ── ui state
  const [liveTail, setLiveTail] = useState(false);
  const [wrap, setWrap] = useState(false);
  const [expandedKeys, setExpandedKeys] = useState(new Set());
  const pageSize = 100; // Grafana-style: load more logs, paginate less

  // ── data fetch: logs
  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage
  } = useInfiniteQuery({
    queryKey: [
      'logs-v2-infinite',
      selectedTeamId, timeRange.value,
      pageSize,
      searchText, selectedLevels, selectedServices,
      refreshKey,
    ],
    queryFn: ({ pageParam = 0 }) => {
      const endTime = Date.now();
      const startTime = endTime - timeRange.minutes * 60 * 1000;
      return v1Service.getLogs(selectedTeamId, startTime, endTime, {
        levels: selectedLevels.length ? selectedLevels : undefined,
        services: selectedServices.length ? selectedServices : undefined,
        search: searchText || undefined,
        limit: pageSize,
        cursor: pageParam || undefined
      });
    },
    getNextPageParam: (lastPage) => lastPage.hasMore ? lastPage.nextCursor : undefined,
    enabled: !!selectedTeamId,
    refetchInterval: liveTail ? 3000 : false,
  });

  // ── data fetch: histogram
  const { data: histogramData } = useQuery({
    queryKey: ['log-histogram', selectedTeamId, timeRange.value, refreshKey],
    queryFn: () => {
      const endTime = Date.now();
      const startTime = endTime - timeRange.minutes * 60 * 1000;
      return v1Service.getLogHistogram(selectedTeamId, startTime, endTime);
    },
    enabled: !!selectedTeamId,
    refetchInterval: liveTail ? 10000 : false,
  });

  // ── data fetch: context (for expanded log with trace)
  const [contextLog, setContextLog] = useState(null);
  const { data: contextData } = useQuery({
    queryKey: ['log-context', selectedTeamId, contextLog?.trace_id, contextLog?.span_id, contextLog?.timestamp],
    queryFn: () =>
      v1Service.getLogDetail(selectedTeamId, contextLog.trace_id, contextLog.span_id, contextLog.timestamp),
    enabled: !!selectedTeamId && !!contextLog?.trace_id,
  });

  const contextLogs = contextData?.logs || [];

  // ── derived data
  const rawLogs = data?.pages ? data.pages.flatMap((page) => page.logs || []) : [];
  const serverTotal = Number(data?.pages?.[0]?.total || 0);
  const rawFacets = data?.pages?.[0]?.facets || {};

  const facets = useMemo(() => {
    const levels = Array.isArray(rawFacets.levels)
      ? rawFacets.levels.reduce((acc, item) => { acc[item.level] = item.count; return acc; }, {})
      : (rawFacets.levels || {});
    const services = Array.isArray(rawFacets.services)
      ? rawFacets.services.reduce((acc, item) => { acc[item.service_name] = item.count; return acc; }, {})
      : (rawFacets.services || {});
    return { levels, services };
  }, [rawFacets]);

  const histogram = useMemo(() => {
    const raw = histogramData || [];
    return Array.isArray(raw)
      ? raw.map((h) => ({ ...h, timestamp: h.time_bucket || h.timestamp }))
      : [];
  }, [histogramData]);

  const filteredLogs = useMemo(() => {
    return rawLogs.filter((log) => {
      if (hostFilter && !safeLower(log.host).includes(safeLower(hostFilter))) return false;
      if (traceFilter && !safeLower(log.trace_id).includes(safeLower(traceFilter))) return false;
      if (hasExceptionOnly && !log.exception) return false;
      if (correlatedOnly && !log.trace_id && !log.span_id) return false;
      return true;
    });
  }, [rawLogs, hostFilter, traceFilter, hasExceptionOnly, correlatedOnly]);

  // ── facet lists sorted by count
  const levelFacetList = useMemo(() =>
    Object.entries(facets.levels).sort((a, b) => Number(b[1]) - Number(a[1])),
    [facets.levels]
  );
  const serviceFacetList = useMemo(() =>
    Object.entries(facets.services).sort((a, b) => Number(b[1]) - Number(a[1])).slice(0, 20),
    [facets.services]
  );

  // ── row key helper
  const rowKey = (log, i) =>
    log.trace_id && log.span_id
      ? `${log.trace_id}-${log.span_id}-${log.timestamp}`
      : `log-${i}-${log.timestamp}`;

  // ── toggle row expansion
  const toggleRow = useCallback((key, log) => {
    setExpandedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
        if (log?.trace_id) setContextLog(log);
      }
      return next;
    });
  }, []);

  // ── facet toggle helpers
  const toggleLevel = (level) => {
    setSelectedLevels((prev) =>
      prev.includes(level) ? prev.filter((l) => l !== level) : [...prev, level]
    );
    setExpandedKeys(new Set());
  };

  const toggleService = (svc) => {
    setSelectedServices((prev) =>
      prev.includes(svc) ? prev.filter((s) => s !== svc) : [...prev, svc]
    );
    setExpandedKeys(new Set());
  };

  // ── clear all
  const clearFilters = () => {
    setSearchText('');
    setSelectedLevels([]);
    setSelectedServices([]);
    setHostFilter('');
    setTraceFilter('');
    setHasExceptionOnly(false);
    setCorrelatedOnly(false);
  };

  const hasActiveFilters = searchText || selectedLevels.length || selectedServices.length
    || hostFilter || traceFilter || hasExceptionOnly || correlatedOnly;

  // ── CSV export
  const exportCSV = () => {
    const header = ['timestamp', 'level', 'service', 'host', 'trace_id', 'message'];
    const rows = filteredLogs.map((l) => [
      l.timestamp, l.level, l.service_name, l.host, l.trace_id,
      String(l.message || '').replace(/\n/g, ' '),
    ]);
    const csv = [header, ...rows]
      .map((r) => r.map((v) => `"${String(v || '').replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `logs-${Date.now()}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>

      {/* ── top toolbar ─────────────────────────────────────────────────────── */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap',
        padding: '12px 16px',
        backgroundColor: '#0F0F0F',
        borderBottom: '1px solid #222',
        marginBottom: 0,
      }}>
        <Input
          prefix={<Search size={14} style={{ color: '#888' }} />}
          allowClear
          placeholder="Search logs…"
          value={searchText}
          onChange={(e) => { setSearchText(e.target.value); setExpandedKeys(new Set()); }}
          style={{ width: 350, background: '#1A1A1A', borderColor: '#333' }}
          size="middle"
        />

        <div style={{ width: 1, height: 24, background: '#333', margin: '0 8px' }} />

        <Input
          allowClear
          placeholder="Host:"
          value={hostFilter}
          onChange={(e) => setHostFilter(e.target.value)}
          style={{ width: 120, background: '#1A1A1A', borderColor: '#333' }}
          size="small"
        />

        <Input
          allowClear
          placeholder="Trace ID:"
          value={traceFilter}
          onChange={(e) => setTraceFilter(e.target.value)}
          style={{ width: 140, background: '#1A1A1A', borderColor: '#333' }}
          size="small"
        />

        <div style={{ flex: 1 }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: 16, background: '#1A1A1A', padding: '4px 12px', borderRadius: 4, border: '1px solid #333' }}>
          <span style={{ fontSize: 12, color: hasExceptionOnly ? '#F04438' : '#A0A0A0', display: 'flex', alignItems: 'center', gap: 6, fontWeight: 500 }}>
            <Switch size="small" checked={hasExceptionOnly} onChange={(v) => { setHasExceptionOnly(v); }} />
            Exceptions
          </span>
          <span style={{ fontSize: 12, color: correlatedOnly ? '#5E60CE' : '#A0A0A0', display: 'flex', alignItems: 'center', gap: 6, fontWeight: 500 }}>
            <Switch size="small" checked={correlatedOnly} onChange={(v) => { setCorrelatedOnly(v); }} />
            Correlated
          </span>
          <span style={{ fontSize: 12, color: liveTail ? '#73C991' : '#A0A0A0', display: 'flex', alignItems: 'center', gap: 6, fontWeight: 500 }}>
            <Radio size={14} className={liveTail ? 'live-tail-icon-active' : ''} style={{ margin: 0 }} />
            <Switch size="small" checked={liveTail} onChange={setLiveTail} />
            Live Tail
          </span>
          <span style={{ fontSize: 12, color: wrap ? '#5E60CE' : '#A0A0A0', display: 'flex', alignItems: 'center', gap: 6, fontWeight: 500 }}>
            <WrapText size={14} />
            <Switch size="small" checked={wrap} onChange={setWrap} />
            Wrap
          </span>
        </div>

        {hasActiveFilters && (
          <Button size="small" icon={<X size={12} />} onClick={clearFilters} type="text" style={{ color: 'var(--text-muted)' }}>
            Clear
          </Button>
        )}

        <Button size="small" icon={<Download size={12} />} onClick={exportCSV} type="text" style={{ color: 'var(--text-muted)' }}>
          Export
        </Button>

        <span style={{ fontSize: 11, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
          {isLoading ? 'Loading…' : `${formatNumber(serverTotal)} logs`}
        </span>
      </div>

      {/* ── histogram ───────────────────────────────────────────────────────── */}
      {histogram.length > 0 && (
        <div style={{ padding: '12px 16px 4px', borderBottom: '1px solid #222', backgroundColor: '#0A0A0A' }}>
          <LogHistogram data={histogram} height={72} />
        </div>
      )}

      {/* ── body: sidebar + log stream ──────────────────────────────────────── */}
      <div style={{ display: 'flex', flex: 1, minHeight: 0, overflow: 'hidden' }}>

        {/* ── facet sidebar ─────────────────────────────────────────────────── */}
        <div style={{
          width: 200,
          flexShrink: 0,
          borderRight: '1px solid #2D2D2D',
          overflowY: 'auto',
          padding: '12px 8px 12px 0',
        }}>
          <FacetSection
            title="Log Level"
            items={levelFacetList}
            selected={selectedLevels}
            onToggle={toggleLevel}
            colorMap={LOG_LEVELS}
            total={serverTotal}
          />
          {serviceFacetList.length > 0 && (
            <FacetSection
              title="Service"
              items={serviceFacetList}
              selected={selectedServices}
              onToggle={toggleService}
              colorMap={null}
              total={serverTotal}
            />
          )}

          {/* active filter chips */}
          {(selectedLevels.length > 0 || selectedServices.length > 0) && (
            <div style={{ marginTop: 8 }}>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Active
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                {selectedLevels.map((l) => (
                  <Tag
                    key={l}
                    closable
                    onClose={() => toggleLevel(l)}
                    color={LOG_LEVELS[l]?.color}
                    style={{ fontSize: 10, cursor: 'pointer' }}
                  >
                    {l}
                  </Tag>
                ))}
                {selectedServices.map((s) => (
                  <Tag key={s} closable onClose={() => toggleService(s)} style={{ fontSize: 10, cursor: 'pointer' }}>
                    {s.length > 14 ? s.slice(0, 12) + '…' : s}
                  </Tag>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── log stream ────────────────────────────────────────────────────── */}
        <div style={{ flex: 1, overflowY: 'auto', minWidth: 0 }}>
          {isLoading && filteredLogs.length === 0 ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
              <Spin size="large" />
            </div>
          ) : filteredLogs.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 48, fontSize: 13 }}>
              No logs matched your filters
            </div>
          ) : (
            <>
              {filteredLogs.map((log, i) => {
                const key = rowKey(log, i);
                return (
                  <LogRow
                    key={key}
                    log={log}
                    isExpanded={expandedKeys.has(key)}
                    onToggle={() => toggleRow(key, log)}
                    wrap={wrap}
                    contextLogs={expandedKeys.has(key) && contextLog?.trace_id === log.trace_id ? contextLogs : []}
                    navigate={navigate}
                  />
                );
              })}

              {/* ── infinite load more ── */}
              {hasNextPage && (
                <div style={{ padding: '16px', textAlign: 'center', borderTop: '1px solid #2D2D2D' }}>
                  <Button
                    type="primary"
                    ghost
                    loading={isFetchingNextPage}
                    onClick={() => fetchNextPage()}
                    style={{ minWidth: 200, borderColor: '#5E60CE', color: '#5E60CE' }}
                  >
                    Load Older Logs
                  </Button>
                </div>
              )}

              {!hasNextPage && filteredLogs.length > 0 && (
                <div style={{ padding: '16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 12, borderTop: '1px solid #2D2D2D' }}>
                  End of matching logs
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <style>{`
        .live-tail-icon-active { color: #73C991; animation: pulse 1.5s infinite; }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
      `}</style>
    </div>
  );
}
