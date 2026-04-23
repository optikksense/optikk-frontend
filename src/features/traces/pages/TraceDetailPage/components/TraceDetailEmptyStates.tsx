import { memo } from "react";

import { PageSurface } from "@shared/components/ui";

export const TraceDetailLoading = memo(function TraceDetailLoading() {
  return (
    <PageSurface className="flex min-h-[320px] items-center justify-center">
      <div className="ok-spinner" />
    </PageSurface>
  );
});

export const TraceDetailError = memo(function TraceDetailError({
  message,
}: {
  message?: string;
}) {
  return (
    <PageSurface className="space-y-3 py-10 text-center">
      <p className="font-medium text-[var(--color-error)] text-base">
        Failed to load trace details
      </p>
      <p className="mx-auto max-w-xl text-[var(--text-secondary)] text-sm">
        {message ||
          "The trace lookup request failed before we could load spans or associated logs."}
      </p>
    </PageSurface>
  );
});

export const TraceDetailEmptySpans = memo(function TraceDetailEmptySpans({
  hasLogs,
}: {
  hasLogs: boolean;
}) {
  return (
    <PageSurface className="space-y-3 py-10 text-center">
      <p className="font-medium text-[var(--text-primary)] text-base">
        No spans found for this trace
      </p>
      <p className="mx-auto max-w-xl text-[var(--text-secondary)] text-sm">
        {hasLogs
          ? "Logs reference this trace ID, but Optik has no matching rows in span storage yet. The timeline and flamegraph only work when your services export OTLP traces to Optik (not just logs). Confirm trace export is enabled, spans are reaching the collector, and retention has not dropped them before logs. Associated logs are listed below."
          : "There are no span rows for this trace ID. If you opened this from logs, trace export may be off, spans may have aged out before logs, or the ID may not match what your spans pipeline writes."}
      </p>
    </PageSurface>
  );
});
