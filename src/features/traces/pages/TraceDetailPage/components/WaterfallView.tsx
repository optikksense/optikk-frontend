import { memo } from "react";

import type { TraceRecord } from "@shared/api/traces/schemas";

import type { SpanEvent } from "../../../types";

import { VisualizationErrorBoundary } from "@shared/components/ui/error-boundary/VisualizationErrorBoundary";
import { WaterfallTrace } from "./WaterfallTrace";

interface Props {
  readonly spans: readonly TraceRecord[];
  readonly selectedSpanId: string | null;
  readonly onSpanClick: (span: { spanId: string }) => void;
  readonly criticalPathSpanIds: ReadonlySet<string>;
  readonly errorPathSpanIds: ReadonlySet<string>;
  readonly spanEvents?: readonly SpanEvent[];
}

import { Route } from "@/routes/_app/traces/$traceId";

function WaterfallViewComponent(props: Props) {
  const searchParams = Route.useSearch();
  const search = searchParams.q ?? "";

  return (
    <div className="flex h-full min-h-0 flex-col overflow-auto">
      <VisualizationErrorBoundary>
        <WaterfallTrace
          spans={props.spans}
          selectedSpanId={props.selectedSpanId}
          onSpanClick={props.onSpanClick}
          criticalPathSpanIds={props.criticalPathSpanIds}
          errorPathSpanIds={props.errorPathSpanIds}
          search={search}
          spanEvents={props.spanEvents}
        />
      </VisualizationErrorBoundary>
    </div>
  );
}

export const WaterfallView = memo(WaterfallViewComponent);
