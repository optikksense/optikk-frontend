import { useMemo } from "react";

import ObservabilityChart from "@shared/components/ui/charts/ObservabilityChart";

import { fmtNum } from "../../../formatters";
import { pivotByRoute, useREDByEndpoint } from "../../../hooks/useREDByEndpoint";
import { PanelCard } from "../../PanelCard";
import { SIGNAL_CHART_HEIGHT, SignalLegend } from "./SignalCardShell";

export function RequestRateSignal({ serviceName }: { serviceName: string }) {
  const query = useREDByEndpoint(serviceName);
  const rows = query.data ?? [];

  const { timestamps, series } = useMemo(() => pivotByRoute(rows, (r) => r.rps, false), [rows]);

  // Window-average rps summed across all routes.
  const avg = useMemo(() => {
    if (timestamps.length === 0) return 0;
    let total = 0;
    for (const s of series) {
      for (const v of s.values) total += v ?? 0;
    }
    return total / timestamps.length;
  }, [series, timestamps]);

  return (
    <PanelCard
      title="Request rate"
      subtitle="rps · per endpoint"
      action={<SignalLegend>avg {fmtNum(avg)} rps</SignalLegend>}
    >
      <ObservabilityChart
        type="line"
        timestamps={timestamps}
        series={series}
        height={SIGNAL_CHART_HEIGHT}
        yFormatter={(v) => fmtNum(v)}
        legend
      />
    </PanelCard>
  );
}
