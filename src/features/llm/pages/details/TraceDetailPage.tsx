import { useNavigate, useParams } from "@tanstack/react-router";
import { useCallback, useMemo, useRef, useState } from "react";

import { PageShell } from "@shared/components/ui";
import EmptyState from "@shared/components/ui/feedback/EmptyState";
import Loading from "@shared/components/ui/feedback/Loading";

import { TraceDetailViewer } from "@shared/traces/components/TraceDetailViewer";
import { adaptLlmTraceToShared } from "../../adapters/llmTraceAdapter";
import { type LlmSpanIO, getLlmSpanIO } from "../../api/llmApi";
import { useLlmRange, useLlmTraceDetail } from "../../hooks/useLlmQueries";

export default function TraceDetailPage() {
  const navigate = useNavigate();
  const { traceId } = useParams({ strict: false });
  const { startTime, endTime } = useLlmRange();
  const detailQ = useLlmTraceDetail(traceId ?? null);

  const detail = detailQ.data;

  const [spanIO, setSpanIO] = useState<Record<string, LlmSpanIO>>({});
  const pendingSpanIO = useRef<Set<string>>(new Set());

  const handleSpanIONeeded = useCallback(
    (spanId: string) => {
      if (!traceId || pendingSpanIO.current.has(spanId)) return;
      pendingSpanIO.current.add(spanId);
      getLlmSpanIO(traceId, spanId, startTime, endTime)
        .then((io) => setSpanIO((prev) => ({ ...prev, [spanId]: io })))
        .catch(() => pendingSpanIO.current.delete(spanId));
    },
    [traceId, startTime, endTime]
  );

  const sharedData = useMemo(() => {
    if (!detail) return null;
    return adaptLlmTraceToShared(detail, { spanIO, onSpanIONeeded: handleSpanIONeeded });
  }, [detail, spanIO, handleSpanIONeeded]);

  const handleBack = () => {
    navigate({ to: "/llm", search: (prev) => ({ ...prev, tab: "traces" }) });
  };

  if (detailQ.isPending) {
    return (
      <PageShell>
        <Loading />
      </PageShell>
    );
  }

  if (!detail || !sharedData) {
    return (
      <PageShell>
        <EmptyState title="Trace not found" />
      </PageShell>
    );
  }

  return (
    <TraceDetailViewer
      traceId={sharedData.traceId}
      spans={sharedData.spans}
      stats={sharedData.stats}
      traceTimeBounds={sharedData.traceTimeBounds}
      getSpanAttributes={sharedData.getSpanAttributes}
      onBack={handleBack}
    />
  );
}
