import { useMemo } from "react";

import ObservabilityChart, {
  type ObservabilityChartSeries,
} from "@shared/components/ui/charts/ObservabilityChart";
import { useChartTimeBuckets } from "@shared/hooks/useChartTimeBuckets";
import { tsKey, tsMs } from "@shared/utils/chartDataUtils";

import type { ErrorTimeSeriesPoint } from "@/features/errors/api/errorGroupsApi";

import { fmtPct } from "../../../formatters";
import { useErrorRateSeries } from "../../../hooks/useErrorRateSeries";
import { PanelCard } from "../../PanelCard";
import { SIGNAL_CHART_HEIGHT, SignalLegend } from "./SignalCardShell";

function buildValues(rows: ErrorTimeSeriesPoint[] | undefined, timeBuckets: string[]): number[] {
  const byBucket: Record<string, { requests: number; errors: number }> = {};
  for (const r of rows ?? []) {
    if (!r.timestamp) continue;
    const key = tsKey(r.timestamp);
    const entry = byBucket[key] ?? { requests: 0, errors: 0 };
    entry.requests += r.request_count;
    entry.errors += r.error_count;
    byBucket[key] = entry;
  }
  return timeBuckets.map((t) => {
    const entry = byBucket[tsKey(t)];
    return entry?.requests ? entry.errors / entry.requests : 0;
  });
}

export function ErrorRateSignal({ serviceName }: { serviceName: string }) {
  const query = useErrorRateSeries(serviceName);
  const { timeBuckets } = useChartTimeBuckets();

  const timestamps = useMemo(() => timeBuckets.map((t) => tsMs(t) / 1000), [timeBuckets]);
  const values = useMemo(() => buildValues(query.data, timeBuckets), [query.data, timeBuckets]);

  const overall = useMemo(() => {
    let req = 0;
    let err = 0;
    for (const r of query.data ?? []) {
      req += r.request_count;
      err += r.error_count;
    }
    return req > 0 ? err / req : 0;
  }, [query.data]);

  const series: ObservabilityChartSeries[] = [
    { label: "error rate", values, color: "var(--color-critical,#f04438)", fill: true },
  ];

  return (
    <PanelCard
      title="Error rate"
      subtitle="%"
      action={<SignalLegend>curr {fmtPct(overall, overall < 0.01 ? 2 : 1)}</SignalLegend>}
    >
      <ObservabilityChart
        type="area"
        timestamps={timestamps}
        series={series}
        height={SIGNAL_CHART_HEIGHT}
        yFormatter={(v) => fmtPct(v, v < 0.01 ? 2 : 1)}
      />
    </PanelCard>
  );
}
