import { useMemo, useState, useCallback } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { v1Service } from '@services/v1Service';
import { useAppStore } from '@store/appStore';
import { LOG_LEVELS } from '@config/constants';

import LogsSidebar from '@components/logs/LogsSidebar';
import LogsTopNav from '@components/logs/LogsTopNav';
import LogsQueryBar from '@components/logs/LogsQueryBar';
import LogsRawView from '@components/logs/LogsRawView';
import LogsChartView from '@components/logs/LogsChartView';
import LogRow, { LogDetailPanel } from '@components/logs/LogRow';

import './LogsPage.css';

function safeLower(v) {
  return String(v || '').toLowerCase();
}

export default function LogsPage() {
  const { selectedTeamId, timeRange, refreshKey } = useAppStore();
  const navigate = useNavigate();

  // ── server-side filter state
  const [searchText, setSearchText] = useState('');
  const [selectedLevels, setSelectedLevels] = useState([]);
  const [selectedServices, setSelectedServices] = useState([]);

  // ── client-side filter state
  const [traceFilter, setTraceFilter] = useState('');
  const [spanFilter, setSpanFilter] = useState('');
  const [messageFilter, setMessageFilter] = useState('');

  // ── ui state
  const [viewMode, setViewMode] = useState('raw');
  const [liveTail, setLiveTail] = useState(false);
  const [wrap] = useState(false);
  const [expandedKeys, setExpandedKeys] = useState(new Set());
  const [selectedLog, setSelectedLog] = useState(null);
  const pageSize = 100;

  // ── data fetch: logs
  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    refetch
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

  const filteredLogs = useMemo(() => {
    return rawLogs.filter((log) => {
      if (traceFilter && !safeLower(log.trace_id).includes(safeLower(traceFilter))) return false;
      if (spanFilter && !safeLower(log.span_id).includes(safeLower(spanFilter))) return false;
      if (messageFilter && !safeLower(log.message).includes(safeLower(messageFilter))) return false;
      return true;
    });
  }, [rawLogs, traceFilter, spanFilter, messageFilter]);

  // ── facet lists sorted by count
  const levelFacetList = useMemo(() =>
    Object.entries(facets.levels).sort((a, b) => Number(b[1]) - Number(a[1])),
    [facets.levels]
  );
  const serviceFacetList = useMemo(() =>
    Object.entries(facets.services).sort((a, b) => Number(b[1]) - Number(a[1])).slice(0, 20),
    [facets.services]
  );

  const rowKey = (log, i) =>
    log.trace_id && log.span_id
      ? `${log.trace_id}-${log.span_id}-${log.timestamp}`
      : `log-${i}-${log.timestamp}`;

  const toggleRow = useCallback((key, log) => {
    setExpandedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
        if (selectedLog?.trace_id === log.trace_id && selectedLog?.timestamp === log.timestamp) {
          setSelectedLog(null);
        }
      } else {
        next.add(key);
        setSelectedLog(log);
      }
      return next;
    });
  }, [selectedLog]);

  const toggleLevel = (level) => {
    setSelectedLevels((prev) =>
      prev.includes(level) ? prev.filter((l) => l !== level) : [...prev, level]
    );
    setExpandedKeys(new Set());
    setSelectedLog(null);
  };

  const toggleService = (svc) => {
    setSelectedServices((prev) =>
      prev.includes(svc) ? prev.filter((s) => s !== svc) : [...prev, svc]
    );
    setExpandedKeys(new Set());
    setSelectedLog(null);
  };

  const handleCloseDetail = useCallback(() => {
    setSelectedLog(null);
    setExpandedKeys(new Set());
  }, []);

  const handleClearAll = useCallback(() => {
    setSearchText('');
    setSelectedLevels([]);
    setSelectedServices([]);
    setTraceFilter('');
    setSpanFilter('');
    setMessageFilter('');
    setExpandedKeys(new Set());
    setSelectedLog(null);
  }, []);

  return (
    <div className="logs-page">

      {/* ── Left Sidebar ── */}
      <LogsSidebar
        serverTotal={serverTotal}
        levelFacetList={levelFacetList}
        serviceFacetList={serviceFacetList}
        selectedLevels={selectedLevels}
        selectedServices={selectedServices}
        toggleLevel={toggleLevel}
        toggleService={toggleService}
        LOG_LEVELS={LOG_LEVELS}
        traceFilter={traceFilter} setTraceFilter={setTraceFilter}
        spanFilter={spanFilter} setSpanFilter={setSpanFilter}
        messageFilter={messageFilter} setMessageFilter={setMessageFilter}
      />

      {/* ── Main Content Area ── */}
      <div className="logs-main">

        {/* Top Navbar */}
        <LogsTopNav
          viewMode={viewMode} setViewMode={setViewMode}
          liveTail={liveTail} setLiveTail={setLiveTail}
          refresh={refetch} isLoading={isLoading}
        />

        {/* Query Builder Bar */}
        <LogsQueryBar
          searchText={searchText} setSearchText={setSearchText}
          traceFilter={traceFilter} setTraceFilter={setTraceFilter}
          spanFilter={spanFilter} setSpanFilter={setSpanFilter}
          messageFilter={messageFilter} setMessageFilter={setMessageFilter}
          selectedLevels={selectedLevels}
          selectedServices={selectedServices}
          onClearLevel={toggleLevel}
          onClearService={toggleService}
          onClearAll={handleClearAll}
        />

        {/* Content Body Based on Tab */}
        {viewMode === 'raw' && (
          <LogsRawView
            filteredLogs={filteredLogs}
            isLoading={isLoading}
            serverTotal={serverTotal}
            wrap={wrap}
            expandedKeys={expandedKeys}
            toggleRow={toggleRow}
            navigate={navigate}
            hasNextPage={hasNextPage}
            isFetchingNextPage={isFetchingNextPage}
            fetchNextPage={fetchNextPage}
            rowKey={rowKey}
            LogRow={LogRow}
          />
        )}

        {viewMode === 'chart' && (
          <LogsChartView />
        )}
      </div>

      {/* ── Log Detail Panel (fixed position overlay) ── */}
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
