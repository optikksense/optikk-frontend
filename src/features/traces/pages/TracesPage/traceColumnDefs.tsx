import type { SimpleTableColumn } from "@/components/ui";
import { formatDuration, formatRelativeTime, formatTimestamp } from "@shared/utils/formatters";
import type { Dispatch, MutableRefObject, SetStateAction } from "react";

import type { TraceRecord } from "../../types";

import { TRACE_STATUS_SORT_ORDER } from "./constants";
import { renderTraceStatus } from "./traceStatusBadge";
import { compareTraceText, compareTraceTimestamp } from "./utils";

export function buildTraceTableColumns(
  isLiveTail: boolean,
  selectedTraceIdsRef: MutableRefObject<string[]>,
  setSelectedTraceIds: Dispatch<SetStateAction<string[]>>
): SimpleTableColumn<TraceRecord>[] {
  return [
    {
      title: "",
      key: "selected",
      width: 42,
      render: (_value, row) => (
        <input
          type="checkbox"
          checked={selectedTraceIdsRef.current.includes(row.trace_id)}
          onChange={(event) => {
            setSelectedTraceIds((previous) => {
              if (event.target.checked) {
                if (previous.length >= 2) {
                  return previous;
                }
                return [...previous, row.trace_id];
              }
              return previous.filter((id) => id !== row.trace_id);
            });
          }}
          onClick={(event) => event.stopPropagation()}
          className="h-4 w-4 rounded border-[var(--border-color)] bg-transparent"
        />
      ),
    },
    {
      title: "Trace ID",
      key: "trace_id",
      dataIndex: "trace_id",
      width: 170,
      ...(isLiveTail
        ? {}
        : { sorter: (left, right) => compareTraceText(left.trace_id, right.trace_id) }),
      render: (value) => (
        <span className="font-mono text-[11px] text-[var(--text-primary)]">
          {String(value).slice(0, 14)}
        </span>
      ),
    },
    {
      title: "Service",
      key: "service_name",
      dataIndex: "service_name",
      width: 160,
      ...(isLiveTail
        ? {}
        : { sorter: (left, right) => compareTraceText(left.service_name, right.service_name) }),
      render: (value) => (
        <span className="font-medium text-[12.5px] text-[var(--text-primary)]">
          {String(value || "Unknown")}
        </span>
      ),
    },
    {
      title: "Operation",
      key: "operation_name",
      dataIndex: "operation_name",
      width: 220,
      ellipsis: true,
      ...(isLiveTail
        ? {}
        : {
            sorter: (left, right) => compareTraceText(left.operation_name, right.operation_name),
          }),
      render: (value) => (
        <span className="block truncate text-[12.5px] text-[var(--text-secondary)]">
          {String(value || "Unknown")}
        </span>
      ),
    },
    {
      title: "Status",
      key: "status",
      dataIndex: "status",
      width: 110,
      ...(isLiveTail
        ? {}
        : {
            sorter: (left, right) =>
              (TRACE_STATUS_SORT_ORDER[String(left.status ?? "UNSET").toUpperCase()] ?? 0) -
              (TRACE_STATUS_SORT_ORDER[String(right.status ?? "UNSET").toUpperCase()] ?? 0),
          }),
      render: (value) => renderTraceStatus(String(value)),
    },
    {
      title: "Duration",
      key: "duration_ms",
      dataIndex: "duration_ms",
      width: 120,
      ...(isLiveTail
        ? {}
        : {
            sorter: (left, right) => Number(left.duration_ms ?? 0) - Number(right.duration_ms ?? 0),
          }),
      render: (value) => (
        <span className="font-medium text-[var(--text-primary)]">
          {formatDuration(Number(value ?? 0))}
        </span>
      ),
    },
    {
      title: "Started",
      key: "start_time",
      dataIndex: "start_time",
      width: 176,
      ...(isLiveTail
        ? {}
        : {
            sorter: (left, right) => compareTraceTimestamp(left.start_time, right.start_time),
            defaultSortOrder: "descend" as const,
          }),
      render: (value) => (
        <div className="space-y-1">
          <div className="text-[12px] text-[var(--text-primary)]">
            {formatTimestamp(String(value))}
          </div>
          <div className="text-[11px] text-[var(--text-muted)]">
            {formatRelativeTime(String(value))}
          </div>
        </div>
      ),
    },
  ];
}
