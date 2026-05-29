import { useMemo, useState } from "react";
import type uPlot from "uplot";

import ObservabilityChart, {
  type ObservabilityChartSeries,
} from "@shared/components/ui/charts/ObservabilityChart";
import { useChartTimeBuckets } from "@shared/hooks/useChartTimeBuckets";
import { tsKey, tsMs } from "@shared/utils/chartDataUtils";

import type { StatusTimeseriesPoint } from "@/features/services/api/serviceDetailApi";

import { fmtNum } from "../formatters";
import { useDeployMarkers } from "../hooks/useDeployMarkers";
import { useStatusTimeseries } from "../hooks/useStatusTimeseries";
import { PanelCard } from "./PanelCard";
import { type StatusSeriesFilter, StatusSeriesToggle } from "./StatusSeriesToggle";

const COLORS = {
  s2xx: "var(--color-healthy)",
  s4xx: "var(--color-degraded)",
  s5xx: "var(--color-critical)",
};

interface ChartData {
  timestamps: number[];
  series: ObservabilityChartSeries[];
}

function buildSeries(rows: StatusTimeseriesPoint[] | undefined, timeBuckets: string[]): ChartData {
  const timestamps = timeBuckets.map((t) => tsMs(t) / 1000);

  if (!rows || rows.length === 0) {
    const zeros = timestamps.map(() => 0);
    return {
      timestamps,
      series: [
        { label: "2xx", values: [...zeros], color: COLORS.s2xx, fill: true },
        { label: "4xx", values: [...zeros], color: COLORS.s4xx, fill: true },
        { label: "5xx", values: [...zeros], color: COLORS.s5xx, fill: true },
      ],
    };
  }

  const map2xx: Record<string, number> = {};
  const map4xx: Record<string, number> = {};
  const map5xx: Record<string, number> = {};
  for (const r of rows) {
    const key = tsKey(r.timestamp);
    map2xx[key] = (map2xx[key] ?? 0) + r.status_2xx;
    map4xx[key] = (map4xx[key] ?? 0) + r.status_4xx;
    map5xx[key] = (map5xx[key] ?? 0) + r.status_5xx;
  }

  const s2xx = timeBuckets.map((t) => map2xx[tsKey(t)] ?? 0);
  const s4xx = timeBuckets.map((t) => map4xx[tsKey(t)] ?? 0);
  const s5xx = timeBuckets.map((t) => map5xx[tsKey(t)] ?? 0);

  return {
    timestamps,
    series: [
      { label: "2xx", values: s2xx, color: COLORS.s2xx, fill: true },
      { label: "4xx", values: s4xx, color: COLORS.s4xx, fill: true },
      { label: "5xx", values: s5xx, color: COLORS.s5xx, fill: true },
    ],
  };
}

function filterSeries(data: ChartData, filter: StatusSeriesFilter): ChartData {
  if (filter === "all") return data;
  return {
    timestamps: data.timestamps,
    series: data.series.filter((s) => s.label === filter),
  };
}

function ChartBody({ data, plugins }: { data: ChartData; plugins: uPlot.Plugin[] }) {
  if (data.timestamps.length === 0) {
    return (
      <div className="grid h-[180px] place-items-center text-[12px] text-[var(--text-muted)]">
        No request traffic in this window.
      </div>
    );
  }
  return (
    <ObservabilityChart
      type="area"
      timestamps={data.timestamps}
      series={data.series}
      height={200}
      yFormatter={(v) => fmtNum(v)}
      plugins={plugins}
    />
  );
}

export function RpsStatusPanel({ serviceName }: { serviceName: string }) {
  const query = useStatusTimeseries(serviceName);
  const { timeBuckets } = useChartTimeBuckets();
  const deployPlugins = useDeployMarkers(serviceName);
  const [filter, setFilter] = useState<StatusSeriesFilter>("all");
  const data = useMemo(() => buildSeries(query.data, timeBuckets), [query.data, timeBuckets]);
  const filtered = useMemo(() => filterSeries(data, filter), [data, filter]);
  return (
    <PanelCard
      title="Requests"
      subtitle="rps by status"
      action={<StatusSeriesToggle value={filter} onChange={setFilter} />}
    >
      <ChartBody data={filtered} plugins={deployPlugins} />
    </PanelCard>
  );
}
