import {
  AlertTriangle,
  ArrowUpRight,
  BarChart3,
  Coins,
  DollarSign,
  Gauge,
  Sparkles,
  Zap,
} from "lucide-react";

import { Badge, Card } from "@/components/ui";
import { cn } from "@/lib/utils";
import { formatDuration, formatNumber } from "@shared/utils/formatters";
import { useMemo } from "react";

import type { LlmExplorerFacets, LlmGenerationRecord, LlmSummary, LlmTrendBucket } from "../types";
import { formatCost } from "../utils/costCalculator";

import LlmVolumeChart from "./LlmVolumeChart";

interface SummaryTileProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  subValue?: string;
  tone?: "default" | "success" | "warning" | "danger" | "accent";
}

const toneClasses: Record<string, string> = {
  default: "border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)]",
  success: "border-[rgba(51,211,145,0.22)] bg-[rgba(51,211,145,0.06)]",
  warning: "border-[rgba(247,144,9,0.22)] bg-[rgba(247,144,9,0.06)]",
  danger: "border-[rgba(240,68,56,0.22)] bg-[rgba(240,68,56,0.06)]",
  accent: "border-[rgba(77,166,200,0.22)] bg-[rgba(77,166,200,0.08)]",
};

function SummaryTile({ icon, label, value, subValue, tone = "default" }: SummaryTileProps) {
  return (
    <Card padding="lg" className={cn("border shadow-sm", toneClasses[tone])}>
      <div className="flex items-center justify-between text-[11px] text-[var(--text-muted)] uppercase tracking-[0.12em]">
        <span>{label}</span>
        <span className="rounded-full border border-current/10 bg-black/10 p-1 opacity-60">
          {icon}
        </span>
      </div>
      <div className="mt-3 font-semibold text-[26px] text-[var(--text-primary)] leading-none">
        {value}
      </div>
      {subValue && <div className="mt-1.5 text-[12px] text-[var(--text-muted)]">{subValue}</div>}
    </Card>
  );
}

interface ModelRow {
  model: string;
  count: number;
  pctOfTotal: number;
}

function ModelBreakdownTable({
  facets,
  total,
}: {
  facets: LlmExplorerFacets;
  total: number;
}) {
  const rows = useMemo<ModelRow[]>(() => {
    return facets.ai_model.slice(0, 8).map((f) => ({
      model: f.value,
      count: f.count,
      pctOfTotal: total > 0 ? (f.count / total) * 100 : 0,
    }));
  }, [facets.ai_model, total]);

  if (rows.length === 0) {
    return (
      <div className="flex h-full items-center justify-center text-[13px] text-[var(--text-muted)]">
        No model data
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {rows.map((row) => (
        <div key={row.model} className="flex items-center gap-3">
          <span className="min-w-0 flex-1 truncate font-mono text-[12px] text-[var(--text-primary)]">
            {row.model}
          </span>
          <div className="w-[120px]">
            <div className="h-1.5 overflow-hidden rounded-full bg-[rgba(255,255,255,0.06)]">
              <div
                className="h-full rounded-full bg-[var(--color-primary)]"
                style={{ width: `${Math.min(row.pctOfTotal, 100)}%` }}
              />
            </div>
          </div>
          <span className="w-[60px] text-right text-[12px] text-[var(--text-secondary)]">
            {formatNumber(row.count)}
          </span>
          <span className="w-[45px] text-right text-[11px] text-[var(--text-muted)]">
            {row.pctOfTotal.toFixed(1)}%
          </span>
        </div>
      ))}
    </div>
  );
}

function ProviderBreakdown({ facets }: { facets: LlmExplorerFacets }) {
  if (facets.ai_system.length === 0) {
    return (
      <div className="flex h-full items-center justify-center text-[13px] text-[var(--text-muted)]">
        No provider data
      </div>
    );
  }

  const total = facets.ai_system.reduce((sum, f) => sum + f.count, 0);

  return (
    <div className="flex flex-wrap gap-3">
      {facets.ai_system.map((provider) => {
        const pct = total > 0 ? ((provider.count / total) * 100).toFixed(1) : "0";
        return (
          <div
            key={provider.value}
            className="flex items-center gap-2 rounded-lg border border-[var(--border-color)] bg-[var(--bg-tertiary)] px-3 py-2"
          >
            <Badge variant="info" className="text-[10px]">
              {provider.value}
            </Badge>
            <span className="font-semibold text-[14px] text-[var(--text-primary)]">
              {formatNumber(provider.count)}
            </span>
            <span className="text-[11px] text-[var(--text-muted)]">{pct}%</span>
          </div>
        );
      })}
    </div>
  );
}

function TopErrorsTable({ generations }: { generations: LlmGenerationRecord[] }) {
  const errorRows = useMemo(
    () => generations.filter((c) => c.status === "ERROR" || c.status === "error").slice(0, 5),
    [generations]
  );

  if (errorRows.length === 0) {
    return (
      <div className="flex h-full items-center justify-center text-[13px] text-[var(--text-muted)]">
        No errors in current view
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {errorRows.map((row) => (
        <div
          key={`${row.trace_id}-${row.span_id}`}
          className="flex items-center gap-3 rounded-md border border-[rgba(240,68,56,0.15)] bg-[rgba(240,68,56,0.04)] px-3 py-2"
        >
          <Badge variant="error" className="text-[10px]">
            ERROR
          </Badge>
          <span className="min-w-0 flex-1 truncate font-mono text-[11px] text-[var(--text-primary)]">
            {row.ai_request_model}
          </span>
          <span className="text-[11px] text-[var(--text-muted)]">
            {row.error_type || row.status_message || "Unknown error"}
          </span>
          <span className="text-[11px] text-[var(--text-muted)]">
            {formatDuration(row.duration_ms)}
          </span>
        </div>
      ))}
    </div>
  );
}

interface LlmOverviewPanelProps {
  summary: LlmSummary;
  facets: LlmExplorerFacets;
  trend: LlmTrendBucket[];
  generations: LlmGenerationRecord[];
  isLoading: boolean;
}

export default function LlmOverviewPanel({
  summary,
  facets,
  trend,
  generations,
  isLoading,
}: LlmOverviewPanelProps) {
  const errorRate = summary.total_calls > 0 ? (summary.error_calls * 100) / summary.total_calls : 0;

  const estimatedTotalCost = useMemo(
    () => generations.reduce((sum, c) => sum + c.estimated_cost, 0),
    [generations]
  );

  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <SummaryTile
          icon={<Sparkles size={14} />}
          label="Total LLM Calls"
          value={formatNumber(summary.total_calls)}
          tone="default"
        />
        <SummaryTile
          icon={<AlertTriangle size={14} />}
          label="Error Rate"
          value={`${errorRate.toFixed(1)}%`}
          subValue={`${formatNumber(summary.error_calls)} errors`}
          tone={errorRate > 5 ? "danger" : errorRate > 1 ? "warning" : "success"}
        />
        <SummaryTile
          icon={<Gauge size={14} />}
          label="Avg Latency"
          value={formatDuration(summary.avg_latency_ms)}
          subValue={`P95: ${formatDuration(summary.p95_latency_ms)}`}
          tone={summary.avg_latency_ms > 5000 ? "warning" : "default"}
        />
        <SummaryTile
          icon={<Zap size={14} />}
          label="Input Tokens"
          value={formatNumber(summary.total_input_tokens)}
          tone="accent"
        />
        <SummaryTile
          icon={<ArrowUpRight size={14} />}
          label="Output Tokens"
          value={formatNumber(summary.total_output_tokens)}
          tone="accent"
        />
        <SummaryTile
          icon={<DollarSign size={14} />}
          label="Est. Cost"
          value={formatCost(estimatedTotalCost)}
          subValue="Based on model pricing"
          tone="accent"
        />
      </div>

      <Card padding="lg" className="border border-[var(--border-color)]">
        <div className="mb-3 flex items-center gap-2 font-medium text-[13px] text-[var(--text-primary)]">
          <BarChart3 size={15} className="text-[var(--text-muted)]" />
          LLM Call Volume
        </div>
        <LlmVolumeChart buckets={trend} isLoading={isLoading} />
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card padding="lg" className="border border-[var(--border-color)]">
          <div className="mb-4 flex items-center gap-2 font-medium text-[13px] text-[var(--text-primary)]">
            <Coins size={15} className="text-[var(--text-muted)]" />
            Model Usage
          </div>
          <ModelBreakdownTable facets={facets} total={summary.total_calls} />
        </Card>

        <Card padding="lg" className="border border-[var(--border-color)]">
          <div className="mb-4 flex items-center gap-2 font-medium text-[13px] text-[var(--text-primary)]">
            <Sparkles size={15} className="text-[var(--text-muted)]" />
            Provider Distribution
          </div>
          <ProviderBreakdown facets={facets} />
        </Card>
      </div>

      <Card padding="lg" className="border border-[var(--border-color)]">
        <div className="mb-4 flex items-center gap-2 font-medium text-[13px] text-[var(--text-primary)]">
          <AlertTriangle size={15} className="text-[var(--color-error)]" />
          Recent Errors
        </div>
        <TopErrorsTable generations={generations} />
      </Card>
    </div>
  );
}
