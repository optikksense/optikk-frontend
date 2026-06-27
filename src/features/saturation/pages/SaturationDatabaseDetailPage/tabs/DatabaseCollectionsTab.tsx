import { useMemo } from "react";

import type { SimpleTableColumn } from "@shared/components/primitives/ui/simple-table";
import DataTable from "@shared/components/ui/data-display/DataTable";

import { fmtMs, fmtNum } from "@/features/services/pages/ServiceDetailPage/formatters";
import { PanelCard } from "@/features/services/pages/ServiceDetailPage/panels/PanelCard";

import { StatusPill } from "@/features/saturation/pages/SaturationDatabasePage/components/StatusPill";
import { type CollectionRow, aggregateCollections } from "../collectionsModel";
import { useDatabaseSystemQueries } from "../hooks/useDatabaseSystemQueries";

const COLUMNS: SimpleTableColumn<CollectionRow>[] = [
  {
    title: "Collection",
    key: "name",
    width: 280,
    render: (_v, row) => (
      <span className="block truncate font-mono font-semibold text-[12.5px] text-foreground">
        {row.name}
      </span>
    ),
  },
  {
    title: "Queries",
    key: "queryCount",
    width: 96,
    align: "right",
    sorter: (a, b) => a.queryCount - b.queryCount,
    render: (_v, row) => <span className="font-mono">{fmtNum(row.queryCount)}</span>,
  },
  {
    title: "Calls",
    key: "calls",
    width: 96,
    align: "right",
    sorter: (a, b) => a.calls - b.calls,
    render: (_v, row) => <span className="font-mono">{fmtNum(row.calls)}</span>,
  },
  {
    title: "p99",
    key: "p99Ms",
    width: 90,
    align: "right",
    sorter: (a, b) => a.p99Ms - b.p99Ms,
    render: (_v, row) => <span className="font-mono">{fmtMs(row.p99Ms)}</span>,
  },
  {
    title: "Total time",
    key: "totalMs",
    width: 110,
    align: "right",
    sorter: (a, b) => a.totalMs - b.totalMs,
    defaultSortOrder: "descend",
    render: (_v, row) => (
      <span className="font-mono font-semibold text-foreground">{fmtMs(row.totalMs)}</span>
    ),
  },
  {
    title: "Status",
    key: "status",
    width: 110,
    render: (_v, row) => <StatusPill status={row.status} />,
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
      <DataTable<CollectionRow>
        data={{ columns: COLUMNS, rows: collections, loading: isPending, rowKey: "name" }}
        pagination={{ pageSize: 10 }}
        config={{ emptyText: "No collection activity for this instance in the current window." }}
      />
    </PanelCard>
  );
}
