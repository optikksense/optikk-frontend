import { useMemo, useState, useCallback } from 'react';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { v1Service } from '@services/v1Service';
import { useAppStore } from '@store/appStore';

import LogsTopNav from '@components/logs/LogsTopNav';
import LogsQueryBar from '@components/logs/LogsQueryBar';
import LogsRawView from '@components/logs/LogsRawView';
import LogHistogram from '@components/charts/LogHistogram';
import LogRow, { LogDetailPanel } from '@components/logs/LogRow';

import './LogsPage.css';

export default function LogsPage() {
  const { selectedTeamId, timeRange, refreshKey } = useAppStore();
  const navigate = useNavigate();

  // ── filter state — structured filters from the query bar
  const [filters, setFilters] = useState([]);
  const [searchText, setSearchText] = useState('');

  // ── ui state
  const [liveTail, setLiveTail] = useState(false);
  const [collapsedKeys, setCollapsedKeys] = useState(new Set());
  const [selectedLog, setSelectedLog] = useState(null);
  const [chartCollapsed, setChartCollapsed] = useState(false);
  const pageSize = 100;

  // ── Build backend params from structured filters
  const backendParams = useMemo(() => {
    const params = {};
    const levels = [];
    const services = [];

    filters.forEach((f) => {
      if (f.field === 'level') {
        levels.push(f.value);
      } else if (f.field === 'service_name') {
        services.push(f.value);
      } else if (f.field === 'trace_id') {
        params.traceId = f.value;
      } else if (f.field === 'span_id') {
        params.spanId = f.value;
      } else if (f.field === 'host') {
        params.host = f.value;
      } else if (f.field === 'container') {
        params.container = f.value;
      } else if (f.field === 'message') {
        params.search = f.value;
      }
    });

    if (levels.length > 0) params.levels = levels;
    if (services.length > 0) params.services = services;
    if (searchText) params.search = searchText;

    return params;
  }, [filters, searchText]);

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
      pageSize, backendParams,
      refreshKey,
    ],
    queryFn: ({ pageParam = 0 }) => {
      const endTime = Date.now();
      const startTime = endTime - timeRange.minutes * 60 * 1000;
      return v1Service.getLogs(selectedTeamId, startTime, endTime, {
        ...backendParams,
        limit: pageSize,
        cursor: pageParam || undefined
      });
    },
    getNextPageParam: (lastPage) => lastPage.hasMore ? lastPage.nextCursor : undefined,
    enabled: !!selectedTeamId,
    refetchInterval: liveTail ? 3000 : false,
  });

  // ── data fetch: histogram (shown above raw logs)
  const getInterval = (minutes) => {
    if (minutes <= 30) return '1m';
    if (minutes <= 180) return '5m';
    if (minutes <= 1440) return '15m';
    return '1h';
  };

  const { data: histData } = useQuery({
    queryKey: ['log-histogram', selectedTeamId, timeRange.value, refreshKey],
    queryFn: () => {
      const endTime = Date.now();
      const startTime = endTime - timeRange.minutes * 60 * 1000;
      const interval = getInterval(timeRange.minutes);
      return v1Service.getLogHistogram(selectedTeamId, startTime, endTime, interval);
    },
    enabled: !!selectedTeamId,
  });

  const histogramData = histData?.histogram || histData?.buckets || histData || [];

  // ── derived data
  const allLogs = data?.pages ? data.pages.flatMap((page) => page.logs || []) : [];
  const serverTotal = Number(data?.pages?.[0]?.total || 0);

  const rowKey = (log, i) =>
    log.trace_id && log.span_id
      ? `${log.trace_id}-${log.span_id}-${log.timestamp}`
      : `log-${i}-${log.timestamp}`;

  const expandedKeys = useMemo(() => {
    const allKeys = new Set(allLogs.map((log, i) => rowKey(log, i)));
    collapsedKeys.forEach((k) => allKeys.delete(k));
    return allKeys;
  }, [allLogs, collapsedKeys]);

  const toggleRow = useCallback((key, log) => {
    setCollapsedKeys((prev) => {
      const next = new Set(prev);
      if (prev.has(key)) {
        next.delete(key);
        setSelectedLog(log);
      } else {
        next.add(key);
        if (selectedLog?.trace_id === log.trace_id && selectedLog?.timestamp === log.timestamp) {
          setSelectedLog(null);
        }
      }
      return next;
    });
  }, [selectedLog]);

  const handleCloseDetail = useCallback(() => {
    setSelectedLog(null);
  }, []);

  const handleClearAll = useCallback(() => {
    setFilters([]);
    setSearchText('');
    setCollapsedKeys(new Set());
    setSelectedLog(null);
  }, []);

  return (
    <div className="logs-page" style={{ flexDirection: 'column' }}>
      <div className="logs-main">

        {/* Top Navbar — no more Chart tab */}
        <LogsTopNav
          liveTail={liveTail} setLiveTail={setLiveTail}
          refresh={refetch} isLoading={isLoading}
        />

        {/* Query Filter Bar */}
        <LogsQueryBar
          filters={filters} setFilters={setFilters}
          searchText={searchText} setSearchText={setSearchText}
          onClearAll={handleClearAll}
        />

        {/* Log Volume Histogram — inline above raw logs */}
        {Array.isArray(histogramData) && histogramData.length > 0 && (
          <div className="logs-histogram">
            <div className="logs-histogram__header">
              <span className="logs-histogram__title">Log Volume</span>
              <button
                className="logs-histogram__toggle"
                onClick={() => setChartCollapsed(!chartCollapsed)}
              >
                {chartCollapsed ? '▸ Show' : '▾ Hide'}
              </button>
            </div>
            {!chartCollapsed && (
              <div className="logs-histogram__chart">
                <LogHistogram data={histogramData} height={160} />
              </div>
            )}
          </div>
        )}

        {/* Raw Log Rows */}
        <LogsRawView
          filteredLogs={allLogs}
          isLoading={isLoading}
          serverTotal={serverTotal}
          wrap={false}
          expandedKeys={expandedKeys}
          toggleRow={toggleRow}
          navigate={navigate}
          hasNextPage={hasNextPage}
          isFetchingNextPage={isFetchingNextPage}
          fetchNextPage={fetchNextPage}
          rowKey={rowKey}
          LogRow={LogRow}
        />
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
