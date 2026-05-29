import type { MetricQueryResult, MetricSeriesData, MetricSpaceAggregation } from "../types";

/** Per-series summary statistics computed over a single series' value array. */
export interface SeriesStats {
  readonly min: number;
  readonly avg: number;
  readonly max: number;
  readonly p95: number;
  readonly p99: number;
  /** First non-null value in the window. */
  readonly first: number | null;
  /** Last non-null value in the window. */
  readonly last: number | null;
  /** Count of non-null samples in the series. */
  readonly samples: number;
  /** Absolute change of last vs first non-null value (null when undefined). */
  readonly delta: number | null;
}

/** Aggregate KPI summary across all series of a query, over the full window. */
export interface QuerySummary {
  /** Current value: the spatially aggregated last non-null point across series. */
  readonly current: number | null;
  readonly avg: number | null;
  readonly min: number | null;
  readonly max: number | null;
  /** Total non-null points across every series. */
  readonly samples: number;
  /** Number of series (cardinality). */
  readonly cardinality: number;
  /** Aggregate delta: current vs the spatially aggregated first non-null point. */
  readonly delta: number | null;
}

function nonNull(values: ReadonlyArray<number | null>): number[] {
  const out: number[] = [];
  for (const v of values) {
    if (v != null && !Number.isNaN(v)) out.push(v);
  }
  return out;
}

/** Linear-interpolated percentile (0–100) over a value array, ignoring nulls. */
export function percentile(values: ReadonlyArray<number | null>, p: number): number {
  const clean = nonNull(values).sort((a, b) => a - b);
  if (clean.length === 0) return 0;
  if (clean.length === 1) return clean[0];
  const rank = (p / 100) * (clean.length - 1);
  const low = Math.floor(rank);
  const high = Math.ceil(rank);
  if (low === high) return clean[low];
  return clean[low] + (clean[high] - clean[low]) * (rank - low);
}

function firstNonNull(values: ReadonlyArray<number | null>): number | null {
  for (const v of values) {
    if (v != null && !Number.isNaN(v)) return v;
  }
  return null;
}

function lastNonNull(values: ReadonlyArray<number | null>): number | null {
  for (let i = values.length - 1; i >= 0; i--) {
    const v = values[i];
    if (v != null && !Number.isNaN(v)) return v;
  }
  return null;
}

/** Compute summary statistics for a single series across its own value array. */
export function computeSeriesStats(series: MetricSeriesData): SeriesStats {
  const clean = nonNull(series.values);
  const first = firstNonNull(series.values);
  const last = lastNonNull(series.values);
  if (clean.length === 0) {
    return { min: 0, avg: 0, max: 0, p95: 0, p99: 0, first, last, samples: 0, delta: null };
  }
  const sum = clean.reduce((acc, v) => acc + v, 0);
  return {
    min: Math.min(...clean),
    avg: sum / clean.length,
    max: Math.max(...clean),
    p95: percentile(series.values, 95),
    p99: percentile(series.values, 99),
    first,
    last,
    samples: clean.length,
    delta: first != null && last != null ? last - first : null,
  };
}

/** Spatially aggregate a list of values across series at one time index. */
function aggregateAcross(values: number[], spaceAgg: MetricSpaceAggregation): number | null {
  if (values.length === 0) return null;
  switch (spaceAgg) {
    case "sum":
      return values.reduce((acc, v) => acc + v, 0);
    case "min":
      return Math.min(...values);
    case "max":
      return Math.max(...values);
    case "avg":
      return values.reduce((acc, v) => acc + v, 0) / values.length;
  }
}

/** Collect the spatially aggregated value at each timestamp index across series. */
function aggregatedTimeline(
  result: MetricQueryResult,
  spaceAgg: MetricSpaceAggregation
): Array<number | null> {
  const length = result.timestamps.length;
  const timeline: Array<number | null> = [];
  for (let i = 0; i < length; i++) {
    const column: number[] = [];
    for (const series of result.series) {
      const v = series.values[i];
      if (v != null && !Number.isNaN(v)) column.push(v);
    }
    timeline.push(aggregateAcross(column, spaceAgg));
  }
  return timeline;
}

/**
 * Build the KPI summary for a query: current / 1h avg-min-max are derived from
 * the spatially aggregated timeline; samples and cardinality count raw series.
 */
export function computeQuerySummary(
  result: MetricQueryResult | undefined,
  spaceAgg: MetricSpaceAggregation
): QuerySummary {
  if (!result || result.series.length === 0) {
    return { current: null, avg: null, min: null, max: null, samples: 0, cardinality: 0, delta: null };
  }
  const timeline = aggregatedTimeline(result, spaceAgg);
  const clean = nonNull(timeline);
  const current = lastNonNull(timeline);
  const first = firstNonNull(timeline);
  const samples = result.series.reduce((acc, s) => acc + nonNull(s.values).length, 0);
  return {
    current,
    avg: clean.length > 0 ? clean.reduce((a, v) => a + v, 0) / clean.length : null,
    min: clean.length > 0 ? Math.min(...clean) : null,
    max: clean.length > 0 ? Math.max(...clean) : null,
    samples,
    cardinality: result.series.length,
    delta: current != null && first != null ? current - first : null,
  };
}
