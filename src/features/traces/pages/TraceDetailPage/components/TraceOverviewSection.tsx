import { memo } from "react";

import { useTraceErrors, useTraceServiceMap } from "../../../hooks/useTraceOverview";
import { TraceBreakdownPanel } from "./TraceBreakdownPanel";
import { TraceErrorsPanel } from "./TraceErrorsPanel";
import { TraceServiceMapPanel } from "./TraceServiceMapPanel";

interface Span {
  readonly span_id: string;
  readonly parent_span_id?: string | null;
  readonly service_name?: string;
  readonly duration_ms?: number;
}

interface Props {
  readonly traceId: string;
  readonly spans: readonly Span[];
  readonly onSpanClick?: (spanId: string) => void;
}

/** Trace-level overview: breakdown pie + service map + errors groups (Phase 4). */
function TraceOverviewSectionComponent({ traceId, spans, onSpanClick }: Props) {
  const serviceMap = useTraceServiceMap(traceId, traceId !== "");
  const errors = useTraceErrors(traceId, traceId !== "");
  return (
    <div className="grid gap-3 p-3">
      <TraceBreakdownPanel spans={spans} />
      <TraceServiceMapPanel data={serviceMap.data} isPending={serviceMap.isPending} />
      <TraceErrorsPanel
        groups={errors.data}
        isPending={errors.isPending}
        onSpanClick={onSpanClick}
      />
    </div>
  );
}

export const TraceOverviewSection = memo(TraceOverviewSectionComponent);
