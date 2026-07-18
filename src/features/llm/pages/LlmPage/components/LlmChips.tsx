import { KIND_META, OPERATION_META, vendorColor, vendorLabel } from "../../../utils/llmFormat";

export function KindChip({ kind }: { readonly kind: string }) {
  const meta = KIND_META[kind];
  if (!meta) return <span className="text-foreground-muted text-xs">—</span>;
  return (
    <span
      className="inline-flex items-center rounded border border-border bg-surface px-1.5 py-0.5 font-mono font-semibold text-[10px] uppercase tracking-wide"
      style={{ color: meta.color }}
    >
      {meta.label}
    </span>
  );
}

export function VendorChip({ vendor }: { readonly vendor: string }) {
  if (!vendor) return <span className="text-foreground-muted text-xs">—</span>;
  return (
    <span className="inline-flex items-center gap-1.5 rounded border border-border bg-surface px-1.5 py-0.5 font-mono text-[11px] text-foreground-secondary">
      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: vendorColor(vendor) }} />
      {vendorLabel(vendor)}
    </span>
  );
}

export function OperationChip({ operation }: { readonly operation: string }) {
  const meta = OPERATION_META[operation] ?? OPERATION_META.other;
  return (
    <span
      className="inline-flex items-center rounded px-1.5 py-0.5 font-mono font-semibold text-[10px] uppercase tracking-wide"
      style={{
        color: meta.color,
        backgroundColor: `color-mix(in srgb, ${meta.color} 14%, transparent)`,
      }}
    >
      {meta.label}
    </span>
  );
}

export function StatusBadge({ hasError }: { readonly hasError: boolean }) {
  return hasError ? (
    <span className="inline-flex items-center gap-1 rounded-full bg-[var(--err-soft)] px-2 py-0.5 font-medium text-[11px] text-[var(--err-fg)]">
      <span className="h-1.5 w-1.5 rounded-full bg-[var(--err)]" />
      error
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 rounded-full bg-[var(--ok-soft)] px-2 py-0.5 font-medium text-[11px] text-[var(--ok-fg)]">
      <span className="h-1.5 w-1.5 rounded-full bg-[var(--ok)]" />
      ok
    </span>
  );
}
