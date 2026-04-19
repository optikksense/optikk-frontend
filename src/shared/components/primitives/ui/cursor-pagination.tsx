import { ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";

export interface CursorPaginationProps {
  hasMore: boolean;
  hasPrev: boolean;
  onNext: () => void;
  onPrev: () => void;
  pageSize: number;
  onPageSizeChange?: (size: number) => void;
  pageSizeOptions?: number[];
  className?: string;
  /** Optional left-aligned label, e.g. "42 rows in view". */
  label?: string;
}

function CursorPagination({
  hasMore,
  hasPrev,
  onNext,
  onPrev,
  pageSize,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 50],
  className,
  label,
}: CursorPaginationProps) {
  return (
    <div
      className={cn(
        "flex w-full min-w-0 flex-wrap items-center justify-between gap-x-4 gap-y-2 text-[13px] text-[var(--text-secondary)]",
        className
      )}
    >
      <span className="min-w-0 shrink">{label ?? ""}</span>
      <div className="flex shrink-0 items-center gap-2">
        {onPageSizeChange ? (
          <select
            value={pageSize}
            onChange={(event) => onPageSizeChange(Number(event.target.value))}
            className="h-7 rounded border border-[var(--border-color)] bg-[var(--bg-tertiary)] px-1.5 text-[12px] text-[var(--text-primary)] focus:outline-none"
          >
            {pageSizeOptions.map((size) => (
              <option key={size} value={size}>
                {size} / page
              </option>
            ))}
          </select>
        ) : null}
        <button
          type="button"
          disabled={!hasPrev}
          onClick={onPrev}
          className="inline-flex h-7 w-7 items-center justify-center rounded border border-[var(--border-color)] bg-[var(--bg-tertiary)] text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-hover)] disabled:pointer-events-none disabled:opacity-40"
        >
          <ChevronLeft size={14} />
        </button>
        <button
          type="button"
          disabled={!hasMore}
          onClick={onNext}
          className="inline-flex h-7 w-7 items-center justify-center rounded border border-[var(--border-color)] bg-[var(--bg-tertiary)] text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-hover)] disabled:pointer-events-none disabled:opacity-40"
        >
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}

export { CursorPagination };
