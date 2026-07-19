import { describe, expect, it } from "vitest";

import type { ExplorerFilter } from "../types/filters";
import { formatDsl, formatFilter } from "./formatDsl";
import { TRACE_KNOWN_FIELDS } from "./knownFields";
import { parseDsl } from "./parseDsl";

describe("formatDsl", () => {
  it("renders each op as retypeable DSL", () => {
    const cases: ReadonlyArray<[ExplorerFilter, string]> = [
      [{ field: "service", op: "eq", value: "api" }, "service:api"],
      [{ field: "service", op: "neq", value: "api" }, "-service:api"],
      [{ field: "duration_ms", op: "gte", value: "500" }, "duration_ms:>=500"],
      [{ field: "duration_ms", op: "lt", value: "10" }, "duration_ms:<10"],
      [{ field: "http_status", op: "in", value: "500,503" }, "http_status:(500 OR 503)"],
      [{ field: "service", op: "not_in", value: "a,b" }, "-service:(a OR b)"],
      [{ field: "@user.id", op: "exists", value: "" }, "@user.id:*"],
      [{ field: "@user.id", op: "not_exists", value: "" }, "-@user.id:*"],
      [{ field: "search", op: "contains", value: "timeout" }, "timeout"],
      [{ field: "search", op: "contains", value: "time out" }, '"time out"'],
    ];
    for (const [filter, expected] of cases) {
      expect(formatFilter(filter)).toBe(expected);
    }
  });

  it("round-trips through parseDsl for every op", () => {
    const filters: readonly ExplorerFilter[] = [
      { field: "service", op: "eq", value: "api" },
      { field: "service", op: "neq", value: "web" },
      { field: "duration_ms", op: "gte", value: "500" },
      { field: "http_status", op: "in", value: "500,503" },
      { field: "@user.id", op: "exists", value: "" },
      { field: "search", op: "contains", value: "timeout" },
    ];
    const text = formatDsl(filters);
    const reparsed = parseDsl(text, TRACE_KNOWN_FIELDS);
    expect(reparsed.errors).toHaveLength(0);
    expect(reparsed.filters).toEqual(filters);
  });

  it("round-trips a value containing whitespace", () => {
    const filter: ExplorerFilter = { field: "service", op: "eq", value: "upi payments" };
    const dsl = formatDsl([filter]);
    expect(dsl).toBe('service:"upi payments"');
    expect(parseDsl(dsl, TRACE_KNOWN_FIELDS).filters).toEqual([filter]);
  });
});
