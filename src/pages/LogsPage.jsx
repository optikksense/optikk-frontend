import { useMemo, useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { v1Service } from '@services/v1Service';
import { useAppStore } from '@store/appStore';
import { useDashboardConfig } from '@hooks/useDashboardConfig';
import { useTimeRange } from '@hooks/useTimeRangeQuery';
import { useDebouncedValue } from '@hooks/useDebouncedValue';
import { useKeyboardShortcut } from '@hooks/useKeyboardShortcut';
import { useInfiniteLogs } from '@hooks/useInfiniteLogs';
import { rowKey } from '@utils/logUtils';
import { TIME_RANGES } from '@config/constants';
import ConfigurableDashboard from '@components/dashboard/ConfigurableDashboard';

import LogsTopNav from '@components/logs/LogsTopNav';
import LogsQueryBar from '@components/logs/LogsQueryBar';
import LogsRawView from '@components/logs/LogsRawView';
import LogRow, { LogDetailPanel } from '@components/logs/LogRow';

import './LogsPage.css';

export default function LogsPage() {
  const { timeRange } = useAppStore();
  const navigate = useNavigate();
  const { config: dashboardConfig } = useDashboardConfig('logs');

  // ── filter state
  const [filters, setFilters] = useState([]);
  const [searchText, setSearchText] = useState('');
  const debouncedSearch = useDebouncedValue(searchText, 300);

  // ── ui state
  const [liveTail, setLiveTail] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);
  const pageSize = 100;

  // ── Build backend params from structured filters
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
  useKeyboardShortcut('Escape', useCallback(() => setSelectedLog(null), []), {
    enabled: !!selectedLog,
  });

  // ── data fetch: logs (infinite scroll + dedup + sort)
  const {
    allLogs, serverTotal, isLoading,
    isError: isLogsError, error: logsError,
    isFetchingNextPage, hasNextPage, fetchNextPage, refetch,
  } = useInfiniteLogs({ backendParams, liveTail, pageSize });

  // ── data fetch: histogram
  const { selectedTeamId: histTeamId, refreshKey: histRefresh, timeRange: histTimeRange, getTimeRange } = useTimeRange();

  const { histStart, histEnd } = useMemo(() => {
    const { startTime, endTime } = getTimeRange();
    return { histStart: startTime, histEnd: endTime };
  }, [histTimeRange, histRefresh, getTimeRange]);

  const histInterval = (() => {
    const mins = (histEnd - histStart) / 60000;
    if (mins <= 60) return '1m';
    if (mins <= 360) return '5m';
    if (mins <= 1440) return '15m';
    if (mins <= 10080) return '1h';
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

  // ── Derive time range label for TopNav
  const timeRangeLabel = useMemo(() => {
    if (timeRange.value === 'custom') return 'Custom range';
    const match = TIME_RANGES.find((r) => r.value === timeRange.value);
    return match?.label || timeRange.value;
  }, [timeRange.value]);

  // ── handlers
  const handleRowClick = useCallback((log) => setSelectedLog(log), []);
  const handleCloseDetail = useCallback(() => setSelectedLog(null), []);
  const handleClearAll = useCallback(() => {
    setFilters([]);
    setSearchText('');
    setSelectedLog(null);
  }, []);

  return (
    <div className="logs-page" style={{ flexDirection: 'column' }}>
      <div className="logs-main">
        <LogsTopNav
          liveTail={liveTail}
          setLiveTail={setLiveTail}
          logCount={allLogs.length}
          serverTotal={serverTotal}
          timeRangeLabel={timeRangeLabel}
        />

        <LogsQueryBar
          filters={filters} setFilters={setFilters}
          searchText={searchText} setSearchText={setSearchText}
          onClearAll={handleClearAll}
        />

        {dashboardConfig && (
          <div style={{ marginBottom: 16 }}>
            <ConfigurableDashboard
              config={dashboardConfig}
              dataSources={chartDataSources}
            />
          </div>
        )}

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
