import { useMemo, useState } from "react";

import { Surface } from "@shared/components/primitives/ui";
import { StatCard } from "@shared/components/ui";
import DataTable from "@shared/components/ui/data-display/DataTable";
import { formatNumber } from "@shared/utils/formatters";
import type { ColumnDef } from "@tanstack/react-table";

import type { LlmCostGroupBy, LlmCostRow } from "../../../api/llmApi";
import { useLlmCostBreakdown } from "../../../hooks/useLlmQueries";
import { formatCost, vendorColor, vendorLabel } from "../../../utils/llmFormat";
import { VendorChip } from "./LlmChips";

const GROUPS: Array<{ key: LlmCostGroupBy; label: string }> = [
  { key: "service", label: "By app" },
  { key: "model", label: "By model" },
  { key: "vendor", label: "By vendor" },
];

export default function CostTab() {
  const [groupBy, setGroupBy] = useState<LlmCostGroupBy>("service");
  const breakdownQ = useLlmCostBreakdown(groupBy);
  const vendorsQ = useLlmCostBreakdown("vendor");

  const rows = breakdownQ.data ?? [];
  const vendors = vendorsQ.data ?? [];
  const total = useMemo(() => rows.reduce((acc, r) => acc + r.cost, 0), [rows]);
  const totalTokens = useMemo(
    () => rows.reduce((acc, r) => acc + r.inputTokens + r.outputTokens, 0),
    [rows]
  );
  const totalSpans = useMemo(() => rows.reduce((acc, r) => acc + r.llmSpans, 0), [rows]);
  const vendorTotal = useMemo(() => vendors.reduce((acc, v) => acc + v.cost, 0), [vendors]);

  const columns: ColumnDef<LlmCostRow>[] = [
    {
      header: GROUPS.find((g) => g.key === groupBy)?.label.replace("By ", "") ?? "Key",
      accessorKey: "key",
      cell: ({ row: { original: r } }) => (
        <div className="flex items-center gap-2">
          <span
            className="h-2 w-2 shrink-0 rounded-full"
            style={{ backgroundColor: vendorColor(r.vendor ?? r.key) }}
          />
          <span className="font-medium font-mono text-foreground text-xs">{r.key}</span>
        </div>
      ),
    },
    {
      header: "Vendor",
      accessorKey: "vendor",
      cell: ({ row: { original: r } }) => <VendorChip vendor={r.vendor ?? ""} />,
    },
    {
      header: "LLM spans",
      accessorKey: "spans",
      meta: { align: "right" },
      cell: ({ row: { original: r } }) => (
        <span className="font-mono">{formatNumber(r.llmSpans)}</span>
      ),
    },
    {
      header: "Tokens in",
      accessorKey: "tokin",
      meta: { align: "right" },
      cell: ({ row: { original: r } }) => (
        <span className="font-mono text-foreground-secondary">{formatNumber(r.inputTokens)}</span>
      ),
    },
    {
      header: "Tokens out",
      accessorKey: "tokout",
      meta: { align: "right" },
      cell: ({ row: { original: r } }) => (
        <span className="font-mono text-foreground-secondary">{formatNumber(r.outputTokens)}</span>
      ),
    },
    {
      header: "$/1k spans",
      accessorKey: "per1k",
      meta: { align: "right" },
      cell: ({ row: { original: r } }) => (
        <span className="font-mono text-foreground-secondary">
          {r.llmSpans > 0 ? formatCost((r.cost / r.llmSpans) * 1000) : "—"}
        </span>
      ),
    },
    {
      header: "Cost",
      accessorKey: "cost",
      meta: { align: "right" },
      cell: ({ row: { original: r } }) => (
        <span className="font-mono font-semibold">{formatCost(r.cost)}</span>
      ),
    },
    {
      header: "Share",
      accessorKey: "share",
      size: 140,
      cell: ({ row: { original: r } }) => {
        const pct = total > 0 ? (r.cost / total) * 100 : 0;
        return (
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-16 overflow-hidden rounded bg-muted">
              <div
                className="h-full rounded"
                style={{
                  width: `${pct}%`,
                  backgroundColor: vendorColor(r.vendor ?? r.key),
                }}
              />
            </div>
            <span className="font-mono text-foreground-muted text-xs">{pct.toFixed(1)}%</span>
          </div>
        );
      },
    },
  ];

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard
          metric={{ title: "Spend", value: formatCost(total) }}
          visuals={{ loading: breakdownQ.isPending }}
        />
        <StatCard
          metric={{ title: "Tokens", value: formatNumber(totalTokens) }}
          visuals={{ loading: breakdownQ.isPending }}
        />
        <StatCard
          metric={{ title: "LLM spans", value: formatNumber(totalSpans) }}
          visuals={{ loading: breakdownQ.isPending }}
        />
        <StatCard
          metric={{
            title: "$/1k LLM spans",
            value: totalSpans > 0 ? formatCost((total / totalSpans) * 1000) : "—",
          }}
          visuals={{ loading: breakdownQ.isPending }}
        />
      </div>

      <div className="grid grid-cols-1 items-start gap-3 lg:grid-cols-[1fr_320px]">
        <Surface elevation={1} padding="md">
          <div className="mb-3 flex items-center gap-2">
            <div>
              <div className="font-medium text-[13px] text-foreground">Spend breakdown</div>
              <div className="text-foreground-muted text-xs">
                cost derived from tokens at query time · re-priceable
              </div>
            </div>
            <div className="flex-1" />
            <div className="flex items-center rounded-md border border-border">
              {GROUPS.map((g) => (
                <button
                  key={g.key}
                  type="button"
                  onClick={() => setGroupBy(g.key)}
                  className={`px-2.5 py-1 text-xs transition-colors ${
                    groupBy === g.key
                      ? "bg-muted font-medium text-foreground"
                      : "text-foreground-secondary hover:text-foreground"
                  }`}
                >
                  {g.label}
                </button>
              ))}
            </div>
          </div>
          <DataTable
            data={{
              columns,
              rows,
              loading: breakdownQ.isPending,
            }}
            pagination={{ pageSize: 25 }}
            config={{ emptyText: "No cost data available in this time range." }}
          />
        </Surface>

        <Surface elevation={1} padding="md">
          <div className="mb-1 font-medium text-[13px] text-foreground">By vendor</div>
          <div className="mb-3 text-foreground-muted text-xs">
            {formatCost(vendorTotal)} total for the selected range
          </div>
          <div className="mb-3 flex h-3 overflow-hidden rounded-full bg-muted">
            {vendors.map((v) => (
              <div
                key={v.key}
                title={vendorLabel(v.key)}
                className="h-full border-surface border-r-2 last:border-r-0"
                style={{
                  width: `${vendorTotal > 0 ? (v.cost / vendorTotal) * 100 : 0}%`,
                  backgroundColor: vendorColor(v.key),
                }}
              />
            ))}
          </div>
          {vendors.map((v) => (
            <div
              key={v.key}
              className="flex items-center gap-2 border-border border-b py-1.5 last:border-b-0"
            >
              <span
                className="h-2 w-2 rounded-sm"
                style={{ backgroundColor: vendorColor(v.key) }}
              />
              <span className="text-foreground text-xs">{vendorLabel(v.key)}</span>
              <span className="flex-1" />
              <span className="font-mono font-semibold text-foreground text-xs">
                {formatCost(v.cost)}
              </span>
              <span className="w-10 text-right font-mono text-foreground-muted text-xs">
                {vendorTotal > 0 ? ((v.cost / vendorTotal) * 100).toFixed(0) : 0}%
              </span>
            </div>
          ))}
        </Surface>
      </div>
    </div>
  );
}
