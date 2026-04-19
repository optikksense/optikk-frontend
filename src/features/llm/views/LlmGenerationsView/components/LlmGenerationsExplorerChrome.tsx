import { Activity, Sparkles } from "lucide-react";
import { memo } from "react";

import { Badge, Switch } from "@/components/ui";
import {
  type AggregationSpec,
  AnalyticsToolbar,
  type ExplorerVizMode,
} from "@/features/explorer-core/components/AnalyticsToolbar";
import { cn } from "@/lib/utils";
import type { StructuredFilter } from "@/shared/hooks/useURLFilters";
import { ObservabilityQueryBar, PageSurface } from "@shared/components/ui";
import { formatNumber } from "@shared/utils/formatters";

import LlmVolumeChart from "../../../components/LlmVolumeChart";
import { LLM_ANALYTICS_FIELDS, LLM_FILTER_FIELDS, LLM_METRIC_FIELDS } from "../../../constants";
import type { LlmSummary, LlmTrendBucket } from "../../../types";

type ExplorerMode = "list" | "analytics";

type Props = {
  trend: LlmTrendBucket[];
  isLoading: boolean;
  summary: LlmSummary;
  selectedSession: string | null;
  onClearSession: () => void;
  filters: StructuredFilter[];
  onClearAll: () => void;
  errorsOnly: boolean;
  onErrorsOnlyChange: (checked: boolean) => void;
  onStructuredFiltersChange: (next: StructuredFilter[]) => void;
  topModels: { value: string }[];
  selectedModel: string | null;
  onToggleModel: (model: string) => void;
  explorerMode: ExplorerMode;
  setExplorerMode: (m: ExplorerMode) => void;
  vizMode: ExplorerVizMode;
  setVizMode: (m: ExplorerVizMode) => void;
  groupBy: string[];
  setGroupBy: (g: string[]) => void;
  aggregations: AggregationSpec[];
  setAggregations: (a: AggregationSpec[]) => void;
  analyticsStep: string;
  setAnalyticsStep: (s: string) => void;
};

function LlmGenerationsExplorerChromeComponent({
  trend,
  isLoading,
  summary,
  selectedSession,
  onClearSession,
  filters,
  onClearAll,
  errorsOnly,
  onErrorsOnlyChange,
  onStructuredFiltersChange,
  topModels,
  selectedModel,
  onToggleModel,
  explorerMode,
  setExplorerMode,
  vizMode,
  setVizMode,
  groupBy,
  setGroupBy,
  aggregations,
  setAggregations,
  analyticsStep,
  setAnalyticsStep,
}: Props) {
  return (
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
            {selectedSession ? (
              <Badge variant="info" className="gap-1 text-[10px]">
                Session
                <button
                  type="button"
                  className="rounded px-0.5 hover:bg-white/10"
                  onClick={onClearSession}
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
                  onClick={() => onToggleModel(m.value)}
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
            setFilters={onStructuredFiltersChange}
            onClearAll={onClearAll}
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
                    onErrorsOnlyChange(event.target.checked);
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
  );
}

export const LlmGenerationsExplorerChrome = memo(LlmGenerationsExplorerChromeComponent);
