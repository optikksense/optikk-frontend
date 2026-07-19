export function KafkaDataStreamsSkeleton() {
  return (
    <div className="flex flex-col gap-4 animate-pulse">
      {/* Client selector skeleton */}
      <div className="rounded-lg border border-border bg-card p-3 flex items-center gap-3">
        <div className="h-4 w-12 rounded bg-muted/40" />
        <div className="h-8 w-48 rounded bg-muted/40" />
      </div>

      {/* Tabs skeleton */}
      <div className="flex border-b border-border gap-4 pb-2">
        <div className="h-6 w-20 rounded bg-muted/40" />
        <div className="h-6 w-20 rounded bg-muted/40" />
        <div className="h-6 w-20 rounded bg-muted/40" />
        <div className="h-6 w-28 rounded bg-muted/40" />
      </div>

      {/* KPI cards skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-lg border border-border bg-card p-4 space-y-2">
          <div className="h-3 w-28 rounded bg-muted/40" />
          <div className="h-7 w-20 rounded bg-muted/40" />
        </div>
        <div className="rounded-lg border border-border bg-card p-4 space-y-2">
          <div className="h-3 w-28 rounded bg-muted/40" />
          <div className="h-7 w-16 rounded bg-muted/40" />
        </div>
        <div className="rounded-lg border border-border bg-card p-4 space-y-2">
          <div className="h-3 w-28 rounded bg-muted/40" />
          <div className="h-7 w-16 rounded bg-muted/40" />
        </div>
      </div>

      {/* Topology map skeleton */}
      <div className="rounded-lg border border-border bg-card p-6 h-[320px] flex items-center justify-center">
        <div className="text-xs text-foreground-muted">Loading data streams...</div>
      </div>
    </div>
  );
}
