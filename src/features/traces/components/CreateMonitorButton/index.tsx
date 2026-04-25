import { Bell } from "lucide-react";
import { memo } from "react";

import type { ExplorerFilter } from "@/features/explorer/types/filters";

interface Props {
  readonly filters: readonly ExplorerFilter[];
}

/**
 * Stub entry point for creating an alert from the current query (A12). The
 * full alerts module isn't in scope for this pass — this button pre-fills a
 * `/alerts/new` route that the alerts feature will own later.
 */
function CreateMonitorButtonComponent({ filters }: Props) {
  const href = buildHref(filters);
  return (
    <a
      href={href}
      className="flex items-center gap-1 rounded px-2 py-0.5 text-[11px] text-[var(--text-muted)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)]"
      title="Create alert from current query"
    >
      <Bell size={12} />
      Create monitor
    </a>
  );
}

function buildHref(filters: readonly ExplorerFilter[]): string {
  const params = new URLSearchParams({ from: "traces" });
  if (filters.length > 0) {
    params.set(
      "filters",
      filters.map((f) => `${f.field}:${f.op}:${encodeURIComponent(f.value)}`).join(";"),
    );
  }
  return `/alerts/new?${params.toString()}`;
}

export const CreateMonitorButton = memo(CreateMonitorButtonComponent);
