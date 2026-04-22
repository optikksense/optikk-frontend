import { lazy, Suspense, useCallback, useMemo } from "react";

import { useAppStore, useTimeRange } from "@/app/store/appStore";
import { ExplorerHeader } from "@/features/explorer/components/chrome/ExplorerHeader";
import { SummaryStrip, type SummaryKPI } from "@/features/explorer/components/chrome/SummaryStrip";
import { DetailDrawer } from "@/features/explorer/components/detail/DetailDrawer";
import { FacetRail } from "@/features/explorer/components/facets/FacetRail";
import type { FacetGroupModel } from "@/features/explorer/components/facets/FacetGroup";
import { ResultsArea } from "@/features/explorer/components/list/ResultsArea";
import { TrendHistogramStrip } from "@/features/explorer/components/trend/TrendHistogramStrip";
import { useExplorerColumns } from "@/features/explorer/hooks/useExplorerColumns";
import type { ExplorerFilter, ExplorerMode } from "@/features/explorer/types/filters";
import { LOG_TREND_SERIES, toTrendBuckets } from "@/features/explorer/utils/trend";

import { DEFAULT_LOG_COLUMNS } from "../../config/columns";
import { useLogsExplorer } from "../../hooks/useLogsExplorer";
import type { LogRecord } from "../../types/log";
import { LOG_COLUMN_DEFS, getLogRowId } from "./logsColumns";
import { LogsAnalyticsSection } from "./LogsAnalyticsSection";

const LogDetailDrawerBody = lazy(() => import("../../components/LogDetailDrawer"));

/**
 * Three-zone Datadog-classic layout for the logs explorer:
 *  - ExplorerHeader  (search + time + mode toggle + KPIs)
 *  - FacetRail       (collapsible left rail)
 *  - ResultsArea     (header + column picker + virtualized list)
 *  - DetailDrawer    (right slide-in, URL-backed via `detail` param)
 *  - LogsAnalyticsSection (swapped in when mode=analytics)
 */
export default function LogsExplorerPage() {
  const { state, query } = useLogsExplorer({ include: ["summary", "facets", "trend"] });
  const { columns: columnConfig, setColumns } = useExplorerColumns("logs", DEFAULT_LOG_COLUMNS);

  const results: readonly LogRecord[] = useMemo(
    () => query.data?.results ?? [],
    [query.data?.results],
  );

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
    (row: LogRecord) => state.setDetail(getLogRowId(row)),
    [state],
  );

  const filterKey = useMemo(() => JSON.stringify(state.filters), [state.filters]);

  return (
    <div className="flex h-full flex-col bg-[var(--bg-primary)]">
      <ExplorerHeader
        filters={state.filters}
        onChangeFilters={(f: readonly ExplorerFilter[]) => state.setFilters(f)}
        onSubmitFreeText={(text: string) => {
          if (!text) return;
          state.setFilters([...state.filters, { field: "body", op: "contains", value: text }]);
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
              series={LOG_TREND_SERIES}
              zoomed={timeRange.kind === "absolute"}
              onTimeRangeChange={onTimeRangeChange}
            />
          ) : null}
          {state.mode === "analytics" ? (
            <LogsAnalyticsSection filters={state.filters} />
          ) : (
            <ResultsArea<LogRecord>
              rows={results}
              columns={LOG_COLUMN_DEFS}
              config={columnConfig}
              onConfigChange={setColumns}
              getRowId={getLogRowId}
              onRowClick={onRowClick}
              selectedId={state.detail}
              resetKey={filterKey}
              loading={query.isPending}
              emptyTitle="No logs"
              emptyDescription="Adjust filters or broaden the time range."
            />
          )}
        </div>
      </div>
      <DetailDrawer
        open={Boolean(state.detail)}
        onOpenChange={(o) => (o ? null : state.setDetail(null))}
        title="Log detail"
      >
        {state.detail ? (
          <Suspense fallback={<div className="p-4 text-sm">Loading…</div>}>
            <LogDetailDrawerBody logId={state.detail} onClose={() => state.setDetail(null)} />
          </Suspense>
        ) : null}
      </DetailDrawer>
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
  if (field === "severity_bucket" || field === "severity") return "Severity";
  return field.charAt(0).toUpperCase() + field.slice(1).replace(/_/g, " ");
}

function buildKPIs(summary: { total: number; errors: number } | undefined): SummaryKPI[] {
  if (!summary) return [];
  const errorRate = summary.total > 0 ? (summary.errors / summary.total) * 100 : 0;
  return [
    { label: "Logs", value: formatCompact(summary.total) },
    { label: "Errors", value: formatCompact(summary.errors), tone: summary.errors > 0 ? "error" : "default" },
    { label: "Error rate", value: `${errorRate.toFixed(2)}%`, tone: errorRate > 5 ? "error" : "default" },
  ];
}

function formatCompact(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return String(n);
}
