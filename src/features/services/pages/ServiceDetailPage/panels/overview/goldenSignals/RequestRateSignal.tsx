import { useMemo } from "react";

import ObservabilityChart, {
  type ObservabilityChartSeries,
} from "@shared/components/ui/charts/ObservabilityChart";

import { PanelCard } from "@shared/components/ui/PanelCard";
import { type StatusTimeseriesPoint, getStatusTimeseries } from "@shared/api/red/redApi";
import { useTimeRangeQuery } from "@shared/hooks/useTimeRangeQuery";
import { tsMs } from "@shared/utils/chartDataUtils";
import { fmtNum } from "@shared/utils/formatters";
import { SIGNAL_CHART_HEIGHT, SignalLegend } from "./SignalCardShell";

/**
 * Request rate golden signal — uses `getStatusTimeseries` (same endpoint
 * as the service drawer) for 100% data consistency across views.
 */
export function RequestRateSignal({ serviceName }: { serviceName: string }) {
  const query = useTimeRangeQuery<StatusTimeseriesPoint[]>(
    `service-detail.request-rate:${serviceName}`,
    (_tenant, start, end) => getStatusTimeseries(start, end, serviceName),
    { enabled: Boolean(serviceName) }
  );

  const points = query.data ?? [];

  const { timestamps, series, avg } = useMemo(() => {
    if (points.length === 0) return { timestamps: [], series: [], avg: 0 };

    const ts = points.map((p) => tsMs(p.timestamp) / 1000);
    const values = points.map(
      (p) => (p.status2xx ?? 0) + (p.status4xx ?? 0) + (p.status5xx ?? 0) + (p.statusOther ?? 0)
    );

    const total = values.reduce((sum, v) => sum + v, 0);
    const avgVal = values.length > 0 ? total / values.length : 0;

    const chartSeries: ObservabilityChartSeries[] = [
      { label: "requests", values, color: "var(--chart-1)", fill: false },
    ];

    return { timestamps: ts, series: chartSeries, avg: avgVal };
  }, [points]);

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
