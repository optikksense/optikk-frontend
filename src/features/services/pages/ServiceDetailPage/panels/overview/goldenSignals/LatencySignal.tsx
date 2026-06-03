import { useMemo } from "react";

import ObservabilityChart, {
  type ObservabilityChartSeries,
} from "@shared/components/ui/charts/ObservabilityChart";
import { useChartTimeBuckets } from "@shared/hooks/useChartTimeBuckets";
import { tsKey, tsMs } from "@shared/utils/chartDataUtils";

import type { LatencyPercentilesPoint } from "@/features/services/api/serviceDetailApi";

import { fmtMs } from "../../../formatters";
import { useLatencyPercentiles } from "../../../hooks/useLatencyPercentiles";
import { PanelCard } from "../../PanelCard";
import { SIGNAL_CHART_HEIGHT, SignalLegend } from "./SignalCardShell";

interface Percentiles {
  p50: number[];
  p95: number[];
  p99: number[];
}

function buildSeries(
  rows: LatencyPercentilesPoint[] | undefined,
  timeBuckets: string[]
): Percentiles {
  const p50: Record<string, number> = {};
  const p95: Record<string, number> = {};
  const p99: Record<string, number> = {};
  for (const r of rows ?? []) {
    const key = tsKey(r.timestamp);
    // Take the max when multiple rows fall into one display bucket.
    p50[key] = Math.max(p50[key] ?? 0, r.p50_ms);
    p95[key] = Math.max(p95[key] ?? 0, r.p95_ms);
    p99[key] = Math.max(p99[key] ?? 0, r.p99_ms);
  }
  return {
    p50: timeBuckets.map((t) => p50[tsKey(t)] ?? 0),
    p95: timeBuckets.map((t) => p95[tsKey(t)] ?? 0),
    p99: timeBuckets.map((t) => p99[tsKey(t)] ?? 0),
  };
}

export function LatencySignal({ serviceName }: { serviceName: string }) {
  const query = useLatencyPercentiles(serviceName);
  const { timeBuckets } = useChartTimeBuckets();

  const timestamps = useMemo(() => timeBuckets.map((t) => tsMs(t) / 1000), [timeBuckets]);
  const { p50, p95, p99 } = useMemo(
    () => buildSeries(query.data, timeBuckets),
    [query.data, timeBuckets]
  );

  const latestP99 = p99.length ? p99[p99.length - 1] : 0;
  const series: ObservabilityChartSeries[] = [
    { label: "p50", values: p50, color: "var(--color-healthy,#73c991)" },
    { label: "p95", values: p95, color: "var(--color-degraded,#f7b63a)" },
    { label: "p99", values: p99, color: "var(--color-critical,#f04438)" },
  ];

  return (
    <PanelCard
      title="Latency"
      subtitle="p50 / p95 / p99 · ms"
      action={<SignalLegend>p99 {fmtMs(latestP99)}</SignalLegend>}
    >
      <ObservabilityChart
        timestamps={timestamps}
        series={series}
        height={SIGNAL_CHART_HEIGHT}
        yFormatter={(v) => fmtMs(v)}
      />
    </PanelCard>
  );
}
