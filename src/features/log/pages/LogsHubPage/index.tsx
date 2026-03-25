import { AlertCircle, FileText, Radio, Share2 } from 'lucide-react';

import { ERROR_CODE_LABELS } from '@/shared/constants/errorCodes';
import { useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

import { Badge, Button } from '@/components/ui';
import type { SimpleTableColumn } from '@/components/ui';
import { ExplorerResultsTable, FacetRail } from '@/features/explorer-core/components';
import { cn } from '@/lib/utils';
import {
  ObservabilityDetailPanel,
  ObservabilityQueryBar,
  PageHeader,
  PageShell,
  PageSurface,
} from '@shared/components/ui';
import { formatNumber, formatRelativeTime } from '@shared/utils/formatters';
import { tsLabel } from '@shared/utils/time';
import type { StructuredFilter } from '@/shared/hooks/useURLFilters';
import { useURLFilters } from '@/shared/hooks/useURLFilters';

import { LevelBadge } from '../../components/log/LogRow';
import { useLogDetailFields } from '../../hooks/useLogDetailFields';
import { useLogsHubData } from '../../hooks/useLogsHubData';
import {
  compileLogsStructuredFilters,
  LOG_FILTER_FIELDS,
  LOGS_URL_FILTER_CONFIG,
  toDisplayText,
  upsertLogFacetFilter,
} from '../../utils/logUtils';
import type { LogRecord, LogsBackendParams } from '../../types';

export default function LogsHubPage(): JSX.Element {
  const navigate = useNavigate();

  const {
    values: urlValues,
    setters: urlSetters,
    structuredFilters: filters,
    setStructuredFilters: setFilters,
    clearAll: clearURLFilters,
  } = useURLFilters(LOGS_URL_FILTER_CONFIG);

  const searchText =
    typeof urlValues['search'] === 'string' ? urlValues['search'] : '';

  const setSearchText = (value: string): void => {
    urlSetters['search']?.(value);
  };

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [selectedLog, setSelectedLog] = useState<LogRecord | null>(null);

  const backendParams = useMemo((): LogsBackendParams => {
    const params: LogsBackendParams = {
      ...compileLogsStructuredFilters(filters),
    };

    if (searchText.trim()) {
      params.search = searchText.trim();
    }

    return params;
  }, [filters, searchText]);

  const {
    logs,
    logsLoading,
    logsError,
    logsErrorDetail,
    total,
    serviceFacets,
    levelFacets,
    liveTailEnabled,
    setLiveTailEnabled,
    liveTailStatus,
    liveTailLagMs,
  } = useLogsHubData({
    searchText,
    filters,
    backendParams,
    page,
    pageSize,
  });

  const detailFields = useLogDetailFields(selectedLog);

  const activeSelections = useMemo(
    () => ({
      service_name:
        filters.find(
          (filter) =>
            filter.field === 'service_name' && filter.operator === 'equals',
        )?.value ?? null,
      level:
        filters.find(
          (filter) => filter.field === 'level' && filter.operator === 'equals',
        )?.value ?? null,
    }),
    [filters],
  );

  const columns = useMemo<SimpleTableColumn<LogRecord>[]>(
    () => [
      {
        title: 'Time',
        key: 'timestamp',
        dataIndex: 'timestamp',
        width: 168,
        render: (value, row) => {
          const timestamp = value instanceof Date || typeof value === 'string' || typeof value === 'number'
            ? value
            : row.timestamp;

          return (
          <div className="space-y-1">
            <div className="font-mono text-[12px] text-[var(--text-primary)]">
              {tsLabel(timestamp)}
            </div>
            <div className="text-[11px] text-[var(--text-muted)]">
              {formatRelativeTime(timestamp)}
            </div>
          </div>
          );
        },
      },
      {
        title: 'Level',
        key: 'level',
        dataIndex: 'level',
        width: 90,
        render: (value, row) => (
          <LevelBadge level={String(value ?? row.severity_text ?? 'INFO')} />
        ),
      },
      {
        title: 'Service',
        key: 'service_name',
        dataIndex: 'service_name',
        width: 160,
        render: (value) => (
          <span className="text-[12.5px] font-medium text-[var(--text-primary)]">
            {toDisplayText(value)}
          </span>
        ),
      },
      {
        title: 'Host',
        key: 'host',
        dataIndex: 'host',
        width: 148,
        render: (value, row) => (
          <span className="text-[12px] text-[var(--text-secondary)]">
            {toDisplayText(value || row.pod)}
          </span>
        ),
      },
      {
        title: 'Message',
        key: 'message',
        dataIndex: 'message',
        render: (value, row) => (
          <button
            type="button"
            className="line-clamp-2 max-w-full text-left text-[12.5px] leading-6 text-[var(--text-primary)] hover:text-white"
            onClick={() => setSelectedLog(row)}
          >
            {toDisplayText(value ?? row.body)}
          </button>
        ),
      },
      {
        title: 'Trace',
        key: 'trace_id',
        dataIndex: 'trace_id',
        width: 150,
        render: (value) => (
          <span className="font-mono text-[11px] text-[var(--text-muted)]">
            {value ? String(value).slice(0, 12) : '—'}
          </span>
        ),
      },
    ],
    [],
  );

  const facetGroups = useMemo(
    () => [
      {
        key: 'service_name',
        label: 'Top Services',
        buckets: serviceFacets.slice(0, 10),
      },
      {
        key: 'level',
        label: 'Severity',
        buckets: levelFacets.slice(0, 8),
      },
    ],
    [levelFacets, serviceFacets],
  );

  return (
    <PageShell>
      <PageHeader
        title="Logs"
        icon={<FileText size={22} />}
        subtitle="Search, filter, and pivot through dense log streams without leaving the investigative thread."
        actions={
          <>
            <Button
              variant="ghost"
              size="sm"
              icon={<Share2 size={14} />}
              onClick={async () => {
                await navigator.clipboard.writeText(window.location.href);
                toast.success('Share link copied');
              }}
            >
              Share
            </Button>
          </>
        }
      />

      <PageSurface padding="lg" className="relative z-[40] overflow-visible">
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="relative z-[70] min-w-[320px] max-w-3xl flex-1">
              <div className="mb-2 flex items-center gap-2">
                <Badge variant={liveTailEnabled ? 'info' : 'default'}>
                  {liveTailEnabled ? 'Live' : 'Snapshot'}
                </Badge>
                {liveTailEnabled ? (
                  <Badge variant="warning">
                    {liveTailStatus === 'live'
                      ? `${Math.max(0, liveTailLagMs)}ms lag`
                      : 'connecting'}
                  </Badge>
                ) : null}
              </div>
              <ObservabilityQueryBar
                fields={LOG_FILTER_FIELDS}
                filters={filters}
                setFilters={(nextFilters: StructuredFilter[]) => {
                  setFilters(nextFilters);
                  setPage(1);
                }}
                searchText={searchText}
                setSearchText={(value: string) => {
                  setSearchText(value);
                  setPage(1);
                }}
                onClearAll={() => {
                  clearURLFilters();
                  setPage(1);
                }}
                placeholder="Search logs, services, hosts, trace IDs, or free text"
              />
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={liveTailEnabled ? 'primary' : 'secondary'}
                size="sm"
                icon={<Radio size={14} />}
                onClick={() => setLiveTailEnabled(!liveTailEnabled)}
              >
                {liveTailEnabled ? 'Stop live tail' : 'Start live tail'}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  clearURLFilters();
                  setPage(1);
                }}
              >
                Reset
              </Button>
            </div>
          </div>
        </div>
      </PageSurface>

      <div className="relative z-0 grid gap-4 xl:grid-cols-[300px_minmax(0,1fr)]">
        <FacetRail
          groups={facetGroups}
          selected={activeSelections}
          onSelect={(groupKey, value) => {
            setFilters(upsertLogFacetFilter(filters, groupKey, value));
            setPage(1);
          }}
        />

        {logsError && logsErrorDetail && (
          <div className="mb-3 flex items-center gap-2 rounded-[var(--card-radius)] border border-[rgba(240,68,56,0.3)] bg-[rgba(240,68,56,0.08)] px-4 py-3 text-[var(--color-error)]">
            <AlertCircle size={16} className="shrink-0" />
            <span className="text-sm font-medium">
              {ERROR_CODE_LABELS[(logsErrorDetail as any).code] ?? 'Error'}
            </span>
            <span className="text-sm opacity-80">
              {(logsErrorDetail as any).message ?? 'Failed to load logs'}
            </span>
          </div>
        )}

        <ExplorerResultsTable
          title="Logs Explorer"
          subtitle={`${formatNumber(logs.length)} rows in view, ${formatNumber(total)} total matches`}
          rows={logs}
          columns={columns}
          rowKey={(row) => String(row.id)}
          isLoading={logsLoading}
          page={page}
          pageSize={pageSize}
          total={liveTailEnabled ? logs.length : total}
          onPageChange={setPage}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setPage(1);
          }}
          onRow={(row) => ({
            onClick: () => setSelectedLog(row),
          })}
          rowClassName={(row) =>
            cn(
              'cursor-pointer transition-colors hover:bg-[rgba(255,255,255,0.04)]',
              selectedLog?.id === row.id &&
                'bg-[rgba(94,96,206,0.12)] ring-1 ring-inset ring-[rgba(94,96,206,0.3)]',
            )
          }
        />
      </div>

      {selectedLog ? (
        <ObservabilityDetailPanel
          title="Log Detail"
          titleBadge={<LevelBadge level={String(selectedLog.level ?? selectedLog.severity_text)} />}
          metaLine={tsLabel(selectedLog.timestamp)}
          metaRight={formatRelativeTime(selectedLog.timestamp)}
          summaryNode={
            <div className="text-[12px] leading-6 text-[var(--text-primary)]">
              {toDisplayText(selectedLog.body ?? selectedLog.message)}
            </div>
          }
          actions={
            <>
              {selectedLog.trace_id ? (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => navigate(`/traces/${selectedLog.trace_id}`)}
                >
                  Open Trace
                </Button>
              ) : null}
            </>
          }
          fields={detailFields}
          rawData={selectedLog}
          onClose={() => setSelectedLog(null)}
        />
      ) : null}
    </PageShell>
  );
}
