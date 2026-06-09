import { memo } from "react";

interface Props {
  readonly rows?: number;
  readonly rowHeight?: number;
}

function ResultsLoadingRowsComponent({ rows = 12, rowHeight = 32 }: Props) {
  return (
    <div aria-busy className="flex flex-col" role="status">
      {Array.from({ length: rows }).map((_, index) => (
        <div
          key={index}
          className="flex items-center border-border border-b px-3"
          style={{ height: rowHeight }}
        >
          <div className="h-3 w-full animate-pulse rounded bg-accent" />
        </div>
      ))}
    </div>
  );
}

export const ResultsLoadingRows = memo(ResultsLoadingRowsComponent);
