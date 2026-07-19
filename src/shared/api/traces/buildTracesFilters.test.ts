import { describe, expect, it } from "vitest";

import type { ExplorerFilter } from "@shared/search/types/filters";
import { buildTracesFilters } from "./buildTracesFilters";

const T0 = 1000;
const T1 = 2000;

function build(filters: readonly ExplorerFilter[]) {
  return buildTracesFilters(filters, T0, T1);
}

describe("buildTracesFilters", () => {
  it("maps service (parser/facets field key) to services", () => {
    const { body, warnings } = build([{ field: "service", op: "eq", value: "checkout" }]);
    expect(body.services).toEqual(["checkout"]);
    expect(warnings).toHaveLength(0);
  });

  it("maps service_name to services for compatibility", () => {
    const { body } = build([{ field: "service_name", op: "eq", value: "checkout" }]);
    expect(body.services).toEqual(["checkout"]);
  });

  it("maps -service to excludeServices", () => {
    const { body } = build([{ field: "service", op: "neq", value: "noise" }]);
    expect(body.excludeServices).toEqual(["noise"]);
  });

  it("expands in-lists into the include array", () => {
    const { body, warnings } = build([{ field: "http_status", op: "in", value: "500,502, 503" }]);
    expect(body.httpStatuses).toEqual(["500", "502", "503"]);
    expect(warnings).toHaveLength(0);
  });

  it("warns instead of dropping unsupported exclusions", () => {
    const { body, warnings } = build([{ field: "operation", op: "neq", value: "GET /" }]);
    expect(body.operations).toBeUndefined();
    expect(warnings).toHaveLength(1);
    expect(warnings[0].code).toBe("unsupported_op");
  });

  it("warns on unknown fields", () => {
    const { warnings } = build([{ field: "bogus", op: "eq", value: "x" }]);
    expect(warnings[0].code).toBe("unknown_field");
  });

  it("converts duration_ms comparisons to nanoseconds", () => {
    const { body } = build([
      { field: "duration_ms", op: "gte", value: "500" },
      { field: "duration_ms", op: "lt", value: "2000" },
    ]);
    expect(body.minDurationNs).toBe(500_000_000);
    expect(body.maxDurationNs).toBe(2_000_000_000);
  });

  it("passes attribute ops through, including comparisons and exists", () => {
    const { body, warnings } = build([
      { field: "@http.status_code", op: "gte", value: "500" },
      { field: "@user.id", op: "exists", value: "" },
    ]);
    expect(body.attributes).toEqual([
      { key: "http.status_code", op: "gte", value: "500" },
      { key: "user.id", op: "exists", value: "" },
    ]);
    expect(warnings).toHaveLength(0);
  });

  it("warns on attribute in-lists (not supported by the backend)", () => {
    const { body, warnings } = build([{ field: "@k", op: "in", value: "a,b" }]);
    expect(body.attributes).toBeUndefined();
    expect(warnings[0].code).toBe("unsupported_op");
  });

  it("joins search terms", () => {
    const { body } = build([
      { field: "search", op: "contains", value: "timeout" },
      { field: "body", op: "contains", value: "checkout" },
    ]);
    expect(body.search).toBe("timeout checkout");
  });

  it("keeps only the first trace_id and warns on duplicates", () => {
    const { body, warnings } = build([
      { field: "trace_id", op: "eq", value: "t1" },
      { field: "trace_id", op: "eq", value: "t2" },
    ]);
    expect(body.traceId).toBe("t1");
    expect(warnings[0].code).toBe("duplicate_single_value");
  });

  it("maps has_error", () => {
    expect(build([{ field: "has_error", op: "eq", value: "true" }]).body.hasError).toBe(true);
    expect(build([{ field: "has_error", op: "eq", value: "false" }]).body.hasError).toBe(false);
  });
});
