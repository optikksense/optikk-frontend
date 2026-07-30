import { Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";

import type { SlowQueryPatternRow } from "@/features/saturation/api/databaseSlowQueriesApi";
import { DatabaseQueriesTable } from "@/features/saturation/pages/SaturationDatabasePage/list/DatabaseQueriesTable";
import { queryFingerprintId } from "@/features/saturation/utils/queryFingerprintId";
import { ROUTES } from "@/shared/constants/routes";
import { PanelCard } from "@shared/components/ui/PanelCard";
import { encodeFilters } from "@shared/search/utils/urlState";

import { useDatabaseSystemQueries } from "../hooks/useDatabaseSystemQueries";

export function DatabaseQueriesTab({ system }: { system: string }) {
  const navigate = useNavigate();
  const { rows, isPending, error } = useDatabaseSystemQueries(system);
  const [search, setSearch] = useState("");
  const filtered = useMemo(() => {
    const needle = search.trim().toLowerCase();
    if (!needle) return rows;
    return rows.filter((row) =>
      `${row.queryText} ${row.collectionName}`.toLowerCase().includes(needle)
    );
  }, [rows, search]);

  const onOpen = (row: SlowQueryPatternRow) => {
    navigate({
      to: ROUTES.databaseQuery.replace(
        "$queryId",
        row.queryHash || queryFingerprintId(row)
      ) as never,
      search: {
        dbSystem: row.dbSystem || system,
        collection: row.collectionName || undefined,
        namespace: row.namespace || undefined,
        server: row.server || undefined,
      } as never,
    });
  };

  return (
    <PanelCard
      title="Normalized queries"
      subtitle={`${filtered.length} fingerprints · selected range`}
      padded={false}
      action={
        <div className="flex items-center gap-2">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Filter by query or database…"
            className="h-8 w-64 rounded-md border border-border bg-surface px-2.5 text-[13px] text-foreground outline-none placeholder:text-foreground-muted focus:border-primary"
          />
          <Link
            to={ROUTES.databaseQueries}
            search={{
              filters: encodeFilters([{ field: "dbSystem", op: "eq", value: system }]),
            }}
            className="whitespace-nowrap text-[12px] text-primary hover:underline"
          >
            Open explorer
          </Link>
        </div>
      }
    >
      <DatabaseQueriesTable
        rows={filtered}
        loading={isPending}
        emptyText={error ?? "No queries recorded for this system in the current window."}
        onOpen={onOpen}
      />
    </PanelCard>
  );
}
