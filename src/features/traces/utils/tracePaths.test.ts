import type { TraceRecord } from "@shared/api/traces/schemas";
import { describe, expect, it } from "vitest";
import { deriveCriticalPathSpanIds, deriveErrorSpanIds } from "./tracePaths";

function span(
  spanId: string,
  parentSpanId: string,
  startMs: number,
  durationMs: number,
  hasError = false
): TraceRecord {
  return {
    spanId,
    parentSpanId,
    traceId: "trace",
    serviceName: "service",
    operationName: spanId,
    startTime: new Date(startMs).toISOString(),
    endTime: new Date(startMs + durationMs).toISOString(),
    durationMs,
    status: hasError ? "ERROR" : "OK",
    spanKind: "SERVER",
    hasError,
    startNs: startMs * 1_000_000,
  };
}

describe("trace path derivation", () => {
  it("uses the child whose subtree finishes latest", () => {
    const spans = [
      span("root", "", 1_000, 100),
      span("short", "root", 1_010, 20),
      span("long", "root", 1_020, 30),
      span("long-child", "long", 1_040, 80),
    ];

    expect([...deriveCriticalPathSpanIds(spans)]).toEqual(["root", "long", "long-child"]);
  });

  it("derives error highlighting from the existing span response", () => {
    const spans = [span("root", "", 1_000, 100), span("failed", "root", 1_010, 20, true)];
    expect([...deriveErrorSpanIds(spans)]).toEqual(["failed"]);
  });
});
