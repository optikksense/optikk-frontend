import { useMemo } from "react";

import ObservabilityChart from "@shared/components/ui/charts/ObservabilityChart";

import { PanelCard } from "@shared/components/ui/PanelCard";
import { fmtNum } from "@shared/utils/formatters";
import { pivotByEndpoint, useREDByEndpoint } from "../../../hooks/useREDByEndpoint";
import { SIGNAL_CHART_HEIGHT, SignalLegend } from "./SignalCardShell";

export function RequestRateSignal({ serviceName }: { serviceName: string }) {
  const query = useREDByEndpoint(serviceName);
  const data = query.data;

  const { timestamps, series } = useMemo(() => pivotByEndpoint(data, (r) => r.rps, false), [data]);

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
        isLoading={query.isLoading}
      />
    </PanelCard>
  );
}
