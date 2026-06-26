import { resolveTimeRangeBounds, timeRangeDurationMs } from "@/types";
import type { TimeRange } from "@/types";

export interface CustomTimeRangeBounds {
  readonly startMs: number;
  readonly endMs: number;
}

export function shiftTimeRange(
  timeRange: TimeRange,
  direction: "backward" | "forward"
): CustomTimeRangeBounds {
  const dur = timeRangeDurationMs(timeRange);
  const { startTime, endTime } = resolveTimeRangeBounds(timeRange);
  const shift = Math.round(dur / 2);

  if (direction === "backward") {
    return { startMs: startTime - shift, endMs: endTime - shift };
  }

  const now = Date.now();
  const newEnd = Math.min(endTime + shift, now);
  const newStart = Math.min(startTime + shift, now - dur);
  return { startMs: newStart, endMs: newEnd };
}

export function zoomTimeRange(
  timeRange: TimeRange,
  direction: "in" | "out"
): CustomTimeRangeBounds {
  const dur = timeRangeDurationMs(timeRange);
  const { startTime, endTime } = resolveTimeRangeBounds(timeRange);
  const mid = (startTime + endTime) / 2;

  if (direction === "in") {
    const halfNewDur = Math.max(dur / 4, 60_000); // min 1 minute
    return { startMs: Math.round(mid - halfNewDur), endMs: Math.round(mid + halfNewDur) };
  }

  const halfNewDur = dur;
  const now = Date.now();
  return {
    startMs: Math.round(mid - halfNewDur),
    endMs: Math.min(Math.round(mid + halfNewDur), now),
  };
}
