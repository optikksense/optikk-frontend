import type { TraceRecord } from "@shared/api/traces/schemas";

// Error span ids for waterfall highlighting and the "e" hotkey cycle.
// The critical path now comes from the consolidated trace-detail response.
export function deriveErrorSpanIds(spans: readonly TraceRecord[]): Set<string> {
  return new Set(
    spans
      .filter((span) => span.hasError || span.status.toUpperCase().includes("ERROR"))
      .map((span) => span.spanId)
  );
}
