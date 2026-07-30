import { KpiCard } from "@shared/components/ui/cards/StatCard";
import { SparklineCell } from "@shared/components/ui/charts/micro/SparklineCell";
import { formatNumber } from "@shared/utils/formatters";

import type { ErrorsOverview } from "../api/types";

interface ErrorsKpiStripProps {
  readonly summary: ErrorsOverview["summary"] | undefined;
  readonly trend: ErrorsOverview["trend"] | undefined;
  readonly unavailable?: boolean;
}

export function ErrorsKpiStrip({
  summary,
  trend,
  unavailable = false,
}: ErrorsKpiStripProps): JSX.Element {
  const series = trend?.map((b) => b.errors) ?? [];
  const value = (metric: keyof ErrorsOverview["summary"]) =>
    summary ? formatNumber(summary[metric]) : "—";
  const subtext = unavailable ? "unavailable" : undefined;

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <KpiCard
        label="Total errors"
        value={value("totalErrors")}
        subtext={subtext ?? "selected range"}
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
        value={value("activeIssues")}
        subtext={subtext ?? "grouped errors"}
        tone="warn"
      />
      <KpiCard
        label="New issues"
        value={value("newIssues")}
        subtext={subtext ?? "first seen < 24h"}
        tone="neutral"
      />
      <KpiCard
        label="Services affected"
        value={value("servicesAffected")}
        subtext={subtext ?? "with active issues"}
        tone="neutral"
      />
    </div>
  );
}
