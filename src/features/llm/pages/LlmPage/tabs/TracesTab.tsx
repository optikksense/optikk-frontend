import { useNavigate } from "@tanstack/react-router";
import type { ColumnDef } from "@tanstack/react-table";
import { ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";

import DataTable from "@shared/components/ui/data-display/DataTable";
import { formatDuration } from "@shared/utils/formatters";

import type { LlmTrace } from "../../../api/llmApi";
import { ScorePill } from "../../../components/chips";
import { useLlmTraces } from "../../../hooks/useLlmQueries";
import { formatCost } from "../../../utils/llmFormat";
import { StatusBadge, VendorChip } from "../components/LlmChips";

const columns: ColumnDef<LlmTrace>[] = [
  {
    header: "Status",
    accessorKey: "hasError",
    size: 90,
    cell: ({ row: { original: t } }) => <StatusBadge hasError={t.hasError} />,
  },
  {
    header: "Trace",
    accessorKey: "operation",
    cell: ({ row: { original: t } }) => (
      <div className="min-w-0">
        <div className="truncate font-medium text-foreground">{t.operation || t.service}</div>
        <div className="truncate font-mono text-[10px] text-foreground-muted">
          {t.promptPreview || t.traceId}
        </div>
      </div>
    ),
  },
  {
    header: "Model",
    accessorKey: "model",
    size: 150,
    cell: ({ row: { original: t } }) => (
      <div className="flex items-center gap-2">
        <VendorChip vendor={t.vendor} />
        <span className="truncate font-mono text-[11px] text-foreground-secondary">{t.model}</span>
      </div>
    ),
  },
  {
    header: "User / Session",
    id: "identity",
    size: 150,
    cell: ({ row: { original: t } }) => (
      <div className="min-w-0 font-mono text-[10px] text-foreground-muted">
        <div className="truncate">{t.userId || "—"}</div>
        <div className="truncate">{t.sessionId || ""}</div>
      </div>
    ),
  },
  {
    header: "Scores",
    id: "scores",
    size: 170,
    cell: ({ row: { original: t } }) => (
      <div className="flex flex-wrap gap-1">
        {(t.scores ?? []).slice(0, 3).map((s) => (
          <ScorePill key={s.name} score={s} />
        ))}
      </div>
    ),
  },
  {
    header: "Latency",
    accessorKey: "durationMs",
    size: 90,
    meta: { align: "right" },
    cell: ({ row: { original: t } }) => (
      <span className="font-mono text-[11px]">{formatDuration(t.durationMs)}</span>
    ),
  },
  {
    header: "Cost",
    accessorKey: "cost",
    size: 90,
    meta: { align: "right" },
    cell: ({ row: { original: t } }) => <span className="font-mono">{formatCost(t.cost)}</span>,
  },
  {
    header: "",
    id: "chevron",
    size: 34,
    meta: { align: "right" },
    cell: () => <ChevronRight size={14} className="ml-auto text-foreground-muted" />,
  },
];

export default function TracesTab() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const tracesQ = useLlmTraces({ limit: 100 });

  const rows = useMemo(() => {
    const all = tracesQ.data?.results ?? [];
    if (!search.trim()) return all;
    const q = search.toLowerCase();
    return all.filter(
      (t) =>
        t.operation.toLowerCase().includes(q) ||
        t.service.toLowerCase().includes(q) ||
        (t.userId ?? "").toLowerCase().includes(q) ||
        t.model.toLowerCase().includes(q)
    );
  }, [tracesQ.data, search]);

  return (
    <div className="flex flex-col gap-3">
      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Filter traces by operation, service, user or model…"
        className="w-full max-w-md rounded border border-border bg-surface px-3 py-1.5 text-foreground text-sm outline-none placeholder:text-foreground-muted focus:border-primary"
      />
      <DataTable
        data={{ columns, rows, loading: tracesQ.isPending }}
        pagination={{ showPagination: false }}
        config={{
          emptyText: "No LLM traces in this window.",
          onRow: (t) => ({
            onClick: () =>
              navigate({ to: `/llm/traces/${encodeURIComponent(t.traceId)}` as string & {} }),
            style: { cursor: "pointer" },
          }),
        }}
      />
    </div>
  );
}
