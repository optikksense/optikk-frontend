import type { LogsTrendBucket } from "../../api/logsAnalyticsApi";

export interface ChartBucket {
  readonly ts: number;
  readonly debug: number;
  readonly info: number;
  readonly warn: number;
  readonly err: number;
}

export function parseBucketMs(time_bucket: string, idx: number): number {
  const iso = time_bucket.includes("T") ? time_bucket : time_bucket.replace(" ", "T");
  const utc = /[zZ]|[+-]\d{2}:?\d{2}$/.test(iso) ? iso : `${iso}Z`;
  const ms = Date.parse(utc);
  return Number.isNaN(ms) ? idx : ms;
}

export function prepareLogsTrendData(trend: readonly LogsTrendBucket[] | undefined): ChartBucket[] {
  if (!trend || trend.length === 0) return [];
  return trend
    .map((b, idx) => ({
      ts: parseBucketMs(b.time_bucket, idx),
      debug: b.debug,
      info: b.info,
      warn: b.warn,
      err: b.error,
    }))
    .sort((a, b) => a.ts - b.ts);
}

/**
 * Transforms ChartBuckets into the cumulative format required for a uPlot stacked bar chart.
 * Draws highest series (err) in the back, then warn, info, and debug in front.
 * Returns [timestamps, err_cumulative, warn_cumulative, info_cumulative, debug_cumulative]
 */
export function buildCumulativeSeries(buckets: ChartBucket[]): [number[], number[], number[], number[], number[]] {
  const timestamps: number[] = [];
  const errSeries: number[] = [];
  const warnSeries: number[] = [];
  const infoSeries: number[] = [];
  const debugSeries: number[] = [];

  for (const b of buckets) {
    timestamps.push(b.ts / 1000); // uPlot expects timestamps in seconds
    const d = b.debug;
    const i = d + b.info;
    const w = i + b.warn;
    const e = w + b.err;

    debugSeries.push(d);
    infoSeries.push(i);
    warnSeries.push(w);
    errSeries.push(e);
  }

  return [timestamps, errSeries, warnSeries, infoSeries, debugSeries];
}
