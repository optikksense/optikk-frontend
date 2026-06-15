import { useMemo } from "react";

import ObservabilityChart, {
  type ObservabilityChartSeries,
} from "@shared/components/ui/charts/ObservabilityChart";
import { tsMs } from "@shared/utils/chartDataUtils";

import { useServiceSaturation } from "../../../hooks/useServiceSaturation";
import { PanelCard } from "../../PanelCard";
import { SIGNAL_CHART_HEIGHT, SignalLegend } from "./SignalCardShell";

// Backend already returns `value` as a percentage (e.g. 18.5 → 18.5%).
function fmtSat(v: number): string {
  return `${v.toFixed(1)}%`;
}

export function SaturationSignal({ serviceName }: { serviceName: string }) {
  const query = useServiceSaturation(serviceName);

  const activeRows = query.data ?? [];
  const timestamps = useMemo(() => activeRows.map((r) => tsMs(r.timestamp) / 1000), [activeRows]);
  const values = useMemo(() => activeRows.map((r) => r.value), [activeRows]);

  const latest = values.length ? values[values.length - 1] : 0;
  const series: ObservabilityChartSeries[] = [
    { label: "saturation", values, color: "var(--color-accent,#8b5cf6)", fill: true },
  ];

  return (
    <PanelCard
      title="Saturation (CPU)"
      subtitle="%"
      action={<SignalLegend>curr {fmtSat(latest)}</SignalLegend>}
    >
      <ObservabilityChart
        type="area"
        timestamps={timestamps}
        series={series}
        height={SIGNAL_CHART_HEIGHT}
        yFormatter={fmtSat}
      />
    </PanelCard>
  );
}
