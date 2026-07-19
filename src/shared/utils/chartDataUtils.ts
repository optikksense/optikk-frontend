import type { ObservabilityChartSeries } from "@shared/components/ui/charts/ObservabilityChart";
import { getChartColor } from "./charting";

export function tsMs(ts: string | number | null | undefined): number {
  if (!ts) return Number.NaN;
  const raw = String(ts).trim();
  const normalized = raw.includes("T") ? raw : raw.replace(" ", "T");
  const hasTimezone = /([zZ]|[+-]\d{2}:\d{2})$/.test(normalized);
  const ms = new Date(hasTimezone ? normalized : `${normalized}Z`).getTime();
  return Number.isNaN(ms) ? Number.NaN : ms;
}

export function firstValue<T>(row: unknown, keys: string[], fallback: T): T {
  if (!row || typeof row !== "object") return fallback;
  const record = row as Record<string, unknown>;
  for (const key of keys) {
    const value = record[key];
    if (value !== undefined && value !== null && value !== "") {
      return value as T;
    }
  }
  return fallback;
}

export function extractTimeseries(
  data: Array<Record<string, unknown>> = [],
  serviceTimeseriesMap: Record<string, Array<Record<string, unknown>>> = {},
  selectedEndpoints: string[] = [],
  valueKeys: string[],
  datasetLabel: string,
  color: string,
  fill = true,
  transform?: (row: Record<string, unknown>) => number
): { timestamps: number[]; chartData: ObservabilityChartSeries[] } {
  const hasServiceData = Object.keys(serviceTimeseriesMap).length > 0;
  let activeTimestamps: number[] = [];
  let seriesList: ObservabilityChartSeries[] = [];

  if (hasServiceData) {
    const activeEntries = Object.entries(serviceTimeseriesMap)
      .filter(([key]) => selectedEndpoints.length === 0 || selectedEndpoints.includes(key))
      .slice(0, 10);

    const firstSvc = activeEntries[0]?.[1] ?? [];
    activeTimestamps = firstSvc
      .map((row) => tsMs(firstValue(row, ["timestamp", "timeBucket"], "")) / 1000)
      .filter((t) => !Number.isNaN(t));

    seriesList = activeEntries.map(([svcName, rows], idx) => {
      const values = rows.map((row) => {
        return transform ? transform(row) : Number(firstValue(row, valueKeys, 0));
      });
      return { label: svcName, values, color: getChartColor(idx), fill: false };
    });
  } else {
    activeTimestamps = data
      .map((d) => tsMs(firstValue(d, ["timestamp", "timeBucket"], "")) / 1000)
      .filter((t) => !Number.isNaN(t));
    seriesList = [
      {
        label: datasetLabel,
        values: data.map((d) => (transform ? transform(d) : Number(firstValue(d, valueKeys, 0)))),
        color,
        fill,
      },
    ];
  }

  return { timestamps: activeTimestamps, chartData: seriesList };
}
