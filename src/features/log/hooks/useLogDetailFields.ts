import type { LogEntry } from "@entities/log/model";
import { tsLabel } from "@shared/utils/time";
import { useMemo } from "react";

/**
 * Hook to map raw log entry to detail panel fields.
 * Decomposes display logic from the main page component.
 */
export function useLogDetailFields(log: LogEntry | null) {
  return useMemo(() => {
    if (!log) return [];

    return [
      { key: "timestamp", label: "Timestamp", value: tsLabel(log.timestamp) },
      { key: "level", label: "Level", value: log.level, filterable: true },
      { key: "service_name", label: "Service", value: log.service_name, filterable: true },
      { key: "host", label: "Host", value: log.host, filterable: true },
      { key: "pod", label: "Pod", value: log.pod },
      { key: "container", label: "Container", value: log.container },

      { key: "trace_id", label: "Trace ID", value: log.trace_id, filterable: true },
      { key: "span_id", label: "Span ID", value: log.span_id },
    ].filter((field) => !!field.value);
  }, [log]);
}
