import { useMemo } from "react";

import ObservabilityChart, {
  type ObservabilityChartSeries,
} from "@shared/components/ui/charts/ObservabilityChart";
import { tsMs } from "@shared/utils/chartDataUtils";

import type { ErrorTimeSeriesPoint } from "@shared/api/errors";

import { PanelCard } from "@shared/components/ui/PanelCard";
import { fmtPct } from "@shared/utils/metricFormatters";
import { useErrorRateSeries } from "../hooks/useErrorRateSeries";

interface ChartData {
  timestamps: number[];
  series: ObservabilityChartSeries[];
}

function buildSeries(rows: ErrorTimeSeriesPoint[] | undefined): ChartData {
  const activeRows = rows ?? [];
  const timestamps = activeRows.map((r) => tsMs(r.timestamp) / 1000);

  return {
    timestamps,
    series: [
      {
        label: "error rate",
        values: activeRows.map((r) => (r.request_count ? r.error_count / r.request_count : 0)),
        color: "var(--color-critical,#f04438)",
        fill: true,
      },
    ],
  };
}

function ChartBody({ data }: { data: ChartData }) {
  if (data.timestamps.length === 0) {
    return (
      <div className="grid h-[180px] place-items-center text-[12px] text-foreground-muted">
        No error samples in this window.
      </div>
    );
  }
  return (
    <ObservabilityChart
      type="area"
      timestamps={data.timestamps}
      series={data.series}
      height={200}
      yFormatter={(v) => fmtPct(v, v < 0.01 ? 2 : 1)}
    />
  );
}

function CurrentRate({ value }: { value: number }) {
  const tone =
    value >= 0.02 ? "text-error" : value >= 0.005 ? "text-warning" : "text-foreground-secondary";
  return (
    <span className={`font-semibold text-[13px] ${tone}`}>
      {fmtPct(value, value < 0.01 ? 2 : 1)}
    </span>
  );
}

export function ErrorRatePanel({ serviceName }: { serviceName: string }) {
  const query = useErrorRateSeries(serviceName);
  const data = useMemo(() => buildSeries(query.data), [query.data]);
  const current = useMemo(() => {
    let req = 0;
    let err = 0;
    for (const r of query.data ?? []) {
      req += r.request_count;
      err += r.error_count;
    }
    return req > 0 ? err / req : 0;
  }, [query.data]);
  return (
    <PanelCard title="Error rate" subtitle="last 60m" action={<CurrentRate value={current} />}>
      <ChartBody data={data} />
    </PanelCard>
  );
}
