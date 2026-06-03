import { useMemo } from "react";

import ObservabilityChart, {
  type ObservabilityChartSeries,
} from "@shared/components/ui/charts/ObservabilityChart";
import { useChartTimeBuckets } from "@shared/hooks/useChartTimeBuckets";
import { tsKey, tsMs } from "@shared/utils/chartDataUtils";

import type { SaturationTimeSeriesPoint } from "@/features/services/api/serviceDetailApi";

import { useServiceSaturation } from "../../../hooks/useServiceSaturation";
import { PanelCard } from "../../PanelCard";
import { SIGNAL_CHART_HEIGHT, SignalLegend } from "./SignalCardShell";

// Backend already returns `value` as a percentage (e.g. 18.5 → 18.5%).
function fmtSat(v: number): string {
  return `${v.toFixed(1)}%`;
}

function buildValues(
  rows: SaturationTimeSeriesPoint[] | undefined,
  timeBuckets: string[]
): number[] {
  const byBucket: Record<string, number> = {};
  for (const r of rows ?? []) {
    byBucket[tsKey(r.timestamp)] = r.value;
  }
  return timeBuckets.map((t) => byBucket[tsKey(t)] ?? 0);
}

export function SaturationSignal({ serviceName }: { serviceName: string }) {
  const query = useServiceSaturation(serviceName);
  const { timeBuckets } = useChartTimeBuckets();

  const timestamps = useMemo(() => timeBuckets.map((t) => tsMs(t) / 1000), [timeBuckets]);
  const values = useMemo(() => buildValues(query.data, timeBuckets), [query.data, timeBuckets]);

  const latest = values.length ? values[values.length - 1] : 0;
  const series: ObservabilityChartSeries[] = [
    { label: "saturation", values, color: "var(--color-accent,#8b5cf6)", fill: true },
  ];

  return (
    <PanelCard
      title="Saturation (CPU)"
      subtitle="%"
      action={<SignalLegend>curr {fmtSat(latest)}</SignalLegend>}
    >
      <ObservabilityChart
        type="area"
        timestamps={timestamps}
        series={series}
        height={SIGNAL_CHART_HEIGHT}
        yFormatter={fmtSat}
      />
    </PanelCard>
  );
}
