import { describe, expect, it } from "vitest";
import { parseUrlTimeRange, timeRangeToUrlParams } from "./useTimeRangeURL";
import type { TimeRange } from "@shared/types";

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
