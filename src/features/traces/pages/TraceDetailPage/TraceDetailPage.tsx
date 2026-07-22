import type { TraceLog } from "@shared/api/traces/schemas";
import { useState } from "react";

import { PageShell } from "@shared/components/ui";
import { formatTimestamp } from "@shared/utils/formatters";

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

function AssociatedTraceLogsSection({
  logs,
  onOpenInLogs,
}: {
  logs: readonly TraceLog[];
  onOpenInLogs: () => void;
}) {
  return (
    <div className="flex flex-col rounded-lg border border-[var(--line)] bg-[var(--bg-1)] p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="font-semibold text-foreground text-sm">Associated Logs</h2>
          <span className="rounded-full bg-[var(--bg-2)] px-2 py-0.5 font-mono text-foreground-secondary text-xs">
            {logs.length}
          </span>
        </div>
        <button
          type="button"
          onClick={onOpenInLogs}
          className="flex cursor-pointer items-center gap-1 border-0 bg-transparent font-mono text-[var(--accent-2)] text-xs hover:underline"
        >
          Open all in Logs Explorer →
        </button>
      </div>
      <div className="overflow-x-auto rounded-md border border-[var(--line)]">
        <table className="w-full text-left font-mono text-xs">
          <thead className="border-[var(--line)] border-b bg-[var(--bg-2)] text-foreground-caption">
            <tr>
              <th className="px-3 py-2 font-medium">Timestamp</th>
              <th className="px-3 py-2 font-medium">Service</th>
              <th className="px-3 py-2 font-medium">Level</th>
              <th className="px-3 py-2 font-medium">Message</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--line)]">
            {logs.map((log, i) => (
              <tr key={log.id || `${log.timestamp}-${i}`} className="hover:bg-[var(--bg-row-h)]">
                <td className="whitespace-nowrap px-3 py-2 text-foreground-secondary">
                  {log.timestamp ? formatTimestamp(log.timestamp) : "—"}
                </td>
                <td className="whitespace-nowrap px-3 py-2 text-foreground">
                  {log.serviceName || "—"}
                </td>
                <td className="whitespace-nowrap px-3 py-2">
                  <span className="inline-block rounded bg-[var(--bg-2)] px-1.5 py-0.5 font-semibold text-[10px] text-foreground uppercase tracking-wide">
                    {log.severityText || "INFO"}
                  </span>
                </td>
                <td className="px-3 py-2 text-foreground break-all">{log.body || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function TraceDetailPage() {
  const { data, stats, resolvedTraceId, traceTimeBounds, actions, layoutProps } =
    useTraceDetailPage();
  // Page-local "active service" highlight; clicking a pill drills into that service's first span.
  const [activeService, setActiveService] = useState<string | null>(null);

  const baseline = useTraceOperationBaseline(
    data.spans[0]?.serviceName,
    data.spans[0]?.operationName
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
    if (data.traceLogs.length === 0) {
      return (
        <PageShell>
          <TraceDetailEmptySpans hasLogs={false} />
        </PageShell>
      );
    }
    return (
      <PageShell className="!gap-0 !pb-0 flex h-full min-h-0 min-h-[calc(100vh-var(--space-header-h,56px)-2rem)] flex-1 flex-col bg-background text-foreground-secondary [font-feature-settings:'tnum']">
        <TraceHeader
          traceId={resolvedTraceId}
          stats={stats}
          startMs={traceTimeBounds.startMs}
          onOpenInLogs={actions.openInLogs}
          onBack={actions.goBack}
        />
        <div className="flex flex-col gap-4 p-5">
          <TraceDetailEmptySpans hasLogs={true} />
          <AssociatedTraceLogsSection logs={data.traceLogs} onOpenInLogs={actions.openInLogs} />
        </div>
      </PageShell>
    );
  }

  const rootSpan = data.spans[0];
  const httpStatus =
    rootSpan?.httpStatusCode != null && rootSpan.httpStatusCode > 0
      ? rootSpan.httpStatusCode
      : undefined;

  const onServiceChange = (svc: string | null) => {
    setActiveService(svc);
    if (svc) {
      const first = data.spans.find((s) => s.serviceName === svc);
      if (first?.spanId) actions.handleSpanClick({ spanId: first.spanId });
    }
  };

  return (
    <PageShell className="!gap-0 !pb-0 flex h-full min-h-0 min-h-[calc(100vh-var(--space-header-h,56px)-2rem)] flex-1 flex-col bg-background text-foreground-secondary [font-feature-settings:'tnum']">
      <TraceHeader
        traceId={resolvedTraceId}
        stats={stats}
        startMs={traceTimeBounds.startMs}
        rootService={rootSpan?.serviceName}
        rootOperation={rootSpan?.operationName}
        httpMethod={rootSpan?.httpMethod}
        httpStatus={httpStatus}
        onOpenInLogs={actions.openInLogs}
        onBack={actions.goBack}
      />
      <KPIStrip
        stats={stats}
        spans={data.spans}
        criticalPathSpanIds={layoutProps.criticalPathSpanIds}
        p50Ms={baseline.data?.p50Ms}
        p95Ms={baseline.data?.p95Ms}
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
