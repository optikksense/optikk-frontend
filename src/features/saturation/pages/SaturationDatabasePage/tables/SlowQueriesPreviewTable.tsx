import { useNavigate } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";

import { SimpleTable, type SimpleTableColumn } from "@shared/components/primitives/ui";

import type { SlowQueryPatternRow } from "@/features/saturation/api/databaseSlowQueriesApi";
import { queryFingerprintId } from "@/features/saturation/utils/queryFingerprintId";
import { fmtMs, fmtNum } from "@/features/services/pages/ServiceDetailPage/formatters";
import { PanelCard } from "@/features/services/pages/ServiceDetailPage/panels/PanelCard";
import { ROUTES } from "@/shared/constants/routes";
import { dynamicNavigateOptions } from "@/shared/utils/navigation";

import { useDatabaseSlowQueriesPreview } from "../hooks/useDatabaseSlowQueriesPreview";

const COLUMNS: SimpleTableColumn<SlowQueryPatternRow>[] = [
  {
    title: "Query",
    key: "query_text",
    width: 460,
    render: (_v, row) => (
      <span className="block max-w-[460px] truncate font-mono text-[11.5px] text-foreground">
        {row.query_text || "—"}
      </span>
    ),
  },
  {
    title: "Collection",
    key: "collection_name",
    width: 160,
    render: (_v, row) => (
      <span className="font-mono text-[11.5px] text-foreground-muted">
        {row.collection_name || "—"}
      </span>
    ),
  },
  {
    title: "p99",
    key: "p99_ms",
    width: 100,
    align: "right",
    sorter: (a, b) => (a.p99_ms ?? 0) - (b.p99_ms ?? 0),
    defaultSortOrder: "descend",
    render: (_v, row) => <span className="font-mono">{fmtMs(row.p99_ms ?? 0)}</span>,
  },
  {
    title: "Calls",
    key: "call_count",
    width: 100,
    align: "right",
    sorter: (a, b) => a.call_count - b.call_count,
    render: (_v, row) => <span className="font-mono">{fmtNum(row.call_count)}</span>,
  },
  {
    title: "",
    key: "chevron",
    width: 34,
    render: () => <ChevronRight size={14} className="text-foreground-muted" />,
  },
];

export function SlowQueriesPreviewTable() {
  const navigate = useNavigate();
  const { data, isPending } = useDatabaseSlowQueriesPreview(8);
  const rows = data ?? [];
  return (
    <PanelCard
      title="Top queries by total time"
      subtitle={data ? `top ${Math.min(rows.length, 8)} by p99` : undefined}
      padded={false}
    >
      {rows.length === 0 ? (
        <div className="px-4 py-8 text-center text-[12px] text-foreground-muted">
          {isPending ? "Loading…" : "No slow queries in window."}
        </div>
      ) : (
        <SimpleTable
          columns={COLUMNS}
          dataSource={rows}
          rowKey={(r, i) => `${r.collection_name}::${i}`}
          onRow={(row) => ({
            onClick: () =>
              navigate(
                dynamicNavigateOptions(
                  ROUTES.saturationDatabaseQuery.replace("$queryId", queryFingerprintId(row))
                )
              ),
            style: { cursor: "pointer" },
          })}
        />
      )}
    </PanelCard>
  );
}
