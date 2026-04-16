import { Activity, AlertCircle, Radio } from "lucide-react";
import { memo } from "react";

import { Badge, Button, Select, Switch } from "@/components/ui";
import type { SelectOption } from "@/components/ui";
import {
  type AggregationSpec,
  AnalyticsToolbar,
  type ExplorerVizMode,
} from "@/features/explorer-core/components/AnalyticsToolbar";
import { cn } from "@/lib/utils";
import type { StructuredFilter } from "@/shared/hooks/useURLFilters";
import { ObservabilityQueryBar, PageSurface } from "@shared/components/ui";
import { formatNumber } from "@shared/utils/formatters";

import { TRACE_FILTER_FIELDS } from "../../../utils/tracesUtils";

import { TRACE_METRIC_FIELDS } from "../constants";
import { formatLiveTailStatus } from "../utils";

type ExplorerMode = "list" | "analytics";

type LiveTailState = {
  status: "idle" | "connecting" | "live" | "closed" | "error";
  lagMs: number;
  droppedCount: number;
  errorMessage: string | null;
};

type Props = {
  mode: string;
  modeOptions: SelectOption[];
  onModeChange: (value: string) => void;
  isLiveTail: boolean;
  liveTail: LiveTailState;
  errorTraces: number;
  onToggleLiveTail: () => void;
  filters: StructuredFilter[];
  setFilters: (next: StructuredFilter[]) => void;
  clearAll: () => void;
  setPage: (p: number) => void;
  errorsOnly: boolean;
  setErrorsOnly: (v: boolean) => void;
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

function TracesExplorerChromeComponent({
  mode,
  modeOptions,
  onModeChange,
  isLiveTail,
  liveTail,
  errorTraces,
  onToggleLiveTail,
  filters,
  setFilters,
  clearAll,
  setPage,
  errorsOnly,
  setErrorsOnly,
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
        {isLiveTail && liveTail.errorMessage ? (
          <div className="flex items-center gap-2 rounded-[var(--card-radius)] border border-[rgba(240,68,56,0.35)] bg-[rgba(240,68,56,0.08)] px-4 py-2.5 text-[13px] text-[var(--color-error)]">
            <AlertCircle size={16} className="shrink-0" />
            <span className="font-medium">Live tail disconnected</span>
            <span className="opacity-90">{liveTail.errorMessage}</span>
          </div>
        ) : null}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Badge variant="info">{mode === "all" ? "All spans" : "Root spans"}</Badge>
            {isLiveTail ? (
              <Badge variant={liveTail.status === "live" ? "warning" : "default"}>
                {formatLiveTailStatus(liveTail.status, liveTail.lagMs)}
              </Badge>
            ) : null}
            {isLiveTail && liveTail.droppedCount > 0 ? (
              <Badge variant="error">{formatNumber(liveTail.droppedCount)} dropped</Badge>
            ) : null}
            <Badge variant={errorTraces > 0 ? "error" : "default"}>
              {formatNumber(errorTraces)} error traces
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={isLiveTail ? "primary" : "secondary"}
              size="sm"
              icon={<Radio size={14} />}
              onClick={onToggleLiveTail}
            >
              {isLiveTail ? "Stop live tail" : "Start live tail"}
            </Button>
          </div>
        </div>

        <div className="relative z-[70] grid items-start gap-3 lg:grid-cols-[minmax(320px,1fr)_220px]">
          <ObservabilityQueryBar
            fields={TRACE_FILTER_FIELDS}
            filters={filters}
            setFilters={(nextFilters: StructuredFilter[]) => {
              setFilters(nextFilters);
              setPage(1);
            }}
            onClearAll={clearAll}
            placeholder="service:api AND status:ERROR — or use Search filter"
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
          <Select
            value={mode}
            onChange={(value) => {
              onModeChange(String(value));
              setPage(1);
            }}
            options={modeOptions}
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
          fieldOptions={[
            ...TRACE_FILTER_FIELDS.map((f) => ({ name: f.key, description: f.label })),
          ]}
          metricFields={TRACE_METRIC_FIELDS}
        />
      </div>
    </PageSurface>
  );
}

export const TracesExplorerChrome = memo(TracesExplorerChromeComponent);
