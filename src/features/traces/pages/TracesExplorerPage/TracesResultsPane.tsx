import type { ColumnConfig, ColumnDef } from "@/features/explorer/types/results";
import { ResultsArea } from "@/features/explorer/components/list/ResultsArea";
import { useCallback } from "react";
import { TrendHistogramStrip } from "@/features/explorer/components/trend/TrendHistogramStrip";
import type { TrendBucket } from "@/features/explorer/components/trend/TrendHistogramStrip";
import { TRACE_TREND_SERIES } from "@/features/explorer/utils/trend";

import { LatencyTrendStrip } from "../../components/LatencyTrendStrip";
import { TraceSortToggle, type TraceSortMode } from "../../components/TraceSortToggle";
import type { LatencyTrendPoint } from "../../hooks/useTracesLatencyTrend";
import type { TraceSummary } from "../../types/trace";
import { getTraceRowId } from "./tracesColumns";

interface Props {
  readonly trendBuckets: readonly TrendBucket[];
  readonly latencyPoints: readonly LatencyTrendPoint[];
  readonly zoomed: boolean;
  readonly onTimeRangeChange: (fromMs: number, toMs: number) => void;
  readonly sortMode: TraceSortMode;
  readonly onSortChange: (mode: TraceSortMode) => void;
  readonly rows: readonly TraceSummary[];
  readonly columns: readonly ColumnDef<TraceSummary>[];
  readonly columnConfig: readonly ColumnConfig[];
  readonly onColumnConfigChange: (next: readonly ColumnConfig[]) => void;
  readonly onRowClick: (row: TraceSummary) => void;
  readonly resetKey: string;
  readonly loading: boolean;
  readonly queryError: string | null;
  readonly onRetry: () => void;
}

function getTraceRowClassName(row: TraceSummary): string {
  return row.has_error
    ? "border-l-2 border-red-500 bg-red-500/[0.03]"
    : "border-l-2 border-transparent";
}

/** Right pane for the traces explorer: trend, latency overlay, sort, result list. */
export function TracesResultsPane(props: Props) {
  const getRowClassName = useCallback(getTraceRowClassName, []);
  return (
    <>
      {props.trendBuckets.length > 0 ? (
        <TrendHistogramStrip
          buckets={props.trendBuckets}
          series={TRACE_TREND_SERIES}
          zoomed={props.zoomed}
          onTimeRangeChange={props.onTimeRangeChange}
        />
      ) : null}
      <LatencyTrendStrip points={props.latencyPoints} />
      <TraceSortToggle mode={props.sortMode} onChange={props.onSortChange} />
      <ResultsArea<TraceSummary>
        rows={props.rows}
        columns={props.columns}
        config={props.columnConfig}
        onConfigChange={props.onColumnConfigChange}
        getRowId={getTraceRowId}
        onRowClick={props.onRowClick}
        resetKey={props.resetKey}
        loading={props.loading}
        queryError={props.queryError}
        onRetry={props.onRetry}
        getRowClassName={getRowClassName}
        emptyTitle="No traces"
        emptyDescription="Adjust filters or broaden the time range."
      />
    </>
  );
}
