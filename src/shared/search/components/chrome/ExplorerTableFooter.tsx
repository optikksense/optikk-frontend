import type { ReactNode } from "react";

interface Props {
  readonly rowCount?: number;
  readonly noun?: string;
  readonly summary?: ReactNode;
  readonly onNextPage: () => void;
  readonly onPrevPage: () => void;
  readonly hasNextPage: boolean;
  readonly hasPrevPage: boolean;
}

/** Cursor pager shared by the explorer result tables (traces, errors). */
export function ExplorerTableFooter({
  rowCount,
  noun = "rows",
  summary,
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
      <span className="text-[12.5px] text-foreground-muted">
        {summary ?? `${rowCount ?? 0} ${noun}`}
      </span>
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
