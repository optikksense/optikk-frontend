export * from './api';
export * from './branded';
export * from './common';
export * from './dashboardConfig';

export interface RelativeTimeRange {
  kind: 'relative';
  preset: string; // e.g. '5m', '1h', '7d'
  label: string;
  minutes: number;
}

export interface AbsoluteTimeRange {
  kind: 'absolute';
  startMs: number; // Unix ms
  endMs: number; // Unix ms
  label: string;
}

export type TimeRange = RelativeTimeRange | AbsoluteTimeRange;

/** Helper to check if a range is relative */
export function isRelativeRange(r: TimeRange): r is RelativeTimeRange {
  return r.kind === 'relative';
}

/** Helper to check if a range is absolute */
export function isAbsoluteRange(r: TimeRange): r is AbsoluteTimeRange {
  return r.kind === 'absolute';
}

/** Resolve any TimeRange to absolute start/end ms bounds */
export function resolveTimeRangeBounds(r: TimeRange): { startTime: number; endTime: number } {
  if (r.kind === 'absolute') {
    return { startTime: r.startMs, endTime: r.endMs };
  }
  const now = Math.floor(Date.now() / 10_000) * 10_000; // stabilize to 10 seconds
  return { startTime: now - r.minutes * 60_000, endTime: now };
}

/** Compute duration in ms for any TimeRange */
export function timeRangeDurationMs(r: TimeRange): number {
  if (r.kind === 'absolute') return r.endMs - r.startMs;
  return r.minutes * 60_000;
}

export interface Team {
  id: number;
  name: string;
  orgName?: string;
}

export interface User {
  id: string | number;
  email: string;
  name?: string;
  teams?: Team[];
}
