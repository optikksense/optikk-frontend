import { Minus, Plus } from "lucide-react";
import { memo } from "react";

import type { ExplorerFacetBucket } from "../../types/queries";

interface Props {
  readonly field: string;
  readonly bucket: ExplorerFacetBucket;
  readonly onInclude: (field: string, value: string) => void;
  readonly onExclude: (field: string, value: string) => void;
  readonly active?: "include" | "exclude" | null;
}

/**
 * Single bucket row: value + count on the left, include/exclude icon buttons
 * surfaced on hover. Keeps layout stable by reserving icon slots.
 */
function FacetBucketComponent({ field, bucket, onInclude, onExclude, active }: Props) {
  const isIncluded = active === "include";
  const isExcluded = active === "exclude";
  return (
    <div
      className="group flex items-center justify-between gap-2 rounded px-2 py-1 hover:bg-[rgba(255,255,255,0.04)]"
      data-active={active ?? "none"}
    >
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <span
          className="truncate font-mono text-[12px] text-[var(--text-primary)]"
          title={bucket.value}
        >
          {bucket.value || "(empty)"}
        </span>
      </div>
      <span className="shrink-0 text-[11px] tabular-nums text-[var(--text-muted)]">
        {bucket.count.toLocaleString()}
      </span>
      <div className="flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
        <button
          type="button"
          aria-label={`Include ${field}=${bucket.value}`}
          aria-pressed={isIncluded}
          onClick={() => onInclude(field, bucket.value)}
          className={`rounded p-1 hover:bg-[var(--bg-primary)] ${
            isIncluded ? "text-[var(--accent)]" : "text-[var(--text-muted)]"
          }`}
        >
          <Plus size={12} />
        </button>
        <button
          type="button"
          aria-label={`Exclude ${field}=${bucket.value}`}
          aria-pressed={isExcluded}
          onClick={() => onExclude(field, bucket.value)}
          className={`rounded p-1 hover:bg-[var(--bg-primary)] ${
            isExcluded ? "text-[var(--danger)]" : "text-[var(--text-muted)]"
          }`}
        >
          <Minus size={12} />
        </button>
      </div>
    </div>
  );
}

export const FacetBucket = memo(FacetBucketComponent);
