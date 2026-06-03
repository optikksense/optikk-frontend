import { useMemo } from "react";

import ObservabilityChart, {
  type ObservabilityChartSeries,
} from "@shared/components/ui/charts/ObservabilityChart";
import { tsMs } from "@shared/utils/chartDataUtils";

import type { LatencyPercentilesPoint } from "@/features/services/api/serviceDetailApi";

import { fmtMs } from "../../../formatters";
import { useLatencyPercentiles } from "../../../hooks/useLatencyPercentiles";
import { PanelCard } from "../../PanelCard";
import { SIGNAL_CHART_HEIGHT, SignalLegend } from "./SignalCardShell";

export function LatencySignal({ serviceName }: { serviceName: string }) {
  const query = useLatencyPercentiles(serviceName);

  const activeRows = query.data ?? [];
  const timestamps = useMemo(() => activeRows.map((r) => tsMs(r.timestamp) / 1000), [activeRows]);
  const p50 = useMemo(() => activeRows.map((r) => r.p50_ms), [activeRows]);
  const p95 = useMemo(() => activeRows.map((r) => r.p95_ms), [activeRows]);
  const p99 = useMemo(() => activeRows.map((r) => r.p99_ms), [activeRows]);

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
