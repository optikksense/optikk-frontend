import { useMemo } from "react";

import { useTimeRangeQuery } from "@shared/hooks/useTimeRangeQuery";

import { getLatencyHeatmap } from "@/features/saturation/api/databaseLatencyApi";
import type { LatencyHeatmapBucket } from "@/features/saturation/api/databaseSeriesSchemas";
import type { DatabaseFilters } from "@/features/saturation/api/databaseSlowQueriesApi";
import {
  type GroupedSeriesResult,
  groupSeriesByLabel,
} from "@/features/saturation/series/groupSeriesByLabel";

/**
 * Renders the latency distribution as one line per latency bucket-label, with
 * the bucket's sample count over time. (A true 2D heatmap primitive does not
 * exist in the shared chart layer; the band breakdown preserves the same signal.)
 */
export function useDatastoreLatencyHeatmap(system: string): GroupedSeriesResult {
  const filters: DatabaseFilters = { db_system: system };
  const query = useTimeRangeQuery<LatencyHeatmapBucket[]>(
    "saturation-datastore.latency-heatmap",
    (_t, s, e) => getLatencyHeatmap(s, e, filters),
    { extraKeys: [system] }
  );
  return useMemo(
    () =>
      groupSeriesByLabel(
        (query.data ?? []).map((r) => ({
          timeBucket: r.time_bucket,
          label: r.bucket_label,
          value: r.count,
        })),
        8
      ),
    [query.data]
  );
}
