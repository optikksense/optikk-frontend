import { ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";

export interface PaginationProps {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  pageSizeOptions?: number[];
  className?: string;
}

function Pagination({
  page,
  pageSize,
  total,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 50],
  className,
}: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const start = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);

  return (
    <div
      className={cn(
        "flex w-full min-w-0 flex-wrap items-center justify-between gap-x-4 gap-y-2 text-[13px] text-[var(--text-secondary)]",
        className
      )}
    >
      <span className="min-w-0 shrink">
        {start}–{end} of {total.toLocaleString()}
      </span>
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
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          className="inline-flex h-7 w-7 items-center justify-center rounded border border-[var(--border-color)] bg-[var(--bg-tertiary)] text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-hover)] disabled:pointer-events-none disabled:opacity-40"
        >
          <ChevronLeft size={14} />
        </button>
        <span className="min-w-[60px] text-center text-[12px]">
          {page} / {totalPages}
        </span>
        <button
          type="button"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          className="inline-flex h-7 w-7 items-center justify-center rounded border border-[var(--border-color)] bg-[var(--bg-tertiary)] text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-hover)] disabled:pointer-events-none disabled:opacity-40"
        >
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}

export { Pagination };
