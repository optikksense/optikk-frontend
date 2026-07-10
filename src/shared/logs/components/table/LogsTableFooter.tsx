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
  const nextDisabled = loadingNext || (!hasMore && pageIndex + 1 >= pageCount);

  return (
    <div className="flex shrink-0 items-center justify-between border-[var(--line)] border-t px-[18px] py-[10px]">
      <span className="text-[11.5px] text-[var(--fg-3)] [font-family:'Geist_Mono',monospace]">
        Page {pageIndex + 1} of {displayPageCount} · {pageRows.toLocaleString()} rows ·{" "}
        {loadedRows.toLocaleString()} loaded
      </span>
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          aria-label="Previous page"
          onClick={onPrevious}
          disabled={pageIndex === 0}
          className="inline-grid h-7 w-7 cursor-pointer place-items-center rounded-[5px] border border-[var(--line)] bg-transparent text-[var(--fg-2)] hover:bg-[var(--bg-2)] hover:text-[var(--fg-0)] disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronLeft size={14} />
        </button>
        <button
          type="button"
          aria-label="Next page"
          onClick={onNext}
          disabled={nextDisabled}
          className="inline-flex h-7 cursor-pointer items-center gap-1 rounded-[5px] border border-[var(--line)] bg-[var(--bg-2)] px-[10px] text-[var(--fg-0)] hover:bg-[var(--bg-2)] disabled:cursor-not-allowed disabled:opacity-40"
        >
          {loadingNext ? "Loading…" : "Next"}
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}

export const LogsTableFooter = memo(LogsTableFooterComponent);
