import { ChevronRight } from "lucide-react";

import DataTable from "@shared/components/ui/data-display/DataTable";
import { formatNumber, formatRelativeTime } from "@shared/utils/formatters";
import type { ColumnDef } from "@tanstack/react-table";

import type { ErrorGroup } from "../../api/errorGroupsApi";

/** Recent (seconds-ago) last-seen values render in the error color to signal "still firing". */
function isFreshlySeen(iso: string): boolean {
  if (!iso) return false;
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return false;
  return Date.now() - t < 60_000;
}

const columns: ColumnDef<ErrorGroup>[] = [
  {
    header: "Issue",
    accessorKey: "operation_name",
    cell: ({ row: { original: row } }) => (
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
    header: "HTTP",
    accessorKey: "http_status_code",
    size: 80,
    meta: { align: "right" },
    cell: ({ row: { original: row } }) => (
      <span className="font-mono text-[12.5px] text-foreground-secondary">
        {row.http_status_code || "—"}
      </span>
    ),
  },
  {
    header: "Errors",
    accessorKey: "error_count",
    size: 100,
    meta: { align: "right" },
    cell: ({ row: { original: row } }) => (
      <span className="font-mono font-semibold text-[13px] text-foreground tabular-nums">
        {formatNumber(row.error_count)}
      </span>
    ),
  },
  {
    header: "First seen",
    accessorKey: "first_occurrence",
    size: 110,
    cell: ({ row: { original: row } }) => (
      <span className="font-mono text-[12.5px] text-foreground-muted">
        {row.first_occurrence ? formatRelativeTime(row.first_occurrence) : "—"}
      </span>
    ),
  },
  {
    header: "Last seen",
    accessorKey: "last_occurrence",
    size: 100,
    cell: ({ row: { original: row } }) => (
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
    header: "",
    id: "chevron",
    size: 36,
    meta: { align: "right" },
    cell: () => <ChevronRight size={14} className="text-foreground-muted" />,
  },
];

interface IssuesTableProps {
  readonly rows: ErrorGroup[];
  readonly onOpen: (groupId: string) => void;
}

export function IssuesTable({ rows, onOpen }: IssuesTableProps): JSX.Element {
  return (
    <DataTable
      data={{
        columns,
        rows,
      }}
      config={{
        onRow: (record) => ({
          onClick: () => onOpen(record.group_id),
          style: { cursor: "pointer" },
        }),
      }}
    />
  );
}
