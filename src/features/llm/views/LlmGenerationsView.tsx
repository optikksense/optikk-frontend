import {
  Activity,
  AlertCircle,
  Database,
  Download,
  List,
  RotateCcw,
  Share2,
  Sparkles,
} from "lucide-react";
import { useMemo, useState } from "react";
import toast from "react-hot-toast";

import { Badge, Button, Modal, Switch } from "@/components/ui";
import type { SimpleTableColumn } from "@/components/ui";
import { ExplorerResultsTable, FacetRail } from "@/features/explorer-core/components";
import {
  type AggregationSpec,
  AnalyticsToolbar,
  type ExplorerVizMode,
} from "@/features/explorer-core/components/AnalyticsToolbar";
import { AnalyticsPieChart } from "@/features/explorer-core/components/visualizations/AnalyticsPieChart";
import { AnalyticsTable } from "@/features/explorer-core/components/visualizations/AnalyticsTable";
import { AnalyticsTimeseries } from "@/features/explorer-core/components/visualizations/AnalyticsTimeseries";
import { AnalyticsTopList } from "@/features/explorer-core/components/visualizations/AnalyticsTopList";
import { useExplorerAnalytics } from "@/features/explorer-core/hooks/useExplorerAnalytics";
import { resolveTimeBounds } from "@/features/explorer-core/utils/timeRange";
import { cn } from "@/lib/utils";
import type { StructuredFilter } from "@/shared/hooks/useURLFilters";
import { useTimeRange } from "@app/store/appStore";
import {
  ObservabilityDetailPanel,
  ObservabilityQueryBar,
  PageSurface,
} from "@shared/components/ui";
import { ROUTES } from "@shared/constants/routes";
import {
  buildLogsHubHref,
  traceDetailHref,
  traceIdEqualsFilter,
} from "@shared/observability/deepLinks";
import {
  formatDuration,
  formatNumber,
  formatRelativeTime,
  formatTimestamp,
} from "@shared/utils/formatters";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";

import { llmHubApi } from "../api/llmHubApi";
import LlmVolumeChart from "../components/LlmVolumeChart";
import { LLM_ANALYTICS_FIELDS, LLM_FILTER_FIELDS, LLM_METRIC_FIELDS } from "../constants";
import { useLlmExplorer } from "../hooks/useLlmExplorer";
import { useLlmGenerationDetail } from "../hooks/useLlmGenerationDetail";
import type { LlmGenerationRecord } from "../types";
import { formatCost } from "../utils/costCalculator";
import { downloadGenerationsAsJson } from "../utils/exportGenerationsJson";

function renderStatus(status: string) {
  const normalized = (status || "UNSET").toUpperCase();
  const variant = normalized === "ERROR" ? "error" : normalized === "OK" ? "success" : "default";
  return <Badge variant={variant}>{normalized}</Badge>;
}

function renderProviderBadge(provider: string) {
  return (
    <Badge variant="info" className="text-[11px]">
      {provider || "unknown"}
    </Badge>
  );
}

function upsertFacetFilter(
  filters: StructuredFilter[],
  nextField: string,
  nextValue: string | null
): StructuredFilter[] {
  const withoutField = filters.filter((filter) => filter.field !== nextField);
  if (!nextValue) return withoutField;
  return [...withoutField, { field: nextField, operator: "equals", value: nextValue }];
}

export default function LlmGenerationsView() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const timeRange = useTimeRange();

  const {
    isLoading,
    isError,
    generations,
    total,
    summary,
    facets,
    trend,
    selectedProvider,
    selectedModel,
    selectedSession,
    errorsOnly,
    page,
    pageSize,
    filters,
    explorerQuery,
    setSelectedProvider,
    setSelectedModel,
    setSelectedSession,
    setErrorsOnly,
    setPage,
    setPageSize,
    setFilters,
    clearAll,
    startTime,
    endTime,
  } = useLlmExplorer();

  const [explorerMode, setExplorerMode] = useState<"list" | "analytics">("list");
  const [datasetModalOpen, setDatasetModalOpen] = useState(false);
  const [datasetName, setDatasetName] = useState("");
  const [vizMode, setVizMode] = useState<ExplorerVizMode>("table");
  const [groupBy, setGroupBy] = useState<string[]>(["gen_ai.request.model"]);
  const [aggregations, setAggregations] = useState<AggregationSpec[]>([
    { function: "count", alias: "count" },
  ]);
  const [analyticsStep, setAnalyticsStep] = useState("5m");

  const { startTime: rangeStart, endTime: rangeEnd } = useMemo(
    () => resolveTimeBounds(timeRange),
    [timeRange]
  );

  const analyticsEnabled =
    explorerMode === "analytics" && groupBy.length > 0 && aggregations.length > 0;

  const analyticsQuery = useExplorerAnalytics("traces", {
    query: explorerQuery ? `@gen_ai.system:* AND ${explorerQuery}` : "@gen_ai.system:*",
    startTime: rangeStart,
    endTime: rangeEnd,
    groupBy,
    aggregations: aggregations.map((a) => ({
      function: a.function,
      field: a.field,
      alias: a.alias || "m",
    })),
    vizMode: vizMode === "list" ? "table" : vizMode,
    step: analyticsStep,
    limit: 500,
    enabled: analyticsEnabled,
  });

  const [selectedGeneration, setSelectedGeneration] = useState<LlmGenerationRecord | null>(null);
  const detailFields = useLlmGenerationDetail(selectedGeneration);

  const topModels = useMemo(() => facets.ai_model.slice(0, 5), [facets.ai_model]);

  const columns = useMemo<SimpleTableColumn<LlmGenerationRecord>[]>(
    () => [
      {
        title: "Time",
        key: "start_time",
        dataIndex: "start_time",
        width: 160,
        sorter: (a, b) =>
          new Date(String(a.start_time)).getTime() - new Date(String(b.start_time)).getTime(),
        defaultSortOrder: "descend",
        render: (value) => (
          <div className="space-y-1">
            <div className="text-[12px] text-[var(--text-primary)]">
              {formatTimestamp(String(value))}
            </div>
            <div className="text-[11px] text-[var(--text-muted)]">
              {formatRelativeTime(String(value))}
            </div>
          </div>
        ),
      },
      {
        title: "Provider",
        key: "ai_system",
        dataIndex: "ai_system",
        width: 100,
        sorter: (a, b) => a.ai_system.localeCompare(b.ai_system),
        render: (value) => renderProviderBadge(String(value)),
      },
      {
        title: "Model",
        key: "ai_request_model",
        dataIndex: "ai_request_model",
        width: 170,
        ellipsis: true,
        sorter: (a, b) => a.ai_request_model.localeCompare(b.ai_request_model),
        render: (value) => (
          <span className="font-mono text-[11px] text-[var(--text-primary)]">
            {String(value || "—")}
          </span>
        ),
      },
      {
        title: "Operation",
        key: "ai_operation",
        dataIndex: "ai_operation",
        width: 110,
        render: (value) =>
          value ? (
            <Badge variant="default" className="text-[10px]">
              {String(value)}
            </Badge>
          ) : (
            <span className="text-[var(--text-muted)]">—</span>
          ),
      },
      {
        title: "Service",
        key: "service_name",
        dataIndex: "service_name",
        width: 140,
        ellipsis: true,
        sorter: (a, b) => a.service_name.localeCompare(b.service_name),
        render: (value) => (
          <span className="font-medium text-[12.5px] text-[var(--text-primary)]">
            {String(value || "Unknown")}
          </span>
        ),
      },
      {
        title: "Status",
        key: "status",
        dataIndex: "status",
        width: 90,
        sorter: (a, b) => a.status.localeCompare(b.status),
        render: (value) => renderStatus(String(value)),
      },
      {
        title: "Trace",
        key: "trace_open",
        width: 82,
        render: (_, row) => (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 px-2 font-medium text-[11px] text-[var(--color-primary)]"
            onClick={(e) => {
              e.stopPropagation();
              void navigate({ to: traceDetailHref(row.trace_id) as never });
            }}
          >
            Open
          </Button>
        ),
      },
      {
        title: "Latency",
        key: "duration_ms",
        dataIndex: "duration_ms",
        width: 100,
        sorter: (a, b) => a.duration_ms - b.duration_ms,
        render: (value) => (
          <span className="font-medium text-[var(--text-primary)]">
            {formatDuration(Number(value ?? 0))}
          </span>
        ),
      },
      {
        title: "Tokens In",
        key: "input_tokens",
        dataIndex: "input_tokens",
        width: 90,
        sorter: (a, b) => a.input_tokens - b.input_tokens,
        render: (value) => (
          <span className="text-[12px] text-[var(--text-secondary)]">
            {Number(value) > 0 ? formatNumber(Number(value)) : "—"}
          </span>
        ),
      },
      {
        title: "Tokens Out",
        key: "output_tokens",
        dataIndex: "output_tokens",
        width: 90,
        sorter: (a, b) => a.output_tokens - b.output_tokens,
        render: (value) => (
          <span className="text-[12px] text-[var(--text-secondary)]">
            {Number(value) > 0 ? formatNumber(Number(value)) : "—"}
          </span>
        ),
      },
      {
        title: "Est. Cost",
        key: "estimated_cost",
        dataIndex: "estimated_cost",
        width: 90,
        sorter: (a, b) => a.estimated_cost - b.estimated_cost,
        render: (value) => (
          <span className="font-mono text-[11px] text-[var(--text-secondary)]">
            {Number(value) > 0 ? formatCost(Number(value)) : "—"}
          </span>
        ),
      },
    ],
    [navigate]
  );

  const saveDatasetMutation = useMutation({
    mutationFn: llmHubApi.createDataset,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["llm", "hub", "datasets"] });
      toast.success("Dataset saved");
      setDatasetModalOpen(false);
      setDatasetName("");
    },
    onError: (e: Error) => toast.error(e.message || "Could not save dataset"),
  });

  const facetGroups = useMemo(
    () => [
      { key: "ai_system", label: "Provider", buckets: facets.ai_system },
      { key: "ai_model", label: "Model", buckets: facets.ai_model },
      { key: "ai_operation", label: "Operation", buckets: facets.ai_operation },
      { key: "service_name", label: "Service", buckets: facets.service_name },
      { key: "prompt_template", label: "Prompt template", buckets: facets.prompt_template },
      { key: "status", label: "Status", buckets: facets.status },
      { key: "finish_reason", label: "Finish Reason", buckets: facets.finish_reason },
    ],
    [facets]
  );

  const selectedFacetState = useMemo(
    () => ({
      ai_system: selectedProvider,
      ai_model: selectedModel,
      ai_operation: filters.find((f) => f.field === "operation")?.value ?? null,
      service_name: filters.find((f) => f.field === "service_name")?.value ?? null,
      prompt_template: filters.find((f) => f.field === "prompt")?.value ?? null,
      status: errorsOnly ? "ERROR" : null,
      finish_reason: filters.find((f) => f.field === "finish_reason")?.value ?? null,
    }),
    [errorsOnly, filters, selectedModel, selectedProvider]
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 font-medium text-[13px] text-[var(--text-primary)]">
          <List size={16} className="text-[var(--text-muted)]" />
          Generations
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            icon={<Download size={14} />}
            onClick={() => {
              downloadGenerationsAsJson(generations);
              toast.success("Downloaded JSON for rows in this page");
            }}
          >
            Export JSON
          </Button>
          <Button
            variant="ghost"
            size="sm"
            icon={<Database size={14} />}
            disabled={generations.length === 0}
            onClick={() => setDatasetModalOpen(true)}
          >
            Save as dataset
          </Button>
          <Button variant="ghost" size="sm" icon={<RotateCcw size={14} />} onClick={clearAll}>
            Reset
          </Button>
          <Button
            variant="ghost"
            size="sm"
            icon={<Share2 size={14} />}
            onClick={async () => {
              await navigator.clipboard.writeText(window.location.href);
              toast.success("Share link copied");
            }}
          >
            Share
          </Button>
        </div>
      </div>

      <PageSurface padding="lg" className="relative z-[40] overflow-visible">
        <div className="flex flex-col gap-4">
          <LlmVolumeChart buckets={trend} isLoading={isLoading} />

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Badge variant="info">
                <Sparkles size={12} className="mr-1 inline" />
                GenAI Spans
              </Badge>
              <Badge variant={summary.error_calls > 0 ? "error" : "default"}>
                {formatNumber(summary.error_calls)} errors
              </Badge>
              <span className="text-[11px] text-[var(--text-muted)]">
                {formatNumber(total)} total
              </span>
              {selectedSession ? (
                <Badge variant="info" className="gap-1 text-[10px]">
                  Session
                  <button
                    type="button"
                    className="rounded px-0.5 hover:bg-white/10"
                    onClick={() => {
                      setSelectedSession(null);
                      setPage(1);
                    }}
                    aria-label="Clear session filter"
                  >
                    ×
                  </button>
                  <span className="max-w-[140px] truncate font-mono">{selectedSession}</span>
                </Badge>
              ) : null}
            </div>
            {topModels.length > 0 && (
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] text-[var(--text-muted)]">Top models:</span>
                {topModels.map((m) => (
                  <button
                    type="button"
                    key={m.value}
                    onClick={() => {
                      setSelectedModel(selectedModel === m.value ? null : m.value);
                      setPage(1);
                    }}
                    className={cn(
                      "rounded-md border px-2 py-0.5 font-mono text-[10px] transition-colors",
                      selectedModel === m.value
                        ? "border-[var(--color-primary)] bg-[rgba(10,174,214,0.12)] text-[var(--color-primary)]"
                        : "border-[var(--border-color)] text-[var(--text-secondary)] hover:border-[var(--text-muted)]"
                    )}
                  >
                    {m.value}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="relative z-[70] grid items-start gap-3 lg:grid-cols-[1fr]">
            <ObservabilityQueryBar
              fields={LLM_FILTER_FIELDS}
              filters={filters}
              setFilters={(nextFilters: StructuredFilter[]) => {
                setFilters(nextFilters);
                setPage(1);
              }}
              onClearAll={clearAll}
              placeholder="model:gpt-4o AND provider:openai — or use Search filter"
              rightSlot={
                <div
                  className={cn(
                    "flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs transition-colors",
                    errorsOnly
                      ? "border-[rgba(240,68,56,0.35)] bg-[rgba(240,68,56,0.08)] text-[var(--color-error)]"
                      : "border-[var(--border-color)] bg-[var(--bg-tertiary)] text-[var(--text-secondary)]"
                  )}
                >
                  <Activity size={13} />
                  Errors only
                  <Switch
                    size="sm"
                    checked={errorsOnly}
                    onChange={(event) => {
                      setErrorsOnly(event.target.checked);
                      setPage(1);
                    }}
                  />
                </div>
              }
            />
          </div>

          <AnalyticsToolbar
            mode={explorerMode}
            onModeChange={setExplorerMode}
            vizMode={vizMode}
            onVizModeChange={setVizMode}
            groupBy={groupBy}
            onGroupByChange={setGroupBy}
            aggregations={aggregations}
            onAggregationsChange={setAggregations}
            step={analyticsStep}
            onStepChange={setAnalyticsStep}
            fieldOptions={LLM_ANALYTICS_FIELDS}
            metricFields={LLM_METRIC_FIELDS}
          />
        </div>
      </PageSurface>

      <div
        className={cn(
          "relative z-0 grid w-full min-w-0 gap-4",
          explorerMode === "list"
            ? "lg:grid-cols-[minmax(280px,320px)_minmax(0,1fr)]"
            : "grid-cols-1"
        )}
      >
        {explorerMode === "list" ? (
          <>
            <FacetRail
              groups={facetGroups}
              selected={selectedFacetState}
              onSelect={(groupKey, value) => {
                if (groupKey === "ai_system") {
                  setSelectedProvider(value);
                  setPage(1);
                  return;
                }
                if (groupKey === "ai_model") {
                  setSelectedModel(value);
                  setPage(1);
                  return;
                }
                if (groupKey === "status") {
                  setErrorsOnly(value === "ERROR");
                  setPage(1);
                  return;
                }
                if (groupKey === "ai_operation") {
                  setFilters(upsertFacetFilter(filters, "operation", value));
                  setPage(1);
                  return;
                }
                if (groupKey === "service_name") {
                  setFilters(upsertFacetFilter(filters, "service_name", value));
                  setPage(1);
                  return;
                }
                if (groupKey === "finish_reason") {
                  setFilters(upsertFacetFilter(filters, "finish_reason", value));
                  setPage(1);
                  return;
                }
                if (groupKey === "prompt_template") {
                  setFilters(upsertFacetFilter(filters, "prompt", value));
                  setPage(1);
                  return;
                }
                setFilters(upsertFacetFilter(filters, groupKey, value));
                setPage(1);
              }}
            />

            {isError && (
              <div className="mb-3 flex items-center gap-2 rounded-[var(--card-radius)] border border-[rgba(240,68,56,0.3)] bg-[rgba(240,68,56,0.08)] px-4 py-3 text-[var(--color-error)]">
                <AlertCircle size={16} className="shrink-0" />
                <span className="font-medium text-sm">Failed to load generations</span>
              </div>
            )}

            <ExplorerResultsTable
              title="LLM Generations"
              subtitle={`${formatNumber(generations.length)} rows in view, ${formatNumber(total)} total`}
              rows={generations}
              columns={columns}
              rowKey={(row) => `${row.trace_id}-${row.span_id}`}
              isLoading={isLoading}
              page={page}
              pageSize={pageSize}
              showPagination
              total={total}
              onPageChange={setPage}
              onPageSizeChange={(size) => {
                setPageSize(size);
                setPage(1);
              }}
              onRow={(row) => ({
                onClick: () => setSelectedGeneration(row),
              })}
              rowClassName={(row) =>
                cn(
                  "cursor-pointer transition-colors hover:bg-[rgba(255,255,255,0.04)]",
                  selectedGeneration?.span_id === row.span_id &&
                    "bg-[rgba(10,174,214,0.12)] ring-1 ring-[rgba(10,174,214,0.28)] ring-inset"
                )
              }
            />
          </>
        ) : (
          <PageSurface padding="lg" className="min-h-[320px]">
            {analyticsQuery.isLoading ? (
              <div className="text-[13px] text-[var(--text-muted)]">Loading analytics...</div>
            ) : analyticsQuery.isError ? (
              <div className="text-[13px] text-[var(--color-error)]">Analytics request failed.</div>
            ) : analyticsQuery.data ? (
              <div className="space-y-4">
                {vizMode === "timeseries" ? (
                  <AnalyticsTimeseries result={analyticsQuery.data} />
                ) : null}
                {vizMode === "toplist" ? <AnalyticsTopList result={analyticsQuery.data} /> : null}
                {vizMode === "table" || vizMode === "list" ? (
                  <AnalyticsTable result={analyticsQuery.data} />
                ) : null}
                {vizMode === "piechart" ? <AnalyticsPieChart result={analyticsQuery.data} /> : null}
              </div>
            ) : (
              <div className="text-[13px] text-[var(--text-muted)]">
                Configure group by and metrics.
              </div>
            )}
          </PageSurface>
        )}
      </div>

      <Modal
        open={datasetModalOpen}
        onClose={() => {
          setDatasetModalOpen(false);
          setDatasetName("");
        }}
        title="Save as dataset"
        width={440}
        footer={
          <>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setDatasetModalOpen(false);
                setDatasetName("");
              }}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              disabled={saveDatasetMutation.isPending || generations.length === 0}
              onClick={() => {
                const name = datasetName.trim();
                if (!name) {
                  toast.error("Enter a dataset name.");
                  return;
                }
                const stripped = generations.map(({ estimated_cost: _ec, ...rest }) => ({
                  ...rest,
                }));
                saveDatasetMutation.mutate({
                  name,
                  query_snapshot: explorerQuery || "",
                  start_time_ms: startTime,
                  end_time_ms: endTime,
                  generations: stripped,
                });
              }}
            >
              {saveDatasetMutation.isPending ? "Saving…" : "Save"}
            </Button>
          </>
        }
      >
        <p className="text-[12px] text-[var(--text-muted)] leading-relaxed">
          Stores the current page of generations (without per-row estimated cost), the active
          explorer query string, and the explorer time bounds ({startTime}–{endTime} ms).
        </p>
        <label className="mt-3 flex flex-col gap-1">
          <span className="text-[11px] text-[var(--text-muted)]">Name</span>
          <input
            className="rounded-md border border-[var(--border-color)] bg-[var(--bg-tertiary)] px-2 py-1.5 text-[12px] text-[var(--text-primary)]"
            value={datasetName}
            onChange={(e) => setDatasetName(e.target.value)}
            placeholder="e.g. eval-baseline-2026-04"
          />
        </label>
      </Modal>

      {selectedGeneration ? (
        <ObservabilityDetailPanel
          title="Generation detail"
          titleBadge={renderStatus(selectedGeneration.status)}
          metaLine={formatTimestamp(selectedGeneration.start_time)}
          metaRight={formatRelativeTime(selectedGeneration.start_time)}
          summaryNode={
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                {renderProviderBadge(selectedGeneration.ai_system)}
                <span className="font-mono font-semibold text-[var(--text-primary)] text-sm">
                  {selectedGeneration.ai_request_model || "Unknown model"}
                </span>
              </div>
              <div className="text-[var(--text-secondary)] text-xs">
                {selectedGeneration.service_name} &middot;{" "}
                {formatDuration(selectedGeneration.duration_ms)}
                {selectedGeneration.total_tokens > 0
                  ? ` \u00b7 ${formatNumber(selectedGeneration.total_tokens)} tokens`
                  : ""}
                {selectedGeneration.estimated_cost > 0
                  ? ` \u00b7 ${formatCost(selectedGeneration.estimated_cost)}`
                  : ""}
              </div>
            </div>
          }
          actions={
            <>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  void navigate({
                    to: ROUTES.traceDetail.replace(
                      "$traceId",
                      selectedGeneration.trace_id
                    ) as never,
                  });
                }}
              >
                View full trace
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  void navigate({
                    to: buildLogsHubHref({
                      filters: [traceIdEqualsFilter(selectedGeneration.trace_id)],
                      fromMs: startTime,
                      toMs: endTime,
                    }) as never,
                  });
                }}
              >
                Related logs
              </Button>
            </>
          }
          fields={detailFields}
          rawData={selectedGeneration}
          onClose={() => setSelectedGeneration(null)}
        />
      ) : null}
    </div>
  );
}
