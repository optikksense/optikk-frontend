import { useMemo } from "react";

import ObservabilityChart, {
  type ObservabilityChartSeries,
} from "@shared/components/ui/charts/ObservabilityChart";
import { tsMs } from "@shared/utils/chartDataUtils";

import { fmtPct } from "../../../formatters";
import { useErrorRateSeries } from "../../../hooks/useErrorRateSeries";
import { PanelCard } from "../../PanelCard";
import { SIGNAL_CHART_HEIGHT, SignalLegend } from "./SignalCardShell";

export function ErrorRateSignal({ serviceName }: { serviceName: string }) {
  const query = useErrorRateSeries(serviceName);

  const activeRows = query.data ?? [];
  const timestamps = useMemo(() => activeRows.map((r) => tsMs(r.timestamp) / 1000), [activeRows]);
  const values = useMemo(
    () => activeRows.map((r) => (r.request_count ? r.error_count / r.request_count : 0)),
    [activeRows]
  );

  const overall = useMemo(() => {
    let req = 0;
    let err = 0;
    for (const r of activeRows) {
      req += r.request_count;
      err += r.error_count;
    }
    return req > 0 ? err / req : 0;
  }, [activeRows]);

  const series: ObservabilityChartSeries[] = [
    { label: "error rate", values, color: "var(--color-critical,#f04438)", fill: true },
  ];

  return (
    <PanelCard
      title="Error rate"
      subtitle="%"
      action={<SignalLegend>curr {fmtPct(overall, overall < 0.01 ? 2 : 1)}</SignalLegend>}
    >
      <ObservabilityChart
        type="area"
        timestamps={timestamps}
        series={series}
        height={SIGNAL_CHART_HEIGHT}
        yFormatter={(v) => fmtPct(v, v < 0.01 ? 2 : 1)}
      />
    </PanelCard>
  );
}
