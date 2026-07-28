import { useMemo } from "react";

import { DeltaBadge } from "@shared/metrics/components/DeltaBadge";
import type {
  MetricExplorerResults,
  MetricQueryDefinition,
  MetricSpaceAggregation,
} from "@shared/metrics/types";
import { formatStatValue } from "@shared/metrics/utils/formatStat";
import { computeQuerySummary } from "@shared/metrics/utils/seriesStats";

interface MetricsKpiStripProps {
  readonly primaryQuery: MetricQueryDefinition | undefined;
  readonly results: MetricExplorerResults;
  readonly spaceAgg: MetricSpaceAggregation;
  readonly unit?: string;
}

interface KpiCell {
  readonly label: string;
  readonly value: string;
  readonly unit: string;
  readonly delta?: number | null;
}

   
                                                                              
                                                                   
   
export function MetricsKpiStrip({ primaryQuery, results, spaceAgg, unit }: MetricsKpiStripProps) {
  const cells = useMemo<KpiCell[]>(() => {
    const result = primaryQuery ? results[primaryQuery.id] : undefined;
    const summary = computeQuerySummary(result, spaceAgg);
    const valueUnit = unit ?? "";
    return [
      {
        label: "current",
        value: formatStatValue(summary.current),
        unit: valueUnit,
        delta: summary.delta,
      },
      { label: "1h avg", value: formatStatValue(summary.avg), unit: valueUnit },
      { label: "1h min", value: formatStatValue(summary.min), unit: valueUnit },
      { label: "1h max", value: formatStatValue(summary.max), unit: valueUnit },
      { label: "samples", value: formatStatValue(summary.samples), unit: "pts" },
      { label: "cardinality", value: String(summary.cardinality), unit: "series" },
    ];
  }, [primaryQuery, results, spaceAgg, unit]);

  return (
    <div className="mb-3 flex flex-wrap gap-x-8 gap-y-3">
      {cells.map((cell) => (
        <div key={cell.label}>
          <div className="font-medium text-[10.5px] text-foreground-muted uppercase tracking-[0.06em]">
            {cell.label}
          </div>
          <div className="mt-0.5 flex items-baseline gap-1.5">
            <span className="font-bold text-[20px] text-foreground tabular-nums tracking-[-0.01em]">
              {cell.value}
            </span>
            {cell.unit ? (
              <span className="text-[11px] text-foreground-muted">{cell.unit}</span>
            ) : null}
            {cell.delta !== undefined ? <DeltaBadge delta={cell.delta} className="ml-1" /> : null}
          </div>
        </div>
      ))}
    </div>
  );
}
