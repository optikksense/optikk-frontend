import { formatDuration } from "@shared/utils/formatters";
import { useMemo } from "react";
import type { TraceRecord } from "../types";

/**
 * Hook to map raw trace data to detail panel fields.
 */
export function useTraceDetailFields(trace: TraceRecord | null) {
  return useMemo(() => {
    if (!trace) return [];

    return [
      {
        key: "trace_id",
        label: "Trace ID",
        value: trace.trace_id,
        filterable: true,
      },
      {
        key: "service_name",
        label: "Service",
        value: trace.service_name,
        filterable: true,
      },
      {
        key: "operation_name",
        label: "Operation",
        value: trace.operation_name,
        filterable: false,
      },
      {
        key: "status",
        label: "Status",
        value: trace.status,
        filterable: true,
      },
      {
        key: "http_method",
        label: "HTTP Method",
        value: trace.http_method,
        filterable: true,
      },
      {
        key: "http_status_code",
        label: "HTTP Status Code",
        value: trace.http_status_code ? String(trace.http_status_code) : null,
        filterable: false,
      },
      {
        key: "duration_ms",
        label: "Duration",
        value: formatDuration(trace.duration_ms),
        filterable: false,
      },
      {
        key: "start_time",
        label: "Start Time",
        value: trace.start_time,
        filterable: false,
      },
    ].filter((field) => Boolean(field.value));
  }, [trace]);
}
