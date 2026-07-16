import { useCallback, useMemo, useRef } from "react";

import { useAppStore, useTimeRange } from "@/app/store/appStore";
import { ExplorerHeader } from "@shared/search/components/chrome/ExplorerHeader";
import { ExplorerLayout } from "@shared/search/components/chrome/ExplorerLayout";
import type { SuggestionOption } from "@shared/search/components/chrome/QuerySuggestions";
import { StatPill } from "@shared/search/components/chrome/StatPill";
import type { ExplorerFilter } from "@shared/search/types/filters";

import { resolveTimeRangeBounds } from "@shared/types";
import { formatNumber } from "@shared/utils/formatters";

import type { LogsFacets } from "@shared/logs/api/logsAnalyticsApi";
import { useLogsExplorerStore } from "@shared/logs/store/logsExplorerStore";
import type { LogRecord } from "@shared/logs/types/log";
import { SEVERITY_STYLES } from "@shared/logs/utils/severity";
import { useLogsExplorer } from "../../hooks/useLogsExplorer";

import { LogDetailDrawer } from "@shared/logs/components/detail/LogDetailDrawer";
import { LogsFacetPanel } from "../../components/facets/LogsFacetPanel";

import { LogsTable } from "@shared/logs/components/table/LogsTable";
import { LogsTableFooter } from "@shared/logs/components/table/LogsTableFooter";
import { LogsTableToolbar } from "@shared/logs/components/table/LogsTableToolbar";
import { LogsActions } from "../../components/toolbar/LogsActions";
import { LogsTrendChart } from "../../components/trend/LogsTrendChart";

function extractSearchTerm(filters: readonly ExplorerFilter[]): string | undefined {
  const f = filters.find(
    (x) => (x.field === "body" || x.field === "search") && (x.op === "contains" || x.op === "eq")
  );
  return f?.value || undefined;
}

function buildValueSuggestions(
  facets: LogsFacets | undefined
): Readonly<Record<string, readonly SuggestionOption[]>> {
  const suggestions: Record<string, readonly SuggestionOption[]> = {
    severity_text: SEVERITY_STYLES.map((s) => ({
      value: s.label.toUpperCase(),
      label: s.label.toUpperCase(),
      hint: s.shortLabel,
    })),
  };
  if (facets?.service.length) {
    suggestions.service_name = facets.service.map((i) => ({
      value: i.value,
      label: i.value,
      hint: i.count.toLocaleString(),
    }));
  }
  if (facets?.host?.length) {
    suggestions.host = facets.host.map((i) => ({ value: i.value, label: i.value }));
  }
  if (facets?.pod?.length) {
    suggestions.pod = facets.pod.map((i) => ({ value: i.value, label: i.value }));
  }
  if (facets?.environment?.length) {
    suggestions.environment = facets.environment.map((i) => ({ value: i.value, label: i.value }));
  }
  return suggestions;
}

/**
 * Main logs explorer page — composes all zones: toolbar, facets, trend chart,
 * table, and detail panel. Matches the DOM shape of TracesExplorerPage.
 */
export default function LogsExplorerPage() {
  const { state, list, summary, trend, facets } = useLogsExplorer();
  const timeRange = useTimeRange();
  const { startTime, endTime } = useMemo(() => resolveTimeRangeBounds(timeRange), [timeRange]);
  const setCustomTimeRange = useAppStore((s) => s.setCustomTimeRange);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const goNextPage = useLogsExplorerStore((s) => s.goNextPage);
  const goPrevPage = useLogsExplorerStore((s) => s.goPrevPage);

  const searchTerm = useMemo(() => extractSearchTerm(state.filters), [state.filters]);
  const valueSuggestions = useMemo(() => buildValueSuggestions(facets.data), [facets.data]);

  const onInclude = useCallback(
    (field: string, value: string) =>
      state.setFilters([...state.filters, { field, op: "eq", value }]),
    [state]
  );
  const onExclude = useCallback(
    (field: string, value: string) =>
      state.setFilters([...state.filters, { field, op: "neq", value }]),
    [state]
  );
  const onClearFilters = useCallback(() => state.setFilters([]), [state]);
  const onRowClick = useCallback((row: LogRecord) => state.setDetail(row.id), [state]);
  const onTimeRangeChange = useCallback(
    (fromMs: number, toMs: number) => setCustomTimeRange(fromMs, toMs, "Brush"),
    [setCustomTimeRange]
  );

  const results = list.results;
  const detailIdx = state.detail ? results.findIndex((r) => r.id === state.detail) : -1;
  const onDetailPrev = detailIdx > 0 ? () => state.setDetail(results[detailIdx - 1].id) : undefined;
  const onDetailNext =
    detailIdx >= 0 && detailIdx < results.length - 1
      ? () => state.setDetail(results[detailIdx + 1].id)
      : undefined;

  const detailOpen = Boolean(state.detail);

  return (
    <>
      <ExplorerLayout
        header={
          <ExplorerHeader
            ref={searchInputRef}
            variant="dsl"
            filters={state.filters}
            onChangeFilters={(f) => state.setFilters(f)}
            onSubmitFreeText={() => {}}
            actions={<LogsActions />}
            valueSuggestions={valueSuggestions}
            searchPlaceholder='Search logs: service_name:checkout severity_text:ERROR "timeout"'
            scope="logs"
          />
        }
        facets={
          <LogsFacetPanel
            facets={facets.data}
            onInclude={onInclude}
            onExclude={onExclude}
            activeFilterCount={state.filters.length}
            onClearAll={onClearFilters}
          />
        }
        content={
          <>
            <div className="mb-4 flex shrink-0 flex-row items-center gap-2.5">
              <StatPill label="Total" value={formatNumber(summary.data?.total ?? 0)} />
              <StatPill
                label="Errors"
                value={formatNumber(summary.data?.errors ?? 0)}
                dot="var(--color-error)"
              />
              <StatPill
                label="Warnings"
                value={formatNumber(summary.data?.warns ?? 0)}
                dot="var(--color-warning)"
              />
            </div>

            <div className="shrink-0">
              <LogsTrendChart
                trend={trend.data}
                zoomed={timeRange.kind === "absolute"}
                onTimeRangeChange={onTimeRangeChange}
                minTimeMs={startTime}
                maxTimeMs={endTime}
              />
            </div>

            <div className="mt-4 flex flex-col">
              <div className="flex flex-col rounded-[8px] border border-[var(--line)] bg-[var(--bg-1)]">
                <LogsTableToolbar />
                <LogsTable
                  rows={results}
                  searchTerm={searchTerm}
                  loading={list.isPending}
                  selectedId={state.detail}
                  onRowClick={onRowClick}
                />
                {results.length > 0 || list.hasMore ? (
                  <LogsTableFooter
                    pageIndex={list.pageIndex}
                    pageCount={list.pageCount}
                    pageRows={results.length}
                    loadedRows={results.length}
                    hasMore={list.hasMore}
                    loadingNext={list.isPending && results.length === 0}
                    onPrevious={goPrevPage}
                    onNext={goNextPage}
                  />
                ) : null}
              </div>
            </div>
          </>
        }
      />

      <LogDetailDrawer
        logId={state.detail ?? ""}
        open={detailOpen}
        onClose={() => state.setDetail(null)}
        onPrev={onDetailPrev}
        onNext={onDetailNext}
      />
    </>
  );
}
