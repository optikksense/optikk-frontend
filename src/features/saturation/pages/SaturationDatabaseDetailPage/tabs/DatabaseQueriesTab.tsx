import { useNavigate } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";

import DataTable from "@shared/components/ui/data-display/DataTable";
import type { ColumnDef } from "@tanstack/react-table";

import type { SlowQueryPatternRow } from "@/features/saturation/api/databaseSlowQueriesApi";
import { queryFingerprintId } from "@/features/saturation/utils/queryFingerprintId";
import { ROUTES } from "@/shared/constants/routes";
import { PanelCard } from "@shared/components/ui/PanelCard";
import { fmtMs, fmtNum } from "@shared/utils/formatters";

import { StatusDot } from "@shared/components/ui/data-display/status/StatusDot";

import { INSTANCE_HEALTH } from "@/features/saturation/pages/SaturationDatabasePage/databaseInstanceModel";
import { useDatabaseSystemQueries } from "../hooks/useDatabaseSystemQueries";

const P99_WARN_MS = 1000;
const P99_CRIT_MS = 2000;

function p99Status(p99: number) {
  if (p99 >= P99_CRIT_MS) return "err" as const;
  if (p99 >= P99_WARN_MS) return "warn" as const;
  return "ok" as const;
}

const COLUMNS: ColumnDef<SlowQueryPatternRow>[] = [
  {
    header: "Query",
    accessorKey: "queryText",

    size: 320,
    minSize: 140,
    cell: ({ row: { original: row } }) => (
      <div className="flex min-w-0 items-center gap-2">
        <StatusDot status={INSTANCE_HEALTH[p99Status(row.p99Ms ?? 0)]} />
        <span className="block truncate font-mono text-[11.5px] text-foreground">
          {row.queryText || "—"}
        </span>
      </div>
    ),
  },
  {
    header: "Calls",
    accessorKey: "callCount",
    size: 90,
    meta: { align: "right" },
    cell: ({ row: { original: row } }) => (
      <span className="font-mono">{fmtNum(row.callCount)}</span>
    ),
  },
  {
    header: "p50",
    accessorKey: "p50Ms",
    size: 84,
    meta: { align: "right" },
    cell: ({ row: { original: row } }) => <span className="font-mono">{fmtMs(row.p50Ms)}</span>,
  },
  {
    header: "p99",
    accessorKey: "p99Ms",
    size: 84,
    meta: { align: "right" },
    cell: ({ row: { original: row } }) => <span className="font-mono">{fmtMs(row.p99Ms)}</span>,
  },
  {
    header: "Total time",
    accessorKey: "total",
    size: 104,
    meta: { align: "right" },
    cell: ({ row: { original: row } }) => (
      <span className="font-mono font-semibold text-foreground">
        {fmtMs(row.callCount * (row.p95Ms ?? 0))}
      </span>
    ),
  },
  {
    header: "",
    id: "chevron",
    size: 34,
    cell: () => <ChevronRight size={14} className="text-foreground-muted" />,
  },
];

export function DatabaseQueriesTab({ system }: { system: string }) {
  const navigate = useNavigate();
  const { rows, isPending, error } = useDatabaseSystemQueries(system);
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!search) return rows;
    const q = search.toLowerCase();
    return rows.filter(
      (r) => r.queryText.toLowerCase().includes(q) || r.collectionName.toLowerCase().includes(q)
    );
  }, [rows, search]);

  return (
    <PanelCard
      title="Normalized queries"
      subtitle={`${filtered.length} fingerprints · last window`}
      padded={false}
      action={
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter by query or collection…"
          className="h-8 w-64 rounded-md border border-border bg-surface px-2.5 text-[13px] text-foreground outline-none placeholder:text-foreground-muted focus:border-primary"
        />
      }
    >
      <DataTable
        data={{
          columns: COLUMNS,
          rows: filtered,
          loading: isPending,
        }}
        resize={{ storageKey: "saturation.database.queries" }}
        pagination={{ pageSize: 10 }}
        config={{
          emptyText: error ?? "No queries recorded for this instance in the current window.",
          onRow: (row) => ({
            onClick: () =>
              navigate({
                to: ROUTES.saturationDatabaseQuery.replace(
                  "$queryId",
                  row.queryHash || queryFingerprintId(row)
                ) as never,
                search: {
                  dbSystem: row.dbSystem || system,
                  collection: row.collectionName || undefined,
                  namespace: row.namespace || undefined,
                  server: row.server || undefined,
                } as never,
              }),
            style: { cursor: "pointer" },
          }),
        }}
      />
    </PanelCard>
  );
}
