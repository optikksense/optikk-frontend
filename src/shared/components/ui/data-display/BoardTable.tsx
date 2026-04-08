import { useMemo } from "react";
import { Virtuoso } from "react-virtuoso";

import BoardLoadMoreFooter from "./BoardLoadMoreFooter";

import type { ReactNode } from "react";
import type {
  BoardColumn,
  BoardFilter,
  BoardPaginationState,
  RenderRowContext,
} from "./ObservabilityDataBoard";

/**
 * Props for the shared virtualized observability board table.
 */
export interface BoardTableProps<RowType> {
  rows: RowType[];
  fixedColumns: BoardColumn[];
  flexColumn: BoardColumn | undefined;
  colWidths: Record<string, number>;
  rowKey: (row: RowType, index: number) => string | number;
  renderRow: (row: RowType, context: RenderRowContext) => ReactNode;
  visibleCols: Record<string, boolean>;
  onAddFilter: ((filter: BoardFilter) => void) | undefined;
  handleResizeMouseDown: (event: React.MouseEvent<HTMLDivElement>, columnKey: string) => void;
  entityName: string;
  pagination: BoardPaginationState;
}

/**
 * Renders the shared board header and virtualized body inside one horizontal
 * scroll container so column headers stay aligned with rows.
 */
export function BoardTable<RowType extends Record<string, unknown>>({
  rows,
  fixedColumns,
  flexColumn,
  colWidths,
  rowKey,
  renderRow,
  visibleCols,
  onAddFilter,
  handleResizeMouseDown,
  entityName,
  pagination,
}: BoardTableProps<RowType>) {
  const { hasNextPage = false, isFetchingNextPage = false, fetchNextPage } = pagination;
  const fixedWidth = useMemo(
    () => fixedColumns.reduce((total, column) => total + (colWidths[column.key] ?? 0), 0),
    [colWidths, fixedColumns]
  );
  const flexColumnWidth = flexColumn
    ? (colWidths[flexColumn.key] ?? flexColumn.defaultWidth ?? 480)
    : 0;
  const tableMinWidth = fixedWidth + flexColumnWidth;

  const BoardScroller = useMemo(
    () =>
      function BoardScrollerComponent({
        className,
        ref,
        ...rest
      }: React.ComponentPropsWithRef<"div">) {
        return (
          <div
            {...rest}
            ref={ref}
            className={`h-full min-w-0 overflow-auto${className ? ` ${className}` : ""}`}
          />
        );
      },
    []
  );

  const BoardHeader = useMemo(
    () =>
      function BoardHeaderComponent() {
        return (
          <div
            className="sticky top-0 z-20 flex select-none border-[color:var(--glass-border)] border-b bg-[rgba(255,255,255,0.02)] font-semibold text-[11px] text-muted-foreground uppercase tracking-[0.05em]"
            style={{ minWidth: tableMinWidth, width: "max-content" }}
          >
            {fixedColumns.map((column) => (
              <div
                key={column.key}
                className="relative box-border flex shrink-0 items-center overflow-hidden text-ellipsis whitespace-nowrap border-[color:var(--glass-border)] border-r px-3 py-[9px]"
                style={{ width: colWidths[column.key] }}
              >
                {column.label}
                <div
                  className="-right-1 absolute top-0 z-[12] h-full w-2 cursor-col-resize hover:bg-[var(--color-primary-subtle-35)]"
                  onMouseDown={(event) => {
                    event.stopPropagation();
                    handleResizeMouseDown(event, column.key);
                  }}
                />
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
        );
      },
    [colWidths, fixedColumns, flexColumn, flexColumnWidth, handleResizeMouseDown, tableMinWidth]
  );

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col">
      <div className="min-h-0 min-w-0 flex-1">
        <Virtuoso
          style={{ height: "100%" }}
          data={rows}
          components={{
            Scroller: BoardScroller,
            Header: BoardHeader,
            Footer: () => (
              <BoardLoadMoreFooter
                entityName={entityName}
                hasNextPage={hasNextPage}
                isFetchingNextPage={isFetchingNextPage}
                onFetchNextPage={fetchNextPage}
              />
            ),
          }}
          endReached={() => {
            if (hasNextPage && !isFetchingNextPage && fetchNextPage) {
              fetchNextPage();
            }
          }}
          itemContent={(index, row) => (
            <div
              key={rowKey(row, index)}
              className="flex cursor-pointer items-baseline border-[color:var(--glass-border)] border-b font-mono text-xs transition-colors duration-[80ms] ease-in-out hover:bg-[rgba(255,255,255,0.05)]"
              style={{ minWidth: tableMinWidth, width: "max-content" }}
            >
              {renderRow(row, { colWidths, visibleCols, onAddFilter })}
            </div>
          )}
        />
      </div>
    </div>
  );
}
