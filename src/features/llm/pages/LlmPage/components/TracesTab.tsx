import { useMemo, useState } from "react";

import { SimpleTable, type SimpleTableColumn, Surface } from "@/components/ui";
import { StatCard } from "@shared/components/ui";
import { formatDuration, formatNumber, formatTimestamp } from "@shared/utils/formatters";

import type { LlmTrace } from "../../../api/llmApi";
import { useLlmTraceDetail, useLlmTraces } from "../../../hooks/useLlmQueries";
import { formatCost } from "../../../utils/llmFormat";
import { StatusBadge, VendorChip } from "./LlmChips";
import TraceInspector from "./TraceInspector";

type TraceFilter = "all" | "errors" | "slow";

const FILTERS: Array<{ key: TraceFilter; label: string }> = [
  { key: "all", label: "All" },
  { key: "errors", label: "Errors" },
  { key: "slow", label: "Slow (>3s)" },
];

export default function TracesTab({
  service,
  onClearService,
}: {
  readonly service: string | null;
  readonly onClearService: () => void;
}) {
  const [filter, setFilter] = useState<TraceFilter>("all");
  const [cursor, setCursor] = useState<string | undefined>(undefined);
  const [selectedTraceId, setSelectedTraceId] = useState<string | null>(null);

  const request = useMemo(
    () => ({
      limit: 50,
      cursor,
      services: service ? [service] : undefined,
      status: filter === "errors" ? "error" : undefined,
      minDurationMs: filter === "slow" ? 3000 : undefined,
    }),
    [cursor, service, filter]
  );
  const tracesQ = useLlmTraces(request);
  const detailQ = useLlmTraceDetail(selectedTraceId);

  const traces = tracesQ.data?.results ?? [];
  const totals = useMemo(
    () =>
      traces.reduce(
        (acc, t) => ({
          cost: acc.cost + t.cost,
          tokens: acc.tokens + t.inputTokens + t.outputTokens,
          errors: acc.errors + (t.hasError ? 1 : 0),
        }),
        { cost: 0, tokens: 0, errors: 0 }
      ),
    [traces]
  );

  const columns: SimpleTableColumn<LlmTrace>[] = [
    {
      title: "Time",
      key: "time",
      render: (_, t) => (
        <span className="font-mono text-foreground-muted text-xs">
          {formatTimestamp(t.startMs)}
        </span>
      ),
    },
    {
      title: "ML app",
      key: "service",
      render: (_, t) => <span className="font-medium font-mono text-foreground">{t.service}</span>,
    },
    {
      title: "Model",
      key: "model",
      render: (_, t) => (
        <div className="flex items-center gap-1.5">
          <VendorChip vendor={t.vendor} />
          <span className="font-mono text-foreground-secondary text-xs">{t.model || "—"}</span>
        </div>
      ),
    },
    {
      title: "Tokens (in / out)",
      key: "tokens",
      align: "right",
      render: (_, t) => (
        <span className="font-mono text-foreground-secondary">
          {formatNumber(t.inputTokens)} / {formatNumber(t.outputTokens)}
        </span>
      ),
    },
    {
      title: "Latency",
      key: "latency",
      align: "right",
      render: (_, t) => <span className="font-mono">{formatDuration(t.durationMs)}</span>,
    },
    {
      title: "Cost",
      key: "cost",
      align: "right",
      render: (_, t) => <span className="font-mono">{formatCost(t.cost)}</span>,
    },
    {
      title: "Status",
      key: "status",
      render: (_, t) => <StatusBadge hasError={t.hasError} />,
    },
    {
      title: "Operation",
      key: "operation",
      render: (_, t) => (
        <span className="font-mono text-foreground-muted text-xs">{t.operation}</span>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard
          metric={{ title: "Traces (page)", value: traces.length }}
          visuals={{ loading: tracesQ.isPending }}
        />
        <StatCard
          metric={{ title: "Errors", value: totals.errors }}
          visuals={{ loading: tracesQ.isPending }}
        />
        <StatCard
          metric={{ title: "Tokens", value: formatNumber(totals.tokens) }}
          visuals={{ loading: tracesQ.isPending }}
        />
        <StatCard
          metric={{ title: "Cost", value: formatCost(totals.cost) }}
          visuals={{ loading: tracesQ.isPending }}
        />
      </div>

      {selectedTraceId ? (
        <TraceInspector
          detail={detailQ.data}
          loading={detailQ.isPending}
          onClose={() => setSelectedTraceId(null)}
        />
      ) : null}

      <Surface elevation={1} padding="md">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <div>
            <div className="font-medium text-[13px] text-foreground">LLM traces</div>
            <div className="text-foreground-muted text-xs">
              each row = one request to an ML app · click for the full chain
            </div>
          </div>
          <div className="flex-1" />
          {service ? (
            <button
              type="button"
              onClick={onClearService}
              className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 font-mono text-foreground-secondary text-xs hover:text-foreground"
            >
              app: {service} ×
            </button>
          ) : null}
          <div className="flex items-center rounded-md border border-border">
            {FILTERS.map((f) => (
              <button
                key={f.key}
                type="button"
                onClick={() => {
                  setFilter(f.key);
                  setCursor(undefined);
                }}
                className={`px-2.5 py-1 text-xs transition-colors ${
                  filter === f.key
                    ? "bg-muted font-medium text-foreground"
                    : "text-foreground-secondary hover:text-foreground"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
        <SimpleTable<LlmTrace>
          columns={columns}
          dataSource={traces}
          rowKey="traceId"
          size="small"
          pagination={false}
          onRow={(t) => ({
            onClick: () => setSelectedTraceId(t.traceId),
            style: { cursor: "pointer" },
          })}
        />
        <div className="mt-3 flex items-center justify-between">
          <button
            type="button"
            disabled={!cursor}
            onClick={() => setCursor(undefined)}
            className="rounded-md border border-border px-2.5 py-1 text-foreground-secondary text-xs enabled:hover:text-foreground disabled:opacity-40"
          >
            First page
          </button>
          <button
            type="button"
            disabled={!tracesQ.data?.pageInfo.hasMore}
            onClick={() => setCursor(tracesQ.data?.pageInfo.nextCursor)}
            className="rounded-md border border-border px-2.5 py-1 text-foreground-secondary text-xs enabled:hover:text-foreground disabled:opacity-40"
          >
            Next page →
          </button>
        </div>
      </Surface>
    </div>
  );
}
