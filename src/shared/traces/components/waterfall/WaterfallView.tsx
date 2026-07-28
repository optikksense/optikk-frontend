import type { TraceRecord } from "@shared/api/traces/schemas";
import ErrorBoundary from "@shared/components/ui/feedback/ErrorBoundary";
import { memo } from "react";
import type { SpanEvent } from "../../types/detail";
import { WaterfallTrace } from "./WaterfallTrace";

interface Props {
  readonly spans: readonly TraceRecord[];
  readonly selectedSpanId: string | null;
  readonly onSpanClick: (span: { spanId: string }) => void;
  readonly criticalPathSpanIds: ReadonlySet<string>;
  readonly errorPathSpanIds: ReadonlySet<string>;
  readonly search?: string;
  readonly spanEvents?: readonly SpanEvent[];
}

function WaterfallViewComponent(props: Props) {
  return (
    <div className="flex h-full min-h-0 flex-col overflow-auto">
      <ErrorBoundary variant="visualization">
        <WaterfallTrace
          spans={props.spans}
          selectedSpanId={props.selectedSpanId}
          onSpanClick={props.onSpanClick}
          criticalPathSpanIds={props.criticalPathSpanIds}
          errorPathSpanIds={props.errorPathSpanIds}
          search={props.search ?? ""}
          spanEvents={props.spanEvents}
        />
      </ErrorBoundary>
    </div>
  );
}

export const WaterfallView = memo(WaterfallViewComponent);
