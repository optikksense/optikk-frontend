import { describe, expect, it } from "vitest";

import type { ExplorerFilter } from "@shared/search/types/filters";
import { buildLogsFilters } from "./buildLogsFilters";

const T0 = 1000;
const T1 = 2000;

function build(filters: readonly ExplorerFilter[]) {
  return buildLogsFilters(filters, T0, T1);
}

describe("buildLogsFilters", () => {
  it("maps resource dims to include arrays", () => {
    const { body, warnings } = build([
      { field: "serviceName", op: "eq", value: "api" },
      { field: "host", op: "eq", value: "h1" },
    ]);
    expect(body.services).toEqual(["api"]);
    expect(body.hosts).toEqual(["h1"]);
    expect(warnings).toHaveLength(0);
  });

  it("maps neq to exclude arrays where supported", () => {
    const { body } = build([{ field: "serviceName", op: "neq", value: "noise" }]);
    expect(body.excludeServices).toEqual(["noise"]);
  });

  it("warns on unsupported exclusions (pod/container/environment)", () => {
    const { warnings } = build([{ field: "pod", op: "neq", value: "p1" }]);
    expect(warnings).toHaveLength(1);
    expect(warnings[0].code).toBe("unsupported_op");
  });

  it("expands severity in-lists (the Errors-and-fatals template)", () => {
    const { body, warnings } = build([{ field: "severityText", op: "in", value: "ERROR,FATAL" }]);
    expect(body.severities).toEqual(["ERROR", "FATAL"]);
    expect(warnings).toHaveLength(0);
  });

  it("maps severity eq/neq", () => {
    const { body } = build([
      { field: "severityText", op: "eq", value: "ERROR" },
      { field: "severityText", op: "neq", value: "INFO" },
    ]);
    expect(body.severities).toEqual(["ERROR"]);
    expect(body.excludeSeverities).toEqual(["INFO"]);
  });

  it("joins search terms", () => {
    const { body } = build([
      { field: "search", op: "contains", value: "timeout" },
      { field: "body", op: "contains", value: "upstream" },
    ]);
    expect(body.search).toBe("timeout upstream");
  });

  it("treats body eq as substring, same as contains", () => {
    const { body, warnings } = build([{ field: "body", op: "eq", value: "request" }]);
    expect(body.search).toBe("request");
    expect(warnings).toEqual([]);
  });

  it("passes attribute ops through, including comparisons and exists", () => {
    const { body, warnings } = build([
      { field: "@http.statusCode", op: "gte", value: "500" },
      { field: "@user.id", op: "not_exists", value: "" },
    ]);
    expect(body.attributes).toEqual([
      { key: "http.statusCode", op: "gte", value: "500" },
      { key: "user.id", op: "not_exists", value: "" },
    ]);
    expect(warnings).toHaveLength(0);
  });

  it("warns on unsupported attribute ops", () => {
    const { warnings } = build([{ field: "@k", op: "in", value: "a,b" }]);
    expect(warnings[0].code).toBe("unsupported_op");
  });

  it("keeps only the first traceId and warns on duplicates", () => {
    const { body, warnings } = build([
      { field: "traceId", op: "eq", value: "t1" },
      { field: "traceId", op: "eq", value: "t2" },
    ]);
    expect(body.traceId).toBe("t1");
    expect(warnings[0].code).toBe("duplicate_single_value");
  });

  it("warns on unknown fields", () => {
    const { warnings } = build([{ field: "operation", op: "eq", value: "x" }]);
    expect(warnings[0].code).toBe("unknown_field");
  });
});
