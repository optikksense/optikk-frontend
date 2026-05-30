import { cn } from "@/lib/utils";

import type { CatalogStatus } from "./buildCatalogRows";

const COLOR: Record<CatalogStatus, string> = {
  healthy: "bg-[var(--color-success,#10b981)]",
  warn: "bg-[var(--color-warning,#f59e0b)]",
  error: "bg-[var(--color-error,#ef4444)]",
  unknown: "bg-foreground-muted",
};

const RING: Record<CatalogStatus, string> = {
  healthy: "ring-[var(--color-success,#10b981)]/30",
  warn: "ring-[var(--color-warning,#f59e0b)]/30",
  error: "ring-[var(--color-error,#ef4444)]/30",
  unknown: "ring-transparent",
};

export function StatusDot({ status }: { status: CatalogStatus }) {
  return (
    <span
      title={status}
      className={cn("inline-block h-2 w-2 rounded-full ring-2", COLOR[status], RING[status])}
    />
  );
}
