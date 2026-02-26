import { useMemo, useState, useCallback, useEffect } from 'react';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { v1Service } from '@services/v1Service';
import { useAppStore } from '@store/appStore';
import { useDashboardConfig } from '@hooks/useDashboardConfig';
import { useTimeRange } from '@hooks/useTimeRangeQuery';
import ConfigurableDashboard from '@components/dashboard/ConfigurableDashboard';

import LogsTopNav from '@components/logs/LogsTopNav';
import LogsQueryBar from '@components/logs/LogsQueryBar';
import LogsRawView from '@components/logs/LogsRawView';
import LogRow, { LogDetailPanel } from '@components/logs/LogRow';

import './LogsPage.css';

// Debounce hook
function useDebouncedValue(value, delay = 300) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

function getLogsFromPage(page) {
  if (!page || typeof page !== 'object') return [];
  if (Array.isArray(page.logs)) return page.logs;
  if (Array.isArray(page.items)) return page.items;
  if (Array.isArray(page.rows)) return page.rows;
  return [];
}

function getHasMoreFromPage(page, allPages, pageSize) {
  const explicitFlags = [
    page?.hasMore,
    page?.has_more,
    page?.pagination?.hasMore,
    page?.pagination?.has_more,
  ];

  const explicitFlag = explicitFlags.find((value) => typeof value === 'boolean');
  if (typeof explicitFlag === 'boolean') return explicitFlag;

  const pageLogs = getLogsFromPage(page);
  const totalCandidates = [
    page?.total,
    page?.totalCount,
    page?.total_count,
    page?.pagination?.total,
    page?.pagination?.totalCount,
    page?.pagination?.total_count,
  ];

  for (const candidate of totalCandidates) {
    const total = Number(candidate);
    if (Number.isFinite(total) && total >= 0) {
      const loadedCount = (allPages || []).reduce((acc, currentPage) => {
        return acc + getLogsFromPage(currentPage).length;
      }, 0);
      return loadedCount < total;
    }
  }

  return pageLogs.length >= pageSize;
}

function getNextCursorFromPage(page) {
  const pageLogs = getLogsFromPage(page);
  const candidates = [
    page?.nextCursor,
    page?.next_cursor,
    page?.pagination?.nextCursor,
    page?.pagination?.next_cursor,
  ];

  for (const candidate of candidates) {
    if (candidate != null && candidate !== '' && candidate !== 0 && candidate !== '0') {
      return candidate;
    }
  }

  const tailId = pageLogs[pageLogs.length - 1]?.id;
  if (tailId != null && tailId !== 0 && tailId !== '0') {
    return tailId;
  }

  return undefined;
}

function parseTimestampMs(value) {
  if (value == null || value === '') return 0;

  if (typeof value === 'number' && Number.isFinite(value)) {
    if (value > 1e18) return Math.floor(value / 1e6); // ns -> ms
    if (value > 1e15) return Math.floor(value / 1e3); // us -> ms
    return Math.floor(value); // already ms
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return 0;

    if (/^-?\d+$/.test(trimmed)) {
      const n = Number(trimmed);
      if (Number.isFinite(n)) {
        if (n > 1e18) return Math.floor(n / 1e6);
        if (n > 1e15) return Math.floor(n / 1e3);
        return Math.floor(n);
      }
    }

    let parsed = Date.parse(trimmed);
    if (!Number.isFinite(parsed)) {
      parsed = Date.parse(trimmed.replace(' ', 'T'));
    }
    if (Number.isFinite(parsed)) return parsed;

    const m = trimmed.match(
      /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2}):(\d{2})(?:\.(\d{1,9}))?(Z)?$/
    );
    if (m) {
      const [, y, mo, d, h, mi, s, frac = '', z] = m;
      const ms = Number((frac + '000').slice(0, 3));
      if (z === 'Z') {
        return Date.UTC(Number(y), Number(mo) - 1, Number(d), Number(h), Number(mi), Number(s), ms);
      }
      return new Date(Number(y), Number(mo) - 1, Number(d), Number(h), Number(mi), Number(s), ms).getTime();
    }
  }

  if (value instanceof Date) {
    const ms = value.getTime();
    return Number.isFinite(ms) ? ms : 0;
  }

  return 0;
}

function getTimestampMs(log) {
  return parseTimestampMs(log?.timestamp);
}

function toBigIntId(id) {
  if (id == null || id === '') return null;
  if (typeof id === 'bigint') return id;
  if (typeof id === 'number' && Number.isFinite(id)) return BigInt(Math.trunc(id));
  if (typeof id === 'string' && /^-?\d+$/.test(id)) {
    try {
      return BigInt(id);
    } catch {
      return null;
    }
  }
  return null;
}

function compareIdsDesc(aId, bId) {
  const aBig = toBigIntId(aId);
  const bBig = toBigIntId(bId);

  if (aBig != null && bBig != null) {
    if (aBig === bBig) return 0;
    return aBig > bBig ? -1 : 1;
  }

  const aStr = String(aId ?? '');
  const bStr = String(bId ?? '');
  if (aStr === bStr) return 0;
  return bStr.localeCompare(aStr);
}

export default function LogsPage() {
  const { selectedTeamId, timeRange, refreshKey } = useAppStore();
  const navigate = useNavigate();

  const { config: dashboardConfig } = useDashboardConfig('logs');

  // ── filter state — structured filters from the query bar
  const [filters, setFilters] = useState([]);
  const [searchText, setSearchText] = useState('');
  const debouncedSearch = useDebouncedValue(searchText, 300);

  // ── ui state
  const [liveTail, setLiveTail] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);
  const pageSize = 100;

  // ── Build backend params from structured filters (supports exclude operators)
  const backendParams = useMemo(() => {
    const params = {};
    const levels = [];
    const services = [];
    const excludeLevels = [];
    const excludeServices = [];
    const excludeHosts = [];

    filters.forEach((f) => {
      const isExclude = f.operator === 'not_equals';
      const isContains = f.operator === 'contains';

      // "contains" on any field uses the backend search (LIKE %value%)
      if (isContains) {
        params.search = f.value;
        return;
      }

      if (f.field === 'level') {
        if (isExclude) excludeLevels.push(f.value);
        else levels.push(f.value);
      } else if (f.field === 'service_name') {
        if (isExclude) excludeServices.push(f.value);
        else services.push(f.value);
      } else if (f.field === 'trace_id') {
        params.traceId = f.value;
      } else if (f.field === 'span_id') {
        params.spanId = f.value;
      } else if (f.field === 'host') {
        if (isExclude) excludeHosts.push(f.value);
        else params.host = f.value;
      } else if (f.field === 'container') {
        params.container = f.value;
      } else if (f.field === 'message') {
        params.search = f.value;
      }
    });

    if (levels.length > 0) params.levels = levels;
    if (services.length > 0) params.services = services;
    if (excludeLevels.length > 0) params.excludeLevels = excludeLevels;
    if (excludeServices.length > 0) params.excludeServices = excludeServices;
    if (excludeHosts.length > 0) params.excludeHosts = excludeHosts;
    if (debouncedSearch) params.search = debouncedSearch;

    return params;
  }, [filters, debouncedSearch]);

  // ── Keyboard shortcut: Escape closes detail panel
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape' && selectedLog) {
        setSelectedLog(null);
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [selectedLog]);

  // ── Stable time window — pin endTime when queryKey changes so all pages
  //    share the same window; recalculated on refreshKey / timeRange change.
  const { stableStart, stableEnd } = useMemo(() => {
    if (timeRange.value === 'custom' && timeRange.startTime && timeRange.endTime) {
      return { stableStart: timeRange.startTime, stableEnd: timeRange.endTime };
    }
    const end = Date.now();
    return { stableStart: end - timeRange.minutes * 60 * 1000, stableEnd: end };
  }, [
    selectedTeamId,
    timeRange.value,
    timeRange.minutes,
    timeRange.startTime,
    timeRange.endTime,
    backendParams,
    refreshKey
  ]);

  // ── data fetch: logs
  const {
    data,
    isLoading,
    isError: isLogsError,
    error: logsError,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    refetch
  } = useInfiniteQuery({
    queryKey: [
      'logs-v2-infinite',
      selectedTeamId, timeRange.value,
      pageSize, backendParams,
      refreshKey,
    ],
    queryFn: ({ pageParam }) =>
      v1Service.getLogs(selectedTeamId, stableStart, stableEnd, {
        ...backendParams,
        limit: pageSize,
        direction: 'desc',
        ...(pageParam != null ? { cursor: pageParam } : {}),
      }),
    getNextPageParam: (lastPage, allPages) => {
      if (!getHasMoreFromPage(lastPage, allPages, pageSize)) return undefined;
      // Cursor can come from different response shapes; fallback to last row id.
      return getNextCursorFromPage(lastPage);
    },
    initialPageParam: null,
    enabled: !!selectedTeamId,
    refetchInterval: liveTail ? 3000 : false,
    refetchIntervalInBackground: false,
  });

  // ── data fetch: histogram — uses same time range as all other charts
  const { selectedTeamId: histTeamId, refreshKey: histRefresh, timeRange: histTimeRange, getTimeRange } = useTimeRange();

  const { histStart, histEnd } = useMemo(() => {
    const { startTime, endTime } = getTimeRange();
    return { histStart: startTime, histEnd: endTime };
  }, [histTimeRange, histRefresh, getTimeRange]);

  const histInterval = (() => {
    const mins = (histEnd - histStart) / 60000;
    // Target ~50 bars; pick the finest interval that achieves this
    if (mins <= 60) return '1m';   // up to 60 bars for 1h window
    if (mins <= 360) return '5m';   // up to 72 bars for 6h window
    if (mins <= 1440) return '15m';  // up to 96 bars for 24h window
    if (mins <= 10080) return '1h';  // up to 168 bars for 7d window
    return '6h';
  })();

  const { data: histData } = useQuery({
    queryKey: ['log-histogram', histTeamId, histTimeRange.value, histRefresh, histInterval],
    queryFn: () => v1Service.getLogHistogram(histTeamId, histStart, histEnd, histInterval),
    enabled: !!histTeamId,
  });

  const histogramData = histData?.histogram || histData?.buckets || histData || [];

  const chartDataSources = useMemo(() => ({
    'log-histogram': Array.isArray(histogramData) ? histogramData : [],
    _meta: { startTime: histStart, endTime: histEnd, interval: histInterval },
  }), [histogramData, histStart, histEnd, histInterval]);


  // ── derived data (deduplicate by id and sort newest-first)
  const allLogs = useMemo(() => {
    if (!data?.pages) return [];
    const raw = data.pages.flatMap((page) => getLogsFromPage(page));
    // Deduplicate by id (refetchInterval can cause overlap between pages)
    const seen = new Set();
    const unique = [];
    for (const log of raw) {
      const id = String(log?.id ?? '').trim();
      const traceId = log?.traceId || log?.trace_id || '';
      const spanId = log?.spanId || log?.span_id || '';
      const serviceName = log?.serviceName || log?.service_name || '';
      const key = id && id !== '0'
        ? id
        : `${log.timestamp}-${traceId}-${spanId}-${serviceName}-${(log.message || '').slice(0, 120)}`;
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(log);
      }
    }
    // Sort newest first by timestamp, with id as a deterministic tie-breaker.
    unique.sort((a, b) => {
      // Always prioritize timestamp so the table starts from the newest log line.
      const tsDiff = getTimestampMs(b) - getTimestampMs(a);
      if (tsDiff !== 0) return tsDiff;
      return compareIdsDesc(a.id, b.id);
    });
    return unique;
  }, [data]);
  const serverTotal = Number(
    data?.pages?.[0]?.total
    ?? data?.pages?.[0]?.totalCount
    ?? data?.pages?.[0]?.total_count
    ?? data?.pages?.[0]?.pagination?.total
    ?? data?.pages?.[0]?.pagination?.totalCount
    ?? data?.pages?.[0]?.pagination?.total_count
    ?? 0
  );

  const rowKey = (log, i) => {
    const id = String(log?.id ?? '').trim();
    if (id && id !== '0') return `log-${id}`;

    const traceId = log?.traceId || log?.trace_id || '';
    const spanId = log?.spanId || log?.span_id || '';
    if (traceId && spanId) return `${traceId}-${spanId}-${log.timestamp}`;

    return `log-${i}-${log.timestamp}`;
  };

  const handleRowClick = useCallback((log) => {
    setSelectedLog(log);
  }, []);

  const handleCloseDetail = useCallback(() => {
    setSelectedLog(null);
  }, []);

  const handleClearAll = useCallback(() => {
    setFilters([]);
    setSearchText('');
    setSelectedLog(null);
  }, []);

  return (
    <div className="logs-page" style={{ flexDirection: 'column' }}>
      <div className="logs-main">

        {/* Top Navbar — no more Chart tab */}
        <LogsTopNav
          liveTail={liveTail} setLiveTail={setLiveTail}
        />

        {/* Query Filter Bar */}
        <LogsQueryBar
          filters={filters} setFilters={setFilters}
          searchText={searchText} setSearchText={setSearchText}
          onClearAll={handleClearAll}
        />

        {/* Configurable Charts — powered by backend YAML config */}
        {dashboardConfig && (
          <div style={{ marginBottom: 16 }}>
            <ConfigurableDashboard
              config={dashboardConfig}
              dataSources={chartDataSources}
            />
          </div>
        )}

        {/* Error State */}
        {isLogsError && (
          <div className="logs-error">
            <div className="logs-error__icon">!</div>
            <div className="logs-error__text">
              Failed to load logs{logsError?.message ? `: ${logsError.message}` : ''}
            </div>
            <button className="logs-btn" onClick={() => refetch()}>
              Retry
            </button>
          </div>
        )}

        {/* Raw Log Rows */}
        {!isLogsError && (
          <LogsRawView
            filteredLogs={allLogs}
            isLoading={isLoading}
            serverTotal={serverTotal}
            wrap={false}
            onRowClick={handleRowClick}
            navigate={navigate}
            hasNextPage={hasNextPage}
            isFetchingNextPage={isFetchingNextPage}
            fetchNextPage={fetchNextPage}
            rowKey={rowKey}
            LogRow={LogRow}
          />
        )}
      </div>

      {/* Log Detail Panel */}
      {selectedLog && (
        <LogDetailPanel
          log={selectedLog}
          onClose={handleCloseDetail}
          navigate={navigate}
        />
      )}
    </div>
  );
}
