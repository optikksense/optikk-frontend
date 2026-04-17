import { Activity, AlertCircle, Radio } from "lucide-react";
import { memo } from "react";

import { Badge, Button, Switch } from "@/components/ui";
import {
  type AggregationSpec,
  AnalyticsToolbar,
  type ExplorerVizMode,
} from "@/features/explorer-core/components/AnalyticsToolbar";
import { LOGS_QUERY_FIELDS } from "@/features/explorer-core/constants/fields";
import { cn } from "@/lib/utils";
import type { StructuredFilter } from "@/shared/hooks/useURLFilters";
import { ObservabilityQueryBar, PageSurface } from "@shared/components/ui";
import { formatNumber } from "@shared/utils/formatters";

import { LOG_FILTER_FIELDS, upsertLogFacetFilter } from "../../../utils/logUtils";

import { LOG_METRIC_FIELDS } from "../constants";

type ExplorerMode = "list" | "analytics";

type Props = {
  liveTailEnabled: boolean;
  liveTailErrorMessage: string | null;
  liveTailStatus: "idle" | "connecting" | "live" | "closed" | "error";
  liveTailLagMs: number;
  liveTailDroppedCount: number;
  errorCount: number;
  onToggleLiveTail: () => void;
  filters: StructuredFilter[];
  setFilters: (next: StructuredFilter[]) => void;
  clearURLFilters: () => void;
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

function LogsHubExplorerChromeComponent({
  liveTailEnabled,
  liveTailErrorMessage,
  liveTailStatus,
  liveTailLagMs,
  liveTailDroppedCount,
  errorCount,
  onToggleLiveTail,
  filters,
  setFilters,
  clearURLFilters,
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
        {liveTailEnabled && liveTailErrorMessage ? (
          <div className="flex items-center gap-2 rounded-[var(--card-radius)] border border-[rgba(240,68,56,0.35)] bg-[rgba(240,68,56,0.08)] px-4 py-2.5 text-[13px] text-[var(--color-error)]">
            <AlertCircle size={16} className="shrink-0" />
            <span className="font-medium">Live tail disconnected</span>
            <span className="opacity-90">{liveTailErrorMessage}</span>
          </div>
        ) : null}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="info">All logs</Badge>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setFilters(upsertLogFacetFilter(filters, "optik.rum", "true"));
                setPage(1);
              }}
            >
              RUM stream
            </Button>
            {liveTailEnabled ? (
              <Badge variant={liveTailStatus === "live" ? "warning" : "default"}>
                {liveTailStatus === "live" ? `${Math.max(0, liveTailLagMs)}ms lag` : "connecting"}
              </Badge>
            ) : null}
            <Badge variant={errorCount > 0 ? "error" : "default"}>
              {formatNumber(errorCount)} error logs
            </Badge>
            {liveTailEnabled && liveTailDroppedCount > 0 ? (
              <Badge variant="error">{formatNumber(liveTailDroppedCount)} dropped</Badge>
            ) : null}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={liveTailEnabled ? "primary" : "secondary"}
              size="sm"
              icon={<Radio size={14} />}
              onClick={onToggleLiveTail}
            >
              {liveTailEnabled ? "Stop live tail" : "Start live tail"}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                clearURLFilters();
                setPage(1);
              }}
            >
              Reset
            </Button>
          </div>
        </div>

        <div className="relative z-[70] grid items-start gap-3 lg:grid-cols-[minmax(320px,1fr)_220px]">
          <ObservabilityQueryBar
            fields={LOG_FILTER_FIELDS}
            filters={filters}
            setFilters={(nextFilters: StructuredFilter[]) => {
              setFilters(nextFilters);
              setPage(1);
            }}
            onClearAll={() => {
              clearURLFilters();
              setPage(1);
            }}
            placeholder="service:web AND status:error — or use Search filter"
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
          <div className="hidden lg:block" aria-hidden />
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
          fieldOptions={[...LOGS_QUERY_FIELDS]}
          metricFields={LOG_METRIC_FIELDS}
        />
      </div>
    </PageSurface>
  );
}

export const LogsHubExplorerChrome = memo(LogsHubExplorerChromeComponent);
