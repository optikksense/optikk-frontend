import type { StructuredFilter } from "@/shared/hooks/useURLFilters";

import type { TraceRecord } from "../../types";

export function compareTraceText(left: unknown, right: unknown): number {
  return String(left ?? "").localeCompare(String(right ?? ""), undefined, {
    sensitivity: "base",
  });
}

export function compareTraceTimestamp(left: unknown, right: unknown): number {
  return new Date(String(left ?? 0)).getTime() - new Date(String(right ?? 0)).getTime();
}

export function formatLiveTailStatus(
  status: "idle" | "connecting" | "live" | "closed" | "error",
  lagMs: number
): string {
  if (status === "live") return `${Math.max(0, lagMs)}ms lag`;
  if (status === "closed") return "session ended";
  if (status === "error") return "stream error";
  return "connecting";
}

export function buildTraceRecordFromLiveItem(value: unknown): TraceRecord {
  const row = value as Record<string, unknown>;
  const start = new Date(String(row.timestamp ?? new Date().toISOString()));
  const durationMs = Number(row.durationMs ?? 0);
  const end = new Date(start.getTime() + durationMs);

  return {
    span_id: String(row.spanId ?? ""),
    trace_id: String(row.traceId ?? ""),
    service_name: String(row.serviceName ?? ""),
    operation_name: String(row.operationName ?? ""),
    start_time: start.toISOString(),
    end_time: end.toISOString(),
    duration_ms: durationMs,
    status: String(row.status ?? "UNSET"),
    span_kind: String(row.spanKind ?? ""),
    http_method: String(row.httpMethod ?? ""),
    http_status_code: Number(row.httpStatusCode ?? 0),
    status_message: "",
    parent_span_id: "",
  };
}

export function upsertFacetFilter(
  filters: StructuredFilter[],
  nextField: string,
  nextValue: string | null
): StructuredFilter[] {
  const withoutField = filters.filter((filter) => filter.field !== nextField);
  if (!nextValue) {
    return withoutField;
  }

  return [
    ...withoutField,
    {
      field: nextField,
      operator: "equals",
      value: nextValue,
    },
  ];
}
