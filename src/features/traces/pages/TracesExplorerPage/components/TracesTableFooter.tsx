interface Props {
  rowCount: number;
  onNextPage: () => void;
  onPrevPage: () => void;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export function TracesTableFooter({
  rowCount,
  onNextPage,
  onPrevPage,
  hasNextPage,
  hasPrevPage,
}: Props) {
  return (
    <div
      className="flex flex-row items-center justify-between"
      style={{ padding: "12px 16px", borderTop: "1px solid var(--line-2)" }}
    >
      <span className="text-[12.5px] text-foreground-muted">Page 1 of 1+ · {rowCount} rows</span>
      <div className="flex gap-2">
        <button
          type="button"
          disabled={!hasPrevPage}
          onClick={onPrevPage}
          className="rounded-md border border-border px-3 py-1.5 font-medium text-sm hover:bg-card-hover disabled:opacity-50 disabled:hover:bg-transparent"
        >
          Previous
        </button>
        <button
          type="button"
          disabled={!hasNextPage}
          onClick={onNextPage}
          className="rounded-md border border-border px-3 py-1.5 font-medium text-sm hover:bg-card-hover disabled:opacity-50 disabled:hover:bg-transparent"
        >
          Next
        </button>
      </div>
    </div>
  );
}
