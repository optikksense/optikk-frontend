export interface PaginationFooterProps {
  page: number;
  hasMore: boolean;
  onPrev: () => void;
  onNext: () => void;
}

export function PaginationFooter({ page, hasMore, onPrev, onNext }: PaginationFooterProps) {
  return (
    <div className="mt-4 flex items-center justify-between border-border/40 border-t pt-4">
      <div className="text-[11.5px] text-foreground-muted">Showing page {page + 1}</div>
      <div className="flex gap-2">
        <button
          type="button"
          disabled={page === 0}
          onClick={onPrev}
          className="inline-flex h-[26px] items-center gap-1 rounded-md border border-border bg-card px-3 font-semibold text-[11px] text-foreground-secondary hover:bg-muted/50 disabled:pointer-events-none disabled:opacity-40"
        >
          Previous
        </button>
        <button
          type="button"
          disabled={!hasMore}
          onClick={onNext}
          className="inline-flex h-[26px] items-center gap-1 rounded-md border border-border bg-card px-3 font-semibold text-[11px] text-foreground-secondary hover:bg-muted/50 disabled:pointer-events-none disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </div>
  );
}
