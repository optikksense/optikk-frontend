interface BoardColumn {
  key: string;
  label: string;
  defaultWidth?: number;
}

interface BoardSkeletonProps {
  fixedColumns: BoardColumn[];
  flexColumn: BoardColumn | undefined;
  colWidths: Record<string, number>;
  rowCount: number;
  randomWidth: (basePercent: number, rangePercent: number) => string;
  skeletonBaseWidth: number;
  skeletonWidthRange: number;
  skeletonFlexBaseWidth: number;
  skeletonFlexWidthRange: number;
}

/**
 *
 * @param root0
 * @param root0.fixedColumns
 * @param root0.flexColumn
 * @param root0.colWidths
 * @param root0.rowCount
 * @param root0.randomWidth
 * @param root0.skeletonBaseWidth
 * @param root0.skeletonWidthRange
 * @param root0.skeletonFlexBaseWidth
 * @param root0.skeletonFlexWidthRange
 */
export default function BoardSkeleton({
  fixedColumns,
  flexColumn,
  colWidths,
  rowCount,
  randomWidth,
  skeletonBaseWidth,
  skeletonWidthRange,
  skeletonFlexBaseWidth,
  skeletonFlexWidthRange,
}: BoardSkeletonProps) {
  const fixedWidth = fixedColumns.reduce(
    (total, column) => total + (colWidths[column.key] ?? 0),
    0
  );
  const flexColumnWidth = flexColumn
    ? (colWidths[flexColumn.key] ?? flexColumn.defaultWidth ?? 480)
    : 0;
  const tableMinWidth = fixedWidth + flexColumnWidth;

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col">
      {/* scroll wrapper */}
      <div className="h-full min-w-0 overflow-auto">
        <div className="min-w-full" style={{ width: "max-content", minWidth: tableMinWidth }}>
          {/* header */}
          <div
            className="sticky top-0 z-20 flex select-none border-[color:var(--glass-border)] border-b bg-[rgba(255,255,255,0.02)] p-0 font-semibold text-[11px] text-muted-foreground uppercase tracking-[0.05em]"
            style={{ width: "max-content", minWidth: "100%" }}
          >
            {fixedColumns.map((column) => (
              <div
                key={column.key}
                className="relative box-border flex shrink-0 items-center overflow-hidden text-ellipsis whitespace-nowrap border-[color:var(--glass-border)] border-r px-3 py-[9px]"
                style={{ width: colWidths[column.key] }}
              >
                {column.label}
              </div>
            ))}
            {flexColumn && (
              <div
                className="relative box-border flex flex-1 items-center overflow-hidden text-ellipsis whitespace-nowrap border-[color:var(--glass-border)] border-r-0 px-3 py-[9px]"
                style={{ flex: `1 0 ${flexColumnWidth}px`, minWidth: flexColumnWidth }}
              >
                {flexColumn.label}
              </div>
            )}
          </div>
          {/* rows */}
          <div className="flex min-h-0 min-w-0 flex-1 flex-col">
            {Array.from({ length: rowCount }).map((_, index) => (
              <div
                key={index}
                className="flex cursor-pointer items-baseline border-[color:var(--glass-border)] border-b font-mono text-xs"
                style={{
                  minWidth: tableMinWidth,
                  padding: "10px 12px",
                  gap: 16,
                  width: "max-content",
                }}
              >
                {fixedColumns.map((column) => (
                  <div key={column.key} style={{ width: colWidths[column.key], flexShrink: 0 }}>
                    <div
                      className="h-[13px] animate-oboard-shimmer rounded"
                      style={{
                        width: randomWidth(skeletonBaseWidth, skeletonWidthRange),
                        background:
                          "linear-gradient(90deg, var(--bg-tertiary) 25%, var(--border-color) 50%, var(--bg-tertiary) 75%)",
                        backgroundSize: "1200px 100%",
                      }}
                    />
                  </div>
                ))}
                {flexColumn && (
                  <div style={{ flex: `1 0 ${flexColumnWidth}px`, minWidth: flexColumnWidth }}>
                    <div
                      className="h-[13px] animate-oboard-shimmer rounded"
                      style={{
                        width: randomWidth(skeletonFlexBaseWidth, skeletonFlexWidthRange),
                        background:
                          "linear-gradient(90deg, var(--bg-tertiary) 25%, var(--border-color) 50%, var(--bg-tertiary) 75%)",
                        backgroundSize: "1200px 100%",
                      }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
