import { ChevronRight } from "lucide-react";

import { SimpleTable, type SimpleTableColumn } from "@shared/components/primitives/ui";
import { formatNumber, formatRelativeTime } from "@shared/utils/formatters";

import type { ErrorGroup } from "../../api/errorGroupsApi";

/** Recent (seconds-ago) last-seen values render in the error color to signal "still firing". */
function isFreshlySeen(iso: string): boolean {
  if (!iso) return false;
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return false;
  return Date.now() - t < 60_000;
}

const columns: SimpleTableColumn<ErrorGroup>[] = [
  {
    title: "Issue",
    key: "operation_name",
    render: (_v, row) => (
      <div className="flex min-w-0 items-start gap-2.5">
        <span className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-error" />
        <div className="min-w-0">
          <span className="font-mono font-semibold text-[13px] text-foreground">
            {row.operation_name || "—"}
          </span>
          {row.status_message ? (
            <div className="mt-0.5 max-w-[460px] truncate text-[12px] text-foreground-muted">
              {row.status_message}
            </div>
          ) : null}
          <div className="mt-1 font-mono text-[11.5px] text-primary">{row.service_name}</div>
        </div>
      </div>
    ),
  },
  {
    title: "HTTP",
    key: "http_status_code",
    width: 80,
    align: "right",
    render: (_v, row) => (
      <span className="font-mono text-[12.5px] text-foreground-secondary">
        {row.http_status_code || "—"}
      </span>
    ),
  },
  {
    // Server already orders by total error count over the selected range; no client sorter.
    title: "Errors",
    key: "error_count",
    width: 100,
    align: "right",
    render: (_v, row) => (
      <span className="font-mono font-semibold text-[13px] text-foreground tabular-nums">
        {formatNumber(row.error_count)}
      </span>
    ),
  },
  {
    title: "First seen",
    key: "first_occurrence",
    width: 110,
    render: (_v, row) => (
      <span className="font-mono text-[12.5px] text-foreground-muted">
        {row.first_occurrence ? formatRelativeTime(row.first_occurrence) : "—"}
      </span>
    ),
  },
  {
    title: "Last seen",
    key: "last_occurrence",
    width: 100,
    render: (_v, row) => (
      <span
        className={`font-mono text-[12.5px] ${
          isFreshlySeen(row.last_occurrence) ? "text-error" : "text-foreground-secondary"
        }`}
      >
        {row.last_occurrence ? formatRelativeTime(row.last_occurrence) : "—"}
      </span>
    ),
  },
  {
    title: "",
    key: "chevron",
    width: 36,
    align: "right",
    render: () => <ChevronRight size={14} className="text-foreground-muted" />,
  },
];

interface IssuesTableProps {
  readonly rows: ErrorGroup[];
  readonly onOpen: (groupId: string) => void;
}

export function IssuesTable({ rows, onOpen }: IssuesTableProps): JSX.Element {
  return (
    <SimpleTable
      columns={columns}
      dataSource={rows}
      rowKey={(r) => r.group_id}
      onRow={(record) => ({
        onClick: () => onOpen(record.group_id),
        style: { cursor: "pointer" },
      })}
    />
  );
}
