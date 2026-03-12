interface BoardColumn {
  key: string;
  label: string;
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
    0,
  );
  const flexColumnWidth = flexColumn
    ? (colWidths[flexColumn.key] ?? flexColumn.defaultWidth ?? 480)
    : 0;
  const tableMinWidth = fixedWidth + flexColumnWidth;

  return (
    <div className="oboard__tbody">
      <div className="oboard__body-scroll">
        <div className="oboard__table-inner" style={{ minWidth: tableMinWidth }}>
          <div className="oboard__thead">
            {fixedColumns.map((column) => (
              <div key={column.key} className="oboard__th" style={{ width: colWidths[column.key] }}>
                {column.label}
              </div>
            ))}
            {flexColumn && (
              <div
                className="oboard__th oboard__th--flex"
                style={{ flex: `1 0 ${flexColumnWidth}px`, minWidth: flexColumnWidth }}
              >
                {flexColumn.label}
              </div>
            )}
          </div>
          <div className="oboard__table-viewport">
            {Array.from({ length: rowCount }).map((_, index) => (
              <div
                key={index}
                className="oboard__row"
                style={{ minWidth: tableMinWidth, padding: '10px 12px', gap: 16 }}
              >
                {fixedColumns.map((column) => (
                  <div key={column.key} style={{ width: colWidths[column.key], flexShrink: 0 }}>
                    <div
                      className="oboard__skeleton"
                      style={{
                        width: randomWidth(skeletonBaseWidth, skeletonWidthRange),
                      }}
                    />
                  </div>
                ))}
                {flexColumn && (
                  <div style={{ flex: `1 0 ${flexColumnWidth}px`, minWidth: flexColumnWidth }}>
                    <div
                      className="oboard__skeleton"
                      style={{
                        width: randomWidth(skeletonFlexBaseWidth, skeletonFlexWidthRange),
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
