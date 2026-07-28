import { Pencil, Trash2 } from "lucide-react";

import { Surface } from "@shared/components/primitives/ui";
import { ConfigurableChartCard } from "@shared/components/ui/dashboard";
import { useMetricsExplorerQuery } from "@shared/metrics/hooks/useMetricsExplorerQuery";
import { isMetricsQuerySpec } from "@shared/types/dashboardConfig";
import type { DashboardPanelSpec } from "@shared/types/dashboardConfig";

import type { Dashboard } from "../../api/dashboardsApi";
import { panelTypeToViz } from "../../builder/metricsWidget";
import { WidgetVizRenderer } from "../../components/WidgetVizRenderer";
import { useWidgetData } from "../../hooks/useWidgetData";

const ROW_PX = 88;
const GAP_PX = 12;

function clampSpan(value: number): number {
  if (!Number.isFinite(value)) return 6;
  return Math.min(12, Math.max(1, Math.round(value)));
}

interface WidgetCardProps {
  readonly widget: Dashboard;
  readonly editing: boolean;
  readonly onEdit: () => void;
  readonly onRemove: () => void;
}

export function WidgetCard({ widget, editing, onEdit, onRemove }: WidgetCardProps) {
  const span = clampSpan(widget.layout.w);
  const rows = Math.max(1, Math.round(widget.layout.h || 4));
  const height = rows * ROW_PX + (rows - 1) * GAP_PX;
  const isMetrics = isMetricsQuerySpec(widget.spec.query);

  return (
    <div className="group relative min-w-0" style={{ gridColumn: `span ${span}`, height }}>
      {editing && (
        <div className="absolute top-1.5 right-1.5 z-10 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          <button
            type="button"
            onClick={onEdit}
            title="Edit widget"
            className="flex h-6 w-6 items-center justify-center rounded bg-card/90 text-foreground-muted hover:text-foreground"
          >
            <Pencil size={12} />
          </button>
          <button
            type="button"
            onClick={onRemove}
            title="Remove widget"
            className="flex h-6 w-6 items-center justify-center rounded bg-card/90 text-foreground-muted hover:bg-error-subtle hover:text-error"
          >
            <Trash2 size={12} />
          </button>
        </div>
      )}
      {isMetrics ? (
        <MetricsWidgetBody spec={widget.spec} bodyHeight={height} />
      ) : (
        <EndpointWidgetBody spec={widget.spec} />
      )}
    </div>
  );
}

                                                                        
function MetricsWidgetBody({
  spec,
  bodyHeight,
}: {
  readonly spec: DashboardPanelSpec;
  readonly bodyHeight: number;
}) {
                                                                       
  const query = isMetricsQuerySpec(spec.query) ? spec.query : null;
  const result = useMetricsExplorerQuery(query?.queries ?? [], query?.step ?? "5m");
  if (!query) return null;

  return (
    <Surface
      elevation={1}
      padding="xs"
      className="chart-card flex h-full min-h-0 flex-col overflow-hidden"
    >
      <div className="chart-card__title">
        <span className="chart-card__title-text">{spec.title ?? spec.id}</span>
      </div>
      <div className="min-h-0 flex-1 overflow-hidden">
        <WidgetVizRenderer
          viz={panelTypeToViz(spec.panelType)}
          queries={query.queries}
          formulas={query.formulas ?? []}
          results={result.data?.results}
          display={{ legend: spec.legend ?? true, smooth: spec.smooth ?? true }}
          isLoading={result.isLoading}
          isError={result.isError}
          height={Math.max(120, bodyHeight - 44)}
        />
      </div>
    </Surface>
  );
}

                                                                               
function EndpointWidgetBody({ spec }: { readonly spec: DashboardPanelSpec }) {
  const { ref, dataSources, isLoading, error } = useWidgetData(spec);

  return (
    <div ref={ref} className="h-full">
      <ConfigurableChartCard
        componentConfig={spec}
        dataSources={dataSources}
        isLoading={isLoading}
        error={error}
        extraContext={{}}
      />
    </div>
  );
}
