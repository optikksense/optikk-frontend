import {
  FileText,
  GitBranch,
} from 'lucide-react';
import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import { PageHeader, ObservabilityDetailPanel } from '@shared/components/ui';
import { ConfiguredTabPanel } from '@shared/components/ui';

import { useURLFilters } from '@shared/hooks/useURLFilters';

import { relativeTime, tsLabel } from '@shared/utils/time';

import LogsLevelDistributionCard from '../../components/charts/LogsLevelDistributionCard';
import LogsVolumeSection from '../../components/charts/LogsVolumeSection';
import LogsKpiRow from '../../components/kpi/LogsKpiRow';
import LogRow, { LevelBadge } from '../../components/log/LogRow';
import LogsTableSection from '../../components/table/LogsTableSection';

import { useLogsHubData } from '../../hooks/useLogsHubData';
import { useLogDetailFields } from '../../hooks/useLogDetailFields';

import type {
  LogRecord,
  LogsBoardRenderContext,
  LogStructuredFilter,
} from '../../types';

import './LogsHubPage.css';

import {
  toDisplayText,
  LOG_FILTER_FIELDS,
  LOG_COLUMNS,
  LOGS_URL_FILTER_CONFIG
} from '../../utils/logUtils';

/* ─── Main page ───────────────────────────────────────────────────────────── */
/**
 *
 */
import { EntityExplorerLayout } from '@/shared/components/layout/EntityExplorerLayout';

export default function LogsHubPage() {
  const navigate = useNavigate();

  /* ── URL-synced filter state ── */
  const {
    values: urlValues,
    setters: urlSetters,
    structuredFilters: filters,
    setStructuredFilters: setFilters,
    clearAll: clearURLFilters,
  } = useURLFilters(LOGS_URL_FILTER_CONFIG);

  const searchText = typeof urlValues['search'] === 'string' ? urlValues['search'] : '';
  const selectedService =
    typeof urlValues['service'] === 'string' && urlValues['service'].length > 0 ? urlValues['service'] : null;
  const errorsOnly = urlValues['errorsOnly'] === true;

  const setSearchText = (value: string): void => {
    urlSetters['search']?.(value);
  };

  const setSelectedService = (value: string | null): void => {
    urlSetters['service']?.(value || '');
  };

  const setErrorsOnly = (value: boolean): void => {
    urlSetters['errorsOnly']?.(value);
  };

  /* ── Local-only state (not worth putting in URL) ── */
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [selectedLog, setSelectedLog] = useState<LogRecord | null>(null);

  const {
    logs,
    logsLoading,
    total,
    volumeBuckets,
    volumeLoading,
    errorCount,
    warnCount,
    totalCount,
    serviceFacets,
    levelFacets,
    statsLoading,
  } = useLogsHubData({
    searchText,
    selectedService,
    errorsOnly,
    filters: filters as LogStructuredFilter[],
    page,
    pageSize,
  }) as any; // Temporary cast to bridge branding gap

  const clearAll = useCallback((): void => {
    clearURLFilters();
    setPage(1);
  }, [clearURLFilters]);

  /* ── Decomposed hooks ── */
  const detailFields = useLogDetailFields(selectedLog);

  /* ── Board row renderer ── */
  const renderRow = useCallback(
    (log: LogRecord, { colWidths, visibleCols }: LogsBoardRenderContext) => (
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

  const traceId = selectedLog ? selectedLog.traceId || selectedLog.trace_id : '';
  const selectedLogMessage = selectedLog ? toDisplayText(String(selectedLog.body)) : '—';

  return (
    <EntityExplorerLayout
      className="logs-page"
      header={<PageHeader title="Logs" icon={<FileText size={24} />} />}
      kpiRow={
        <LogsKpiRow
          errorCount={errorCount}
          warnCount={warnCount}
          serviceCount={serviceFacets.length}
          totalCount={totalCount}
        />
      }
      chartsRow={
        <div className="logs-charts-row">
          <LogsVolumeSection volumeBuckets={volumeBuckets} isLoading={volumeLoading} />
          <LogsLevelDistributionCard isLoading={statsLoading} levelFacets={levelFacets} />
        </div>
      }
      tabPanel={<ConfiguredTabPanel pageId="logs" tabId="default" />}
      tableSection={
        <LogsTableSection
          config={{
            columns: LOG_COLUMNS,
            filterFields: LOG_FILTER_FIELDS,
            renderRow,
          }}
          data={{
            logs,
            isLoading: logsLoading,
            serviceFacets,
          }}
          pagination={{
            page,
            pageSize,
            total,
            setPage,
            setPageSize,
          }}
          filters={{
            filters,
            searchText,
            selectedService,
            errorsOnly,
            setFilters: (nextFilters) => {
              setFilters(nextFilters);
              setPage(1);
            },
            setSearchText: (value) => {
              setSearchText(value);
              setPage(1);
            },
            setSelectedService: (value) => {
              setSelectedService(value);
              setPage(1);
            },
            setErrorsOnly: (value) => {
              setErrorsOnly(value);
              setPage(1);
            },
            clearAll,
          }}
        />
      }
      detailSidebar={
        selectedLog && (
          <ObservabilityDetailPanel
            title="Log Detail"
            titleBadge={<LevelBadge level={selectedLog.severityText} />}
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
                {selectedLogMessage}
              </span>
            }
            actions={
              traceId ? (
                <button
                  className="logs-view-trace-btn"
                  onClick={() => navigate(`/traces/${traceId}`)}
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
        )
      }
    />
  );
}
