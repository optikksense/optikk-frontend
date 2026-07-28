import { useSearchParamsCompat as useSearchParams } from "@shared/hooks/useSearchParamsCompat";
import { useEffect, useRef } from "react";

import type { RelativeTimeRange, TimeRange } from "@shared/types";

import { TIME_RANGES } from "@config/constants";

import { useAppStore, useTimeRange } from "@app/store/appStore";

const PARAM_FROM = "from";
const PARAM_TO = "to";
const PARAM_TZ = "tz";

                                           
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

                                                        
export interface UrlTimeState {
  from: string | null;
  to: string | null;
  tz: string | null;
}

                                                                                       
export interface UrlWrite {
  from: string;
  to: string;
  tz: string | null;
}

   
                                                                
                                                                              
                         
   
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

   
                                                                  
  
                                                                               
                                                                                
                                                                              
                                                                               
                                      
   
export function useTimeRangeURL(): void {
  const [searchParams, setSearchParams] = useSearchParams();
  const timeRange = useTimeRange();
  const timezone = useAppStore((s) => s.timezone);
  const setTimeRange = useAppStore((s) => s.setTimeRange);
  const setTimezone = useAppStore((s) => s.setTimezone);

                                                                            
                                                    
  const searchParamsRef = useRef(searchParams);
  searchParamsRef.current = searchParams;

  const initialized = useRef(false);

                                                                             
                                                                                    
  useEffect(() => {
    const url = readUrl(searchParams);
    const parsed = parseUrlTimeRange(url.from, url.to);
    if (parsed) {
      setTimeRange(parsed);
      if (url.tz && url.tz !== timezone) setTimezone(url.tz);
    } else {
      const write = resolveUrlWrite(timeRange, timezone, url);
      if (write) applyUrlWrite(setSearchParams, write);
    }
    initialized.current = true;
                                                           
  }, []);

                                                                       
  useEffect(() => {
    if (!initialized.current) return;
    const write = resolveUrlWrite(timeRange, timezone, readUrl(searchParamsRef.current));
    if (write) applyUrlWrite(setSearchParams, write);
  }, [timeRange, timezone, setSearchParams]);

                                                                                  
                                                                            
  useEffect(() => {
    if (!initialized.current) return;
    const url = readUrl(searchParams);
    const next = resolveStoreWrite(useAppStore.getState().timeRange, url);
    if (next) setTimeRange(next);
    if (url.tz && url.tz !== useAppStore.getState().timezone) setTimezone(url.tz);
  }, [searchParams, setTimeRange, setTimezone]);
}
