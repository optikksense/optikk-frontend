import { useMemo } from "react";

import ObservabilityChart, {
  type ObservabilityChartSeries,
} from "@shared/components/ui/charts/ObservabilityChart";

import { PanelCard } from "@shared/components/ui/PanelCard";
import { type ErrorTimeSeriesPoint, getServiceErrorRate } from "@shared/api/errors";
import { useTimeRangeQuery } from "@shared/hooks/useTimeRangeQuery";
import { tsMs } from "@shared/utils/chartDataUtils";
import { fmtPct } from "@shared/utils/formatters";
import { SIGNAL_CHART_HEIGHT, SignalLegend } from "./SignalCardShell";

/**
 * Error rate golden signal — uses `getServiceErrorRate` (same endpoint
 * as the service drawer) for 100% data consistency across views.
 */
export function ErrorRateSignal({ serviceName }: { serviceName: string }) {
  const query = useTimeRangeQuery<ErrorTimeSeriesPoint[]>(
    `service-detail.error-rate:${serviceName}`,
    (_tenant, start, end) => getServiceErrorRate(start, end, { serviceName }),
    { enabled: Boolean(serviceName) }
  );

  const points = query.data ?? [];

  const { timestamps, series, peak } = useMemo(() => {
    if (points.length === 0) return { timestamps: [], series: [], peak: 0 };

    const ts = points.map((p) => tsMs(p.timestamp) / 1000);
    const values = points.map((p) => {
      const requests = p.requestCount ?? 0;
      const errors = p.errorCount ?? 0;
      return requests > 0 ? (errors / requests) * 100 : 0;
    });

    let max = 0;
    for (const v of values) {
      if (v > max) max = v;
    }

    const chartSeries: ObservabilityChartSeries[] = [
      { label: "error rate", values, color: "var(--chart-2)", fill: false },
    ];

    return { timestamps: ts, series: chartSeries, peak: max };
  }, [points]);

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
