import type { TimeRange } from "@shared/types";
import { describe, expect, it } from "vitest";
import {
  type UrlTimeState,
  parseUrlTimeRange,
  resolveStoreWrite,
  resolveUrlWrite,
  timeRangeToUrlParams,
} from "./useTimeRangeURL";

const rel = (preset: string, minutes: number): TimeRange => ({
  kind: "relative",
  preset,
  label: `Last ${preset}`,
  minutes,
});

describe("useTimeRangeURL utilities", () => {
  it("parses relative URL preset values correctly", () => {
    const parsed = parseUrlTimeRange("now-15m", "now");
    expect(parsed).toEqual({
      kind: "relative",
      label: "Last 15 minutes",
      preset: "15m",
      minutes: 15,
    });
  });

  it("parses custom relative duration values", () => {
    const parsed = parseUrlTimeRange("now-45m", "now");
    expect(parsed).toEqual({
      kind: "relative",
      label: "Last 45m",
      preset: "45m",
      minutes: 45,
    });
  });

  it("parses absolute millisecond time ranges correctly", () => {
    const startMs = 1700000000000;
    const endMs = 1700003600000;
    const parsed = parseUrlTimeRange(String(startMs), String(endMs));
    expect(parsed).toEqual({
      kind: "absolute",
      startMs,
      endMs,
      label: "Custom range",
    });
  });

  it("serializes relative time range to URL parameters", () => {
    const range: TimeRange = {
      kind: "relative",
      preset: "1h",
      label: "Last 1 hour",
      minutes: 60,
    };
    expect(timeRangeToUrlParams(range)).toEqual({
      from: "now-1h",
      to: "now",
    });
  });

  it("serializes absolute time range to URL parameters", () => {
    const range: TimeRange = {
      kind: "absolute",
      startMs: 1700000000000,
      endMs: 1700003600000,
      label: "Custom range",
    };
    expect(timeRangeToUrlParams(range)).toEqual({
      from: "1700000000000",
      to: "1700003600000",
    });
  });

  it("returns null for invalid from parameter", () => {
    expect(parseUrlTimeRange(null, "now")).toBeNull();
    expect(parseUrlTimeRange("invalid", "now")).toBeNull();
  });
});

describe("useTimeRangeURL sync decisions", () => {
  it("resolveUrlWrite returns null when URL already matches the store", () => {
    const url: UrlTimeState = { from: "now-30m", to: "now", tz: null };
    expect(resolveUrlWrite(rel("30m", 30), "local", url)).toBeNull();
  });

  it("resolveUrlWrite writes store values when URL is stale", () => {
    const url: UrlTimeState = { from: "now-30m", to: "now", tz: null };
    expect(resolveUrlWrite(rel("24h", 1440), "local", url)).toEqual({
      from: "now-24h",
      to: "now",
      tz: null,
    });
  });

  it("resolveStoreWrite returns null when store already matches the URL", () => {
    const url: UrlTimeState = { from: "now-24h", to: "now", tz: null };
    expect(resolveStoreWrite(rel("24h", 1440), url)).toBeNull();
  });

  it("resolveStoreWrite returns null for an invalid URL", () => {
    const url: UrlTimeState = { from: null, to: null, tz: null };
    expect(resolveStoreWrite(rel("24h", 1440), url)).toBeNull();
  });

  // The freeze was an infinite store<->URL swap. This asserts the invariant that
  // prevents it: from ANY disagreeing (store, URL) snapshot, applying one
  // store->URL write then one URL->store write reaches a fixed point where both
  // resolvers return null — i.e. no further work, no oscillation.
  it("reaches a fixed point in one round-trip from a disagreeing state", () => {
    const store = rel("30m", 30);
    let url: UrlTimeState = { from: "now-24h", to: "now", tz: null };

    // store -> URL
    const urlWrite = resolveUrlWrite(store, "local", url);
    expect(urlWrite).not.toBeNull();
    if (urlWrite) url = { from: urlWrite.from, to: urlWrite.to, tz: urlWrite.tz };

    // URL now reflects the store; both directions must be settled.
    expect(resolveStoreWrite(store, url)).toBeNull();
    expect(resolveUrlWrite(store, "local", url)).toBeNull();
  });

  it("settles when the URL is authoritative (back/forward navigation)", () => {
    let store = rel("30m", 30);
    const url: UrlTimeState = { from: "now-1h", to: "now", tz: null };

    // URL -> store
    const next = resolveStoreWrite(store, url);
    expect(next).not.toBeNull();
    expect(next && timeRangeToUrlParams(next)).toEqual({ from: "now-1h", to: "now" });
    if (next) store = next;

    // store now reflects the URL; both directions settled.
    expect(resolveUrlWrite(store, "local", url)).toBeNull();
    expect(resolveStoreWrite(store, url)).toBeNull();
  });
});
