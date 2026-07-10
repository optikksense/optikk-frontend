import { useMemo } from "react";

import DataTable from "@shared/components/ui/data-display/DataTable";
import type { ColumnDef } from "@tanstack/react-table";

import { PanelCard } from "@shared/components/ui/PanelCard";
import { fmtMs, fmtNum } from "@shared/utils/metricFormatters";

import { StatusPill } from "@/features/saturation/pages/SaturationDatabasePage/components/StatusPill";
import { type CollectionRow, aggregateCollections } from "../collectionsModel";
import { useDatabaseSystemQueries } from "../hooks/useDatabaseSystemQueries";

const COLUMNS: ColumnDef<CollectionRow>[] = [
  {
    header: "Collection",
    accessorKey: "name",
    size: 280,
    cell: ({ row: { original: row } }) => (
      <span className="block truncate font-mono font-semibold text-[12.5px] text-foreground">
        {row.name}
      </span>
    ),
  },
  {
    header: "Queries",
    accessorKey: "queryCount",
    size: 96,
    meta: { align: "right" },
    cell: ({ row: { original: row } }) => (
      <span className="font-mono">{fmtNum(row.queryCount)}</span>
    ),
  },
  {
    header: "Calls",
    accessorKey: "calls",
    size: 96,
    meta: { align: "right" },
    cell: ({ row: { original: row } }) => <span className="font-mono">{fmtNum(row.calls)}</span>,
  },
  {
    header: "p99",
    accessorKey: "p99Ms",
    size: 90,
    meta: { align: "right" },
    cell: ({ row: { original: row } }) => <span className="font-mono">{fmtMs(row.p99Ms)}</span>,
  },
  {
    header: "Total time",
    accessorKey: "totalMs",
    size: 110,
    meta: { align: "right" },
    cell: ({ row: { original: row } }) => (
      <span className="font-mono font-semibold text-foreground">{fmtMs(row.totalMs)}</span>
    ),
  },
  {
    header: "Status",
    accessorKey: "status",
    size: 110,
    cell: ({ row: { original: row } }) => <StatusPill status={row.status} />,
  },
];

export function DatabaseCollectionsTab({ system }: { system: string }) {
  const { rows, isPending } = useDatabaseSystemQueries(system);
  const collections = useMemo(() => aggregateCollections(rows), [rows]);

  return (
    <PanelCard
      title="Collections"
      subtitle={`${collections.length} collections · aggregated from query patterns`}
      padded={false}
    >
      <DataTable
        data={{ columns: COLUMNS, rows: collections, loading: isPending }}
        pagination={{ pageSize: 10 }}
        config={{ emptyText: "No collection activity for this instance in the current window." }}
      />
    </PanelCard>
  );
}
