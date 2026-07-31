import { MetricSegmentedControl } from "@shared/metrics/components/MetricSegmentedControl";
import { TIME_STEP_OPTIONS } from "@shared/metrics/constants";
import { useMetricsExplorerQuery } from "@shared/metrics/hooks/useMetricsExplorerQuery";
import type { TimeStep } from "@shared/metrics/types";

import type { WidgetEditorState } from "@shared/dashboards/builder/metricsWidget";
import { WidgetVizRenderer } from "@shared/dashboards/components/WidgetVizRenderer";

const PREVIEW_HEIGHT = 260;

interface WidgetPreviewPanelProps {
  readonly state: WidgetEditorState;
  readonly onTitleChange: (title: string) => void;
  readonly onStepChange: (step: TimeStep) => void;
}

/** Right column: title, step, query echo, and the live WYSIWYG preview. */
export function WidgetPreviewPanel({
  state,
  onTitleChange,
  onStepChange,
}: WidgetPreviewPanelProps) {
  const query = useMetricsExplorerQuery(state.queries, state.step);

  return (
    <div className="flex h-full flex-col gap-3">
      <input
        value={state.title}
        onChange={(e) => onTitleChange(e.target.value)}
        placeholder="Widget title"
        className="w-full rounded border border-border bg-background px-3 py-2 font-semibold text-foreground text-sm outline-none focus:border-primary"
      />

      <div className="flex items-center justify-between gap-2">
        <span className="truncate font-mono text-[11px] text-foreground-muted">
          {queryEcho(state)}
        </span>
        <MetricSegmentedControl
          options={TIME_STEP_OPTIONS}
          value={state.step}
          onChange={onStepChange}
          size="sm"
        />
      </div>

      <div className="min-h-[280px] flex-1 rounded-lg border border-border bg-card p-3">
        <WidgetVizRenderer
          viz={state.viz}
          queries={state.queries}
          formulas={state.formulas}
          results={query.data?.results}
          display={state.display}
          isLoading={query.isLoading}
          isError={query.isError}
          height={PREVIEW_HEIGHT}
        />
      </div>
    </div>
  );
}

/** Compact summary of the first active query for the preview header. */
function queryEcho(state: WidgetEditorState): string {
  const active = state.queries.find((q) => q.metricName);
  if (!active) return "Select a metric to preview";
  const groupBy = active.groupBy.length > 0 ? ` by ${active.groupBy.join(", ")}` : "";
  return `${active.aggregation}(${active.metricName})${groupBy}`;
}
