import { forwardRef, useMemo } from 'react';
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
}: BoardTableProps<RowType>): JSX.Element {
  const { hasNextPage = false, isFetchingNextPage = false, fetchNextPage } = pagination;
  const fixedWidth = useMemo(
    () => fixedColumns.reduce(
      (total, column) => total + (colWidths[column.key] ?? 0),
      0,
    ),
    [colWidths, fixedColumns],
  );
  const flexColumnWidth = flexColumn
    ? (colWidths[flexColumn.key] ?? flexColumn.defaultWidth ?? 480)
    : 0;
  const tableMinWidth = fixedWidth + flexColumnWidth;
  const BoardScroller = useMemo(
    () => forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
      function BoardScrollerComponent(props, ref) {
        const { className, ...rest } = props;

        return (
          <div
            {...rest}
            ref={ref}
            className={className ? `oboard__body-scroll ${className}` : 'oboard__body-scroll'}
          />
        );
      },
    ),
    [],
  );
  const BoardHeader = useMemo(
    () => function BoardHeaderComponent() {
      return (
        <div className="oboard__thead" style={{ minWidth: tableMinWidth }}>
          {fixedColumns.map((column) => (
            <div key={column.key} className="oboard__th" style={{ width: colWidths[column.key] }}>
              {column.label}
              <div
                className="oboard__resizer"
                onMouseDown={(event) => {
                  event.stopPropagation();
                  handleResizeMouseDown(event, column.key);
                }}
              />
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
      );
    },
    [colWidths, fixedColumns, flexColumn, flexColumnWidth, handleResizeMouseDown, tableMinWidth],
  );

  return (
    <div className="oboard__tbody">
      <div className="oboard__table-viewport">
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
              className="oboard__row"
              style={{ minWidth: tableMinWidth }}
            >
              {renderRow(row, { colWidths, visibleCols, onAddFilter })}
            </div>
          )}
        />
      </div>
    </div>
  );
}
