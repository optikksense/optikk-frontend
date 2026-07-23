import type { ColumnDef } from "@tanstack/react-table";

import { StatCard } from "@shared/components/ui";
import DataTable from "@shared/components/ui/data-display/DataTable";
import { formatDuration, formatNumber } from "@shared/utils/formatters";

import type { LlmModelUsage } from "../../../api/llmApi";
import { useLlmModels, useLlmOverview } from "../../../hooks/useLlmQueries";
import { useScoreSummary } from "../../../hooks/useScores";
import { deltaPct, formatCost } from "../../../utils/llmFormat";
import { VendorChip } from "../components/LlmChips";

const modelColumns: ColumnDef<LlmModelUsage>[] = [
  {
    header: "Model",
    accessorKey: "model",
    cell: ({ row: { original: m } }) => (
      <div className="flex items-center gap-2">
        <VendorChip vendor={m.vendor} />
        <span className="font-medium text-foreground">{m.model || "—"}</span>
      </div>
    ),
  },
  {
    header: "Traces",
    accessorKey: "traces",
    size: 90,
    meta: { align: "right" },
    cell: ({ row: { original: m } }) => <span className="font-mono">{formatNumber(m.traces)}</span>,
  },
  {
    header: "Tokens (in/out)",
    id: "tokens",
    size: 140,
    meta: { align: "right" },
    cell: ({ row: { original: m } }) => (
      <span className="font-mono text-[11px] text-foreground-muted">
        {formatNumber(m.inputTokens)} / {formatNumber(m.outputTokens)}
      </span>
    ),
  },
  {
    header: "p50 / p95",
    id: "latency",
    size: 130,
    meta: { align: "right" },
    cell: ({ row: { original: m } }) => (
      <span className="font-mono text-[11px]">
        {formatDuration(m.p50Ms)} / {formatDuration(m.p95Ms)}
      </span>
    ),
  },
  {
    header: "Cost",
    accessorKey: "cost",
    size: 90,
    meta: { align: "right" },
    cell: ({ row: { original: m } }) => <span className="font-mono">{formatCost(m.cost)}</span>,
  },
];

export default function DashboardTab() {
  const overviewQ = useLlmOverview();
  const modelsQ = useLlmModels();
  const scoresQ = useScoreSummary();

  const cur = overviewQ.data?.current;
  const prev = overviewQ.data?.previous;
  const loading = overviewQ.isPending;

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        <StatCard
          metric={{ title: "Traces", value: formatNumber(cur?.traces ?? 0) }}
          trend={{ value: deltaPct(cur?.traces ?? 0, prev?.traces ?? 0) ?? undefined }}
          visuals={{ loading }}
        />
        <StatCard
          metric={{ title: "Total cost", value: formatCost(cur?.cost ?? 0) }}
          trend={{ value: deltaPct(cur?.cost ?? 0, prev?.cost ?? 0) ?? undefined }}
          visuals={{ loading }}
        />
        <StatCard
          metric={{ title: "Input tokens", value: formatNumber(cur?.inputTokens ?? 0) }}
          trend={{ value: deltaPct(cur?.inputTokens ?? 0, prev?.inputTokens ?? 0) ?? undefined }}
          visuals={{ loading }}
        />
        <StatCard
          metric={{ title: "Output tokens", value: formatNumber(cur?.outputTokens ?? 0) }}
          trend={{ value: deltaPct(cur?.outputTokens ?? 0, prev?.outputTokens ?? 0) ?? undefined }}
          visuals={{ loading }}
        />
        <StatCard
          metric={{ title: "p95 latency", value: formatDuration(cur?.p95Ms ?? 0) }}
          trend={{
            value: deltaPct(cur?.p95Ms ?? 0, prev?.p95Ms ?? 0) ?? undefined,
            inverted: true,
          }}
          visuals={{ loading }}
        />
        <StatCard
          metric={{ title: "Error rate", value: `${(cur?.errorRate ?? 0).toFixed(2)}%` }}
          trend={{
            value: deltaPct(cur?.errorRate ?? 0, prev?.errorRate ?? 0) ?? undefined,
            inverted: true,
          }}
          visuals={{ loading }}
        />
      </div>

      {scoresQ.data && scoresQ.data.length > 0 && (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {scoresQ.data.slice(0, 4).map((s) => (
            <StatCard
              key={s.name}
              metric={{
                title: `Score · ${s.name}`,
                value: s.mean.toFixed(2),
                description: `${formatNumber(s.count)} scored`,
              }}
            />
          ))}
        </div>
      )}

      <section>
        <h3 className="mb-2 font-semibold text-foreground text-sm">Model usage</h3>
        <DataTable
          data={{ columns: modelColumns, rows: modelsQ.data ?? [], loading: modelsQ.isPending }}
          pagination={{ showPagination: false }}
          config={{ emptyText: "No model activity in this window." }}
        />
      </section>
    </div>
  );
}
