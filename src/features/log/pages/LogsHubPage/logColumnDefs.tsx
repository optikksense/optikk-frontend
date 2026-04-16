import type { SimpleTableColumn } from "@/components/ui";
import { formatRelativeTime } from "@shared/utils/formatters";
import { tsLabel } from "@shared/utils/time";

import { LevelBadge } from "../../components/log/LogRow";
import type { LogRecord } from "../../types";
import { toDisplayText } from "../../utils/logUtils";

import { LOG_LEVEL_SORT_ORDER } from "./constants";
import { compareText, compareTimestamp } from "./tableUtils";

type Sortable = Record<string, unknown>;

function timeColumn(liveTailEnabled: boolean): SimpleTableColumn<LogRecord> {
  return {
    title: "Time",
    key: "timestamp",
    dataIndex: "timestamp",
    width: 168,
    ...(liveTailEnabled
      ? {}
      : {
          sorter: (left: LogRecord, right: LogRecord) =>
            compareTimestamp(left.timestamp, right.timestamp),
          defaultSortOrder: "descend" as const,
        }),
    render: (value, row) => {
      const timestamp =
        value instanceof Date || typeof value === "string" || typeof value === "number"
          ? value
          : row.timestamp;

      return (
        <div className="space-y-1">
          <div className="font-mono text-[12px] text-[var(--text-primary)]">
            {tsLabel(timestamp)}
          </div>
          <div className="text-[11px] text-[var(--text-muted)]">
            {formatRelativeTime(timestamp)}
          </div>
        </div>
      );
    },
  };
}

function levelColumn(liveTailEnabled: boolean): SimpleTableColumn<LogRecord> {
  return {
    title: "Level",
    key: "level",
    dataIndex: "level",
    width: 90,
    ...(liveTailEnabled
      ? {}
      : {
          sorter: (left: LogRecord, right: LogRecord) =>
            (LOG_LEVEL_SORT_ORDER[
              String(left.level ?? left.severity_text ?? "INFO").toUpperCase()
            ] ?? 0) -
            (LOG_LEVEL_SORT_ORDER[
              String(right.level ?? right.severity_text ?? "INFO").toUpperCase()
            ] ?? 0),
        }),
    render: (value, row) => <LevelBadge level={String(value ?? row.severity_text ?? "INFO")} />,
  };
}

function serviceColumn(liveTailEnabled: boolean): SimpleTableColumn<LogRecord> {
  return {
    title: "Service",
    key: "service_name",
    dataIndex: "service_name",
    width: 160,
    ...(liveTailEnabled
      ? {}
      : {
          sorter: (left: LogRecord, right: LogRecord) =>
            compareText(left.service_name ?? left.service, right.service_name ?? right.service),
        }),
    render: (value) => (
      <span className="font-medium text-[12.5px] text-[var(--text-primary)]">
        {toDisplayText(value)}
      </span>
    ),
  };
}

function hostColumn(liveTailEnabled: boolean): SimpleTableColumn<LogRecord> {
  return {
    title: "Host",
    key: "host",
    dataIndex: "host",
    width: 148,
    ...(liveTailEnabled
      ? {}
      : {
          sorter: (left: LogRecord, right: LogRecord) =>
            compareText(left.host ?? left.pod, right.host ?? right.pod),
        }),
    render: (value, row) => (
      <span className="text-[12px] text-[var(--text-secondary)]">
        {toDisplayText(value || row.pod)}
      </span>
    ),
  };
}

function messageColumn(liveTailEnabled: boolean, onSelectMessage: (row: LogRecord) => void) {
  return {
    title: "Message",
    key: "message",
    dataIndex: "message",
    ...(liveTailEnabled
      ? {}
      : {
          sorter: (left: LogRecord, right: LogRecord) =>
            compareText(left.message ?? left.body, right.message ?? right.body),
        }),
    render: (value, row) => (
      <button
        type="button"
        className="line-clamp-2 max-w-full text-left text-[12.5px] text-[var(--text-primary)] leading-6 hover:text-white"
        onClick={() => onSelectMessage(row)}
      >
        {toDisplayText(value ?? row.body)}
      </button>
    ),
  } satisfies SimpleTableColumn<LogRecord>;
}

function traceColumn(liveTailEnabled: boolean): SimpleTableColumn<LogRecord> {
  return {
    title: "Trace",
    key: "trace_id",
    dataIndex: "trace_id",
    width: 150,
    ...(liveTailEnabled
      ? {}
      : {
          sorter: (left: LogRecord, right: LogRecord) =>
            compareText(left.trace_id ?? left.traceId, right.trace_id ?? right.traceId),
        }),
    render: (value) => (
      <span className="font-mono text-[11px] text-[var(--text-muted)]">
        {value ? String(value).slice(0, 12) : "—"}
      </span>
    ),
  };
}

export function buildLogTableColumns(
  liveTailEnabled: boolean,
  onSelectMessage: (row: LogRecord) => void
): SimpleTableColumn<LogRecord>[] {
  return [
    timeColumn(liveTailEnabled),
    levelColumn(liveTailEnabled),
    serviceColumn(liveTailEnabled),
    hostColumn(liveTailEnabled),
    messageColumn(liveTailEnabled, onSelectMessage),
    traceColumn(liveTailEnabled),
  ];
}
