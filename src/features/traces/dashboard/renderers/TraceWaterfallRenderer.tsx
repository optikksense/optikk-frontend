import { useMemo } from "react";

import WaterfallChart, {
  type WaterfallSpan,
} from "@shared/components/ui/charts/specialized/WaterfallChart";
import type { DashboardPanelRendererProps } from "@shared/components/ui/dashboard/dashboardPanelRegistry";
import { useDashboardData } from "@shared/components/ui/dashboard/hooks/useDashboardData";

/**
 *
 */
export function TraceWaterfallRenderer({
  chartConfig,
  dataSources,
  fillHeight: _fillHeight,
}: DashboardPanelRendererProps) {
  const { data: spans } = useDashboardData(chartConfig, dataSources);
  const waterfallSpans = useMemo<WaterfallSpan[]>(
    () =>
      spans
        .map((span) => ({
          span_id: String(span.span_id ?? ""),
          parent_span_id: span.parent_span_id == null ? null : String(span.parent_span_id),
          start_time: String(span.start_time ?? ""),
          end_time: String(span.end_time ?? ""),
          service_name: span.service_name == null ? undefined : String(span.service_name),
          operation_name: span.operation_name == null ? undefined : String(span.operation_name),
          status: span.status == null ? undefined : String(span.status),
          span_kind: span.span_kind == null ? undefined : String(span.span_kind),
          kind_string: span.kind_string == null ? undefined : String(span.kind_string),
          duration_ms: Number(span.duration_ms ?? 0),
        }))
        .filter((span) => span.span_id && span.start_time && span.end_time),
    [spans]
  );

  if (waterfallSpans.length === 0) {
    return (
      <div className="text-muted" style={{ textAlign: "center", padding: 32 }}>
        No data
      </div>
    );
  }
  return (
    <div className="h-full min-h-0 overflow-hidden">
      <WaterfallChart spans={waterfallSpans} />
    </div>
  );
}
