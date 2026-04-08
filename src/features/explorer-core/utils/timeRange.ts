import type { TimeRange } from "@/types";
import { resolveTimeRangeBounds } from "@/types";

export interface ResolvedTimeBounds {
  startTime: number;
  endTime: number;
}

export function resolveTimeBounds(timeRange: TimeRange): ResolvedTimeBounds {
  return resolveTimeRangeBounds(timeRange);
}
