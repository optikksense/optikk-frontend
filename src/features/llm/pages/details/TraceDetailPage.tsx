import { useNavigate, useParams } from "@tanstack/react-router";
import { useMemo } from "react";

import { PageShell } from "@shared/components/ui";
import EmptyState from "@shared/components/ui/feedback/EmptyState";
import Loading from "@shared/components/ui/feedback/Loading";

import { adaptLlmTraceToShared } from "@shared/traces/adapters/llmTraceAdapter";
import { TraceDetailViewer } from "@shared/traces/components/TraceDetailViewer";
import { useLlmTraceDetail } from "../../hooks/useLlmQueries";

export default function TraceDetailPage() {
  const navigate = useNavigate();
  const { traceId } = useParams({ strict: false });
  const detailQ = useLlmTraceDetail(traceId ?? null);

  const detail = detailQ.data;

  const sharedData = useMemo(() => {
    if (!detail) return null;
    return adaptLlmTraceToShared(detail);
  }, [detail]);

  const handleBack = () => {
    navigate({ to: "/llm" as string & {} });
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
