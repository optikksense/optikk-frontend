import { useSearchParamsCompat as useSearchParams } from "@shared/hooks/useSearchParamsCompat";
import { useEffect, useRef } from "react";

import type { RelativeTimeRange, TimeRange } from "@shared/types";

import { TIME_RANGES } from "@config/constants";

import { useAppStore, useTimeRange } from "@app/store/appStore";

const PARAM_FROM = "from";
const PARAM_TO = "to";
const PARAM_TZ = "tz";

/** Matches "now-Xm", "now-Xh", "now-Xd" */
const RELATIVE_RE = /^now-(\d+)(m|h|d)$/;

function presetToUrlValue(preset: string): string {
  return `now-${preset}`;
}

function urlValueToPreset(val: string): RelativeTimeRange | null {
  const m = RELATIVE_RE.exec(val);
  if (!m) return null;
  const num = Number.parseInt(m[1], 10);
  const unit = m[2];
  let minutes: number;
  let presetStr: string;
  switch (unit) {
    case "m":
      minutes = num;
      presetStr = `${num}m`;
      break;
    case "h":
      minutes = num * 60;
      presetStr = `${num}h`;
      break;
    case "d":
      minutes = num * 1440;
      presetStr = `${num}d`;
      break;
    default:
      return null;
  }
  const found = TIME_RANGES.find((r) => r.preset === presetStr);
  if (found) return found;
  return { kind: "relative", preset: presetStr, label: `Last ${num}${unit}`, minutes };
}

export function parseUrlTimeRange(from: string | null, to: string | null): TimeRange | null {
  if (!from) return null;

  if (from.startsWith("now-") && (!to || to === "now")) {
    return urlValueToPreset(from);
  }

  const startMs = Number(from);
  const endMs = Number(to);
  if (Number.isFinite(startMs) && Number.isFinite(endMs) && startMs < endMs) {
    return {
      kind: "absolute",
      startMs,
      endMs,
      label: "Custom range",
    };
  }

  return null;
}

export function timeRangeToUrlParams(r: TimeRange): { from: string; to: string } {
  if (r.kind === "relative") {
    return { from: presetToUrlValue(r.preset), to: "now" };
  }
  return { from: String(r.startMs), to: String(r.endMs) };
}

/** A snapshot of the time-range-relevant URL params. */
export interface UrlTimeState {
  from: string | null;
  to: string | null;
  tz: string | null;
}

/** The URL params store->URL sync should write, or null if the URL already matches. */
export interface UrlWrite {
  from: string;
  to: string;
  tz: string | null;
}

/**
 * Pure decision: what (if anything) store->URL sync must write.
 * Returns null when the URL already reflects the store — the guard that keeps
 * the effect idempotent.
 */
export function resolveUrlWrite(
  timeRange: TimeRange,
  timezone: string,
  url: UrlTimeState
): UrlWrite | null {
  const params = timeRangeToUrlParams(timeRange);
  const expectedTz = timezone !== "local" ? timezone : null;
  if (url.from === params.from && url.to === params.to && (url.tz ?? null) === expectedTz) {
    return null;
  }
  return { from: params.from, to: params.to, tz: expectedTz };
}

/**
 * Pure decision: what (if anything) URL->store sync must write.
 * Returns null when the URL is invalid or the store already matches it.
 */
export function resolveStoreWrite(timeRange: TimeRange, url: UrlTimeState): TimeRange | null {
  const parsed = parseUrlTimeRange(url.from, url.to);
  if (!parsed) return null;
  const currentParams = timeRangeToUrlParams(timeRange);
  const parsedParams = timeRangeToUrlParams(parsed);
  if (currentParams.from === parsedParams.from && currentParams.to === parsedParams.to) {
    return null;
  }
  return parsed;
}

function readUrl(searchParams: URLSearchParams): UrlTimeState {
  return {
    from: searchParams.get(PARAM_FROM),
    to: searchParams.get(PARAM_TO),
    tz: searchParams.get(PARAM_TZ),
  };
}

function applyUrlWrite(
  setSearchParams: ReturnType<typeof useSearchParams>[1],
  write: UrlWrite
): void {
  setSearchParams(
    (prev) => {
      const next = new URLSearchParams(prev);
      next.set(PARAM_FROM, write.from);
      next.set(PARAM_TO, write.to);
      if (write.tz) {
        next.set(PARAM_TZ, write.tz);
      } else {
        next.delete(PARAM_TZ);
      }
      return next;
    },
    { replace: true }
  );
}

/**
 * Keeps the time range in sync between the app store and the URL.
 *
 * The two directional effects deliberately depend only on their OWN source and
 * read the other via a ref / getState, never via a render-closure value. Cross-
 * depending on both sources makes the effects fire on each other's writes and
 * oscillate forever (store and URL are always one render apart), which freezes
 * the tab on every time-range change.
 */
export function useTimeRangeURL(): void {
  const [searchParams, setSearchParams] = useSearchParams();
  const timeRange = useTimeRange();
  const timezone = useAppStore((s) => s.timezone);
  const setTimeRange = useAppStore((s) => s.setTimeRange);
  const setTimezone = useAppStore((s) => s.setTimezone);

  // Latest searchParams for comparison inside the store->URL effect without
  // making that effect re-run when the URL changes.
  const searchParamsRef = useRef(searchParams);
  searchParamsRef.current = searchParams;

  const initialized = useRef(false);

  // 1. Mount hydration: the URL wins over the persisted store on first load.
  // biome-ignore lint/correctness/useExhaustiveDependencies: run once on mount only
  useEffect(() => {
    const parsed = parseUrlTimeRange(searchParams.get(PARAM_FROM), searchParams.get(PARAM_TO));
    if (parsed) {
      setTimeRange(parsed);
      const urlTz = searchParams.get(PARAM_TZ);
      if (urlTz && urlTz !== timezone) setTimezone(urlTz);
    } else {
      writeStoreToUrl(setSearchParams, timeRange, timezone);
    }
    initialized.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 2. Store -> URL: fires only on store changes (not on URL changes).
  useEffect(() => {
    if (!initialized.current) return;

    const params = timeRangeToUrlParams(timeRange);
    const expectedTz = timezone !== "local" ? timezone : null;

    const sp = searchParamsRef.current;
    if (
      sp.get(PARAM_FROM) === params.from &&
      sp.get(PARAM_TO) === params.to &&
      (sp.get(PARAM_TZ) ?? null) === expectedTz
    ) {
      return;
    }

    writeStoreToUrl(setSearchParams, timeRange, timezone);
  }, [timeRange, timezone, setSearchParams]);

  // 3. URL -> Store: fires only on URL changes (browser back/forward, hydration).
  //    Reads the store via getState so store changes never re-trigger this.
  useEffect(() => {
    if (!initialized.current) return;

    const parsed = parseUrlTimeRange(searchParams.get(PARAM_FROM), searchParams.get(PARAM_TO));
    if (!parsed) return;

    const current = useAppStore.getState().timeRange;
    const currentParams = timeRangeToUrlParams(current);
    const parsedParams = timeRangeToUrlParams(parsed);
    if (currentParams.from !== parsedParams.from || currentParams.to !== parsedParams.to) {
      setTimeRange(parsed);
    }

    const urlTz = searchParams.get(PARAM_TZ);
    if (urlTz && urlTz !== useAppStore.getState().timezone) setTimezone(urlTz);
  }, [searchParams, setTimeRange, setTimezone]);
}
