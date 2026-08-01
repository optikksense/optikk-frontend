import DataTable from "@shared/components/ui/data-display/DataTable";
import type { ColumnDef } from "@tanstack/react-table";

import type { QueryPerformanceCollection } from "@/features/saturation/api/databaseQueryPerformanceApi";
import { PanelCard } from "@shared/components/ui/PanelCard";
import { fmtMs, fmtNum } from "@shared/utils/formatters";

import { useQueryPerformanceCatalogue } from "../hooks/useQueryPerformance";

const COLUMNS: ColumnDef<QueryPerformanceCollection>[] = [
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
    accessorKey: "callCount",
    size: 96,
    meta: { align: "right" },
    cell: ({ row: { original: row } }) => (
      <span className="font-mono">{fmtNum(row.callCount)}</span>
    ),
  },
  {
    header: "p95",
    accessorKey: "p95Ms",
    size: 90,
    meta: { align: "right" },
    cell: ({ row: { original: row } }) => (
      <span className="font-mono">{row.p95Ms == null ? "—" : fmtMs(row.p95Ms)}</span>
    ),
  },
  {
    header: "p99",
    accessorKey: "p99Ms",
    size: 90,
    meta: { align: "right" },
    cell: ({ row: { original: row } }) => (
      <span className="font-mono">{row.p99Ms == null ? "—" : fmtMs(row.p99Ms)}</span>
    ),
  },
];

export function DatabaseCollectionsTab({ system }: { system: string }) {
  const query = useQueryPerformanceCatalogue(system);
  const collections = query.data?.collections ?? [];

  return (
    <PanelCard
      title="Collections"
      subtitle={`${collections.length} collections · query-level rollup data`}
      padded={false}
    >
      <DataTable
        data={{ columns: COLUMNS, rows: collections, loading: query.isPending && !query.data }}
        pagination={{ pageSize: 10 }}
        config={{
          emptyText: query.isError
            ? "Unable to load collections for the current window."
            : "No collection activity for this instance in the current window.",
        }}
      />
    </PanelCard>
  );
}
