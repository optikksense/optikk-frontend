import { ExplorerTableFooter } from "@shared/search/components/chrome/ExplorerTableFooter";
import {
  TrendChart,
  type TrendChartBucket,
  type TrendChartSegment,
} from "@shared/search/components/trend/TrendChart";

import type { useErrorsExplorer } from "../hooks/useErrorsExplorer";
import { ErrorsKpiStrip } from "./ErrorsKpiStrip";
import { IssuesTable } from "./IssuesTable";

const ERROR_SEGMENTS: readonly TrendChartSegment[] = [
  { key: "errors", label: "Errors", color: "var(--err)" },
];

type ErrorsExplorerModel = ReturnType<typeof useErrorsExplorer>;

function toBuckets(trend: ErrorsExplorerModel["trend"]): readonly TrendChartBucket[] | undefined {
  if (!trend || trend.length === 0) return undefined;
  return trend.map((b) => ({ ts: Date.parse(b.timeBucket), counts: { errors: b.errors } }));
}

/**
 * Presentational body shared by the standalone Error Tracking explorer and
 * the service-scoped Errors tab: KPI strip + error-volume chart + issues
 * table. Search bar and facet rail are page chrome, supplied by the caller.
 */
export function ErrorsExplorerContent({ model }: { readonly model: ErrorsExplorerModel }) {
  return (
    <>
      {model.error ? (
        <div
          className="mb-4 rounded-md border border-error bg-error-subtle px-3 py-2 text-error text-sm"
          role="alert"
        >
          Could not load error groups: {model.error.message}
        </div>
      ) : null}

      <div className="mb-4 shrink-0">
        <ErrorsKpiStrip summary={model.summary} trend={model.trend} />
      </div>

      <div className="shrink-0">
        <TrendChart
          title="Error Volume Over Time"
          segments={ERROR_SEGMENTS}
          data={toBuckets(model.trend)}
          minTimeMs={model.startTime}
          maxTimeMs={model.endTime}
          onTimeRangeChange={model.onTimeRangeChange}
        />
      </div>

      <div className="mt-4 flex flex-col">
        <IssuesTable rows={model.groups} onOpen={model.onOpenGroup} />
        <ExplorerTableFooter
          rowCount={model.groups.length}
          noun={model.groups.length === 1 ? "issue" : "issues"}
          onNextPage={model.onNextPage}
          onPrevPage={model.onPrevPage}
          hasNextPage={model.hasNextPage}
          hasPrevPage={model.hasPrevPage}
        />
      </div>
    </>
  );
}
