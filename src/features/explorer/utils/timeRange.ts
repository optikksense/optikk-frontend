import type { TimeRange } from "@/types";
import { resolveTimeRangeBounds } from "@/types";

export interface ResolvedTimeBounds {
  readonly startTime: number;
  readonly endTime: number;
}

/**
 * Resolves the app store time range (relative or absolute) into millisecond
 * start/end bounds used by explorer API payloads.
 */
export function resolveTimeBounds(timeRange: TimeRange): ResolvedTimeBounds {
  return resolveTimeRangeBounds(timeRange);
}
