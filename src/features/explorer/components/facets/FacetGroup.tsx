import { ChevronDown, ChevronRight } from "lucide-react";
import { memo, useMemo, useState } from "react";

import type { ExplorerFacetBucket } from "../../types/queries";
import { FacetBucket } from "./FacetBucket";
import { FacetSearchBox } from "./FacetSearchBox";
import { FacetShowAllModal } from "./FacetShowAllModal";

export interface FacetGroupModel {
  readonly field: string;
  readonly label: string;
  readonly buckets: readonly ExplorerFacetBucket[];
}

interface Props {
  readonly group: FacetGroupModel;
  readonly defaultOpen?: boolean;
  readonly topN?: number;
  readonly onInclude: (field: string, value: string) => void;
  readonly onExclude: (field: string, value: string) => void;
  readonly isActive?: (field: string, value: string) => "include" | "exclude" | null;
}

function applyLocalFilter(
  buckets: readonly ExplorerFacetBucket[],
  query: string
): readonly ExplorerFacetBucket[] {
  if (!query) return buckets;
  const needle = query.toLowerCase();
  return buckets.filter((bucket) => bucket.value.toLowerCase().includes(needle));
}

function FacetGroupComponent({
  group,
  defaultOpen = true,
  topN = 8,
  onInclude,
  onExclude,
  isActive,
}: Props) {
  const [open, setOpen] = useState(defaultOpen);
  const [query, setQuery] = useState("");
  const [showAll, setShowAll] = useState(false);
  const filtered = useMemo(() => applyLocalFilter(group.buckets, query), [group.buckets, query]);
  const visible = filtered.slice(0, topN);
  const hasMore = filtered.length > topN;
  const Icon = open ? ChevronDown : ChevronRight;
  return (
    <section className="flex flex-col gap-1 border-b border-[var(--border-color)] px-2 py-2">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex w-full items-center gap-1 text-[11px] font-semibold uppercase tracking-wider text-[var(--text-secondary)]"
        aria-expanded={open}
      >
        <Icon size={12} />
        {group.label}
      </button>
      {open ? (
        <div className="flex flex-col gap-1 pt-1">
          {group.buckets.length > topN ? <FacetSearchBox value={query} onChange={setQuery} /> : null}
          {visible.map((bucket) => (
            <FacetBucket
              key={bucket.value}
              field={group.field}
              bucket={bucket}
              onInclude={onInclude}
              onExclude={onExclude}
              active={isActive?.(group.field, bucket.value) ?? null}
            />
          ))}
          {hasMore ? (
            <button
              type="button"
              onClick={() => setShowAll(true)}
              className="self-start px-2 py-1 text-[11px] text-[var(--accent)] hover:underline"
            >
              Show all {filtered.length}
            </button>
          ) : null}
          <FacetShowAllModal
            open={showAll}
            onOpenChange={setShowAll}
            field={group.field}
            label={group.label}
            buckets={group.buckets}
            onInclude={onInclude}
            onExclude={onExclude}
            isActive={isActive}
          />
        </div>
      ) : null}
    </section>
  );
}

export const FacetGroup = memo(FacetGroupComponent);
