import { memo } from "react";

import { PageSurface } from "@shared/components/ui";

import ServicePills from "../../../components/ServicePills";
import SpanKindBreakdown from "../../../components/SpanKindBreakdown";
import type { SpanKindDuration } from "../../../types";

interface Props {
  spans: Array<{ service_name?: string }>;
  spanKindBreakdown: SpanKindDuration[];
}

function TraceDetailServiceBarComponent({ spans, spanKindBreakdown }: Props) {
  return (
    <PageSurface className="flex flex-wrap items-start gap-6">
      <div className="min-w-[240px] flex-1">
        <div className="mb-2 font-semibold text-[11px] text-[var(--text-muted)] uppercase tracking-[0.08em]">
          Services
        </div>
        <ServicePills spans={spans} activeService={null} onSelect={() => {}} />
      </div>
      {spanKindBreakdown.length > 0 ? (
        <div className="min-w-[220px] flex-1">
          <div className="mb-2 font-semibold text-[11px] text-[var(--text-muted)] uppercase tracking-[0.08em]">
            Span Kind Breakdown
          </div>
          <SpanKindBreakdown data={spanKindBreakdown} />
        </div>
      ) : null}
    </PageSurface>
  );
}

export const TraceDetailServiceBar = memo(TraceDetailServiceBarComponent);
