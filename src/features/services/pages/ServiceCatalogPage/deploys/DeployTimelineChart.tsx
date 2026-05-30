import { useMemo } from "react";
import type uPlot from "uplot";

import UPlotChart, { defaultAxes, uBars } from "@shared/components/ui/charts/UPlotChart";
import { getChartColor } from "@shared/utils/charting";

import type { DeployRow } from "./useDeploysData";
import { useDeployTimeline } from "./useDeployTimeline";

interface DeployTimelineChartProps {
  readonly rows: ReadonlyArray<DeployRow>;
}

export function DeployTimelineChart({ rows }: DeployTimelineChartProps) {
  const { counts, labels, total } = useDeployTimeline(rows);

  const plot = useMemo(() => {
    const xVals = counts.map((_c, i) => i);
    const axes = defaultAxes();
    axes[0] = {
      ...axes[0],
      values: (_self: uPlot, splits: number[]) => splits.map((i) => labels[Math.round(i)] ?? ""),
    };
    const options: Omit<uPlot.Options, "width" | "height"> = {
      axes,
      series: [{}, uBars("Deploys", getChartColor(0))],
      legend: { show: false },
      scales: { x: { time: false, distr: 2 }, y: { min: 0 } },
    };
    return { data: [xVals, counts] as uPlot.AlignedData, options };
  }, [counts, labels]);

  if (total === 0) {
    return (
      <div className="grid h-[120px] place-items-center text-[12px] text-foreground-muted">
        No deploys in this time range.
      </div>
    );
  }

  return <UPlotChart options={plot.options} data={plot.data} height={120} className="w-full" />;
}
