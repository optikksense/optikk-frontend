import { useCallback, useMemo } from "react";

import { useAppStore, useTimeRange } from "@app/store/appStore";
import { StatPill } from "@shared/search/components/chrome/StatPill";
import type { ExplorerFilter } from "@shared/search/types/filters";
import { resolveTimeRangeBounds } from "@shared/types";
import { formatNumber } from "@shared/utils/formatters";

import { LogsTable } from "@shared/logs/components/table/LogsTable";
import { LogsTableFooter } from "@shared/logs/components/table/LogsTableFooter";
import { LogsTableToolbar } from "@shared/logs/components/table/LogsTableToolbar";
import { useLogsExplorerStore } from "@shared/logs/store/logsExplorerStore";
import type { LogRecord } from "@shared/logs/types/log";

import type { useLogsExplorer } from "../hooks/useLogsExplorer";
import { LogsTrendChart } from "./trend/LogsTrendChart";

function extractSearchTerm(filters: readonly ExplorerFilter[]): string | undefined {
  const f = filters.find(
    (x) => (x.field === "body" || x.field === "search") && (x.op === "contains" || x.op === "eq")
  );
  return f?.value || undefined;
}

interface LogsExplorerContentProps {
  readonly explorer: ReturnType<typeof useLogsExplorer>;
}

   
                                                                     
                                                                              
                                                             
   
export function LogsExplorerContent({ explorer }: LogsExplorerContentProps) {
  const { state, list, summary, trend } = explorer;
  const timeRange = useTimeRange();
  const { startTime, endTime } = useMemo(() => resolveTimeRangeBounds(timeRange), [timeRange]);
  const setCustomTimeRange = useAppStore((s) => s.setCustomTimeRange);

  const goNextPage = useLogsExplorerStore((s) => s.goNextPage);
  const goPrevPage = useLogsExplorerStore((s) => s.goPrevPage);

  const searchTerm = useMemo(() => extractSearchTerm(state.filters), [state.filters]);
  const onRowClick = useCallback((row: LogRecord) => state.setDetail(row.id), [state]);
  const onTimeRangeChange = useCallback(
    (fromMs: number, toMs: number) => setCustomTimeRange(fromMs, toMs, "Brush"),
    [setCustomTimeRange]
  );

  const results = list.results;

  return (
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
  );
}
