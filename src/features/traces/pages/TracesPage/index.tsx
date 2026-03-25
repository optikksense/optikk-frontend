import { Activity, AlertCircle, GitBranch, GitCompare, Radio, Share2 } from 'lucide-react';

import { ERROR_CODE_LABELS } from '@/shared/constants/errorCodes';
import { useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

import { Badge, Button, Select, Switch } from '@/components/ui';
import type { SelectOption, SimpleTableColumn } from '@/components/ui';
import { ExplorerResultsTable, FacetRail } from '@/features/explorer-core/components';
import { useLiveTailStream } from '@/features/explorer-core/hooks/useLiveTailStream';
import { cn } from '@/lib/utils';
import { tracesService } from '@shared/api/tracesService';
import { toApiErrorShape } from '@shared/api/utils/errorNormalization';
import {
  ObservabilityDetailPanel,
  ObservabilityQueryBar,
  PageHeader,
  PageShell,
  PageSurface,
} from '@shared/components/ui';
import {
  formatDuration,
  formatNumber,
  formatRelativeTime,
  formatTimestamp,
} from '@shared/utils/formatters';
import type { StructuredFilter } from '@/shared/hooks/useURLFilters';

import { useTraceDetailFields } from '../../hooks/useTraceDetailFields';
import { useTracesExplorer } from '../../hooks/useTracesExplorer';
import { TRACE_FILTER_FIELDS } from '../../utils/tracesUtils';

import type { TraceRecord } from '../../types';

function renderTraceStatus(status: string): JSX.Element {
  const normalized = (status || 'UNSET').toUpperCase();
  const variant = normalized === 'ERROR' ? 'error' : normalized === 'OK' ? 'success' : 'default';
  return <Badge variant={variant}>{normalized}</Badge>;
}

function buildTraceRecordFromLiveItem(value: unknown): TraceRecord {
  const row = value as Record<string, unknown>;
  const start = new Date(String(row.timestamp ?? new Date().toISOString()));
  const durationMs = Number(row.durationMs ?? 0);
  const end = new Date(start.getTime() + durationMs);

  return {
    span_id: String(row.spanId ?? ''),
    trace_id: String(row.traceId ?? ''),
    service_name: String(row.serviceName ?? ''),
    operation_name: String(row.operationName ?? ''),
    start_time: start.toISOString(),
    end_time: end.toISOString(),
    duration_ms: durationMs,
    status: String(row.status ?? 'UNSET'),
    span_kind: String(row.spanKind ?? ''),
    http_method: String(row.httpMethod ?? ''),
    http_status_code: Number(row.httpStatusCode ?? 0),
    status_message: '',
    parent_span_id: '',
  };
}

function upsertFacetFilter(
  filters: StructuredFilter[],
  nextField: string,
  nextValue: string | null
): StructuredFilter[] {
  const withoutField = filters.filter((filter) => filter.field !== nextField);
  if (!nextValue) {
    return withoutField;
  }

  return [
    ...withoutField,
    {
      field: nextField,
      operator: 'equals',
      value: nextValue,
    },
  ];
}

export default function TracesPage(): JSX.Element {
  const navigate = useNavigate();

  const {
    isLoading,
    isError,
    error,
    traces,
    totalTraces,
    errorTraces,
    facets,
    searchText,
    selectedService,
    errorsOnly,
    mode,
    page,
    pageSize,
    filters,
    backendParams,
    setSearchText,
    setSelectedService,
    setErrorsOnly,
    setMode,
    setPage,
    setPageSize,
    setFilters,
    clearAll,
  } = useTracesExplorer();

  const [selectedTrace, setSelectedTrace] = useState<TraceRecord | null>(null);
  const [selectedTraceIds, setSelectedTraceIds] = useState<string[]>([]);
  const [isLiveTail, setIsLiveTail] = useState(false);
  const normalizedError = useMemo(() => (error ? toApiErrorShape(error) : null), [error]);

  const detailFields = useTraceDetailFields(selectedTrace);

  const liveTail = useLiveTailStream<TraceRecord>({
    enabled: isLiveTail,
    subscribeEvent: 'subscribe:spans',
    itemEvent: 'span',
    params: {
      services: backendParams.services,
      status: backendParams.status,
      search: backendParams.search,
      spanKind: backendParams.spanKind,
      operationName: backendParams.operationName,
      httpMethod: backendParams.httpMethod,
    },
    normalizeItem: buildTraceRecordFromLiveItem,
  });

  const renderedTraces = isLiveTail ? liveTail.items : traces;

  const columns = useMemo<SimpleTableColumn<TraceRecord>[]>(
    () => [
      {
        title: '',
        key: 'selected',
        width: 42,
        render: (_value, row) => (
          <input
            type="checkbox"
            checked={selectedTraceIds.includes(row.trace_id)}
            onChange={(event) => {
              setSelectedTraceIds((previous) => {
                if (event.target.checked) {
                  if (previous.length >= 2) {
                    return previous;
                  }
                  return [...previous, row.trace_id];
                }
                return previous.filter((id) => id !== row.trace_id);
              });
            }}
            onClick={(event) => event.stopPropagation()}
            className="h-4 w-4 rounded border-[var(--border-color)] bg-transparent"
          />
        ),
      },
      {
        title: 'Trace ID',
        key: 'trace_id',
        dataIndex: 'trace_id',
        width: 170,
        render: (value) => (
          <span className="font-mono text-[11px] text-[var(--text-primary)]">
            {String(value).slice(0, 14)}
          </span>
        ),
      },
      {
        title: 'Service',
        key: 'service_name',
        dataIndex: 'service_name',
        width: 160,
        render: (value) => (
          <span className="text-[12.5px] font-medium text-[var(--text-primary)]">
            {String(value || 'Unknown')}
          </span>
        ),
      },
      {
        title: 'Operation',
        key: 'operation_name',
        dataIndex: 'operation_name',
        render: (value) => (
          <span className="text-[12.5px] text-[var(--text-secondary)]">
            {String(value || 'Unknown')}
          </span>
        ),
      },
      {
        title: 'Status',
        key: 'status',
        dataIndex: 'status',
        width: 110,
        render: (value) => renderTraceStatus(String(value)),
      },
      {
        title: 'Duration',
        key: 'duration_ms',
        dataIndex: 'duration_ms',
        width: 120,
        render: (value) => (
          <span className="font-medium text-[var(--text-primary)]">
            {formatDuration(Number(value ?? 0))}
          </span>
        ),
      },
      {
        title: 'Started',
        key: 'start_time',
        dataIndex: 'start_time',
        width: 176,
        render: (value) => (
          <div className="space-y-1">
            <div className="text-[12px] text-[var(--text-primary)]">
              {formatTimestamp(String(value))}
            </div>
            <div className="text-[11px] text-[var(--text-muted)]">
              {formatRelativeTime(String(value))}
            </div>
          </div>
        ),
      },
    ],
    [selectedTraceIds]
  );

  const facetGroups = useMemo(
    () => [
      {
        key: 'service_name',
        label: 'Top Services',
        buckets: (facets.service_name ?? []).slice(0, 10),
      },
      {
        key: 'status',
        label: 'Status',
        buckets: (facets.status ?? []).slice(0, 6),
      },
      {
        key: 'operation_name',
        label: 'Operations',
        buckets: (facets.operation_name ?? []).slice(0, 10),
      },
    ],
    [facets.operation_name, facets.service_name, facets.status]
  );

  const selectedFacetState = useMemo(
    () => ({
      service_name: selectedService,
      status: errorsOnly ? 'ERROR' : null,
      operation_name: filters.find((filter) => filter.field === 'operation_name')?.value ?? null,
    }),
    [errorsOnly, filters, selectedService]
  );

  const modeOptions = useMemo<SelectOption[]>(
    () => [
      { label: 'Root spans', value: 'root' },
      { label: 'All spans', value: 'all' },
    ],
    []
  );

  return (
    <PageShell>
      <PageHeader
        title="Traces"
        icon={<GitBranch size={22} />}
        subtitle="Search, compare, and pivot across traces without leaving the explorer workflow."
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
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Badge variant="info">{mode === 'all' ? 'All spans' : 'Root spans'}</Badge>
              {isLiveTail ? (
                <Badge variant={liveTail.status === 'live' ? 'warning' : 'default'}>
                  {liveTail.status === 'live' ? `${liveTail.lagMs}ms lag` : 'connecting'}
                </Badge>
              ) : null}
              <Badge variant={errorTraces > 0 ? 'error' : 'default'}>
                {formatNumber(errorTraces)} error traces
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              {selectedTraceIds.length === 2 ? (
                <Button
                  variant="primary"
                  size="sm"
                  icon={<GitCompare size={14} />}
                  onClick={() =>
                    navigate(`/traces/compare?a=${selectedTraceIds[0]}&b=${selectedTraceIds[1]}`)
                  }
                >
                  Compare selected
                </Button>
              ) : null}
              <Button
                variant={isLiveTail ? 'primary' : 'secondary'}
                size="sm"
                icon={<Radio size={14} />}
                onClick={() => setIsLiveTail(!isLiveTail)}
              >
                {isLiveTail ? 'Stop live tail' : 'Start live tail'}
              </Button>
            </div>
          </div>

          <div className="relative z-[70] grid items-start gap-3 lg:grid-cols-[minmax(320px,1fr)_220px]">
            <ObservabilityQueryBar
              fields={TRACE_FILTER_FIELDS}
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
              onClearAll={clearAll}
              placeholder="Search traces, operations, services, or IDs"
              rightSlot={
                <div
                  className={cn(
                    'flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs transition-colors',
                    errorsOnly
                      ? 'border-[rgba(240,68,56,0.35)] bg-[rgba(240,68,56,0.08)] text-[var(--color-error)]'
                      : 'border-[var(--border-color)] bg-[var(--bg-tertiary)] text-[var(--text-secondary)]'
                  )}
                >
                  <Activity size={13} />
                  Errors only
                  <Switch
                    size="sm"
                    checked={errorsOnly}
                    onChange={(event) => {
                      setErrorsOnly(event.target.checked);
                      setPage(1);
                    }}
                  />
                </div>
              }
            />
            <Select
              value={mode}
              onChange={(value) => {
                setMode(String(value));
                setPage(1);
              }}
              options={modeOptions}
            />
          </div>
        </div>
      </PageSurface>

      <div className="relative z-0 grid gap-4 xl:grid-cols-[300px_minmax(0,1fr)]">
        <FacetRail
          groups={facetGroups}
          selected={selectedFacetState}
          onSelect={(groupKey, value) => {
            if (groupKey === 'service_name') {
              setSelectedService(value);
              setPage(1);
              return;
            }
            if (groupKey === 'status') {
              setErrorsOnly(value === 'ERROR');
              setPage(1);
              return;
            }
            setFilters(upsertFacetFilter(filters, groupKey, value));
            setPage(1);
          }}
        />

        {isError && normalizedError && (
          <div className="mb-3 flex items-center gap-2 rounded-[var(--card-radius)] border border-[rgba(240,68,56,0.3)] bg-[rgba(240,68,56,0.08)] px-4 py-3 text-[var(--color-error)]">
            <AlertCircle size={16} className="shrink-0" />
            <span className="text-sm font-medium">
              {ERROR_CODE_LABELS[normalizedError.code] ?? 'Error'}
            </span>
            <span className="text-sm opacity-80">
              {normalizedError.message || 'Failed to load traces'}
            </span>
          </div>
        )}

        <ExplorerResultsTable
          title="Trace Explorer"
          subtitle={`${formatNumber(renderedTraces.length)} rows in view, ${formatNumber(totalTraces)} total traces`}
          rows={renderedTraces}
          columns={columns}
          rowKey={(row) => row.trace_id}
          isLoading={isLoading}
          page={page}
          pageSize={pageSize}
          total={isLiveTail ? renderedTraces.length : totalTraces}
          onPageChange={setPage}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setPage(1);
          }}
          onRow={(row) => ({
            onClick: () => setSelectedTrace(row),
          })}
          rowClassName={(row) =>
            cn(
              'cursor-pointer transition-colors hover:bg-[rgba(255,255,255,0.04)]',
              selectedTrace?.trace_id === row.trace_id &&
                'bg-[rgba(10,174,214,0.12)] ring-1 ring-inset ring-[rgba(10,174,214,0.28)]'
            )
          }
        />
      </div>

      {selectedTrace ? (
        <ObservabilityDetailPanel
          title="Trace Detail"
          titleBadge={renderTraceStatus(selectedTrace.status)}
          metaLine={formatTimestamp(selectedTrace.start_time)}
          metaRight={formatRelativeTime(selectedTrace.start_time)}
          summaryNode={
            <div className="space-y-1">
              <div className="text-sm font-semibold text-[var(--text-primary)]">
                {selectedTrace.operation_name}
              </div>
              <div className="text-xs text-[var(--text-secondary)]">
                {selectedTrace.service_name} • {formatDuration(selectedTrace.duration_ms)}
              </div>
            </div>
          }
          actions={
            <>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => navigate(`/traces/${selectedTrace.trace_id}`)}
              >
                View full trace
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  const params = new URLSearchParams({
                    filters: `trace_id:equals:${selectedTrace.trace_id}`,
                  });
                  navigate(`/logs?${params.toString()}`);
                }}
              >
                Related logs
              </Button>
            </>
          }
          fields={detailFields}
          rawData={selectedTrace}
          onClose={() => setSelectedTrace(null)}
        />
      ) : null}
    </PageShell>
  );
}
