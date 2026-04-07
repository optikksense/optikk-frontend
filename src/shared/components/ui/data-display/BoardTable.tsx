import { useMemo } from 'react';
import { Virtuoso } from 'react-virtuoso';

import BoardLoadMoreFooter from './BoardLoadMoreFooter';

import type {
  BoardColumn,
  RenderRowContext,
  BoardPaginationState,
  BoardFilter,
} from './ObservabilityDataBoard';
import type { ReactNode } from 'react';

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
      function BoardScrollerComponent({ className, ref, ...rest }: React.ComponentPropsWithRef<'div'>) {
        return (
          <div
            {...rest}
            ref={ref}
            className={`h-full min-w-0 overflow-auto${className ? ` ${className}` : ''}`}
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
            className="flex border-b border-[color:var(--glass-border)] text-[11px] font-semibold uppercase tracking-[0.05em] text-muted-foreground sticky top-0 bg-[rgba(255,255,255,0.02)] z-20 select-none"
            style={{ minWidth: tableMinWidth, width: 'max-content' }}
          >
            {fixedColumns.map((column) => (
              <div
                key={column.key}
                className="relative flex items-center shrink-0 border-r border-[color:var(--glass-border)] px-3 py-[9px] whitespace-nowrap overflow-hidden text-ellipsis box-border"
                style={{ width: colWidths[column.key] }}
              >
                {column.label}
                <div
                  className="absolute top-0 -right-1 w-2 h-full cursor-col-resize z-[12] hover:bg-[var(--color-primary-subtle-35)]"
                  onMouseDown={(event) => {
                    event.stopPropagation();
                    handleResizeMouseDown(event, column.key);
                  }}
                />
              </div>
            ))}
            {flexColumn && (
              <div
                className="relative flex items-center border-[color:var(--glass-border)] px-3 py-[9px] whitespace-nowrap overflow-hidden text-ellipsis box-border flex-1 border-r-0"
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
    <div className="flex-1 flex flex-col min-w-0 min-h-0">
      <div className="flex-1 min-w-0 min-h-0">
        <Virtuoso
          style={{ height: '100%' }}
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
              className="flex items-baseline cursor-pointer border-b border-[color:var(--glass-border)] transition-colors duration-[80ms] ease-in-out font-mono text-xs hover:bg-[rgba(255,255,255,0.05)]"
              style={{ minWidth: tableMinWidth, width: 'max-content' }}
            >
              {renderRow(row, { colWidths, visibleCols, onAddFilter })}
            </div>
          )}
        />
      </div>
    </div>
  );
}
