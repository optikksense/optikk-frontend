import { useMemo } from "react";

import { useTimeRange } from "@shared/hooks/useTimeRangeQuery";

import type { DeployRow } from "./useDeploysData";

const MIN_BUCKET_MS = 5 * 60 * 1000;
const TARGET_BUCKETS = 48;

export interface DeployTimeline {
  readonly counts: number[];
  readonly labels: string[];
  readonly total: number;
}

function formatTick(ms: number, spanMs: number): string {
  const d = new Date(ms);
  if (spanMs <= 48 * 60 * 60 * 1000) {
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }
  return d.toLocaleDateString([], { month: "short", day: "numeric" });
}

/**
 * Buckets latest-per-service deploy events into ~48 even bins across the active
 * time range. Sparse by nature (one event per service) — faithful to the only
 * all-services source rather than the design's multi-deploy histogram.
 */
export function useDeployTimeline(rows: ReadonlyArray<DeployRow>): DeployTimeline {
  const { getTimeRange } = useTimeRange();
  return useMemo<DeployTimeline>(() => {
    const bounds = getTimeRange();
    const start = Number(bounds.startTime);
    const end = Number(bounds.endTime);
    const spanMs = Math.max(MIN_BUCKET_MS, end - start);
    const bucketMs = Math.max(MIN_BUCKET_MS, Math.ceil(spanMs / TARGET_BUCKETS));
    const bucketCount = Math.max(1, Math.ceil(spanMs / bucketMs));
    const counts = new Array<number>(bucketCount).fill(0);
    for (const row of rows) {
      if (row.deployedAtMs < start || row.deployedAtMs > end) continue;
      const idx = Math.min(bucketCount - 1, Math.floor((row.deployedAtMs - start) / bucketMs));
      counts[idx] += 1;
    }
    const labels = counts.map((_c, i) => formatTick(start + i * bucketMs, spanMs));
    return { counts, labels, total: rows.length };
  }, [rows, getTimeRange]);
}
