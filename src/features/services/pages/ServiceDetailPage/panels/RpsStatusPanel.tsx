import { useMemo, useState } from "react";
import type uPlot from "uplot";

import ObservabilityChart, {
  type ObservabilityChartSeries,
} from "@shared/components/ui/charts/ObservabilityChart";
import { tsMs } from "@shared/utils/chartDataUtils";

import type { StatusTimeseriesPoint } from "@/features/services/api/serviceDetailApi";

import { fmtNum } from "../formatters";
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

function buildSeries(rows: StatusTimeseriesPoint[] | undefined): ChartData {
  const activeRows = rows ?? [];
  const timestamps = activeRows.map((r) => tsMs(r.timestamp) / 1000);

  return {
    timestamps,
    series: [
      { label: "2xx", values: activeRows.map((r) => r.status_2xx), color: COLORS.s2xx, fill: true },
      { label: "4xx", values: activeRows.map((r) => r.status_4xx), color: COLORS.s4xx, fill: true },
      { label: "5xx", values: activeRows.map((r) => r.status_5xx), color: COLORS.s5xx, fill: true },
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
      <div className="grid h-[180px] place-items-center text-[12px] text-foreground-muted">
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
  const [filter, setFilter] = useState<StatusSeriesFilter>("all");
  const data = useMemo(() => buildSeries(query.data), [query.data]);
  const filtered = useMemo(() => filterSeries(data, filter), [data, filter]);
  return (
    <PanelCard
      title="Requests"
      subtitle="rps by status · last 60m"
      action={<StatusSeriesToggle value={filter} onChange={setFilter} />}
    >
      <ChartBody data={filtered} plugins={[]} />
    </PanelCard>
  );
}
