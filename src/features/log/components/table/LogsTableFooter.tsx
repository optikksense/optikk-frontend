import { ChevronLeft, ChevronRight } from "lucide-react";
import { memo } from "react";

interface Props {
  readonly pageIndex: number;
  readonly pageCount: number;
  readonly pageRows: number;
  readonly loadedRows: number;
  readonly hasMore: boolean;
  readonly loadingNext: boolean;
  readonly onPrevious: () => void;
  readonly onNext: () => void;
}

function LogsTableFooterComponent({
  pageIndex,
  pageCount,
  pageRows,
  loadedRows,
  hasMore,
  loadingNext,
  onPrevious,
  onNext,
}: Props) {
  const displayPageCount = hasMore ? `${pageCount}+` : String(Math.max(pageCount, 1));

  return (
    <div className="flex items-center justify-between border-t border-[var(--border-color)] bg-[var(--bg-secondary)] px-4 py-2">
      <span className="font-mono text-[11px] text-[var(--text-muted)]">
        Page {pageIndex + 1} of {displayPageCount} · {pageRows.toLocaleString()} rows ·{" "}
        {loadedRows.toLocaleString()} loaded
      </span>
      <div className="flex items-center gap-1">
        <button
          type="button"
          aria-label="Previous page"
          onClick={onPrevious}
          disabled={pageIndex === 0}
          className="inline-flex h-7 w-7 items-center justify-center rounded border border-[var(--border-color)] bg-[var(--bg-tertiary)] text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] disabled:pointer-events-none disabled:opacity-40"
        >
          <ChevronLeft size={14} />
        </button>
        <button
          type="button"
          aria-label="Next page"
          onClick={onNext}
          disabled={loadingNext || (!hasMore && pageIndex + 1 >= pageCount)}
          className="inline-flex h-7 items-center gap-1 rounded border border-[var(--border-color)] bg-[var(--bg-tertiary)] px-2.5 font-medium text-[11px] text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] disabled:pointer-events-none disabled:opacity-40"
        >
          {loadingNext ? "Loading…" : "Next"}
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}

export const LogsTableFooter = memo(LogsTableFooterComponent);
