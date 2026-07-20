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

export function useTimeRangeURL(): void {
  const [searchParams, setSearchParams] = useSearchParams();
  const timeRange = useTimeRange();
  const timezone = useAppStore((s) => s.timezone);
  const setTimeRange = useAppStore((s) => s.setTimeRange);
  const setTimezone = useAppStore((s) => s.setTimezone);

  // 1. Initial hydration on mount: read URL or push store default to URL
  useEffect(() => {
    const urlFrom = searchParams.get(PARAM_FROM);
    const urlTo = searchParams.get(PARAM_TO);
    const urlTz = searchParams.get(PARAM_TZ);

    const parsed = parseUrlTimeRange(urlFrom, urlTo);
    if (parsed) {
      setTimeRange(parsed);
      if (urlTz && urlTz !== timezone) setTimezone(urlTz);
    } else {
      const params = timeRangeToUrlParams(timeRange);
      const expectedTz = timezone !== "local" ? timezone : null;
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          next.set(PARAM_FROM, params.from);
          next.set(PARAM_TO, params.to);
          if (expectedTz) next.set(PARAM_TZ, expectedTz);
          return next;
        },
        { replace: true }
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 2. Sync Store -> URL when store timeRange or timezone changes
  useEffect(() => {
    const params = timeRangeToUrlParams(timeRange);
    const expectedTz = timezone !== "local" ? timezone : null;

    const urlFrom = searchParams.get(PARAM_FROM);
    const urlTo = searchParams.get(PARAM_TO);
    const urlTz = searchParams.get(PARAM_TZ);

    if (urlFrom === params.from && urlTo === params.to && (urlTz ?? null) === expectedTz) {
      return;
    }

    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.set(PARAM_FROM, params.from);
        next.set(PARAM_TO, params.to);
        if (expectedTz) {
          next.set(PARAM_TZ, expectedTz);
        } else {
          next.delete(PARAM_TZ);
        }
        return next;
      },
      { replace: true }
    );
  }, [timeRange, timezone, searchParams, setSearchParams]);

  // 3. Sync URL -> Store when URL searchParams change (e.g. browser back/forward)
  useEffect(() => {
    const urlFrom = searchParams.get(PARAM_FROM);
    const urlTo = searchParams.get(PARAM_TO);
    const urlTz = searchParams.get(PARAM_TZ);

    const parsed = parseUrlTimeRange(urlFrom, urlTo);
    if (!parsed) return;

    const currentParams = timeRangeToUrlParams(timeRange);
    const parsedParams = timeRangeToUrlParams(parsed);

    // Stop sync loop if store already matches URL params
    if (currentParams.from === parsedParams.from && currentParams.to === parsedParams.to) {
      return;
    }

    setTimeRange(parsed);
    if (urlTz && urlTz !== timezone) setTimezone(urlTz);
  }, [searchParams, setTimeRange, setTimezone, timeRange, timezone]);
}


