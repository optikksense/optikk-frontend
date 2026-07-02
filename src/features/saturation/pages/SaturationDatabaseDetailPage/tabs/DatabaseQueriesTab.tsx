import { useNavigate } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";

import type { SimpleTableColumn } from "@shared/components/primitives/ui/simple-table";
import DataTable from "@shared/components/ui/data-display/DataTable";

import type { SlowQueryPatternRow } from "@/features/saturation/api/databaseSlowQueriesApi";
import { queryFingerprintId } from "@/features/saturation/utils/queryFingerprintId";
import { fmtMs, fmtNum } from "@/features/services/pages/ServiceDetailPage/formatters";
import { PanelCard } from "@/features/services/pages/ServiceDetailPage/panels/PanelCard";
import { ROUTES } from "@/shared/constants/routes";
import { dynamicNavigateOptions } from "@/shared/utils/navigation";

import { StatusDot } from "../components/StatusDot";
import { useDatabaseSystemQueries } from "../hooks/useDatabaseSystemQueries";

const P99_WARN_MS = 1000;
const P99_CRIT_MS = 2000;

function p99Status(p99: number) {
  if (p99 >= P99_CRIT_MS) return "err" as const;
  if (p99 >= P99_WARN_MS) return "warn" as const;
  return "ok" as const;
}

const COLUMNS: SimpleTableColumn<SlowQueryPatternRow>[] = [
  {
    title: "Query",
    key: "query_text",
    width: 460,
    render: (_v, row) => (
      <div className="flex min-w-0 items-center gap-2">
        <StatusDot status={p99Status(row.p99_ms ?? 0)} />
        <span className="block truncate font-mono text-[11.5px] text-foreground">
          {row.query_text || "—"}
        </span>
      </div>
    ),
  },
  {
    title: "Calls",
    key: "call_count",
    width: 90,
    align: "right",
    sorter: (a, b) => a.call_count - b.call_count,
    render: (_v, row) => <span className="font-mono">{fmtNum(row.call_count)}</span>,
  },
  {
    title: "p50",
    key: "p50_ms",
    width: 84,
    align: "right",
    sorter: (a, b) => (a.p50_ms ?? 0) - (b.p50_ms ?? 0),
    render: (_v, row) => <span className="font-mono">{fmtMs(row.p50_ms)}</span>,
  },
  {
    title: "p99",
    key: "p99_ms",
    width: 84,
    align: "right",
    sorter: (a, b) => (a.p99_ms ?? 0) - (b.p99_ms ?? 0),
    defaultSortOrder: "descend",
    render: (_v, row) => <span className="font-mono">{fmtMs(row.p99_ms)}</span>,
  },
  {
    title: "Total time",
    key: "total",
    width: 104,
    align: "right",
    sorter: (a, b) => a.call_count * (a.p95_ms ?? 0) - b.call_count * (b.p95_ms ?? 0),
    render: (_v, row) => (
      <span className="font-mono font-semibold text-foreground">
        {fmtMs(row.call_count * (row.p95_ms ?? 0))}
      </span>
    ),
  },
  {
    title: "",
    key: "chevron",
    width: 34,
    render: () => <ChevronRight size={14} className="text-foreground-muted" />,
  },
];

export function DatabaseQueriesTab({ system }: { system: string }) {
  const navigate = useNavigate();
  const { rows, isPending } = useDatabaseSystemQueries(system);
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!search) return rows;
    const q = search.toLowerCase();
    return rows.filter(
      (r) => r.query_text.toLowerCase().includes(q) || r.collection_name.toLowerCase().includes(q)
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
      <DataTable<SlowQueryPatternRow>
        data={{
          columns: COLUMNS,
          rows: filtered,
          loading: isPending,
          rowKey: (r, i) => `${queryFingerprintId(r)}::${i}`,
        }}
        pagination={{ pageSize: 10 }}
        config={{
          emptyText: "No queries recorded for this instance in the current window.",
          onRow: (row) => ({
            onClick: () =>
              navigate(
                dynamicNavigateOptions(
                  ROUTES.saturationDatabaseQuery.replace(
                    "$queryId",
                    row.query_hash || queryFingerprintId(row)
                  )
                )
              ),
            style: { cursor: "pointer" },
          }),
        }}
      />
    </PanelCard>
  );
}
