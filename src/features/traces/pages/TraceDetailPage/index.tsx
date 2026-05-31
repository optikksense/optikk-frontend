import { useState } from "react";

import { PageShell } from "@shared/components/ui";

import { useTraceOperationBaseline } from "../../hooks/useTraceOperationBaseline";
import { BottomBar } from "./components/BottomBar";
import { KPIStrip } from "./components/KPIStrip";
import { ServiceStrip } from "./components/ServiceStrip";
import {
  TraceDetailEmptySpans,
  TraceDetailError,
  TraceDetailLoading,
} from "./components/TraceDetailEmptyStates";
import { TraceDetailLayout } from "./components/TraceDetailLayout";
import { TraceHeader } from "./components/TraceHeader";
import { useTraceDetailPage } from "./hooks/useTraceDetailPage";

export default function TraceDetailPage() {
  const { data, stats, resolvedTraceId, traceTimeBounds, actions, layoutProps } =
    useTraceDetailPage();
  // Page-local "active service" highlight; clicking a pill drills into that service's first span.
  const [activeService, setActiveService] = useState<string | null>(null);
  // Root operation baseline (p50/p95) for the Duration KPI "N× slower than p50".
  const baseline = useTraceOperationBaseline(
    data.spans[0]?.service_name,
    data.spans[0]?.operation_name
  );

  if (data.isPending)
    return (
      <PageShell>
        <TraceDetailLoading />
      </PageShell>
    );
  if (data.isError)
    return (
      <PageShell>
        <TraceDetailError message={data.error?.message} />
      </PageShell>
    );
  if (data.spans.length === 0) {
    return (
      <PageShell>
        <TraceDetailEmptySpans hasLogs={data.traceLogs.length > 0} />
      </PageShell>
    );
  }

  const rootSpan = data.spans[0];
  const httpStatus =
    rootSpan?.http_status_code != null && rootSpan.http_status_code > 0
      ? rootSpan.http_status_code
      : undefined;

  const onServiceChange = (svc: string | null) => {
    setActiveService(svc);
    if (svc) {
      const first = data.spans.find((s) => s.service_name === svc);
      if (first?.span_id) actions.handleSpanClick({ span_id: first.span_id });
    }
  };

  return (
    <PageShell className="!gap-0 !pb-0 flex h-full min-h-0 min-h-[calc(100vh-var(--space-header-h,56px)-2rem)] flex-1 flex-col bg-background text-foreground-secondary [font-feature-settings:'tnum']">
      <TraceHeader
        traceId={resolvedTraceId}
        stats={stats}
        startMs={traceTimeBounds.startMs}
        rootService={rootSpan?.service_name}
        rootOperation={rootSpan?.operation_name}
        httpMethod={rootSpan?.http_method}
        httpStatus={httpStatus}
        onOpenInLogs={actions.openInLogs}
        onBack={actions.goBack}
      />
      <KPIStrip
        stats={stats}
        spans={data.spans}
        criticalPathSpanIds={layoutProps.criticalPathSpanIds}
        p50Ms={baseline.data?.p50_ms}
        p95Ms={baseline.data?.p95_ms}
      />
      <ServiceStrip
        spans={data.spans}
        activeService={activeService}
        onActiveServiceChange={onServiceChange}
      />
      <div className="flex min-h-0 flex-1 flex-col">
        <TraceDetailLayout
          {...layoutProps}
          traceId={resolvedTraceId}
          errorCount={stats.errors}
          traceStartMs={traceTimeBounds.startMs}
          traceEndMs={traceTimeBounds.endMs}
        />
      </div>
      <BottomBar
        traceId={resolvedTraceId}
        spanCount={stats.totalSpans}
        serviceCount={stats.services.size}
      />
    </PageShell>
  );
}
