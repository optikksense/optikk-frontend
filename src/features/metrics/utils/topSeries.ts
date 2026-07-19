import type { MetricQueryResult, TopSeriesGroupBy } from "@shared/metrics/types";
import { computeSeriesStats } from "@shared/metrics/utils/seriesStats";

/** One ranked row in the Top series panel. */
export interface TopSeriesRow {
  readonly label: string;

  readonly sublabel?: string;

  readonly current: number;

  readonly delta: number | null;
}

const GROUP_BY_TAG_KEYS: Record<TopSeriesGroupBy, string[]> = {
  host: ["host", "hostname", "instance", "pod", "instanceId"],
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

export function buildTopSeriesRows(
  result: MetricQueryResult | undefined,
  groupBy: TopSeriesGroupBy
): TopSeriesRow[] {
  if (!result || result.series.length === 0) return [];

  const groups = new Map<
    string,
    {
      sublabel?: string;
      currentSum: number;
      currentCount: number;
      deltaSum: number;
      deltaCount: number;
    }
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
