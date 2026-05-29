import { useMemo } from "react";
import type uPlot from "uplot";

import ObservabilityChart, {
  type ObservabilityChartSeries,
} from "@shared/components/ui/charts/ObservabilityChart";
import { useChartTimeBuckets } from "@shared/hooks/useChartTimeBuckets";
import { tsKey, tsMs } from "@shared/utils/chartDataUtils";

import type { ErrorTimeSeriesPoint } from "@/features/errors/api/errorGroupsApi";

import { fmtPct } from "../formatters";
import { useDeployMarkers } from "../hooks/useDeployMarkers";
import { useErrorRateSeries } from "../hooks/useErrorRateSeries";
import { PanelCard } from "./PanelCard";

interface ChartData {
  timestamps: number[];
  series: ObservabilityChartSeries[];
}

function buildSeries(rows: ErrorTimeSeriesPoint[] | undefined, timeBuckets: string[]): ChartData {
  const timestamps = timeBuckets.map((t) => tsMs(t) / 1000);

  if (!rows || rows.length === 0) {
    return {
      timestamps,
      series: [
        {
          label: "error rate",
          values: timestamps.map(() => 0),
          color: "var(--color-critical,#f04438)",
          fill: true,
        },
      ],
    };
  }

  // Build lookup map from API rows keyed by normalized timestamp
  const dataMap: Record<string, { requests: number; errors: number }> = {};
  for (const r of rows) {
    if (!r.timestamp) continue;
    const key = tsKey(r.timestamp);
    const existing = dataMap[key];
    if (existing) {
      existing.requests += r.request_count;
      existing.errors += r.error_count;
    } else {
      dataMap[key] = { requests: r.request_count, errors: r.error_count };
    }
  }

  const values = timeBuckets.map((t) => {
    const entry = dataMap[tsKey(t)];
    if (!entry || !entry.requests) return 0;
    return entry.errors / entry.requests;
  });

  return {
    timestamps,
    series: [
      {
        label: "error rate",
        values,
        color: "var(--color-critical,#f04438)",
        fill: true,
      },
    ],
  };
}

function ChartBody({ data, plugins }: { data: ChartData; plugins: uPlot.Plugin[] }) {
  if (data.timestamps.length === 0) {
    return (
      <div className="grid h-[180px] place-items-center text-[12px] text-[var(--text-muted)]">
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
      plugins={plugins}
    />
  );
}

export function ErrorRatePanel({ serviceName }: { serviceName: string }) {
  const query = useErrorRateSeries(serviceName);
  const { timeBuckets } = useChartTimeBuckets();
  const deployPlugins = useDeployMarkers(serviceName);
  const data = useMemo(() => buildSeries(query.data, timeBuckets), [query.data, timeBuckets]);
  return (
    <PanelCard title="Error rate" subtitle="errors / requests">
      <ChartBody data={data} plugins={deployPlugins} />
    </PanelCard>
  );
}
