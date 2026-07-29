import ObservabilityChart, {
  type ObservabilityChartSeries,
} from "@shared/components/ui/charts/ObservabilityChart";

import { PanelCard } from "@shared/components/ui/PanelCard";
import { getChartColor } from "@shared/utils/charting";
import { fmtPct } from "@shared/utils/formatters";
import { SIGNAL_CHART_HEIGHT, SignalLegend } from "./SignalCardShell";
import { useEndpointRED } from "./useEndpointRED";

/**
 * Error rate golden signal — one line per endpoint, from `red-by-endpoint`.
 * Shares its query with the request rate card, and so shares its inbound-only
 * span filter: the previous `/errors/service-error-rate` source counted client
 * and internal spans in the denominator, which made the two cards disagree.
 *
 * Null buckets (endpoint served no traffic) stay null so the line breaks
 * rather than dropping to a misleading 0%.
 */
export function ErrorRateSignal({ serviceName }: { serviceName: string }) {
  const query = useEndpointRED(serviceName);

  const timestamps = (query.data?.timestamps ?? []).map((ms) => ms / 1000);
  const endpoints = query.data?.series ?? [];

  const series: ObservabilityChartSeries[] = endpoints.map((endpoint, index) => ({
    label: endpoint.operationName,
    values: endpoint.errorRate,
    color: getChartColor(index),
    fill: false,
  }));

  let peak = 0;
  for (const endpoint of endpoints) {
    for (const rate of endpoint.errorRate) {
      if (rate != null && rate > peak) peak = rate;
    }
  }

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
