import { useNavigate } from "@tanstack/react-router";
import {
  Bot,
  Brain,
  Database,
  ExternalLink,
  Gauge,
  MessageSquareText,
  Network,
  SearchX,
  Sparkles,
} from "lucide-react";
import { useCallback, useMemo, useRef, useState } from "react";

import { ExplorerHeader } from "@/features/explorer/components/chrome/ExplorerHeader";
import { SummaryStrip, type SummaryKPI } from "@/features/explorer/components/chrome/SummaryStrip";
import { FacetRail } from "@/features/explorer/components/facets/FacetRail";
import type { FacetGroupModel } from "@/features/explorer/components/facets/FacetGroup";
import { ResultsArea } from "@/features/explorer/components/list/ResultsArea";
import type { ColumnConfig, ColumnDef } from "@/features/explorer/types/results";
import type { ExplorerFilter } from "@/features/explorer/types/filters";
import { Button, Surface } from "@/components/ui";
import ObservabilityChart, {
  type ObservabilityChartSeries,
} from "@shared/components/ui/charts/ObservabilityChart";
import { formatDuration, formatNumber, formatPercentage } from "@shared/utils/formatters";
import { dynamicNavigateOptions } from "@shared/utils/navigation";
import { getChartColor } from "@shared/utils/charting";
import { cn } from "@/lib/utils";

import { useAiObservabilityPage } from "../../hooks/useAiObservabilityPage";
import type {
  AiAgentRunPoint,
  AiCallRow,
  AiCostPoint,
  AiErrorRatePoint,
  AiFacetBucket,
  AiLatencyPoint,
  AiModelRatePoint,
  AiPromptUsagePoint,
  AiRetrievalErrorPoint,
  AiRetrievalRatePoint,
  AiTabId,
  AiTokenUsagePoint,
  AiToolCallPoint,
  AiToolErrorPoint,
  AiTraceRow,
} from "../../types";
import {
  AI_SPAN_TYPES,
  type AiSpanType,
  inferAiSpanType,
  labelForAiSpanType,
} from "../../utils/spanTypes";

const TAB_ITEMS: readonly {
  id: AiTabId;
  label: string;
  icon: React.ReactNode;
}[] = [
  { id: "models", label: "Models", icon: <Brain size={14} /> },
  { id: "prompts", label: "Prompts", icon: <MessageSquareText size={14} /> },
  { id: "agents", label: "Agents & Tools", icon: <Bot size={14} /> },
  { id: "retrieval", label: "Retrieval", icon: <Database size={14} /> },
  { id: "traces", label: "Traces", icon: <Network size={14} /> },
];

export default function AiObservabilityPage() {
  const page = useAiObservabilityPage();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const onInclude = useCallback(
    (field: string, value: string) =>
      page.state.setFilters([...page.state.filters, { field, op: "eq", value }]),
    [page.state]
  );
  const onExclude = useCallback(
    (field: string, value: string) =>
      page.state.setFilters([...page.state.filters, { field, op: "neq", value }]),
    [page.state]
  );
  const onClearFilters = useCallback(() => page.state.setFilters([]), [page.state]);

  const facets = useMemo(
    () => buildFacetGroups(page.facetsQuery.data),
    [page.facetsQuery.data]
  );
  const valueSuggestions = useMemo(
    () => buildValueSuggestions(page.facetsQuery.data),
    [page.facetsQuery.data]
  );
  const kpis = useMemo(() => buildKpis(page.filtered), [page.filtered]);

  const openTrace = useCallback(
    (traceId: string) => navigate(dynamicNavigateOptions(`/traces/${encodeURIComponent(traceId)}`)),
    [navigate]
  );

  return (
    <div className="flex h-full min-h-[calc(100vh-var(--space-header-h,56px)-2rem)] flex-col overflow-hidden bg-[var(--bg-primary)]">
      <div className="shrink-0 border-[var(--border-color)] border-b px-4 py-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex min-w-0 items-start gap-3">
            <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-[var(--card-radius)] border border-[var(--border-color)] bg-[var(--bg-tertiary)] text-[var(--color-primary)]">
              <Sparkles size={17} />
            </span>
            <div className="min-w-0">
              <h1 className="m-0 font-semibold text-[22px] text-[var(--text-primary)] leading-tight">
                AI Observability
              </h1>
              <p className="mt-1 max-w-3xl text-[13px] text-[var(--text-secondary)]">
                Model latency, token and cost pressure, prompt versions, agent tools, retrieval, and AI traces.
              </p>
            </div>
          </div>
        </div>
      </div>

      <ExplorerHeader
        ref={searchInputRef}
        variant="dsl"
        scope="ai"
        filters={page.state.filters}
        onChangeFilters={(next) => page.state.setFilters(next)}
        onSubmitFreeText={() => {}}
        searchPlaceholder="provider:openai model:gpt-4o spanType:CHAT_MODEL promptName:"
        valueSuggestions={valueSuggestions}
        disableBareFreeTextFallback
        kpiStrip={<SummaryStrip kpis={kpis} />}
      />

      <div className="flex min-h-0 flex-1 overflow-hidden">
        <FacetRail
          groups={facets}
          onInclude={onInclude}
          onExclude={onExclude}
          isActive={(field, value) => activeFilterState(page.state.filters, field, value)}
          activeFilterCount={page.state.filters.length}
          onClearAll={onClearFilters}
        />
        <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <TabBar activeTab={page.activeTab} onChange={page.setTab} />
          {page.unsupportedFilters ? <UnsupportedFiltersNotice /> : null}
          <div className="min-h-0 flex-1 overflow-auto p-4">
            {page.activeTab === "models" ? (
              <ModelsTab page={page} openTrace={openTrace} />
            ) : null}
            {page.activeTab === "prompts" ? (
              <PromptsTab page={page} openTrace={openTrace} />
            ) : null}
            {page.activeTab === "agents" ? <AgentsTab page={page} /> : null}
            {page.activeTab === "retrieval" ? <RetrievalTab page={page} /> : null}
            {page.activeTab === "traces" ? (
              <TracesTab page={page} openTrace={openTrace} />
            ) : null}
          </div>
        </main>
      </div>
    </div>
  );
}

type PageModel = ReturnType<typeof useAiObservabilityPage>;

function TabBar({
  activeTab,
  onChange,
}: {
  readonly activeTab: AiTabId;
  readonly onChange: (tab: AiTabId) => void;
}) {
  return (
    <div className="shrink-0 border-[var(--border-color)] border-b bg-[var(--bg-primary)] px-4 py-2">
      <div className="inline-flex flex-wrap gap-1 rounded-[calc(var(--card-radius)+2px)] border border-[var(--border-color)] bg-[var(--bg-tertiary)] p-1">
        {TAB_ITEMS.map((tab) => {
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onChange(tab.id)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-[var(--card-radius)] px-3 py-1.5 font-medium text-[12px] transition-colors",
                active
                  ? "bg-[var(--color-primary)] text-white shadow-[var(--shadow-sm)]"
                  : "text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]"
              )}
            >
              {tab.icon}
              {tab.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function UnsupportedFiltersNotice() {
  return (
    <div className="shrink-0 border-[var(--border-color)] border-b bg-[var(--bg-secondary)] px-4 py-2 text-[12px] text-[var(--text-secondary)]">
      AI queries support structured GenAI fields only. Free-text and raw attribute filters are ignored for this view.
    </div>
  );
}

function ModelsTab({
  page,
  openTrace,
}: {
  readonly page: PageModel;
  readonly openTrace: (traceId: string) => void;
}) {
  return (
    <div className="space-y-4">
      <ChartGrid>
        <ChartPanel
          title="Requests by model"
          rows={page.filtered.modelRate}
          loading={page.modelQueries.requestRate.isPending}
          group={(row) => labelModel(row)}
          value={(row) => row.requests}
          yFormatter={formatNumber}
        />
        <ChartPanel
          title="P95 latency by model"
          rows={page.filtered.modelLatency}
          loading={page.modelQueries.latency.isPending}
          group={(row) => labelModel(row)}
          value={(row) => row.p95Ms}
          yFormatter={formatDuration}
        />
        <ChartPanel
          title="Token usage by model"
          rows={page.filtered.modelTokens}
          loading={page.modelQueries.tokenUsage.isPending}
          group={(row) => labelModel(row)}
          value={(row) => row.totalTokens}
          yFormatter={formatNumber}
        />
        <ChartPanel
          title="Estimated cost by model"
          rows={page.filtered.modelCost}
          loading={page.modelQueries.cost.isPending}
          group={(row) => labelModel(row)}
          value={(row) => row.estimatedTotalCost}
          yFormatter={formatCurrency}
        />
      </ChartGrid>
      <div className="grid gap-4 xl:grid-cols-2">
        <AiResultsTable
          title="Most expensive calls"
          rows={page.filtered.expensiveCalls}
          columns={CALL_COLUMNS}
          loading={page.modelQueries.expensiveCalls.isPending}
          getRowId={(row) => row.spanId || row.traceId}
          onRowClick={(row) => openTrace(row.traceId)}
          emptyTitle="No AI calls"
        />
        <AiResultsTable
          title="Slowest calls"
          rows={page.filtered.slowCalls}
          columns={CALL_COLUMNS}
          loading={page.modelQueries.slowCalls.isPending}
          getRowId={(row) => row.spanId || row.traceId}
          onRowClick={(row) => openTrace(row.traceId)}
          emptyTitle="No slow AI calls"
        />
      </div>
    </div>
  );
}

function PromptsTab({
  page,
  openTrace,
}: {
  readonly page: PageModel;
  readonly openTrace: (traceId: string) => void;
}) {
  return (
    <div className="space-y-4">
      <ChartGrid>
        <ChartPanel
          title="Prompt usage"
          rows={page.filtered.promptUsage}
          loading={page.promptQueries.usage.isPending}
          group={(row) => labelPrompt(row)}
          value={(row) => row.calls}
          yFormatter={formatNumber}
        />
        <ChartPanel
          title="Prompt P95 latency"
          rows={page.filtered.promptLatency}
          loading={page.promptQueries.latency.isPending}
          group={(row) => labelPrompt(row)}
          value={(row) => row.p95Ms}
          yFormatter={formatDuration}
        />
        <ChartPanel
          title="Prompt tokens"
          rows={page.filtered.promptTokens}
          loading={page.promptQueries.tokenUsage.isPending}
          group={(row) => labelPrompt(row)}
          value={(row) => row.totalTokens}
          yFormatter={formatNumber}
        />
        <ChartPanel
          title="Prompt cost"
          rows={page.filtered.promptCost}
          loading={page.promptQueries.cost.isPending}
          group={(row) => labelPrompt(row)}
          value={(row) => row.estimatedTotalCost}
          yFormatter={formatCurrency}
        />
      </ChartGrid>
      <AiResultsTable
        title="Prompt traces"
        rows={page.filtered.promptTraces}
        columns={TRACE_COLUMNS}
        loading={page.promptQueries.traces.isPending}
        getRowId={(row) => row.spanId || row.traceId}
        onRowClick={(row) => openTrace(row.traceId)}
        emptyTitle="No prompt traces"
      />
    </div>
  );
}

function AgentsTab({ page }: { readonly page: PageModel }) {
  return (
    <ChartGrid>
      <ChartPanel
        title="Agent runs"
        rows={page.filtered.agentRuns}
        loading={page.agentQueries.runs.isPending}
        group={(row) => row.agentName || "unknown"}
        value={(row) => row.runs}
        yFormatter={formatNumber}
      />
      <ChartPanel
        title="Tool calls"
        rows={page.filtered.toolCalls}
        loading={page.agentQueries.toolCalls.isPending}
        group={(row) => row.toolName || "unknown"}
        value={(row) => row.calls}
        yFormatter={formatNumber}
      />
      <ChartPanel
        title="Tool errors"
        rows={page.filtered.toolErrors}
        loading={page.agentQueries.toolErrors.isPending}
        group={(row) => row.toolName || "unknown"}
        value={(row) => row.errors}
        yFormatter={formatNumber}
      />
      <ChartPanel
        title="Tool P95 latency"
        rows={page.filtered.toolLatency}
        loading={page.agentQueries.toolLatency.isPending}
        group={(row) => row.toolName || "unknown"}
        value={(row) => row.p95Ms}
        yFormatter={formatDuration}
      />
    </ChartGrid>
  );
}

function RetrievalTab({ page }: { readonly page: PageModel }) {
  return (
    <ChartGrid>
      <ChartPanel
        title="Retrieval requests"
        rows={page.filtered.retrievalRate}
        loading={page.retrievalQueries.rate.isPending}
        group={(row) => row.dataSource || "unknown"}
        value={(row) => row.requests}
        yFormatter={formatNumber}
      />
      <ChartPanel
        title="Retrieval P95 latency"
        rows={page.filtered.retrievalLatency}
        loading={page.retrievalQueries.latency.isPending}
        group={(row) => row.dataSource || "unknown"}
        value={(row) => row.p95Ms}
        yFormatter={formatDuration}
      />
      <ChartPanel
        title="Retrieval errors"
        rows={page.filtered.retrievalErrors}
        loading={page.retrievalQueries.errors.isPending}
        group={(row) => row.dataSource || "unknown"}
        value={(row) => row.errors}
        yFormatter={formatNumber}
      />
      <ChartPanel
        title="Retrieval error rate"
        rows={page.filtered.retrievalErrors}
        loading={page.retrievalQueries.errors.isPending}
        group={(row) => row.dataSource || "unknown"}
        value={(row) => row.errorRate}
        yFormatter={(value) => formatPercentage(value)}
      />
    </ChartGrid>
  );
}

function TracesTab({
  page,
  openTrace,
}: {
  readonly page: PageModel;
  readonly openTrace: (traceId: string) => void;
}) {
  return (
    <div className="space-y-4">
      <Surface elevation={1} padding="sm">
        <div className="mb-2 flex items-center gap-2 text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wide">
          <Gauge size={13} />
          Span types
        </div>
        <div className="flex flex-wrap gap-2">
          {AI_SPAN_TYPES.map((type) => (
            <SpanTypeButton
              key={type}
              type={type}
              active={Boolean(
                page.state.filters.find(
                  (filter) => filter.field === "spanType" && filter.value === type
                )
              )}
              onClick={() =>
                page.state.setFilters(toggleFilter(page.state.filters, {
                  field: "spanType",
                  op: "eq",
                  value: type,
                }))
              }
            />
          ))}
        </div>
      </Surface>
      <AiResultsTable
        title="AI traces"
        rows={page.filtered.traces}
        columns={TRACE_COLUMNS}
        loading={page.tracesQuery.isPending}
        getRowId={(row) => row.spanId || row.traceId}
        onRowClick={(row) => openTrace(row.traceId)}
        emptyTitle="No AI traces"
      />
    </div>
  );
}

function ChartGrid({ children }: { readonly children: React.ReactNode }) {
  return <div className="grid gap-4 xl:grid-cols-2">{children}</div>;
}

function ChartPanel<Row extends { readonly timestamp: string }>({
  title,
  rows,
  loading,
  group,
  value,
  yFormatter,
}: {
  readonly title: string;
  readonly rows: readonly Row[];
  readonly loading: boolean;
  readonly group: (row: Row) => string;
  readonly value: (row: Row) => number;
  readonly yFormatter: (value: number) => string;
}) {
  const data = useMemo(() => buildChartData(rows, group, value), [rows, group, value]);
  return (
    <Surface elevation={1} padding="sm" className="min-h-[280px]">
      <div className="mb-2 flex items-center justify-between gap-2">
        <h2 className="m-0 truncate text-[13px] font-semibold text-[var(--text-primary)]">
          {title}
        </h2>
        {loading ? (
          <span className="text-[11px] text-[var(--text-muted)]">Loading</span>
        ) : null}
      </div>
      {data.timestamps.length === 0 ? (
        <EmptyPanel />
      ) : (
        <ObservabilityChart
          timestamps={data.timestamps}
          series={data.series}
          type="line"
          height={220}
          yFormatter={yFormatter}
          legend
        />
      )}
    </Surface>
  );
}

function EmptyPanel() {
  return (
    <div className="flex h-[220px] flex-col items-center justify-center gap-2 text-center">
      <SearchX size={24} className="text-[var(--text-muted)] opacity-70" />
      <div className="text-[12px] text-[var(--text-secondary)]">No AI telemetry found</div>
      <div className="max-w-[280px] text-[11px] text-[var(--text-muted)]">
        Broaden the time range or remove filters once services emit GenAI telemetry.
      </div>
    </div>
  );
}

function AiResultsTable<Row>({
  title,
  rows,
  columns,
  loading,
  getRowId,
  onRowClick,
  emptyTitle,
}: {
  readonly title: string;
  readonly rows: readonly Row[];
  readonly columns: readonly ColumnDef<Row>[];
  readonly loading: boolean;
  readonly getRowId: (row: Row) => string;
  readonly onRowClick: (row: Row) => void;
  readonly emptyTitle: string;
}) {
  const [config, setConfig] = useState<readonly ColumnConfig[]>(
    columns.map((column) => ({ key: column.key, visible: true, width: column.width }))
  );
  return (
    <Surface elevation={1} padding="xs" className="flex min-h-[360px] flex-col overflow-hidden">
      <div className="flex shrink-0 items-center justify-between gap-2 px-2 py-2">
        <h2 className="m-0 truncate text-[13px] font-semibold text-[var(--text-primary)]">
          {title}
        </h2>
        <span className="font-mono text-[11px] text-[var(--text-muted)]">
          {formatNumber(rows.length)}
        </span>
      </div>
      <div className="min-h-0 flex-1 overflow-hidden">
        <ResultsArea<Row>
          rows={rows}
          columns={columns}
          config={config}
          onConfigChange={setConfig}
          getRowId={getRowId}
          onRowClick={onRowClick}
          loading={loading}
          emptyTitle={emptyTitle}
          emptyDescription="Adjust filters or broaden the time range."
          rowHeight={38}
        />
      </div>
    </Surface>
  );
}

function SpanTypeButton({
  type,
  active,
  onClick,
}: {
  readonly type: AiSpanType;
  readonly active: boolean;
  readonly onClick: () => void;
}) {
  return (
    <Button
      type="button"
      size="sm"
      variant={active ? "primary" : "secondary"}
      onClick={onClick}
    >
      {labelForAiSpanType(type)}
    </Button>
  );
}

const CALL_COLUMNS: readonly ColumnDef<AiCallRow>[] = [
  { key: "time", label: "Time", width: 130, render: (row) => <Mono>{formatTime(row.timestamp)}</Mono> },
  { key: "duration", label: "Duration", width: 100, render: (row) => <Mono>{formatDuration(row.durationMs)}</Mono> },
  { key: "model", label: "Model", width: 180, render: (row) => <TextCell>{labelModel(row)}</TextCell> },
  { key: "operation", label: "Operation", width: 150, render: (row) => <TextCell>{row.operation}</TextCell> },
  { key: "tokens", label: "Tokens", width: 90, render: (row) => <Mono>{formatNumber(row.totalTokens)}</Mono> },
  { key: "cost", label: "Cost", width: 90, render: (row) => <Mono>{formatCurrency(row.estimatedTotalCost)}</Mono> },
  { key: "status", label: "Status", width: 110, render: (row) => <StatusPill status={row.status} errorType={row.errorType} /> },
  {
    key: "trace",
    label: "Trace",
    width: 100,
    render: () => (
      <span className="inline-flex items-center gap-1 text-[11px] text-[var(--color-primary)]">
        Open <ExternalLink size={11} />
      </span>
    ),
  },
];

const TRACE_COLUMNS: readonly ColumnDef<AiTraceRow>[] = [
  {
    key: "spanType",
    label: "Type",
    width: 116,
    render: (row) => <TypePill type={inferAiSpanType(row.operation)} />,
  },
  { key: "time", label: "Time", width: 130, render: (row) => <Mono>{formatTime(row.timestamp)}</Mono> },
  { key: "service", label: "Service", width: 150, render: (row) => <TextCell>{row.service}</TextCell> },
  { key: "model", label: "Model", width: 170, render: (row) => <TextCell>{labelModel(row)}</TextCell> },
  { key: "operation", label: "Operation", width: 140, render: (row) => <TextCell>{row.operation}</TextCell> },
  { key: "context", label: "Prompt / tool / source", render: (row) => <TextCell>{traceContext(row)}</TextCell> },
  { key: "duration", label: "Duration", width: 95, render: (row) => <Mono>{formatDuration(row.durationMs)}</Mono> },
  { key: "tokens", label: "Tokens", width: 90, render: (row) => <Mono>{formatNumber(row.totalTokens)}</Mono> },
  { key: "cost", label: "Cost", width: 90, render: (row) => <Mono>{formatCurrency(row.estimatedTotalCost)}</Mono> },
  { key: "status", label: "Status", width: 110, render: (row) => <StatusPill status={row.status} errorType={row.errorType} /> },
];

function TypePill({ type }: { readonly type: AiSpanType }) {
  return (
    <span className="inline-flex items-center rounded-[var(--card-radius)] border border-[var(--border-color)] bg-[var(--bg-tertiary)] px-2 py-0.5 text-[10px] font-semibold text-[var(--text-secondary)] uppercase">
      {labelForAiSpanType(type)}
    </span>
  );
}

function StatusPill({
  status,
  errorType,
}: {
  readonly status: string;
  readonly errorType?: string;
}) {
  const error = status.toUpperCase() === "ERROR" || Boolean(errorType);
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-[var(--card-radius)] px-2 py-0.5 text-[10px] font-semibold uppercase",
        error
          ? "bg-[var(--color-error-subtle)] text-[var(--color-error)]"
          : "bg-[var(--color-success-subtle)] text-[var(--color-success)]"
      )}
      title={errorType}
    >
      {error ? "Error" : status || "OK"}
    </span>
  );
}

function Mono({ children }: { readonly children: React.ReactNode }) {
  return <span className="truncate font-mono text-[11px] text-[var(--text-secondary)]">{children}</span>;
}

function TextCell({ children }: { readonly children: React.ReactNode }) {
  return <span className="block truncate text-[12px] text-[var(--text-primary)]">{children}</span>;
}

function buildChartData<Row extends { readonly timestamp: string }>(
  rows: readonly Row[],
  group: (row: Row) => string,
  value: (row: Row) => number
): { timestamps: number[]; series: ObservabilityChartSeries[] } {
  const timestamps = Array.from(
    new Set(rows.map((row) => toTimestampSeconds(row.timestamp)).filter((ts) => ts > 0))
  ).sort((a, b) => a - b);
  if (timestamps.length === 0) return { timestamps: [], series: [] };

  const byGroup = new Map<string, Map<number, number>>();
  for (const row of rows) {
    const ts = toTimestampSeconds(row.timestamp);
    if (ts <= 0) continue;
    const key = group(row) || "unknown";
    const bucket = byGroup.get(key) ?? new Map<number, number>();
    bucket.set(ts, (bucket.get(ts) ?? 0) + safeNumber(value(row)));
    byGroup.set(key, bucket);
  }

  const ranked = Array.from(byGroup.entries())
    .map(([key, values]) => ({
      key,
      values,
      total: Array.from(values.values()).reduce((sum, next) => sum + next, 0),
    }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 8);

  return {
    timestamps,
    series: ranked.map((entry, index) => ({
      label: entry.key,
      values: timestamps.map((ts) => entry.values.get(ts) ?? null),
      color: getChartColor(index),
      width: 1.8,
    })),
  };
}

function buildKpis(rows: PageModel["filtered"]): SummaryKPI[] {
  const requests = rows.modelRate.reduce((sum, row) => sum + row.requests, 0);
  const errors = rows.modelErrors.reduce((sum, row) => sum + row.errors, 0);
  const p95 = rows.modelLatency.reduce((max, row) => Math.max(max, row.p95Ms), 0);
  const tokens = rows.modelTokens.reduce((sum, row) => sum + row.totalTokens, 0);
  const cost = rows.modelCost.reduce((sum, row) => sum + row.estimatedTotalCost, 0);
  const errorRate = requests > 0 ? errors / requests : 0;
  return [
    { label: "Requests", value: formatNumber(requests) },
    { label: "P95", value: formatDuration(p95) },
    { label: "Error rate", value: formatPercentage(errorRate), tone: errorRate > 0 ? "error" : "default" },
    { label: "Tokens", value: formatNumber(tokens) },
    { label: "Cost", value: formatCurrency(cost) },
  ];
}

function buildFacetGroups(facets: PageModel["facetsQuery"]["data"]): FacetGroupModel[] {
  const operations = facets?.operations ?? [];
  const spanTypes = AI_SPAN_TYPES.map((type) => ({
    value: type,
    count: operations
      .filter((bucket) => inferAiSpanType(bucket.value) === type)
      .reduce((sum, bucket) => sum + bucket.count, 0),
  })).filter((bucket) => bucket.count > 0 || bucket.value !== "UNKNOWN");

  return [
    facetGroup("spanType", "Span type", spanTypes),
    facetGroup("provider", "Provider", facets?.providers),
    facetGroup("model", "Model", facets?.models),
    facetGroup("operation", "Operation", facets?.operations),
    facetGroup("service", "Service", facets?.services),
    facetGroup("environment", "Environment", facets?.environments),
    facetGroup("promptName", "Prompt", facets?.promptNames),
    facetGroup("agentName", "Agent", facets?.agentNames),
    facetGroup("toolName", "Tool", facets?.toolNames),
    facetGroup("dataSource", "Data source", facets?.dataSources),
  ].filter((group) => group.buckets.length > 0);
}

function facetGroup(
  field: string,
  label: string,
  buckets: readonly AiFacetBucket[] | undefined
): FacetGroupModel {
  return { field, label, buckets: [...(buckets ?? [])] };
}

function buildValueSuggestions(facets: PageModel["facetsQuery"]["data"]) {
  const fromBuckets = (buckets: readonly AiFacetBucket[] | undefined) =>
    (buckets ?? []).map((bucket) => ({
      value: bucket.value,
      label: bucket.value,
      hint: formatNumber(bucket.count),
    }));
  return {
    spanType: AI_SPAN_TYPES.map((type) => ({
      value: type,
      label: labelForAiSpanType(type),
    })),
    provider: fromBuckets(facets?.providers),
    model: fromBuckets(facets?.models),
    operation: fromBuckets(facets?.operations),
    service: fromBuckets(facets?.services),
    environment: fromBuckets(facets?.environments),
    promptName: fromBuckets(facets?.promptNames),
    agentName: fromBuckets(facets?.agentNames),
    toolName: fromBuckets(facets?.toolNames),
    dataSource: fromBuckets(facets?.dataSources),
  };
}

function activeFilterState(
  filters: readonly ExplorerFilter[],
  field: string,
  value: string
): "include" | "exclude" | null {
  const found = filters.find((filter) => filter.field === field && filter.value === value);
  if (!found) return null;
  return found.op === "neq" || found.op === "not_in" ? "exclude" : "include";
}

function toggleFilter(
  filters: readonly ExplorerFilter[],
  nextFilter: ExplorerFilter
): readonly ExplorerFilter[] {
  const exists = filters.some(
    (filter) =>
      filter.field === nextFilter.field &&
      filter.op === nextFilter.op &&
      filter.value === nextFilter.value
  );
  if (exists) {
    return filters.filter(
      (filter) =>
        !(
          filter.field === nextFilter.field &&
          filter.op === nextFilter.op &&
          filter.value === nextFilter.value
        )
    );
  }
  return [...filters, nextFilter];
}

function labelModel(row: {
  readonly provider?: string;
  readonly model?: string;
  readonly operation?: string;
}) {
  const model = row.model || "unknown";
  const provider = row.provider && row.provider !== "unknown" ? `${row.provider} / ` : "";
  return `${provider}${model}`;
}

function labelPrompt(row: {
  readonly promptName?: string;
  readonly promptVersion?: string;
}) {
  if (!row.promptName) return "unknown";
  return row.promptVersion ? `${row.promptName}@${row.promptVersion}` : row.promptName;
}

function traceContext(row: AiTraceRow): string {
  if (row.promptName) return labelPrompt(row);
  if (row.toolName) return row.toolName;
  if (row.dataSource) return row.dataSource;
  return row.name;
}

function formatCurrency(value: number): string {
  if (!Number.isFinite(value)) return "$0.00";
  return new Intl.NumberFormat("en", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: value < 1 ? 4 : 2,
  }).format(value);
}

function formatTime(timestamp: string): string {
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toISOString().slice(11, 19);
}

function toTimestampSeconds(timestamp: string): number {
  const ms = Date.parse(timestamp);
  if (Number.isNaN(ms)) return 0;
  return Math.floor(ms / 1000);
}

function safeNumber(value: number): number {
  return Number.isFinite(value) ? value : 0;
}
