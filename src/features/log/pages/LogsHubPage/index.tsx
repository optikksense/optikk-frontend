import {
  FileText,
  GitBranch,
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { PageHeader, ObservabilityDetailPanel } from '@shared/components/ui';
import { useURLFilters } from '@shared/hooks/useURLFilters';
import { relativeTime, tsLabel } from '@shared/utils/time';

import { EntityExplorerLayout } from '@/shared/components/layout/EntityExplorerLayout';

import LogsLevelDistributionCard from '../../components/charts/LogsLevelDistributionCard';
import LogsVolumeSection from '../../components/charts/LogsVolumeSection';
import LogsKpiRow from '../../components/kpi/LogsKpiRow';
import LogRow, { LevelBadge } from '../../components/log/LogRow';
import LogAttributesTree from '../../components/log/LogAttributesTree';
import LogsTableSection from '../../components/table/LogsTableSection';
import LogSurroundingPanel from '../../components/log/LogSurroundingPanel';
import DynamicFieldExplorer from '../../components/log/DynamicFieldExplorer';
import { useLogDetailFields } from '../../hooks/useLogDetailFields';
import { useLogsHubData } from '../../hooks/useLogsHubData';
import {
  LOG_COLUMNS,
  LOG_FILTER_FIELDS,
  LOGS_URL_FILTER_CONFIG,
  toDisplayText,
} from '../../utils/logUtils';

import type {
  LogRecord,
  LogsBoardRenderContext,
  LogStructuredFilter,
} from '../../types';

import './LogsHubPage.css';

export default function LogsHubPage() {
  const navigate = useNavigate();

  /* ── URL-synced filter state ── */
  const {
    values: urlValues,
    setters: urlSetters,
    clearAll: clearURLFilters,
  } = useURLFilters(LOGS_URL_FILTER_CONFIG);

  const optiQLQuery = typeof urlValues['q'] === 'string' ? urlValues['q'] : '';

  const setOptiQLQuery = (value: string): void => {
    urlSetters['q']?.(value);
  };

  /* ── Local-only state (not worth putting in URL) ── */
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [selectedLog, setSelectedLog] = useState<LogRecord | null>(null);
  const [focusedLogIndex, setFocusedLogIndex] = useState(-1);

  const {
    logs,
    logsLoading,
    total,
    volumeBuckets,
    volumeStep,
    volumeLoading,
    errorCount,
    warnCount,
    totalCount,
    serviceFacets,
    levelFacets,
    statsLoading,
    liveTailEnabled,
    setLiveTailEnabled,
  } = useLogsHubData({
    optiQLQuery,
    page,
    pageSize,
  }) as ReturnType<typeof useLogsHubData>;

  const clearAll = useCallback((): void => {
    clearURLFilters();
    setPage(1);
  }, [clearURLFilters]);

  /* ── Keyboard navigation ── */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const tagName = target.tagName.toUpperCase();
      const isEditable =
        tagName === 'INPUT' || tagName === 'TEXTAREA' || tagName === 'SELECT' || target.isContentEditable;

      // Allow Escape even from inputs
      if (e.key === 'Escape') {
        setSelectedLog(null);
        setFocusedLogIndex(-1);
        return;
      }

      if (isEditable) return;

      if (e.key === 'j') {
        setFocusedLogIndex((i) => {
          const next = Math.min(i + 1, logs.length - 1);
          if (next >= 0 && logs[next]) {
            setSelectedLog(logs[next] ?? null);
          }
          return next;
        });
        e.preventDefault();
      } else if (e.key === 'k') {
        setFocusedLogIndex((i) => {
          const next = Math.max(i <= 0 ? 0 : i - 1, 0);
          if (next >= 0 && logs[next]) {
            setSelectedLog(logs[next] ?? null);
          }
          return next;
        });
        e.preventDefault();
      } else if (e.key === '/') {
        // Focus the search input by its placeholder text or data attribute
        const searchInput = document.querySelector<HTMLInputElement>(
          'input[placeholder*="Search log"], input[data-logs-search]',
        );
        searchInput?.focus();
        e.preventDefault();
      }
    };

    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [logs]);

  /* ── Export handler ── */
  const handleExport = useCallback(
    (format: 'json' | 'csv') => {
      const date = new Date().toISOString().slice(0, 10);
      if (format === 'json') {
        const blob = new Blob([JSON.stringify(logs, null, 2)], {
          type: 'application/json',
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `logs-${date}.json`;
        a.click();
        URL.revokeObjectURL(url);
      } else {
        const headers = [
          'timestamp',
          'level',
          'service_name',
          'host',
          'pod',
          'trace_id',
          'message',
        ];
        const rows = logs.map((l) =>
          headers
            .map((h) => JSON.stringify(String((l as Record<string, unknown>)[h] ?? '')))
            .join(','),
        );
        const csv = [headers.join(','), ...rows].join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `logs-${date}.csv`;
        a.click();
        URL.revokeObjectURL(url);
      }
    },
    [logs],
  );

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

  const traceId = selectedLog ? selectedLog.trace_id || selectedLog.traceId : '';
  const selectedLogMessage = selectedLog ? toDisplayText(String(selectedLog.body)) : '—';

  const hasAttributes =
    selectedLog &&
    (Object.keys((selectedLog as Record<string, unknown>).attributes_string ?? {}).length > 0 ||
      Object.keys((selectedLog as Record<string, unknown>).attributes_number ?? {}).length > 0 ||
      Object.keys((selectedLog as Record<string, unknown>).attributes_bool ?? {}).length > 0);

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
          <LogsVolumeSection
            volumeBuckets={volumeBuckets}
            volumeStep={volumeStep}
            isLoading={volumeLoading}
          />
          <LogsLevelDistributionCard isLoading={statsLoading} levelFacets={levelFacets} />
        </div>
      }
      tableSection={
        <div style={{ display: 'flex', gap: 16, height: '100%' }}>
          <DynamicFieldExplorer 
            logs={logs}
            isLoading={logsLoading}
            onSelectField={(key, value) => {
              const prefix = optiQLQuery.trim() === '' ? '' : ' ';
              setOptiQLQuery(`${optiQLQuery}${prefix}attr.${key}="${value}"`);
            }}
          />
          <div style={{ flex: 1, minWidth: 0 }}>
            <LogsTableSection
              config={{
                columns: LOG_COLUMNS,
                filterFields: LOG_FILTER_FIELDS,
                renderRow,
                onOpenDetail: setSelectedLog,
              }}
              data={{
                logs,
                isLoading: logsLoading,
                serviceFacets,
                liveTailEnabled,
                setLiveTailEnabled,
              }}
              pagination={{
                page,
                pageSize,
                total,
                setPage,
                setPageSize,
              }}
              filters={{
                optiQLQuery,
                setOptiQLQuery: (value: string) => {
                  setOptiQLQuery(value);
                  setPage(1);
                },
                clearAll,
              }}
              onExport={handleExport}
              focusedLogIndex={focusedLogIndex}
            />
          </div>
        </div>
      }
      detailSidebar={
        selectedLog && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <ObservabilityDetailPanel
              title="Log Detail"
              titleBadge={
                <LevelBadge
                  level={
                    selectedLog.level ?? selectedLog.severity_text ?? selectedLog.severityText
                  }
                />
              }
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

            {hasAttributes && (
              <div className="glass-panel" style={{ padding: 12 }}>
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: 'var(--text-secondary)',
                    marginBottom: 8,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                  }}
                >
                  Attributes
                </div>
                <LogAttributesTree log={selectedLog as Parameters<typeof LogAttributesTree>[0]['log']} />
              </div>
            )}

            <div className="glass-panel" style={{ padding: 12 }}>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: 'var(--text-secondary)',
                  marginBottom: 8,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                }}
              >
                Context
              </div>
              <LogSurroundingPanel log={selectedLog} />
            </div>
          </div>
        )
      }
    />
  );
}
