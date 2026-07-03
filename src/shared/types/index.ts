export * from "./common";
export * from "./dashboardConfig";

export interface RelativeTimeRange {
  kind: "relative";
  preset: string; // e.g. '5m', '1h', '7d'
  label: string;
  minutes: number;
}

export interface AbsoluteTimeRange {
  kind: "absolute";
  startMs: number;
  endMs: number;
  label: string;
}

export type TimeRange = RelativeTimeRange | AbsoluteTimeRange;

export function isRelativeRange(r: TimeRange): r is RelativeTimeRange {
  return r.kind === "relative";
}

export function resolveTimeRangeBounds(r: TimeRange): { startTime: number; endTime: number } {
  if (r.kind === "absolute") {
    return { startTime: r.startMs, endTime: r.endMs };
  }
  const now = Math.floor(Date.now() / 10_000) * 10_000;
  return { startTime: now - r.minutes * 60_000, endTime: now };
}

export function timeRangeDurationMs(r: TimeRange): number {
  if (r.kind === "absolute") return r.endMs - r.startMs;
  return r.minutes * 60_000;
}

export interface Team {
  id: number;
  name: string;
  orgName?: string | null;
}

export interface User {
  id: string | number;
  email: string;
  name?: string | null;
  avatarUrl?: string | null;
  teams?: Team[];
}
