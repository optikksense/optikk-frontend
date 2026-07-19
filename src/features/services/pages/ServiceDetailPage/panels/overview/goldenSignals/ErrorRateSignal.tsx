import { useMemo } from "react";

import ObservabilityChart from "@shared/components/ui/charts/ObservabilityChart";

import { PanelCard } from "@shared/components/ui/PanelCard";
import { fmtPct } from "@shared/utils/metricFormatters";
import { pivotByRoute, useREDByEndpoint } from "../../../hooks/useREDByEndpoint";
import { SIGNAL_CHART_HEIGHT, SignalLegend } from "./SignalCardShell";

export function ErrorRateSignal({ serviceName }: { serviceName: string }) {
  const query = useREDByEndpoint(serviceName);
  const rows = query.data ?? [];

  const { timestamps, series } = useMemo(
    () => pivotByRoute(rows, (r) => r.errorRate, false),
    [rows]
  );

  // Worst current error rate across routes, for the legend.
  const peak = useMemo(() => {
    let max = 0;
    for (const s of series) {
      for (const v of s.values) {
        if (v != null && v > max) max = v;
      }
    }
    return max;
  }, [series]);

  return (
    <PanelCard
      title="Error rate"
      subtitle="% · per endpoint"
      action={<SignalLegend>peak {fmtPct(peak, peak < 0.1 ? 2 : 1)}</SignalLegend>}
    >
      <ObservabilityChart
        type="line"
        timestamps={timestamps}
        series={series}
        height={SIGNAL_CHART_HEIGHT}
        yFormatter={(v) => fmtPct(v, v < 0.1 ? 2 : 1)}
        legend
        isLoading={query.isLoading}
      />
    </PanelCard>
  );
}
