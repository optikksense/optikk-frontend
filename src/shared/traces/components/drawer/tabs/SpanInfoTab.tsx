import type { TraceRecord } from "@shared/api/traces/schemas";
import { Skeleton } from "@shared/components/primitives/ui";
import type { RelatedTrace, SpanAttributes, SpanEvent } from "@shared/traces/types/detail";
import { computeSpanTiming } from "@shared/traces/utils/timing";
import { memo, useMemo } from "react";
import { SpanAncestorSection } from "./SpanAncestorSection";
import { SpanAttributesSection } from "./SpanAttributesSection";
import { SpanDatabaseSection } from "./SpanDatabaseSection";
import { SpanEventsSection } from "./SpanEventsSection";
import { SpanExceptionSection } from "./SpanExceptionSection";
import { SpanLlmSection } from "./SpanLlmSection";
import { SpanRelatedSection } from "./SpanRelatedSection";
import { SpanTimingSection } from "./SpanTimingSection";

interface Props {
  readonly spanAttributes: SpanAttributes | null;
  readonly loading: boolean;
  readonly spans: readonly TraceRecord[];
  readonly selectedSpanId: string | null;
  readonly spanEvents: readonly SpanEvent[];
  readonly relatedTraces: readonly RelatedTrace[];
  readonly relatedTracesRequested: boolean;
  readonly relatedTracesLoading: boolean;
  readonly onLoadRelatedTraces?: () => void;
  readonly traceStartMs?: number;
  readonly traceEndMs?: number;
  readonly onSpanClick?: (span: { spanId: string }) => void;
  readonly onAddFilter?: (key: string, value: string) => void;
}

function SpanInfoTabComponent({
  spanAttributes,
  loading,
  spans,
  selectedSpanId,
  spanEvents,
  relatedTraces,
  relatedTracesRequested,
  relatedTracesLoading,
  onLoadRelatedTraces,
  traceStartMs,
  traceEndMs,
  onSpanClick,
  onAddFilter,
}: Props) {
  const timing = useMemo(
    () => computeSpanTiming(spans, selectedSpanId, traceStartMs, traceEndMs),
    [spans, selectedSpanId, traceStartMs, traceEndMs]
  );

  if (loading && !spanAttributes) {
    return (
      <div className="flex flex-col gap-4 p-2">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <SpanTimingSection timing={timing} />

      <SpanAncestorSection ancestors={timing.ancestors} onSpanClick={onSpanClick} />

      {spanAttributes && <SpanLlmSection spanAttributes={spanAttributes} />}

      {spanAttributes && <SpanExceptionSection spanAttributes={spanAttributes} />}

      {spanAttributes && <SpanDatabaseSection spanAttributes={spanAttributes} />}

      <SpanEventsSection events={spanEvents} traceStartMs={traceStartMs} />

      {spanAttributes && (
        <SpanAttributesSection spanAttributes={spanAttributes} onAddFilter={onAddFilter} />
      )}

      <SpanRelatedSection
        relatedTraces={relatedTraces}
        requested={relatedTracesRequested}
        loading={relatedTracesLoading}
        onLoad={onLoadRelatedTraces}
      />
    </div>
  );
}

export const SpanInfoTab = memo(SpanInfoTabComponent);
