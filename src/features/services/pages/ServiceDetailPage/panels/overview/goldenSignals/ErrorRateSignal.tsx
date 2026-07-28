import { useMemo } from "react";

import ObservabilityChart from "@shared/components/ui/charts/ObservabilityChart";

import { PanelCard } from "@shared/components/ui/PanelCard";
import { fmtPct } from "@shared/utils/formatters";
import { pivotByRoute, useREDByEndpoint } from "../../../hooks/useREDByEndpoint";
import { SIGNAL_CHART_HEIGHT, SignalLegend } from "./SignalCardShell";

export function ErrorRateSignal({ serviceName }: { serviceName: string }) {
  const query = useREDByEndpoint(serviceName);
  const data = query.data;

  const { timestamps, series } = useMemo(
    () => pivotByRoute(data, (r) => r.errorRate, false),
    [data]
  );

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
