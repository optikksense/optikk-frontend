import { CHART_COLORS } from "@config/constants";

import { getResolvedChartPalette } from "./chartTheme";

/** Get a color from the shared chart palette by index. */
export function getChartColor(index: number): string {
  const palette = getResolvedChartPalette();
  const effectivePalette = palette.length > 0 ? palette : CHART_COLORS;
  return effectivePalette[index % effectivePalette.length];
}

type TimestampLike = string | number | Date;

function getTimestampValue(value: unknown, timestampKey: string): TimestampLike | null {
  if (typeof value !== "object" || value === null) {
    return null;
  }

  const raw = (value as Record<string, unknown>)[timestampKey];
  if (raw instanceof Date || typeof raw === "string" || typeof raw === "number") {
    return raw;
  }

  return null;
}

/** Format timestamps for chart x-axis labels. */
export function formatChartLabels<T extends object>(
  data: T[],
  timestampKey = "timestamp"
): string[] {
  if (!data || data.length === 0) return [];
  const timestamps = data
    .map((item) => getTimestampValue(item, timestampKey))
    .filter((item): item is TimestampLike => item !== null)
    .map((timestamp) => new Date(timestamp).getTime());
  if (timestamps.length === 0) return [];
  const spanMs = Math.max(...timestamps) - Math.min(...timestamps);
  const day = 86400000;

  return data.map((item) => {
    const timestamp = getTimestampValue(item, timestampKey);
    const date = timestamp == null ? new Date(0) : new Date(timestamp);
    if (spanMs <= day) {
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    }
    if (spanMs <= 7 * day) {
      return `${date.toLocaleDateString([], { weekday: "short" })} ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
    }
    return date.toLocaleDateString([], { month: "short", day: "numeric" });
  });
}

/** Generate time bucket strings spanning [startMs, endMs]. */
export function generateTimeBuckets(startMs: number, endMs: number): string[] {
  const rangeMs = endMs - startMs;
  let stepMs: number;

  if (rangeMs <= 3 * 3600000) stepMs = 60000;
  else if (rangeMs <= 86400000) stepMs = 300000;
  else stepMs = 3600000;

  const alignedStart = Math.floor(startMs / stepMs) * stepMs;
  const buckets: string[] = [];
  for (let t = alignedStart; t <= endMs; t += stepMs) {
    buckets.push(new Date(t).toISOString());
  }
  return buckets;
}
