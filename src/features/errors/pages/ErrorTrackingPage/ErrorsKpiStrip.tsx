import { KpiCard } from "@shared/components/ui/dashboard/KpiCard";
import { formatNumber } from "@shared/utils/formatters";

import { SparklineCell } from "@shared/components/ui/charts/micro/SparklineCell";

export interface ErrorsKpis {
  /** Sum of error counts over the volume series in the selected range. */
  readonly totalErrors: number;
  /** Per-bucket error counts that back the Total-errors sparkline. */
  readonly totalErrorsSeries: number[];
  /** Number of grouped issues in the range (capped aggregate). */
  readonly activeIssues: number;
  /** Issues first seen within the last 24h. */
  readonly newIssues: number;
  /** Distinct services with at least one issue. */
  readonly servicesAffected: number;
}

/**
 * Error-tracking KPI strip. Only the Total-errors card carries a sparkline (the only
 * cross-page series the backend exposes via /errors/error-volume); the other three are
 * plain counts derived from the capped aggregate groups query.
 */
export function ErrorsKpiStrip({ kpis }: { kpis: ErrorsKpis }): JSX.Element {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <KpiCard
        label="Total errors"
        value={formatNumber(kpis.totalErrors)}
        subtext="selected range"
        tone="err"
        sparkline={
          kpis.totalErrorsSeries.length >= 2 ? (
            <SparklineCell
              values={kpis.totalErrorsSeries}
              tone="err"
              width={80}
              height={24}
              className="h-full w-full"
            />
          ) : undefined
        }
      />
      <KpiCard
        label="Active issues"
        value={formatNumber(kpis.activeIssues)}
        subtext="grouped errors"
        tone="warn"
      />
      <KpiCard
        label="New issues"
        value={formatNumber(kpis.newIssues)}
        subtext="first seen < 24h"
        tone="neutral"
      />
      <KpiCard
        label="Services affected"
        value={formatNumber(kpis.servicesAffected)}
        subtext="with active issues"
        tone="neutral"
      />
    </div>
  );
}
