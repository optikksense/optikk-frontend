import { AlertCircle, AlertTriangle } from "lucide-react";

export function TraceDetailLoading() {
  return (
    <div className="grid place-items-center gap-2 px-5 py-24 text-center">
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      <div className="font-medium text-[13px] text-foreground-muted">Loading trace details…</div>
    </div>
  );
}

export function TraceDetailError({ message }: { readonly message?: string }) {
  return (
    <div className="grid place-items-center gap-2 px-5 py-20 text-center">
      <div className="inline-flex h-10 w-10 place-items-center rounded-full bg-error-subtle text-error">
        <AlertCircle size={20} />
      </div>
      <div className="font-semibold text-[16px] text-foreground">Failed to load trace</div>
      <div className="max-w-[440px] text-[12.5px] text-foreground-muted">
        {message || "An unexpected error occurred while fetching trace details."}
      </div>
    </div>
  );
}

export function TraceDetailEmptySpans({ hasLogs }: { readonly hasLogs: boolean }) {
  return (
    <div className="grid place-items-center gap-2 rounded-lg border border-border bg-secondary p-8 text-center">
      <div className="inline-flex h-10 w-10 place-items-center rounded-full bg-warning-subtle text-warning">
        <AlertTriangle size={20} />
      </div>
      <div className="font-semibold text-[15px] text-foreground">No spans recorded</div>
      <div className="max-w-[480px] text-[12.5px] text-foreground-muted">
        {hasLogs
          ? "This trace ID has associated logs, but no span spans were registered."
          : "No span data found for this trace ID."}
      </div>
    </div>
  );
}
