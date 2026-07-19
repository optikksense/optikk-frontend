import { useNavigate } from "@tanstack/react-router";
import type { ColumnDef } from "@tanstack/react-table";
import { ChevronRight } from "lucide-react";
import { memo } from "react";

import DataTable from "@shared/components/ui/data-display/DataTable";

import type { Monitor } from "../../api/monitorsApi";
import MonitorStatusBadge from "../../components/MonitorStatusBadge";
import PriorityChip from "../../components/PriorityChip";

interface Props {
  readonly monitors: readonly Monitor[];
}

const TYPE_COLORS: Record<string, string> = {
  metric: "text-primary",
  apm: "text-primary",
  log: "text-warning",
};

function formatScope(m: Monitor): string {
  const tags = m.scope.tags ?? [];
  return tags.map((t) => `${t.key}:${t.value}`).join(" ");
}

function formatValue(v: number | undefined, type: string): string {
  if (v === undefined) return "—";
  if (type === "apm") return `${v.toFixed(2)}`;
  return `${v}`;
}

const columns: ColumnDef<Monitor>[] = [
  {
    header: "Status",
    accessorKey: "status",
    size: 120,
    cell: ({ row: { original: m } }) => <MonitorStatusBadge status={m.status} />,
  },
  {
    header: "Monitor",
    accessorKey: "name",
    cell: ({ row: { original: m } }) => (
      <div>
        <div className="font-medium text-foreground">{m.name}</div>
        <div className="font-mono text-[10px] text-foreground-muted">m-{m.id}</div>
      </div>
    ),
  },
  {
    header: "Type",
    accessorKey: "type",
    size: 90,
    cell: ({ row: { original: m } }) => (
      <span className={`font-bold font-mono text-[10px] uppercase ${TYPE_COLORS[m.type] ?? ""}`}>
        {m.type}
      </span>
    ),
  },
  {
    header: "Priority",
    accessorKey: "priority",
    size: 110,
    cell: ({ row: { original: m } }) => <PriorityChip priority={m.priority} />,
  },
  {
    header: "Scope",
    accessorKey: "scope",
    cell: ({ row: { original: m } }) => (
      <span className="font-mono text-[11px] text-foreground-muted">{formatScope(m)}</span>
    ),
  },
  {
    header: "Current",
    accessorKey: "currentValue",
    size: 100,
    meta: { align: "right" },
    cell: ({ row: { original: m } }) => (
      <span className="font-mono">{formatValue(m.currentValue, m.type)}</span>
    ),
  },
  {
    header: "Last eval",
    accessorKey: "lastEvaluatedAt",
    size: 130,
    cell: ({ row: { original: m } }) => (
      <span className="font-mono text-[11px] text-foreground-muted">
        {m.lastEvaluatedAt ? new Date(m.lastEvaluatedAt).toLocaleTimeString() : "—"}
      </span>
    ),
  },
  {
    header: "",
    id: "chevron",
    size: 34,
    meta: { align: "right" },
    cell: () => <ChevronRight size={14} className="ml-auto text-foreground-muted" />,
  },
];

function MonitorsTable({ monitors }: Props) {
  const navigate = useNavigate();
  return (
    <DataTable
      data={{ columns, rows: [...monitors] }}
      pagination={{ showPagination: false }}
      config={{
        emptyText: "No monitors match your filters.",
        onRow: (m) => ({
          onClick: () => navigate({ to: `/monitors/${m.id}` as string & {} }),
          style: { cursor: "pointer" },
        }),
      }}
    />
  );
}

export default memo(MonitorsTable);
