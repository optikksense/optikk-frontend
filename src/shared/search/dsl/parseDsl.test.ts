import { describe, expect, it } from "vitest";

import { TRACE_KNOWN_FIELDS, knownFieldsForScope } from "./knownFields";
import { parseDsl } from "./parseDsl";

const traceFields = TRACE_KNOWN_FIELDS;
const LOGS_TEST_FIELDS = knownFieldsForScope("logs");

describe("parseDsl", () => {
  it("parses bare tokens as free-text search", () => {
    const r = parseDsl("timeout", traceFields);
    expect(r.filters).toEqual([{ field: "search", op: "contains", value: "timeout" }]);
    expect(r.errors).toHaveLength(0);
  });

  it("parses quoted phrases as one search term", () => {
    const r = parseDsl('"time out"', traceFields);
    expect(r.filters).toEqual([{ field: "search", op: "contains", value: "time out" }]);
  });

  it("parses field:value as eq", () => {
    const r = parseDsl("service:checkout", traceFields);
    expect(r.filters).toEqual([{ field: "service", op: "eq", value: "checkout" }]);
  });

  it("parses -field:value as neq", () => {
    const r = parseDsl("-service:checkout", traceFields);
    expect(r.filters).toEqual([{ field: "service", op: "neq", value: "checkout" }]);
  });

  it("parses comparison prefixes", () => {
    expect(parseDsl("duration_ms:>=500", traceFields).filters[0]).toEqual({
      field: "duration_ms",
      op: "gte",
      value: "500",
    });
    expect(parseDsl("duration_ms:<10", traceFields).filters[0]).toEqual({
      field: "duration_ms",
      op: "lt",
      value: "10",
    });
  });

  it("parses (a OR b) as in", () => {
    const r = parseDsl("http_status:(500 OR 503)", traceFields);
    expect(r.filters).toEqual([{ field: "http_status", op: "in", value: "500,503" }]);
  });

  it("parses -field:(a OR b) as not_in", () => {
    const r = parseDsl("-service:(a OR b)", traceFields);
    expect(r.filters).toEqual([{ field: "service", op: "not_in", value: "a,b" }]);
  });

  it("parses @key:value as attribute eq", () => {
    const r = parseDsl("@http.status_code:500", traceFields);
    expect(r.filters).toEqual([{ field: "@http.status_code", op: "eq", value: "500" }]);
  });

  it("parses @key:* as exists and -@key:* as not_exists", () => {
    expect(parseDsl("@user.id:*", traceFields).filters).toEqual([
      { field: "@user.id", op: "exists", value: "" },
    ]);
    expect(parseDsl("-@user.id:*", traceFields).filters).toEqual([
      { field: "@user.id", op: "not_exists", value: "" },
    ]);
  });

  it("rejects :* on non-attribute fields", () => {
    const r = parseDsl("service:*", traceFields);
    expect(r.filters).toHaveLength(0);
    expect(r.errors[0].message).toContain("@attributes");
  });

  it("errors on unknown fields", () => {
    const r = parseDsl("nope:value", traceFields);
    expect(r.filters).toHaveLength(0);
    expect(r.errors[0].message).toContain('Unknown field "nope"');
  });

  it("errors on empty value", () => {
    const r = parseDsl("service:", traceFields);
    expect(r.filters).toHaveLength(0);
    expect(r.errors[0].message).toBe("Empty field or value");
  });

  it("parses mixed structured and free-text queries", () => {
    const r = parseDsl('service:checkout -severity_text:INFO "timeout"', LOGS_TEST_FIELDS);
    // service is not a logs field -> error; the rest parse.
    expect(r.errors).toHaveLength(1);
    expect(r.filters).toEqual([
      { field: "severity_text", op: "neq", value: "INFO" },
      { field: "search", op: "contains", value: "timeout" },
    ]);
  });
});
