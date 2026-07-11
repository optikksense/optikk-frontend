import { tsMs } from "@shared/utils/chartDataUtils";
import { useMemo } from "react";
import type uPlot from "uplot";
import type { PerformanceSeries } from "./useOverviewModel";

export function usePerformanceChartData(series: PerformanceSeries): uPlot.AlignedData {
  const { timestamps, reqValues, errValues } = useMemo(() => {
    const reqByTs = new Map<number, number>();
    const errByTs = new Map<number, number>();

    for (const row of series.requestRows) {
      const t = Math.floor(tsMs(row.timestamp as string) / 1000);
      if (!Number.isFinite(t)) continue;
      reqByTs.set(t, (reqByTs.get(t) ?? 0) + Number(row.request_count ?? row.value ?? 0));
    }
    for (const row of series.errorRows) {
      const t = Math.floor(tsMs(row.timestamp as string) / 1000);
      if (!Number.isFinite(t)) continue;
      errByTs.set(t, (errByTs.get(t) ?? 0) + Number(row.error_count ?? 0));
    }

    const allTs = [...new Set([...reqByTs.keys(), ...errByTs.keys()])].sort((a, b) => a - b);

    return {
      timestamps: allTs,
      reqValues: allTs.map((t) => reqByTs.get(t) ?? 0),
      errValues: allTs.map((t) => errByTs.get(t) ?? 0),
    };
  }, [series.requestRows, series.errorRows]);

  return useMemo<uPlot.AlignedData>(
    () => [timestamps, reqValues, errValues],
    [timestamps, reqValues, errValues]
  );
}
