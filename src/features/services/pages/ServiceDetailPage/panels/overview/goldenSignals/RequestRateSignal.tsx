import { useMemo } from "react";

import ObservabilityChart, {
  type ObservabilityChartSeries,
} from "@shared/components/ui/charts/ObservabilityChart";
import { tsMs } from "@shared/utils/chartDataUtils";

import type { StatusTimeseriesPoint } from "@/features/services/api/serviceDetailApi";

import { fmtNum } from "../../../formatters";
import { useStatusTimeseries } from "../../../hooks/useStatusTimeseries";
import { PanelCard } from "../../PanelCard";
import { SIGNAL_CHART_HEIGHT, SignalLegend } from "./SignalCardShell";

export function RequestRateSignal({ serviceName }: { serviceName: string }) {
  const query = useStatusTimeseries(serviceName);

  const activeRows = query.data ?? [];
  const timestamps = useMemo(() => activeRows.map((r) => tsMs(r.timestamp) / 1000), [activeRows]);
  const values = useMemo(
    () => activeRows.map((r) => r.status_2xx + r.status_4xx + r.status_5xx + r.status_other),
    [activeRows]
  );

  const avg = values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0;
  const series: ObservabilityChartSeries[] = [
    { label: "rps", values, color: "var(--color-info,#3b82f6)", fill: true },
  ];

  return (
    <PanelCard
      title="Request rate"
      subtitle="rps"
      action={<SignalLegend>avg {fmtNum(avg)} rps</SignalLegend>}
    >
      <ObservabilityChart
        type="area"
        timestamps={timestamps}
        series={series}
        height={SIGNAL_CHART_HEIGHT}
        yFormatter={(v) => fmtNum(v)}
      />
    </PanelCard>
  );
}
