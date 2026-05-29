import ObservabilityChart from "@shared/components/ui/charts/ObservabilityChart";
import { Card } from "@shared/components/primitives/ui";

import type { GroupedSeriesResult } from "@/features/saturation/series/groupSeriesByLabel";

interface GroupedSeriesPanelProps {
  readonly eyebrow: string;
  readonly title: string;
  readonly result: GroupedSeriesResult;
  readonly emptyLabel: string;
  readonly yFormatter: (value: number) => string;
}

/** A titled card wrapping a multi-series ObservabilityChart for datastore breakdowns. */
export function GroupedSeriesPanel({
  eyebrow,
  title,
  result,
  emptyLabel,
  yFormatter,
}: GroupedSeriesPanelProps) {
  return (
    <Card padding="lg" className="min-h-[300px] border-[var(--border-color)]">
      <div className="mb-3">
        <div className="text-[11px] text-[var(--text-muted)] uppercase tracking-[0.08em]">
          {eyebrow}
        </div>
        <div className="mt-1 font-semibold text-[15px] text-[var(--text-primary)]">{title}</div>
      </div>
      {result.timestamps.length === 0 || result.series.length === 0 ? (
        <div className="grid h-[220px] place-items-center text-[12px] text-[var(--text-muted)]">
          {emptyLabel}
        </div>
      ) : (
        <ObservabilityChart
          timestamps={result.timestamps}
          series={result.series}
          height={240}
          legend
          yFormatter={yFormatter}
        />
      )}
    </Card>
  );
}
