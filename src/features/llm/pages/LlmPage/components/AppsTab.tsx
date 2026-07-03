import { useMemo } from "react";

import { Surface } from "@/components/ui";
import { SimpleTable, type SimpleTableColumn } from "@/components/ui";
import { StatCard } from "@shared/components/ui";
import ObservabilityChart from "@shared/components/ui/charts/ObservabilityChart";
import SparklineChart from "@shared/components/ui/charts/micro/SparklineChart";
import { formatDuration, formatNumber } from "@shared/utils/formatters";

import type { LlmApp } from "../../../api/llmApi";
import { useLlmApps, useLlmTimeseries } from "../../../hooks/useLlmQueries";
import { alignSeries } from "../../../utils/alignSeries";
import { formatCost, vendorColor, vendorLabel } from "../../../utils/llmFormat";
import { VendorChip } from "./LlmChips";

function ChartCard({
  title,
  subtitle,
  children,
}: {
  readonly title: string;
  readonly subtitle: string;
  readonly children: React.ReactNode;
}) {
  return (
    <Surface elevation={1} padding="md">
      <div className="mb-2">
        <div className="font-medium text-[13px] text-foreground">{title}</div>
        <div className="text-foreground-muted text-xs">{subtitle}</div>
      </div>
      {children}
    </Surface>
  );
}

const LATENCY_COLORS: Record<string, string> = {
  p50: "var(--chart-3)",
  p95: "var(--chart-1)",
  p99: "var(--chart-5)",
};

export default function AppsTab({ onOpenTrace }: { readonly onOpenTrace: (app: string) => void }) {
  const appsQ = useLlmApps();
  const tokensQ = useLlmTimeseries("tokens_by_vendor");
  const latencyQ = useLlmTimeseries("latency");

  const apps = appsQ.data ?? [];
  const totals = useMemo(
    () =>
      apps.reduce(
        (acc, a) => ({
          llm: acc.llm + a.llmSpans,
          tool: acc.tool + a.toolSpans,
          tokens: acc.tokens + a.inputTokens + a.outputTokens,
          cost: acc.cost + a.cost,
        }),
        { llm: 0, tool: 0, tokens: 0, cost: 0 }
      ),
    [apps]
  );
  const maxP95 = useMemo(() => Math.max(0, ...apps.map((a) => a.p95Ms)), [apps]);

  const tokensAligned = useMemo(() => alignSeries(tokensQ.data ?? []), [tokensQ.data]);
  const latencyAligned = useMemo(() => alignSeries(latencyQ.data ?? []), [latencyQ.data]);

  const columns: SimpleTableColumn<LlmApp>[] = [
    {
      title: "App",
      key: "service",
      dataIndex: "service",
      render: (_, a) => (
        <div className="flex items-center gap-2">
          <span
            className="h-2 w-2 shrink-0 rounded-full"
            style={{
              backgroundColor:
                a.errorRate > 1 ? "var(--err)" : a.errorRate > 0.5 ? "var(--warn)" : "var(--ok)",
            }}
          />
          <span className="font-medium text-foreground">{a.service}</span>
        </div>
      ),
    },
    {
      title: "Primary model",
      key: "model",
      dataIndex: "primaryModel",
      render: (_, a) => (
        <div className="flex items-center gap-1.5">
          <VendorChip vendor={a.vendor} />
          <span className="font-mono text-foreground-secondary text-xs">{a.primaryModel}</span>
        </div>
      ),
    },
    {
      title: "LLM",
      key: "llm",
      align: "right",
      render: (_, a) => <span className="font-mono">{formatNumber(a.llmSpans)}</span>,
      sorter: (x, y) => x.llmSpans - y.llmSpans,
      defaultSortOrder: "descend",
    },
    {
      title: "Tool",
      key: "tool",
      align: "right",
      render: (_, a) => (
        <span className="font-mono text-foreground-secondary">
          {a.toolSpans ? formatNumber(a.toolSpans) : "—"}
        </span>
      ),
    },
    {
      title: "Retr.",
      key: "retr",
      align: "right",
      render: (_, a) => (
        <span className="font-mono text-foreground-secondary">
          {a.retrievalSpans ? formatNumber(a.retrievalSpans) : "—"}
        </span>
      ),
    },
    {
      title: "Emb.",
      key: "emb",
      align: "right",
      render: (_, a) => (
        <span className="font-mono text-foreground-secondary">
          {a.embeddingSpans ? formatNumber(a.embeddingSpans) : "—"}
        </span>
      ),
    },
    {
      title: "p95",
      key: "p95",
      align: "right",
      render: (_, a) => <span className="font-mono">{formatDuration(a.p95Ms)}</span>,
      sorter: (x, y) => x.p95Ms - y.p95Ms,
    },
    {
      title: "Err",
      key: "err",
      align: "right",
      render: (_, a) => (
        <span className="font-mono" style={{ color: a.errorRate > 1 ? "var(--err)" : undefined }}>
          {a.errorRate.toFixed(2)}%
        </span>
      ),
      sorter: (x, y) => x.errorRate - y.errorRate,
    },
    {
      title: "Tokens",
      key: "tokens",
      align: "right",
      render: (_, a) => (
        <span className="font-mono text-foreground-secondary">
          {formatNumber(a.inputTokens)} / {formatNumber(a.outputTokens)}
        </span>
      ),
    },
    {
      title: "Cost",
      key: "cost",
      align: "right",
      render: (_, a) => <span className="font-mono font-semibold">{formatCost(a.cost)}</span>,
      sorter: (x, y) => x.cost - y.cost,
    },
    {
      title: "Trend",
      key: "trend",
      width: 90,
      render: (_, a) =>
        a.trend && a.trend.length > 1 ? (
          <SparklineChart data={a.trend} color="var(--chart-1)" width={80} height={22} />
        ) : (
          <span className="text-foreground-muted">—</span>
        ),
    },
  ];

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        <StatCard
          metric={{ title: "ML applications", value: apps.length }}
          visuals={{ loading: appsQ.isPending }}
        />
        <StatCard
          metric={{ title: "LLM spans", value: formatNumber(totals.llm) }}
          visuals={{ loading: appsQ.isPending }}
        />
        <StatCard
          metric={{ title: "Tool spans", value: formatNumber(totals.tool) }}
          visuals={{ loading: appsQ.isPending }}
        />
        <StatCard
          metric={{ title: "Slowest app p95", value: formatDuration(maxP95) }}
          visuals={{ loading: appsQ.isPending }}
        />
        <StatCard
          metric={{ title: "Tokens", value: formatNumber(totals.tokens) }}
          visuals={{ loading: appsQ.isPending }}
        />
        <StatCard
          metric={{ title: "Spend", value: formatCost(totals.cost) }}
          visuals={{ loading: appsQ.isPending }}
        />
      </div>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        <ChartCard title="Tokens by vendor" subtitle="input + output tokens per bucket">
          <ObservabilityChart
            timestamps={tokensAligned.timestamps}
            series={[...tokensAligned.values.entries()].map(([key, values]) => ({
              label: vendorLabel(key),
              values,
              color: vendorColor(key),
            }))}
            type="line"
            height={220}
            legend
            yFormatter={(v) => formatNumber(v)}
          />
        </ChartCard>
        <ChartCard title="End-to-end latency" subtitle="p50 · p95 · p99 across chat/agent spans">
          <ObservabilityChart
            timestamps={latencyAligned.timestamps}
            series={[...latencyAligned.values.entries()].map(([key, values]) => ({
              label: key,
              values,
              color: LATENCY_COLORS[key] ?? "var(--chart-6)",
            }))}
            type="line"
            height={220}
            legend
            yFormatter={(v) => formatDuration(v)}
          />
        </ChartCard>
      </div>

      <Surface elevation={1} padding="md">
        <div className="mb-3">
          <div className="font-medium text-[13px] text-foreground">ML applications</div>
          <div className="text-foreground-muted text-xs">
            {apps.length} apps · services emitting gen_ai spans · click for traces
          </div>
        </div>
        <SimpleTable<LlmApp>
          columns={columns}
          dataSource={apps}
          rowKey="service"
          size="small"
          pagination={false}
          onRow={(a) => ({ onClick: () => onOpenTrace(a.service), style: { cursor: "pointer" } })}
        />
      </Surface>
    </div>
  );
}
