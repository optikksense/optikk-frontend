import type { RelativeTimeRange, TimeRange } from "@/types";

import { RANGE_GROUPS } from "./constants";

const ALL_PRESETS: RelativeTimeRange[] = RANGE_GROUPS.flatMap((g) => g.items);

const UNIT_MAP: Record<string, { suffix: string; minuteMultiplier: number }> = {
  m: { suffix: "m", minuteMultiplier: 1 },
  min: { suffix: "m", minuteMultiplier: 1 },
  mins: { suffix: "m", minuteMultiplier: 1 },
  minute: { suffix: "m", minuteMultiplier: 1 },
  minutes: { suffix: "m", minuteMultiplier: 1 },
  h: { suffix: "h", minuteMultiplier: 60 },
  hr: { suffix: "h", minuteMultiplier: 60 },
  hrs: { suffix: "h", minuteMultiplier: 60 },
  hour: { suffix: "h", minuteMultiplier: 60 },
  hours: { suffix: "h", minuteMultiplier: 60 },
  d: { suffix: "d", minuteMultiplier: 1440 },
  day: { suffix: "d", minuteMultiplier: 1440 },
  days: { suffix: "d", minuteMultiplier: 1440 },
  w: { suffix: "d", minuteMultiplier: 10080 },
  week: { suffix: "d", minuteMultiplier: 10080 },
  weeks: { suffix: "d", minuteMultiplier: 10080 },
};

const DAY_NAMES = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];

function makeRelative(minutes: number, label: string): RelativeTimeRange {
  // Try to find a matching preset first
  const found = ALL_PRESETS.find((p) => p.minutes === minutes);
  if (found) return found;
  return { kind: "relative", preset: `${minutes}m`, label, minutes };
}

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function endOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);
}

/**
 * Parse a time expression into a TimeRange.
 *
 * Supported formats:
 * - Grafana-style: "now-6h", "now-2d", "now-30m"
 * - Preset shortcuts: "5m", "1h", "7d", "30d"
 * - Natural language: "last 2 hours", "last 30 minutes", "last 7 days"
 * - Named periods: "yesterday", "today", "this week", "last week"
 * - Day names: "last tuesday", "last monday"
 * - Absolute: "2024-03-15 14:00 to 2024-03-15 18:00"
 *
 * Returns null if the input cannot be parsed.
 */
export function parseTimeExpression(input: string): TimeRange | null {
  const trimmed = input.trim().toLowerCase();
  if (!trimmed) return null;

  // 1. Direct preset match: "5m", "1h", "7d"
  const directPreset = ALL_PRESETS.find(
    (p) => p.preset === trimmed || p.label.toLowerCase() === trimmed
  );
  if (directPreset) return directPreset;

  // 2. Grafana-style: "now-6h", "now-30m", "now-2d"
  const grafanaMatch = /^now-(\d+)(m|h|d|w)$/.exec(trimmed);
  if (grafanaMatch) {
    const num = Number.parseInt(grafanaMatch[1], 10);
    const unit = UNIT_MAP[grafanaMatch[2]];
    if (unit) {
      const minutes = num * unit.minuteMultiplier;
      return makeRelative(minutes, `Last ${num}${grafanaMatch[2]}`);
    }
  }

  // 3. "last N <unit>" pattern
  const lastNMatch = /^last\s+(\d+)\s+(\w+)$/.exec(trimmed);
  if (lastNMatch) {
    const num = Number.parseInt(lastNMatch[1], 10);
    const unit = UNIT_MAP[lastNMatch[2]];
    if (unit && num > 0) {
      const minutes = num * unit.minuteMultiplier;
      return makeRelative(minutes, `Last ${num} ${lastNMatch[2]}`);
    }
  }

  // 4. "<N><unit>" shorthand: "2h", "30m", "3d"
  const shorthandMatch = /^(\d+)(m|h|d|w)$/.exec(trimmed);
  if (shorthandMatch) {
    const num = Number.parseInt(shorthandMatch[1], 10);
    const unit = UNIT_MAP[shorthandMatch[2]];
    if (unit && num > 0) {
      const minutes = num * unit.minuteMultiplier;
      return makeRelative(minutes, `Last ${num}${shorthandMatch[2]}`);
    }
  }

  // 5. Named periods
  const now = new Date();
  switch (trimmed) {
    case "today": {
      const start = startOfDay(now);
      return {
        kind: "absolute",
        startMs: start.getTime(),
        endMs: now.getTime(),
        label: "Today",
      };
    }
    case "yesterday": {
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      return {
        kind: "absolute",
        startMs: startOfDay(yesterday).getTime(),
        endMs: endOfDay(yesterday).getTime(),
        label: "Yesterday",
      };
    }
    case "this week": {
      const dayOfWeek = now.getDay();
      const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
      const monday = new Date(now);
      monday.setDate(monday.getDate() + mondayOffset);
      return {
        kind: "absolute",
        startMs: startOfDay(monday).getTime(),
        endMs: now.getTime(),
        label: "This week",
      };
    }
    case "last week": {
      const dayOfWeek = now.getDay();
      const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
      const thisMonday = new Date(now);
      thisMonday.setDate(thisMonday.getDate() + mondayOffset);
      const lastMonday = new Date(thisMonday);
      lastMonday.setDate(lastMonday.getDate() - 7);
      const lastSunday = new Date(thisMonday);
      lastSunday.setDate(lastSunday.getDate() - 1);
      return {
        kind: "absolute",
        startMs: startOfDay(lastMonday).getTime(),
        endMs: endOfDay(lastSunday).getTime(),
        label: "Last week",
      };
    }
    case "since midnight": {
      return {
        kind: "absolute",
        startMs: startOfDay(now).getTime(),
        endMs: now.getTime(),
        label: "Since midnight",
      };
    }
  }

  // 6. "last <dayname>" — e.g., "last tuesday"
  const lastDayMatch = /^last\s+(\w+)$/.exec(trimmed);
  if (lastDayMatch) {
    const dayIndex = DAY_NAMES.indexOf(lastDayMatch[1]);
    if (dayIndex >= 0) {
      const target = new Date(now);
      const currentDay = now.getDay();
      let daysBack = currentDay - dayIndex;
      if (daysBack <= 0) daysBack += 7;
      target.setDate(target.getDate() - daysBack);
      return {
        kind: "absolute",
        startMs: startOfDay(target).getTime(),
        endMs: endOfDay(target).getTime(),
        label: `Last ${lastDayMatch[1].charAt(0).toUpperCase() + lastDayMatch[1].slice(1)}`,
      };
    }
  }

  // 7. Absolute range: "YYYY-MM-DD HH:mm to YYYY-MM-DD HH:mm"
  const toSplit = trimmed.split(/\s+to\s+/);
  if (toSplit.length === 2) {
    const startDate = new Date(toSplit[0].replace(" ", "T"));
    const endDate = new Date(toSplit[1].replace(" ", "T"));
    if (
      !Number.isNaN(startDate.getTime()) &&
      !Number.isNaN(endDate.getTime()) &&
      startDate < endDate
    ) {
      return {
        kind: "absolute",
        startMs: startDate.getTime(),
        endMs: endDate.getTime(),
        label: `${toSplit[0]} to ${toSplit[1]}`,
      };
    }
  }

  return null;
}

/**
 * Filter presets that match the given search query.
 * Used for the autocomplete dropdown in the time input.
 */
export function filterPresets(query: string): RelativeTimeRange[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return ALL_PRESETS.filter(
    (p) =>
      p.preset.includes(q) ||
      p.label.toLowerCase().includes(q) ||
      `last ${p.label.toLowerCase()}`.includes(q)
  );
}
