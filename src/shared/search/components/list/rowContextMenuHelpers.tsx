import { Filter, FilterX } from "lucide-react";

import type { ExplorerFilter } from "../../types/filters";
import type { ContextMenuEntry } from "./RowContextMenu";

interface FilterPushArgs {
  readonly filters: readonly ExplorerFilter[];
  readonly setFilters: (next: readonly ExplorerFilter[]) => void;
}

                                                                            
                                                                            
                                                                           
                                                       
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

export function copyToClipboard(value: string): void {
  if (!value || typeof navigator === "undefined" || !navigator.clipboard) return;
  void navigator.clipboard.writeText(value).catch(() => undefined);
}

function truncatePreview(s: string, n = 32): string {
  return s.length > n ? `${s.slice(0, n - 1)}…` : s;
}
