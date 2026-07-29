import { KpiCard } from "@shared/components/ui/cards/StatCard";
import { SparklineCell } from "@shared/components/ui/charts/micro/SparklineCell";
import { formatNumber } from "@shared/utils/formatters";

import type { ErrorsOverview } from "../api/types";

interface ErrorsKpiStripProps {
  readonly summary: ErrorsOverview["summary"] | undefined;
  readonly trend: ErrorsOverview["trend"] | undefined;
}

const EMPTY_SUMMARY: ErrorsOverview["summary"] = {
  totalErrors: 0,
  activeIssues: 0,
  newIssues: 0,
  servicesAffected: 0,
};

export function ErrorsKpiStrip({ summary, trend }: ErrorsKpiStripProps): JSX.Element {
  const kpis = summary ?? EMPTY_SUMMARY;
  const series = trend?.map((b) => b.errors) ?? [];

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <KpiCard
        label="Total errors"
        value={formatNumber(kpis.totalErrors)}
        subtext="selected range"
        tone="err"
        sparkline={
          series.length >= 2 ? (
            <SparklineCell
              values={series}
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
