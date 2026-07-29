import ObservabilityChart, {
  type ObservabilityChartSeries,
} from "@shared/components/ui/charts/ObservabilityChart";

import { PanelCard } from "@shared/components/ui/PanelCard";
import { getChartColor } from "@shared/utils/charting";
import { fmtNum } from "@shared/utils/formatters";
import { SIGNAL_CHART_HEIGHT, SignalLegend } from "./SignalCardShell";
import { useEndpointRED } from "./useEndpointRED";

/**
 * Request rate golden signal — one line per endpoint, from
 * `red-by-endpoint`. The headline stays the service total so it still
 * reconciles with the service drawer's aggregate sparkline.
 */
export function RequestRateSignal({ serviceName }: { serviceName: string }) {
  const query = useEndpointRED(serviceName);

  const timestamps = (query.data?.timestamps ?? []).map((ms) => ms / 1000);
  const endpoints = query.data?.series ?? [];

  const series: ObservabilityChartSeries[] = endpoints.map((endpoint, index) => ({
    label: endpoint.operationName,
    values: endpoint.rps,
    color: getChartColor(index),
    fill: false,
  }));

  // Service total per bucket, averaged over the window.
  let total = 0;
  for (const endpoint of endpoints) {
    for (const rps of endpoint.rps) total += rps;
  }
  const avg = timestamps.length > 0 ? total / timestamps.length : 0;

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
