import { Activity, AlertCircle, FileText, Radio, Share2 } from "lucide-react";

import { ERROR_CODE_LABELS } from "@/shared/constants/errorCodes";
import { useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

import { Badge, Button, Switch } from "@/components/ui";
import type { SimpleTableColumn } from "@/components/ui";
import { ExplorerResultsTable, FacetRail } from "@/features/explorer-core/components";
import {
  type AggregationSpec,
  AnalyticsToolbar,
  type ExplorerVizMode,
} from "@/features/explorer-core/components/AnalyticsToolbar";
import { AnalyticsPieChart } from "@/features/explorer-core/components/visualizations/AnalyticsPieChart";
import { AnalyticsTable } from "@/features/explorer-core/components/visualizations/AnalyticsTable";
import { AnalyticsTimeseries } from "@/features/explorer-core/components/visualizations/AnalyticsTimeseries";
import { AnalyticsTopList } from "@/features/explorer-core/components/visualizations/AnalyticsTopList";
import { LOGS_QUERY_FIELDS } from "@/features/explorer-core/constants/fields";
import { useExplorerAnalytics } from "@/features/explorer-core/hooks/useExplorerAnalytics";
import { buildLogsExplorerQuery } from "@/features/explorer-core/utils/explorerQuery";
import { resolveTimeBounds } from "@/features/explorer-core/utils/timeRange";
import { cn } from "@/lib/utils";
import type { StructuredFilter } from "@/shared/hooks/useURLFilters";
import { useURLFilters } from "@/shared/hooks/useURLFilters";
import { useTimeRange } from "@app/store/appStore";
import { toApiErrorShape } from "@shared/api/utils/errorNormalization";
import {
  ObservabilityDetailPanel,
  ObservabilityQueryBar,
  PageHeader,
  PageShell,
  PageSurface,
} from "@shared/components/ui";
import { formatNumber, formatRelativeTime } from "@shared/utils/formatters";
import { rowKey as logRowKey, parseTimestampMs } from "@shared/utils/logUtils";
import { tsLabel } from "@shared/utils/time";

import { LogsNavTabs } from "../../components/LogsNavTabs";
import { LevelBadge } from "../../components/log/LogRow";
import { useLogDetailFields } from "../../hooks/useLogDetailFields";
import { LOGS_LIVE_TAIL_MAX_ROWS, useLogsHubData } from "../../hooks/useLogsHubData";
import type { LogRecord, LogsBackendParams } from "../../types";
import {
  LOGS_URL_FILTER_CONFIG,
  LOG_FILTER_FIELDS,
  compileLogsStructuredFilters,
  toDisplayText,
  upsertLogFacetFilter,
} from "../../utils/logUtils";

const LOG_METRIC_FIELDS = [
  { value: "duration", label: "duration (logs)" },
  { value: "body", label: "body" },
];

const LOG_LEVEL_SORT_ORDER: Record<string, number> = {
  TRACE: 0,
  DEBUG: 1,
  INFO: 2,
  WARN: 3,
  WARNING: 3,
  ERROR: 4,
  FATAL: 5,
};

function compareText(left: unknown, right: unknown): number {
  return String(left ?? "").localeCompare(String(right ?? ""), undefined, { sensitivity: "base" });
}

/** Table sorter — must handle OTLP/log ns integers from WebSocket, not only ISO strings. */
function compareTimestamp(left: unknown, right: unknown): number {
  return parseTimestampMs(left) - parseTimestampMs(right);
}

function formatLiveTailStatus(
  status: "idle" | "connecting" | "live" | "closed" | "error",
  lagMs: number
): string {
  if (status === "live") return `${Math.max(0, lagMs)}ms lag`;
  if (status === "closed") return "session ended";
  if (status === "error") return "stream error";
  return "connecting";
}

export default function LogsHubPage() {
  const navigate = useNavigate();
  const timeRange = useTimeRange();

  const {
    values: urlValues,
    setters: urlSetters,
    structuredFilters: filters,
    setStructuredFilters: setFilters,
    clearAll: clearURLFilters,
  } = useURLFilters(LOGS_URL_FILTER_CONFIG);

  const errorsOnly = urlValues.errorsOnly === true;

  const setErrorsOnly = (value: boolean): void => {
    urlSetters.errorsOnly?.(value);
  };

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [selectedLog, setSelectedLog] = useState<LogRecord | null>(null);

  const [explorerMode, setExplorerMode] = useState<"list" | "analytics">("list");
  const [vizMode, setVizMode] = useState<ExplorerVizMode>("table");
  const [groupBy, setGroupBy] = useState<string[]>(["service"]);
  const [aggregations, setAggregations] = useState<AggregationSpec[]>([
    { function: "count", alias: "count" },
  ]);
  const [analyticsStep, setAnalyticsStep] = useState("5m");

  const explorerQuery = useMemo(
    () => buildLogsExplorerQuery({ filters, errorsOnly }),
    [filters, errorsOnly]
  );

  const liveTailParams = useMemo((): LogsBackendParams => {
    const params: LogsBackendParams = {
      ...compileLogsStructuredFilters(filters),
    };
    if (errorsOnly) {
      params.severities = [...(params.severities ?? []), "ERROR"];
    }
    return params;
  }, [errorsOnly, filters]);

  const { startTime, endTime } = useMemo(() => resolveTimeBounds(timeRange), [timeRange]);

  const analyticsEnabled =
    explorerMode === "analytics" && groupBy.length > 0 && aggregations.length > 0;

  const analyticsQuery = useExplorerAnalytics("logs", {
    query: explorerQuery,
    startTime,
    endTime,
    groupBy,
    aggregations: aggregations.map((a) => ({
      function: a.function,
      field: a.field,
      alias: a.alias || "m",
    })),
    vizMode: vizMode === "list" ? "table" : vizMode,
    step: analyticsStep,
    limit: 500,
    enabled: analyticsEnabled,
  });

  const {
    logs,
    logsLoading,
    logsError,
    logsErrorDetail,
    total,
    serviceFacets,
    levelFacets,
    hostFacets,
    podFacets,
    containerFacets,
    environmentFacets,
    scopeNameFacets,
    liveTailEnabled,
    setLiveTailEnabled,
    liveTailStatus,
    liveTailLagMs,
    liveTailErrorMessage,
    liveTailDroppedCount,
    errorCount,
  } = useLogsHubData({
    explorerQuery,
    filters,
    liveTailParams,
    page,
    pageSize,
  });

  const detailFields = useLogDetailFields(selectedLog);
  const normalizedLogsError = useMemo(
    () => (logsErrorDetail ? toApiErrorShape(logsErrorDetail) : null),
    [logsErrorDetail]
  );

  const activeSelections = useMemo(
    () => ({
      service_name:
        filters.find((filter) => filter.field === "service_name" && filter.operator === "equals")
          ?.value ?? null,
      level: errorsOnly
        ? "ERROR"
        : (filters.find((filter) => filter.field === "level" && filter.operator === "equals")
            ?.value ?? null),
      host: filters.find((f) => f.field === "host")?.value ?? null,
      pod: filters.find((f) => f.field === "pod")?.value ?? null,
      container: filters.find((f) => f.field === "container")?.value ?? null,
      environment: filters.find((f) => f.field === "environment")?.value ?? null,
      scope_name: filters.find((f) => f.field === "logger")?.value ?? null,
    }),
    [errorsOnly, filters]
  );

  const columns = useMemo<SimpleTableColumn<LogRecord>[]>(
    () => [
      {
        title: "Time",
        key: "timestamp",
        dataIndex: "timestamp",
        width: 168,
        // Live tail rows are pre-sorted newest-first; disable client sort so order stays correct.
        ...(liveTailEnabled
          ? {}
          : {
              sorter: (left: LogRecord, right: LogRecord) =>
                compareTimestamp(left.timestamp, right.timestamp),
              defaultSortOrder: "descend" as const,
            }),
        render: (value, row) => {
          const timestamp =
            value instanceof Date || typeof value === "string" || typeof value === "number"
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
        title: "Level",
        key: "level",
        dataIndex: "level",
        width: 90,
        ...(liveTailEnabled
          ? {}
          : {
              sorter: (left: LogRecord, right: LogRecord) =>
                (LOG_LEVEL_SORT_ORDER[
                  String(left.level ?? left.severity_text ?? "INFO").toUpperCase()
                ] ?? 0) -
                (LOG_LEVEL_SORT_ORDER[
                  String(right.level ?? right.severity_text ?? "INFO").toUpperCase()
                ] ?? 0),
            }),
        render: (value, row) => <LevelBadge level={String(value ?? row.severity_text ?? "INFO")} />,
      },
      {
        title: "Service",
        key: "service_name",
        dataIndex: "service_name",
        width: 160,
        ...(liveTailEnabled
          ? {}
          : {
              sorter: (left: LogRecord, right: LogRecord) =>
                compareText(left.service_name ?? left.service, right.service_name ?? right.service),
            }),
        render: (value) => (
          <span className="font-medium text-[12.5px] text-[var(--text-primary)]">
            {toDisplayText(value)}
          </span>
        ),
      },
      {
        title: "Host",
        key: "host",
        dataIndex: "host",
        width: 148,
        ...(liveTailEnabled
          ? {}
          : {
              sorter: (left: LogRecord, right: LogRecord) =>
                compareText(left.host ?? left.pod, right.host ?? right.pod),
            }),
        render: (value, row) => (
          <span className="text-[12px] text-[var(--text-secondary)]">
            {toDisplayText(value || row.pod)}
          </span>
        ),
      },
      {
        title: "Message",
        key: "message",
        dataIndex: "message",
        ...(liveTailEnabled
          ? {}
          : {
              sorter: (left: LogRecord, right: LogRecord) =>
                compareText(left.message ?? left.body, right.message ?? right.body),
            }),
        render: (value, row) => (
          <button
            type="button"
            className="line-clamp-2 max-w-full text-left text-[12.5px] text-[var(--text-primary)] leading-6 hover:text-white"
            onClick={() => setSelectedLog(row)}
          >
            {toDisplayText(value ?? row.body)}
          </button>
        ),
      },
      {
        title: "Trace",
        key: "trace_id",
        dataIndex: "trace_id",
        width: 150,
        ...(liveTailEnabled
          ? {}
          : {
              sorter: (left: LogRecord, right: LogRecord) =>
                compareText(left.trace_id ?? left.traceId, right.trace_id ?? right.traceId),
            }),
        render: (value) => (
          <span className="font-mono text-[11px] text-[var(--text-muted)]">
            {value ? String(value).slice(0, 12) : "—"}
          </span>
        ),
      },
    ],
    [liveTailEnabled]
  );

  const facetGroups = useMemo(
    () => [
      { key: "service_name", label: "Service", buckets: serviceFacets },
      { key: "level", label: "Severity", buckets: levelFacets },
      { key: "host", label: "Host", buckets: hostFacets },
      { key: "pod", label: "Pod", buckets: podFacets },
      { key: "container", label: "Container", buckets: containerFacets },
      { key: "environment", label: "Environment", buckets: environmentFacets },
      { key: "scope_name", label: "Scope / logger", buckets: scopeNameFacets },
    ],
    [
      containerFacets,
      environmentFacets,
      hostFacets,
      levelFacets,
      podFacets,
      scopeNameFacets,
      serviceFacets,
    ]
  );

  const analyticsData = analyticsQuery.data;

  return (
    <PageShell>
      <PageHeader
        title="Logs"
        icon={<FileText size={22} />}
        subtitle="Search, filter, and pivot through dense log streams without leaving the investigative thread."
        actions=<Button
          variant="ghost"
          size="sm"
          icon={<Share2 size={14} />}
          onClick={async () => {
            await navigator.clipboard.writeText(window.location.href);
            toast.success("Share link copied");
          }}
        >
          Share
        </Button>
      />

      <PageSurface padding="lg" className="relative z-[40] overflow-visible">
        <div className="flex flex-col gap-4">
          {liveTailEnabled && liveTailErrorMessage ? (
            <div className="flex items-center gap-2 rounded-[var(--card-radius)] border border-[rgba(240,68,56,0.35)] bg-[rgba(240,68,56,0.08)] px-4 py-2.5 text-[13px] text-[var(--color-error)]">
              <AlertCircle size={16} className="shrink-0" />
              <span className="font-medium">Live tail disconnected</span>
              <span className="opacity-90">{liveTailErrorMessage}</span>
            </div>
          ) : null}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Badge variant="info">All logs</Badge>
              {liveTailEnabled ? (
                <Badge variant={liveTailStatus === "live" ? "warning" : "default"}>
                  {liveTailStatus === "live" ? `${Math.max(0, liveTailLagMs)}ms lag` : "connecting"}
                </Badge>
              ) : null}
              <Badge variant={errorCount > 0 ? "error" : "default"}>
                {formatNumber(errorCount)} error logs
              </Badge>
              {liveTailEnabled && liveTailDroppedCount > 0 ? (
                <Badge variant="error">{formatNumber(liveTailDroppedCount)} dropped</Badge>
              ) : null}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={liveTailEnabled ? "primary" : "secondary"}
                size="sm"
                icon={<Radio size={14} />}
                onClick={() => setLiveTailEnabled(!liveTailEnabled)}
              >
                {liveTailEnabled ? "Stop live tail" : "Start live tail"}
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

          <div className="relative z-[70] grid items-start gap-3 lg:grid-cols-[minmax(320px,1fr)_220px]">
            <ObservabilityQueryBar
              fields={LOG_FILTER_FIELDS}
              filters={filters}
              setFilters={(nextFilters: StructuredFilter[]) => {
                setFilters(nextFilters);
                setPage(1);
              }}
              onClearAll={() => {
                clearURLFilters();
                setPage(1);
              }}
              placeholder="service:web AND status:error — or use Search filter"
              rightSlot={
                <div
                  className={cn(
                    "flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs transition-colors",
                    errorsOnly
                      ? "border-[rgba(240,68,56,0.35)] bg-[rgba(240,68,56,0.08)] text-[var(--color-error)]"
                      : "border-[var(--border-color)] bg-[var(--bg-tertiary)] text-[var(--text-secondary)]"
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
            <div className="hidden lg:block" aria-hidden />
          </div>

          <AnalyticsToolbar
            mode={explorerMode}
            onModeChange={setExplorerMode}
            vizMode={vizMode}
            onVizModeChange={setVizMode}
            groupBy={groupBy}
            onGroupByChange={setGroupBy}
            aggregations={aggregations}
            onAggregationsChange={setAggregations}
            step={analyticsStep}
            onStepChange={setAnalyticsStep}
            fieldOptions={[...LOGS_QUERY_FIELDS]}
            metricFields={LOG_METRIC_FIELDS}
          />
        </div>
      </PageSurface>

      <div
        className={cn(
          "relative z-0 grid gap-4",
          explorerMode === "list" ? "xl:grid-cols-[300px_minmax(0,1fr)]" : "grid-cols-1"
        )}
      >
        {explorerMode === "list" ? (
          <FacetRail
            groups={facetGroups}
            selected={activeSelections}
            onSelect={(groupKey, value) => {
              if (groupKey === "level") {
                setErrorsOnly(false);
              }
              if (groupKey === "scope_name") {
                setFilters(upsertLogFacetFilter(filters, "logger", value));
                setPage(1);
                return;
              }
              setFilters(upsertLogFacetFilter(filters, groupKey, value));
              setPage(1);
            }}
          />
        ) : null}

        {logsError && normalizedLogsError && explorerMode === "list" && (
          <div className="mb-3 flex items-center gap-2 rounded-[var(--card-radius)] border border-[rgba(240,68,56,0.3)] bg-[rgba(240,68,56,0.08)] px-4 py-3 text-[var(--color-error)]">
            <AlertCircle size={16} className="shrink-0" />
            <span className="font-medium text-sm">
              {ERROR_CODE_LABELS[normalizedLogsError.code] ?? "Error"}
            </span>
            <span className="text-sm opacity-80">
              {normalizedLogsError.message || "Failed to load logs"}
            </span>
          </div>
        )}

        {explorerMode === "list" ? (
          <ExplorerResultsTable
            key={liveTailEnabled ? "logs-live-tail" : "logs-explorer"}
            title="Logs Explorer"
            subtitle={
              liveTailEnabled
                ? `${formatNumber(logs.length)} live tail rows`
                : `${formatNumber(logs.length)} rows in view, ${formatNumber(total)} total matches`
            }
            rows={logs}
            columns={columns}
            rowKey={(row) => logRowKey(row)}
            isLoading={logsLoading}
            page={page}
            pageSize={pageSize}
            total={liveTailEnabled ? logs.length : total}
            showPagination={!liveTailEnabled}
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
                "cursor-pointer transition-colors hover:bg-[rgba(255,255,255,0.04)]",
                selectedLog?.timestamp === row.timestamp &&
                  "bg-[rgba(10,174,214,0.12)] ring-1 ring-[rgba(10,174,214,0.28)] ring-inset"
              )
            }
          />
        ) : (
          <PageSurface padding="lg" className="min-h-[320px]">
            {analyticsQuery.isLoading ? (
              <div className="text-[13px] text-[var(--text-muted)]">Loading analytics…</div>
            ) : analyticsQuery.isError ? (
              <div className="text-[13px] text-[var(--color-error)]">Analytics request failed.</div>
            ) : analyticsData ? (
              <div className="space-y-4">
                {vizMode === "timeseries" ? <AnalyticsTimeseries result={analyticsData} /> : null}
                {vizMode === "toplist" ? <AnalyticsTopList result={analyticsData} /> : null}
                {vizMode === "table" || vizMode === "list" ? (
                  <AnalyticsTable result={analyticsData} />
                ) : null}
                {vizMode === "piechart" ? <AnalyticsPieChart result={analyticsData} /> : null}
              </div>
            ) : (
              <div className="text-[13px] text-[var(--text-muted)]">
                Configure group by and metrics.
              </div>
            )}
          </PageSurface>
        )}
      </div>

      {selectedLog ? (
        <ObservabilityDetailPanel
          title="Log Detail"
          titleBadge={<LevelBadge level={String(selectedLog.level ?? selectedLog.severity_text)} />}
          metaLine={tsLabel(selectedLog.timestamp)}
          metaRight={formatRelativeTime(selectedLog.timestamp)}
          summaryNode={
            <div className="text-[12px] text-[var(--text-primary)] leading-6">
              {toDisplayText(selectedLog.body ?? selectedLog.message)}
            </div>
          }
          actions={
            selectedLog.trace_id || selectedLog.traceId ? (
              <Button
                variant="secondary"
                size="sm"
                onClick={() =>
                  navigate({
                    to: `/traces/${encodeURIComponent(
                      selectedLog.trace_id || selectedLog.traceId || ""
                    )}` as any,
                  })
                }
              >
                Open Trace
              </Button>
            ) : null
          }
          fields={detailFields}
          rawData={selectedLog}
          onClose={() => setSelectedLog(null)}
        />
      ) : null}
    </PageShell>
  );
}
