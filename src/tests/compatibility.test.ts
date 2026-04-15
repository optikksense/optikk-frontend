import { describe, expect, it } from "vitest"

import { decodeStructuredFilters, encodeStructuredFilters } from "@/platform/url/filter-codec"
import { parseTimeRange, serializeTimeRange } from "@/platform/url/time-range-codec"

describe("compatibility codecs", () => {
  it("round-trips structured filters", () => {
    const encoded = encodeStructuredFilters([
      { field: "trace_id", operator: "equals", value: "abc" },
    ])
    expect(decodeStructuredFilters(encoded)).toEqual([
      { field: "trace_id", operator: "equals", value: "abc" },
    ])
  })

  it("keeps relative time range semantics", () => {
    const range = parseTimeRange("now-15m", "now")
    expect(serializeTimeRange(range)).toEqual({ from: "now-15m", to: "now" })
  })
})
