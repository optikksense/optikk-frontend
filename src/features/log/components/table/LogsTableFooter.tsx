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
    <div className="ok-foot">
      <span className="ok-foot-l">
        Page {pageIndex + 1} of {displayPageCount} · {pageRows.toLocaleString()} rows ·{" "}
        {loadedRows.toLocaleString()} loaded
      </span>
      <div className="ok-foot-r">
        <button
          type="button"
          aria-label="Previous page"
          onClick={onPrevious}
          disabled={pageIndex === 0}
          className="ok-pg"
        >
          <ChevronLeft size={14} />
        </button>
        <button
          type="button"
          aria-label="Next page"
          onClick={onNext}
          disabled={nextDisabled}
          className="ok-pg is-pri"
        >
          {loadingNext ? "Loading…" : "Next"}
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}

export const LogsTableFooter = memo(LogsTableFooterComponent);
