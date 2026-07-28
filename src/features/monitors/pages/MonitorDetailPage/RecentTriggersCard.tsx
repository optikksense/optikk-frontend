import { memo } from "react";

import DataTable from "@shared/components/ui/data-display/DataTable";
import type { ColumnDef } from "@tanstack/react-table";

import type { MonitorEvent } from "../../api/monitorsApi";

const COLUMNS: ColumnDef<MonitorEvent>[] = [
  {
    header: "When",
    accessorKey: "startedAt",
    cell: ({ row: { original: e } }) => (
      <span className="font-mono text-xs">{new Date(e.startedAt).toLocaleString()}</span>
    ),
  },
  {
    header: "Kind",
    accessorKey: "kind",
    cell: ({ row: { original: e } }) => <span className="text-xs">{e.kind}</span>,
  },
  {
    header: "Peak value",
    accessorKey: "value",
    meta: { align: "right" },
    cell: ({ row: { original: e } }) => (
      <span className="font-mono text-xs">{e.value !== undefined ? e.value.toFixed(2) : "—"}</span>
    ),
  },
  {
    header: "Threshold",
    accessorKey: "threshold",
    meta: { align: "right" },
    cell: ({ row: { original: e } }) => (
      <span className="font-mono text-xs">
        {e.threshold !== undefined ? e.threshold.toFixed(2) : "—"}
      </span>
    ),
  },
];

interface Props {
  readonly events: readonly MonitorEvent[];
  readonly loading: boolean;
}

function RecentTriggersCard({ events, loading }: Props) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="font-medium text-foreground text-sm">Recent triggers</div>
      <div className="text-[11px] text-foreground-muted">last events</div>
      <div className="mt-3">
        <DataTable
          data={{
            columns: COLUMNS,
            rows: [...events],
            loading: loading && events.length === 0,
          }}
          config={{ emptyText: "No triggers yet." }}
        />
      </div>
    </div>
  );
}

export default memo(RecentTriggersCard);
