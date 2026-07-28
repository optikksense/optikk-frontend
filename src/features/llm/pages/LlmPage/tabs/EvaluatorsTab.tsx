import type { ColumnDef } from "@tanstack/react-table";
import { useState } from "react";

import { Button } from "@shared/components/primitives/ui/button";
import StatCard from "@shared/components/ui/cards/StatCard";
import DataTable from "@shared/components/ui/data-display/DataTable";
import { formatNumber } from "@shared/utils/formatters";

import type { LlmEvaluator } from "../../../api/evaluatorsApi";
import { useEvaluatorMutations, useEvaluators } from "../../../hooks/useEvaluators";
import EvaluatorDrawer from "../product/EvaluatorDrawer";

export default function EvaluatorsTab() {
  const evaluatorsQ = useEvaluators();
  const { update } = useEvaluatorMutations();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const columns: ColumnDef<LlmEvaluator>[] = [
    {
      header: "Evaluator",
      accessorKey: "name",
      cell: ({ row: { original: e } }) => (
        <div>
          <div className="font-medium text-foreground">{e.name}</div>
          <div className="font-mono text-[10px] text-foreground-muted">score: {e.scoreName}</div>
        </div>
      ),
    },
    {
      header: "Target",
      accessorKey: "target",
      size: 120,
      cell: ({ row: { original: e } }) => (
        <span className="font-mono text-[11px] text-foreground-secondary">{e.target}</span>
      ),
    },
    {
      header: "Type",
      accessorKey: "dataType",
      size: 110,
      cell: ({ row: { original: e } }) => (
        <span className="font-mono text-[11px] text-foreground-secondary">{e.dataType}</span>
      ),
    },
    {
      header: "Scores",
      id: "count",
      size: 90,
      meta: { align: "right" },
      cell: ({ row: { original: e } }) => (
        <span className="font-mono">{formatNumber(e.analytics.count)}</span>
      ),
    },
    {
      header: "Mean",
      id: "mean",
      size: 80,
      meta: { align: "right" },
      cell: ({ row: { original: e } }) => (
        <span className="font-mono">
          {e.analytics.count > 0 ? e.analytics.meanValue.toFixed(2) : "—"}
        </span>
      ),
    },
    {
      header: "Enabled",
      accessorKey: "enabled",
      size: 100,
      meta: { align: "right" },
      cell: ({ row: { original: e } }) => (
        <button
          type="button"
          onClick={() => update.mutate({ id: e.id, req: { enabled: !e.enabled } })}
          className="inline-flex items-center gap-1.5 text-[11px]"
        >
          <span
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: e.enabled ? "var(--ok)" : "var(--foreground-muted)" }}
          />
          {e.enabled ? "ON" : "OFF"}
        </button>
      ),
    },
  ];

  const enabledCount = (evaluatorsQ.data ?? []).filter((e) => e.enabled).length;

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        <StatCard
          metric={{ title: "Evaluators", value: formatNumber(evaluatorsQ.data?.length ?? 0) }}
        />
        <StatCard metric={{ title: "Enabled", value: formatNumber(enabledCount) }} />
        <div className="flex items-end justify-end">
          <Button onClick={() => setDrawerOpen(true)}>New evaluator</Button>
        </div>
      </div>
      <DataTable
        data={{ columns, rows: evaluatorsQ.data ?? [], loading: evaluatorsQ.isPending }}
        pagination={{ showPagination: false }}
        config={{ emptyText: "No evaluators defined yet." }}
      />
      {drawerOpen && <EvaluatorDrawer onClose={() => setDrawerOpen(false)} />}
    </div>
  );
}
