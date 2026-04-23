import { useCallback, useMemo } from "react";
import { useNavigate } from "@tanstack/react-router";

import { useAppStore, useTimeRange } from "@/app/store/appStore";
import { ExplorerHeader } from "@/features/explorer/components/chrome/ExplorerHeader";
import { SummaryStrip, type SummaryKPI } from "@/features/explorer/components/chrome/SummaryStrip";
import { FacetRail } from "@/features/explorer/components/facets/FacetRail";
import type { FacetGroupModel } from "@/features/explorer/components/facets/FacetGroup";
import { ResultsArea } from "@/features/explorer/components/list/ResultsArea";
import { TrendHistogramStrip } from "@/features/explorer/components/trend/TrendHistogramStrip";
import { useExplorerColumns } from "@/features/explorer/hooks/useExplorerColumns";
import type { ExplorerFilter, ExplorerMode } from "@/features/explorer/types/filters";
import { TRACE_TREND_SERIES, toTrendBuckets } from "@/features/explorer/utils/trend";
import { formatErrorForDisplay } from "@shared/api/utils/errorNormalization";

import { DEFAULT_TRACE_COLUMNS } from "../../config/columns";
import { useTracesExplorer } from "../../hooks/useTracesExplorer";
import type { TraceSummary } from "../../types/trace";
import { TRACE_COLUMN_DEFS, getTraceRowId } from "./tracesColumns";
import { TracesAnalyticsSection } from "./TracesAnalyticsSection";

/**
 * Three-zone traces explorer. Row click navigates to /traces/$traceId
 * (untouched TraceDetailPage) — no side drawer on this scope since the
 * waterfall + span drawer live on that dedicated page.
 */
export default function TracesExplorerPage() {
  const { state, query, traces } = useTracesExplorer({ include: ["summary", "facets", "trend"] });
  const navigate = useNavigate();
  const { columns: columnConfig, setColumns } = useExplorerColumns("traces", DEFAULT_TRACE_COLUMNS);

  const facetGroups = useMemo<FacetGroupModel[]>(
    () => facetsToGroups(query.data?.facets),
    [query.data?.facets],
  );

  const kpis = useMemo<SummaryKPI[]>(() => buildKPIs(query.data?.summary), [query.data?.summary]);

  const trendBuckets = useMemo(() => toTrendBuckets(query.data?.trend), [query.data?.trend]);
  const setCustomTimeRange = useAppStore((s) => s.setCustomTimeRange);
  const timeRange = useTimeRange();
  const onTimeRangeChange = useCallback(
    (fromMs: number, toMs: number) => setCustomTimeRange(fromMs, toMs, "Brush"),
    [setCustomTimeRange],
  );

  const onInclude = useCallback(
    (field: string, value: string) =>
      state.setFilters([...state.filters, { field, op: "eq", value }]),
    [state],
  );
  const onExclude = useCallback(
    (field: string, value: string) =>
      state.setFilters([...state.filters, { field, op: "neq", value }]),
    [state],
  );
  const onRowClick = useCallback(
    (row: TraceSummary) => navigate({ to: `/traces/${encodeURIComponent(row.trace_id)}` }),
    [navigate],
  );

  const filterKey = useMemo(() => JSON.stringify(state.filters), [state.filters]);

  const queryError = query.isError ? formatErrorForDisplay(query.error) : null;

  return (
    <div className="flex h-full flex-col bg-[var(--bg-primary)]">
      <ExplorerHeader
        filters={state.filters}
        onChangeFilters={(f: readonly ExplorerFilter[]) => state.setFilters(f)}
        onSubmitFreeText={(text: string) => {
          if (!text) return;
          state.setFilters([...state.filters, { field: "search", op: "contains", value: text }]);
        }}
        mode={state.mode}
        onModeChange={(m: ExplorerMode) => state.setMode(m)}
        kpiStrip={kpis.length > 0 ? <SummaryStrip kpis={kpis} /> : null}
      />
      <div className="flex flex-1 overflow-hidden">
        <FacetRail groups={facetGroups} onInclude={onInclude} onExclude={onExclude} />
        <div className="flex flex-1 flex-col overflow-hidden">
          {trendBuckets.length > 0 ? (
            <TrendHistogramStrip
              buckets={trendBuckets}
              series={TRACE_TREND_SERIES}
              zoomed={timeRange.kind === "absolute"}
              onTimeRangeChange={onTimeRangeChange}
            />
          ) : null}
          {state.mode === "analytics" ? (
            <TracesAnalyticsSection filters={state.filters} />
          ) : (
            <ResultsArea<TraceSummary>
              rows={traces}
              columns={TRACE_COLUMN_DEFS}
              config={columnConfig}
              onConfigChange={setColumns}
              getRowId={getTraceRowId}
              onRowClick={onRowClick}
              resetKey={filterKey}
              loading={query.isPending}
              queryError={queryError}
              onRetry={() => {
                void query.refetch();
              }}
              emptyTitle="No traces"
              emptyDescription="Adjust filters or broaden the time range."
            />
          )}
        </div>
      </div>
    </div>
  );
}

function facetsToGroups(
  facets: Record<string, Array<{ value: string; count: number }>> | undefined,
): FacetGroupModel[] {
  if (!facets) return [];
  return Object.entries(facets).map(([field, buckets]) => ({
    field,
    label: humanLabel(field),
    buckets,
  }));
}

function humanLabel(field: string): string {
  if (field === "service") return "Service";
  if (field === "operation") return "Operation";
  if (field === "http_method") return "Method";
  if (field === "http_status") return "HTTP";
  if (field === "status") return "Status";
  return field.charAt(0).toUpperCase() + field.slice(1).replace(/_/g, " ");
}

function buildKPIs(summary: { total: number; errors: number } | undefined): SummaryKPI[] {
  if (!summary) return [];
  const errorRate = summary.total > 0 ? (summary.errors / summary.total) * 100 : 0;
  return [
    { label: "Traces", value: formatCompact(summary.total) },
    { label: "Errors", value: formatCompact(summary.errors), tone: summary.errors > 0 ? "error" : "default" },
    { label: "Error rate", value: `${errorRate.toFixed(2)}%`, tone: errorRate > 5 ? "error" : "default" },
  ];
}

function formatCompact(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return String(n);
}
