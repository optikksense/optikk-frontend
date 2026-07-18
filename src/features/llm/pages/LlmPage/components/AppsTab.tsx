import { useMemo } from "react";

import { Surface } from "@shared/components/primitives/ui";
import { StatCard } from "@shared/components/ui";
import ObservabilityChart from "@shared/components/ui/charts/ObservabilityChart";
import SparklineChart from "@shared/components/ui/charts/micro/SparklineChart";
import DataTable from "@shared/components/ui/data-display/DataTable";
import { formatDuration, formatNumber } from "@shared/utils/formatters";
import type { ColumnDef } from "@tanstack/react-table";

import type { LlmApp } from "../../../api/llmApi";
import {
  useLlmApps,
  useLlmOverview,
  useLlmRange,
  useLlmTimeseries,
} from "../../../hooks/useLlmQueries";
import { alignSeries } from "../../../utils/alignSeries";
import { deltaPct, formatCost, vendorColor, vendorLabel } from "../../../utils/llmFormat";
import LiveTraceStream from "./LiveTraceStream";
import { KindChip, VendorChip } from "./LlmChips";
import SpanBreakdownRail from "./SpanBreakdownRail";

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

// Sparklines only render with two or more points.
function spark(values?: number[] | null): number[] | undefined {
  return values && values.length > 1 ? values : undefined;
}

export default function AppsTab({ onOpenTrace }: { readonly onOpenTrace: (app: string) => void }) {
  const appsQ = useLlmApps();
  const overviewQ = useLlmOverview();
  const tokensQ = useLlmTimeseries("tokens_by_vendor");
  const latencyQ = useLlmTimeseries("latency");
  const { startTime, endTime } = useLlmRange();

  const apps = appsQ.data ?? [];
  const cur = overviewQ.data?.current;
  const prev = overviewQ.data?.previous;
  const series = overviewQ.data?.series;

  const kindMix = useMemo(() => {
    const counts = { agent: 0, rag: 0, workflow: 0 };
    for (const a of apps) {
      counts[a.kind === "agent" || a.kind === "rag" ? a.kind : "workflow"] += 1;
    }
    return `${counts.agent} agents · ${counts.rag} rag · ${counts.workflow} workflows`;
  }, [apps]);

  const dailyProjection = useMemo(() => {
    if (!cur || endTime <= startTime) return null;
    return (cur.cost / (endTime - startTime)) * 86_400_000;
  }, [cur, startTime, endTime]);

  const tokensAligned = useMemo(() => alignSeries(tokensQ.data ?? []), [tokensQ.data]);
  const latencyAligned = useMemo(() => alignSeries(latencyQ.data ?? []), [latencyQ.data]);

  const columns: ColumnDef<LlmApp>[] = [
    {
      header: "App",
      accessorKey: "service",
      cell: ({ row: { original: a } }) => (
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
      header: "Kind",
      accessorKey: "kind",
      cell: ({ row: { original: a } }) => <KindChip kind={a.kind ?? ""} />,
    },
    {
      header: "Primary model",
      accessorKey: "primaryModel",
      cell: ({ row: { original: a } }) => (
        <div className="flex items-center gap-1.5">
          <VendorChip vendor={a.vendor} />
          <span className="font-mono text-foreground-secondary text-xs">{a.primaryModel}</span>
        </div>
      ),
    },
    {
      header: "LLM",
      accessorKey: "llmSpans",
      meta: { align: "right" },
      cell: ({ row: { original: a } }) => (
        <span className="font-mono">{formatNumber(a.llmSpans)}</span>
      ),
    },
    {
      header: "Tool",
      accessorKey: "toolSpans",
      meta: { align: "right" },
      cell: ({ row: { original: a } }) => (
        <span className="font-mono text-foreground-secondary">
          {a.toolSpans ? formatNumber(a.toolSpans) : "—"}
        </span>
      ),
    },
    {
      header: "Retr.",
      accessorKey: "retrievalSpans",
      meta: { align: "right" },
      cell: ({ row: { original: a } }) => (
        <span className="font-mono text-foreground-secondary">
          {a.retrievalSpans ? formatNumber(a.retrievalSpans) : "—"}
        </span>
      ),
    },
    {
      header: "Emb.",
      accessorKey: "embeddingSpans",
      meta: { align: "right" },
      cell: ({ row: { original: a } }) => (
        <span className="font-mono text-foreground-secondary">
          {a.embeddingSpans ? formatNumber(a.embeddingSpans) : "—"}
        </span>
      ),
    },
    {
      header: "p95",
      accessorKey: "p95Ms",
      meta: { align: "right" },
      cell: ({ row: { original: a } }) => (
        <span className="font-mono">{formatDuration(a.p95Ms)}</span>
      ),
    },
    {
      header: "Err",
      accessorKey: "errorRate",
      meta: { align: "right" },
      cell: ({ row: { original: a } }) => (
        <span className="font-mono" style={{ color: a.errorRate > 1 ? "var(--err)" : undefined }}>
          {a.errorRate.toFixed(2)}%
        </span>
      ),
    },
    {
      header: "Cost",
      accessorKey: "cost",
      meta: { align: "right" },
      cell: ({ row: { original: a } }) => (
        <span className="font-mono font-semibold">{formatCost(a.cost)}</span>
      ),
    },
    {
      header: "Trend",
      accessorKey: "trend",
      size: 90,
      cell: ({ row: { original: a } }) =>
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
          metric={{ title: "ML applications", value: apps.length, description: kindMix }}
          visuals={{ loading: appsQ.isPending }}
        />
        <StatCard
          metric={{ title: "LLM spans", value: formatNumber(cur?.llmSpans ?? 0) }}
          trend={{ value: deltaPct(cur?.llmSpans ?? 0, prev?.llmSpans ?? 0) ?? undefined }}
          visuals={{
            loading: overviewQ.isPending,
            sparklineData: spark(series?.llmSpans),
            sparklineColor: "var(--chart-3)",
          }}
        />
        <StatCard
          metric={{ title: "Tool spans", value: formatNumber(cur?.toolSpans ?? 0) }}
          trend={{ value: deltaPct(cur?.toolSpans ?? 0, prev?.toolSpans ?? 0) ?? undefined }}
          visuals={{
            loading: overviewQ.isPending,
            sparklineData: spark(series?.toolSpans),
            sparklineColor: "var(--chart-1)",
          }}
        />
        <StatCard
          metric={{
            title: "p95 latency",
            value: formatDuration(cur?.p95Ms ?? 0),
            description: cur
              ? `p50 ${formatDuration(cur.p50Ms)} · p99 ${formatDuration(cur.p99Ms)}`
              : undefined,
          }}
          trend={{
            value: deltaPct(cur?.p95Ms ?? 0, prev?.p95Ms ?? 0) ?? undefined,
            inverted: true,
          }}
          visuals={{
            loading: overviewQ.isPending,
            sparklineData: spark(series?.p95Ms),
            sparklineColor: "var(--chart-1)",
          }}
        />
        <StatCard
          metric={{ title: "Error rate", value: `${(cur?.errorRate ?? 0).toFixed(2)}%` }}
          trend={{
            value: deltaPct(cur?.errorRate ?? 0, prev?.errorRate ?? 0) ?? undefined,
            inverted: true,
          }}
          visuals={{
            loading: overviewQ.isPending,
            sparklineData: spark(series?.errorRate),
            sparklineColor: "var(--chart-5)",
          }}
        />
        <StatCard
          metric={{
            title: "Spend",
            value: formatCost(cur?.cost ?? 0),
            description:
              dailyProjection !== null ? `≈${formatCost(dailyProjection)}/day` : undefined,
          }}
          trend={{ value: deltaPct(cur?.cost ?? 0, prev?.cost ?? 0) ?? undefined }}
          visuals={{
            loading: overviewQ.isPending,
            sparklineData: spark(series?.cost),
            sparklineColor: "var(--chart-6)",
          }}
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

      <div className="grid grid-cols-1 items-start gap-3 lg:grid-cols-[1fr_300px]">
        <Surface elevation={1} padding="md">
          <div className="mb-3">
            <div className="font-medium text-[13px] text-foreground">ML applications</div>
            <div className="text-foreground-muted text-xs">
              {apps.length} apps · services emitting gen_ai spans · click for traces
            </div>
          </div>
          <DataTable
            data={{
              columns,
              rows: apps,
              loading: appsQ.isPending,
            }}
            pagination={{ showPagination: false }}
            config={{
              onRow: (a) => ({
                onClick: () => onOpenTrace(a.service),
                style: { cursor: "pointer" },
              }),
            }}
          />
        </Surface>
        <SpanBreakdownRail apps={apps} />
      </div>

      <LiveTraceStream service={null} />
    </div>
  );
}
