import { Filter, FilterX } from "lucide-react";

import type { ExplorerFilter } from "../../types/filters";
import type { ContextMenuEntry } from "./RowContextMenu";

interface FilterPushArgs {
  readonly filters: readonly ExplorerFilter[];
  readonly setFilters: (next: readonly ExplorerFilter[]) => void;
}

/** Append "Filter by …" + "Exclude …" entries for `field=value` to `items`,
 *  using `Filter`/`FilterX` icons and a truncated value preview so the menu
 *  doesn't overflow on long strings. Mutates `items` in place — call sites
 *  build the list left-to-right and don't share it. */
export function pushIncludeExcludeFilter(
  items: ContextMenuEntry[],
  args: FilterPushArgs,
  field: string,
  value: string,
  label: string
): void {
  const preview = truncatePreview(value);
  items.push({
    kind: "action",
    label: `Filter by ${label}: ${preview}`,
    icon: <Filter size={12} />,
    onSelect: () => args.setFilters([...args.filters, { field, op: "eq", value }]),
  });
  items.push({
    kind: "action",
    label: `Exclude ${label}: ${preview}`,
    icon: <FilterX size={12} />,
    onSelect: () => args.setFilters([...args.filters, { field, op: "neq", value }]),
  });
}

/** Best-effort clipboard write. No-op when clipboard isn't available
 *  (SSR, http://, denied permission). */
export function copyToClipboard(value: string): void {
  if (!value || typeof navigator === "undefined" || !navigator.clipboard) return;
  void navigator.clipboard.writeText(value).catch(() => undefined);
}

/** Truncate with an ellipsis to keep "Filter by service: …" labels narrow. */
function truncatePreview(s: string, n = 32): string {
  return s.length > n ? `${s.slice(0, n - 1)}…` : s;
}
