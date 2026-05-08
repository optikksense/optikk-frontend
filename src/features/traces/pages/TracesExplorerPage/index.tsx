import { useNavigate } from "@tanstack/react-router";
import { useCallback, useMemo } from "react";

import { ExplorerHeader } from "@/features/explorer/components/chrome/ExplorerHeader";
import { SummaryStrip } from "@/features/explorer/components/chrome/SummaryStrip";
import { FacetRail } from "@/features/explorer/components/facets/FacetRail";
import { ResultsArea } from "@/features/explorer/components/list/ResultsArea";
import type { ColumnDef } from "@/features/explorer/types/results";
import type { ExplorerFilter } from "@/features/explorer/types/filters";
import { TrendHistogramStrip } from "@/features/explorer/components/trend/TrendHistogramStrip";
import { TRACE_TREND_SERIES } from "@/features/explorer/utils/trend";
import { SavedViewsDropdown } from "@/features/savedViews/components/SavedViewsDropdown";
import { formatErrorForDisplay } from "@shared/api/utils/errorNormalization";

import { CreateMonitorButton } from "../../components/CreateMonitorButton";
import { ExportButton } from "../../components/ExportButton";
import { ShareLinkButton } from "../../components/ShareLinkButton";
import { TraceScopeToggle } from "../../components/TraceScopeToggle";
import { TraceSortToggle } from "../../components/TraceSortToggle";
import { useSpansQuery } from "../../hooks/useSpansQuery";
import type { SpanRow } from "../../types/span";
import type { TraceSummary } from "../../types/trace";
import { getTraceRowId } from "./tracesColumns";
import { useTracesExplorerPage, type UseTracesExplorerPageReturn } from "./useTracesExplorerPage";

/** Three-zone traces explorer: query header + facet rail + scope-switched
 *  results body (traces or spans). Row click navigates to /traces/$traceId. */
export default function TracesExplorerPage() {
  const p = useTracesExplorerPage();
  return (
    <div className="flex h-full flex-col bg-[var(--bg-primary)]">
      <ExplorerHeader
        ref={p.searchInputRef}
        variant="dsl"
        filters={p.state.filters}
        onChangeFilters={(f: readonly ExplorerFilter[]) => p.state.setFilters(f)}
        onSubmitFreeText={p.onFreeText}
        actions={<SavedViewsDropdown scope="traces" onLoad={p.onLoadSavedView} />}
        kpiStrip={p.kpis.length > 0 ? <SummaryStrip kpis={p.kpis} /> : null}
      />
      <div className="flex flex-1 overflow-hidden">
        <FacetRail
          groups={p.facetGroups}
          onInclude={p.onInclude}
          onExclude={p.onExclude}
          activeFilterCount={p.state.filters.length}
          onClearAll={p.onClearFilters}
        />
        <div className="flex flex-1 flex-col overflow-hidden">
          <MainBody p={p} />
        </div>
      </div>
    </div>
  );
}

// ---------- scope-switched body ----------

function MainBody({ p }: { p: UseTracesExplorerPageReturn }) {
  return (
    <>
      <TraceScopeToggle
        scope={p.scope}
        onChange={p.setScope}
        trailing={
          <div className="flex items-center gap-3">
            <ExportButton traces={p.sortedTraces} />
            <CreateMonitorButton filters={p.state.filters} />
            <ShareLinkButton filters={p.state.filters} />
          </div>
        }
      />
      {p.scope === "spans" ? <SpansPane filters={p.state.filters} /> : <TracesPane p={p} />}
    </>
  );
}

// ---------- traces pane ----------

function getTraceRowClassName(row: TraceSummary): string {
  return row.has_error
    ? "border-l-2 border-red-500 bg-red-500/[0.03]"
    : "border-l-2 border-transparent";
}

function TracesPane({ p }: { p: UseTracesExplorerPageReturn }) {
  return (
    <>
      {p.trendBuckets.length > 0 ? (
        <TrendHistogramStrip
          buckets={p.trendBuckets}
          series={TRACE_TREND_SERIES}
          zoomed={p.zoomed}
          onTimeRangeChange={p.onTimeRangeChange}
        />
      ) : null}
      <TraceSortToggle mode={p.sortMode} onChange={p.setSortMode} />
      <ResultsArea<TraceSummary>
        rows={p.sortedTraces}
        columns={p.columnDefs}
        config={p.columnConfig}
        onConfigChange={p.setColumns}
        getRowId={getTraceRowId}
        onRowClick={p.onRowClick}
        getContextMenuItems={p.getContextMenuItems}
        resetKey={p.filterKey}
        loading={p.query.isPending}
        queryError={p.queryError}
        onRetry={p.onRetry}
        getRowClassName={getTraceRowClassName}
        emptyTitle="No traces"
        emptyDescription="Adjust filters or broaden the time range."
      />
    </>
  );
}

// ---------- spans pane ----------

function SpansPane({ filters }: { filters: readonly ExplorerFilter[] }) {
  const query = useSpansQuery({ filters });
  const navigate = useNavigate();
  const rows = query.data?.spans ?? [];
  const queryError = query.isError ? formatErrorForDisplay(query.error) : null;
  const onRowClick = useCallback(
    (row: SpanRow) =>
      navigate({
        to: `/traces/${encodeURIComponent(row.trace_id)}`,
        search: { span: row.span_id } as never,
      }),
    [navigate]
  );
  const onRetry = useCallback(() => {
    void query.refetch();
  }, [query]);
  const config = useMemo(() => SPAN_COLUMNS.map((c) => ({ key: c.key, visible: true })), []);
  return (
    <ResultsArea<SpanRow>
      rows={rows}
      columns={SPAN_COLUMNS}
      config={config}
      onConfigChange={() => {}}
      getRowId={(r) => r.span_id}
      onRowClick={onRowClick}
      resetKey={JSON.stringify(filters)}
      loading={query.isPending}
      queryError={queryError}
      onRetry={onRetry}
      emptyTitle="No spans"
      emptyDescription="Adjust filters or broaden the time range."
    />
  );
}

const SPAN_COLUMNS: readonly ColumnDef<SpanRow>[] = [
  {
    key: "timestamp",
    label: "Time",
    width: 170,
    render: (row) => (
      <span className="font-mono text-xs text-[var(--text-secondary)]">
        {new Date(row.timestamp_ns / 1_000_000).toISOString().slice(11, 23)}
      </span>
    ),
  },
  {
    key: "duration",
    label: "Duration",
    width: 100,
    render: (row) => (
      <span className="font-mono text-xs" style={{ color: row.has_error ? "#e8494d" : undefined }}>
        {formatMs(row.duration_ms)}
      </span>
    ),
  },
  {
    key: "service_name",
    label: "Service",
    width: 160,
    render: (row) => <span className="truncate text-sm">{row.service_name}</span>,
  },
  {
    key: "operation",
    label: "Operation",
    render: (row) => <span className="truncate text-sm">{row.operation}</span>,
  },
  {
    key: "kind",
    label: "Kind",
    width: 90,
    render: (row) => <span className="font-mono text-xs">{row.kind ?? ""}</span>,
  },
  {
    key: "status",
    label: "Status",
    width: 96,
    render: (row) => <SpanStatusBadge status={row.status} hasError={row.has_error} />,
  },
  {
    key: "http_method",
    label: "Method",
    width: 80,
    render: (row) => (
      <span className="font-mono text-xs uppercase">{row.http_method ?? ""}</span>
    ),
  },
  {
    key: "http_status",
    label: "HTTP",
    width: 72,
    render: (row) => (
      <span className="font-mono text-xs">{row.response_status_code ?? ""}</span>
    ),
  },
  {
    key: "trace_id",
    label: "Trace",
    width: 140,
    render: (row) => (
      <span className="truncate font-mono text-[11px] text-[var(--text-muted)]">
        {row.trace_id.slice(0, 12)}…
      </span>
    ),
  },
];

function SpanStatusBadge({ status, hasError }: { status: string | undefined; hasError: boolean }) {
  const color = hasError ? "#e8494d" : status === "OK" ? "#73bf69" : "#7e8ea0";
  const label = hasError ? "ERROR" : status || "UNSET";
  return (
    <span
      className="inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase"
      style={{ backgroundColor: `${color}22`, color }}
    >
      {label}
    </span>
  );
}

function formatMs(ms: number): string {
  if (!Number.isFinite(ms) || ms <= 0) return "—";
  if (ms >= 1000) return `${(ms / 1000).toFixed(2)}s`;
  return `${Math.round(ms)}ms`;
}
