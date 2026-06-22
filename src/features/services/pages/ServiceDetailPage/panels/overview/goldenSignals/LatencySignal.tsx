import { useMemo } from "react";

import ObservabilityChart from "@shared/components/ui/charts/ObservabilityChart";

import { fmtMs } from "../../../formatters";
import { pivotByRoute, useREDByEndpoint } from "../../../hooks/useREDByEndpoint";
import { PanelCard } from "../../PanelCard";
import { SIGNAL_CHART_HEIGHT, SignalLegend } from "./SignalCardShell";

export function LatencySignal({ serviceName }: { serviceName: string }) {
  const query = useREDByEndpoint(serviceName);
  const rows = query.data ?? [];

  const { timestamps, series } = useMemo(() => pivotByRoute(rows, (r) => r.p99_ms, false), [rows]);

  // Latest non-null p99 across routes, for the legend.
  const latestP99 = useMemo(() => {
    let val = 0;
    for (const s of series) {
      for (let i = s.values.length - 1; i >= 0; i--) {
        const v = s.values[i];
        if (v != null) {
          if (v > val) val = v;
          break;
        }
      }
    }
    return val;
  }, [series]);

  return (
    <PanelCard
      title="Latency"
      subtitle="p99 · ms · per endpoint"
      action={<SignalLegend>p99 {fmtMs(latestP99)}</SignalLegend>}
    >
      <ObservabilityChart
        type="line"
        timestamps={timestamps}
        series={series}
        height={SIGNAL_CHART_HEIGHT}
        yFormatter={(v) => fmtMs(v)}
        legend
      />
    </PanelCard>
  );
}
