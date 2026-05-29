import type { MetricQueryResult, TopSeriesGroupBy } from "../types";
import { computeSeriesStats } from "./seriesStats";

/** One ranked row in the Top series panel. */
export interface TopSeriesRow {
  /** Display label for the group (tag value, or joined tags when ungrouped). */
  readonly label: string;
  /** Secondary label (e.g. a related tag value), when available. */
  readonly sublabel?: string;
  /** Current (last non-null) value used for ranking and the bar. */
  readonly current: number;
  /** Change of last vs first non-null value across the window. */
  readonly delta: number | null;
}

/** Tag keys that satisfy a given group-by dimension, in priority order. */
const GROUP_BY_TAG_KEYS: Record<TopSeriesGroupBy, string[]> = {
  host: ["host", "hostname", "instance", "pod", "instance_id"],
  region: ["region", "az", "availability_zone", "datacenter"],
  version: ["version", "ver", "release", "image_tag"],
};

function resolveTagValue(tags: Record<string, string>, groupBy: TopSeriesGroupBy): string | null {
  for (const key of GROUP_BY_TAG_KEYS[groupBy]) {
    if (tags[key] != null) return tags[key];
  }
  return null;
}

function joinTags(tags: Record<string, string>): string {
  const values = Object.values(tags);
  return values.length > 0 ? values.join(", ") : "all";
}

/**
 * Rank a query's series by current value (desc), re-grouping by the chosen tag
 * dimension. When a series has no tag for that dimension it is bucketed under
 * its full tag label so nothing is silently dropped.
 */
export function buildTopSeriesRows(
  result: MetricQueryResult | undefined,
  groupBy: TopSeriesGroupBy
): TopSeriesRow[] {
  if (!result || result.series.length === 0) return [];

  // Aggregate current value + delta per group key (average across members).
  const groups = new Map<
    string,
    { sublabel?: string; currentSum: number; currentCount: number; deltaSum: number; deltaCount: number }
  >();

  for (const series of result.series) {
    const stats = computeSeriesStats(series);
    if (stats.last == null) continue;
    const groupValue = resolveTagValue(series.tags, groupBy) ?? joinTags(series.tags);
    const existing = groups.get(groupValue) ?? {
      sublabel: series.tags.region ?? series.tags.az ?? undefined,
      currentSum: 0,
      currentCount: 0,
      deltaSum: 0,
      deltaCount: 0,
    };
    existing.currentSum += stats.last;
    existing.currentCount += 1;
    if (stats.delta != null) {
      existing.deltaSum += stats.delta;
      existing.deltaCount += 1;
    }
    groups.set(groupValue, existing);
  }

  const rows: TopSeriesRow[] = [];
  for (const [label, g] of groups) {
    rows.push({
      label,
      sublabel: g.sublabel,
      current: g.currentSum / g.currentCount,
      delta: g.deltaCount > 0 ? g.deltaSum / g.deltaCount : null,
    });
  }

  return rows.sort((a, b) => b.current - a.current);
}
