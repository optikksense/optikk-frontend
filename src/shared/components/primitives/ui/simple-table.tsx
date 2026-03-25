import { useMemo, useState } from 'react';
import {
  type ColumnDef,
  type Row,
  type SortingFn,
  type SortingState,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';

import { cn } from '@/lib/utils';
import { useResizableColumns, type ColumnWidthMap } from '@shared/hooks/useResizableColumns';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './table';

type TableRowData = object;

function asRowRecord(value: TableRowData): Record<string, unknown> {
  return value as Record<string, unknown>;
}

export interface SimpleTableColumn<RowType extends TableRowData = TableRowData> {
  title: React.ReactNode;
  dataIndex?: keyof RowType | string;
  key?: string;
  width?: number | string;
  align?: 'left' | 'center' | 'right';
  ellipsis?: boolean;
  render?: (
    value: unknown,
    record: RowType,
    index: number,
  ) => React.ReactNode;
  sorter?: ((left: RowType, right: RowType) => number) | boolean;
  defaultSortOrder?: 'ascend' | 'descend';
  filters?: Array<{ text: string; value: unknown }>;
  onFilter?: (value: unknown, record: RowType) => boolean;
}

export interface SimpleTablePagination {
  pageSize?: number;
  current?: number;
  total?: number;
  showSizeChanger?: boolean;
  onChange?: (page: number, pageSize: number) => void;
}

export interface SimpleTableProps<RowType extends TableRowData = TableRowData> {
  columns: SimpleTableColumn<RowType>[];
  dataSource: RowType[];
  rowKey?: keyof RowType | ((record: RowType, index?: number) => string);
  size?: 'small' | 'middle' | 'large';
  pagination?: false | SimpleTablePagination;
  scroll?: { x?: number | string; y?: number | string };
  className?: string;
  rowClassName?: string | ((record: RowType, index: number) => string);
  onRow?: (
    record: RowType,
    index?: number,
  ) => React.HTMLAttributes<HTMLTableRowElement>;
}

interface ColumnMeta {
  align?: 'left' | 'center' | 'right';
  ellipsis?: boolean;
  width?: number | string;
  columnId?: string;
}

type SortableRow<RowType extends TableRowData> = Row<RowType>;

function createSortingFn<RowType extends TableRowData>(
  sorter?: SimpleTableColumn<RowType>['sorter'],
): SortingFn<RowType> | 'auto' {
  if (typeof sorter !== 'function') {
    return 'auto';
  }

  return (rowA: SortableRow<RowType>, rowB: SortableRow<RowType>) =>
    sorter(rowA.original, rowB.original);
}

function toColumnId<RowType extends TableRowData>(
  column: SimpleTableColumn<RowType>,
): string {
  return String(column.key ?? column.dataIndex ?? '');
}

function SimpleTable<RowType extends TableRowData = TableRowData>({
  columns: incomingColumns,
  dataSource,
  rowKey,
  size = 'middle',
  pagination = false,
  scroll,
  className,
  rowClassName,
  onRow,
}: SimpleTableProps<RowType>) {
  const initialSorting = useMemo<SortingState>(() => {
    for (const column of incomingColumns) {
      if (column.defaultSortOrder) {
        return [
          {
            id: toColumnId(column),
            desc: column.defaultSortOrder === 'descend',
          },
        ];
      }
    }
    return [];
  }, [incomingColumns]);

  const [sorting, setSorting] = useState<SortingState>(initialSorting);

  // Build initial widths from column definitions
  const initialWidths = useMemo<ColumnWidthMap>(() => {
    const widths: ColumnWidthMap = {};
    for (const col of incomingColumns) {
      const id = toColumnId(col);
      if (id && typeof col.width === 'number') {
        widths[id] = col.width;
      }
    }
    return widths;
  }, [incomingColumns]);

  const { columnWidths, handleResizeMouseDown } = useResizableColumns({
    initialWidths,
    defaultWidth: 160,
    minWidth: 60,
  });

  const columns = useMemo<ColumnDef<RowType>[]>(
    () =>
      incomingColumns.map((column) => {
        const id = toColumnId(column);

        return {
          id,
          accessorFn: (row: RowType) =>
            column.dataIndex ? asRowRecord(row)[String(column.dataIndex)] : undefined,
          header: () => column.title,
          size: typeof column.width === 'number' ? column.width : undefined,
          enableSorting: Boolean(column.sorter),
          sortingFn: createSortingFn(column.sorter),
          cell: (info) => {
            const value = column.dataIndex
              ? asRowRecord(info.row.original)[String(column.dataIndex)]
              : undefined;

            if (column.render) {
              return column.render(value, info.row.original, info.row.index);
            }

            return value ?? '-';
          },
          meta: {
            align: column.align,
            ellipsis: column.ellipsis,
            width: column.width,
            columnId: id,
          } satisfies ColumnMeta,
        };
      }),
    [incomingColumns],
  );

  const getRowId = useMemo(() => {
    if (typeof rowKey === 'function') {
      return (row: RowType, index: number) => rowKey(row, index);
    }

    if (typeof rowKey === 'string') {
      return (row: RowType, index: number) =>
        String(asRowRecord(row)[rowKey] ?? index);
    }

    return (row: RowType, index: number) => String(asRowRecord(row).key ?? index);
  }, [rowKey]);

  const pageSize =
    pagination && typeof pagination === 'object'
      ? pagination.pageSize ?? 10
      : dataSource.length;

  const table = useReactTable({
    data: dataSource,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: pagination ? getPaginationRowModel() : undefined,
    getRowId,
    initialState: {
      pagination: pagination ? { pageSize, pageIndex: 0 } : undefined,
    },
  });

  const sizeClasses = {
    small: 'text-[12px]',
    middle: 'text-[12px]',
    large: 'text-[14px]',
  };

  const rows = table.getRowModel().rows;

  return (
    <div className={cn('w-full overflow-auto', className)}>
      <div style={scroll?.y ? { maxHeight: scroll.y, overflowY: 'auto' } : undefined}>
        <Table
          className={cn('border-collapse table-fixed overflow-hidden rounded-[var(--card-radius)] bg-[var(--bg-secondary)]', sizeClasses[size])}
          style={scroll?.x ? { minWidth: scroll.x } : undefined}
        >
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="hover:bg-transparent">
                {headerGroup.headers.map((header) => {
                  const meta = header.column.columnDef.meta as ColumnMeta | undefined;
                  const colId = meta?.columnId ?? header.id;
                  const resolvedWidth = columnWidths[colId] ?? meta?.width;

                  return (
                    <TableHead
                      key={header.id}
                      className={cn(
                        'relative h-9 border-b border-[var(--border-color)] bg-[rgba(255,255,255,0.015)] text-[11px] font-medium normal-case tracking-[0.01em] text-[var(--text-secondary)]',
                        header.column.getCanSort() && 'cursor-pointer select-none',
                      )}
                      style={{
                        width: resolvedWidth,
                        textAlign: meta?.align ?? 'left',
                      }}
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {{
                        asc: ' ↑',
                        desc: ' ↓',
                      }[header.column.getIsSorted() as string] ?? ''}

                      {/* Resize handle */}
                      <div
                        className="absolute top-0 -right-1 z-[12] h-full w-2 cursor-col-resize hover:bg-[rgba(124,127,242,0.18)]"
                        onMouseDown={(event) => {
                          event.stopPropagation();
                          handleResizeMouseDown(event, colId);
                        }}
                      />
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {rows.map((row) => {
              const rowCls =
                typeof rowClassName === 'function'
                  ? rowClassName(row.original, row.index)
                  : rowClassName ?? '';
              const rowProps = onRow ? onRow(row.original, row.index) : {};

              return (
                <TableRow key={row.id} className={rowCls} {...rowProps}>
                  {row.getVisibleCells().map((cell) => {
                    const meta = cell.column.columnDef.meta as ColumnMeta | undefined;
                    const colId = meta?.columnId ?? cell.column.id;
                    const resolvedWidth = columnWidths[colId] ?? meta?.width;

                    return (
                      <TableCell
                        key={cell.id}
                        className={cn('py-2', meta?.ellipsis && 'max-w-0 truncate')}
                        style={{
                          textAlign: meta?.align ?? 'left',
                          width: resolvedWidth,
                        }}
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    );
                  })}
                </TableRow>
              );
            })}
            {rows.length === 0 ? (
              <TableRow className="hover:bg-transparent">
                <TableCell
                  colSpan={incomingColumns.length}
                  className="px-3 py-8 text-center text-[12px] text-[var(--text-muted)]"
                >
                  No data
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </div>
      {pagination && table.getPageCount() > 1 ? (
        <div className="flex items-center justify-between border-t border-[var(--border-color)] px-3 py-2.5 text-[12px] text-[var(--text-secondary)]">
          <span>{dataSource.length} total</span>
          <div className="flex items-center gap-2">
            {typeof pagination === 'object' && pagination.showSizeChanger ? (
              <select
                value={table.getState().pagination.pageSize}
                onChange={(event) => table.setPageSize(Number(event.target.value))}
                className="h-7 rounded-[var(--card-radius)] border border-[var(--border-color)] bg-[var(--bg-tertiary)] px-2 text-[11px] text-[var(--text-primary)]"
              >
                {[10, 20, 50, 100].map((value) => (
                  <option key={value} value={value}>
                    {value} / page
                  </option>
                ))}
              </select>
            ) : null}
            <button
              type="button"
              disabled={!table.getCanPreviousPage()}
              onClick={() => table.previousPage()}
              className="rounded-[var(--card-radius)] border border-[var(--border-color)] bg-[var(--bg-tertiary)] px-2 py-0.5 disabled:opacity-40"
            >
              ‹
            </button>
            <span>
              {table.getState().pagination.pageIndex + 1} / {table.getPageCount()}
            </span>
            <button
              type="button"
              disabled={!table.getCanNextPage()}
              onClick={() => table.nextPage()}
              className="rounded-[var(--card-radius)] border border-[var(--border-color)] bg-[var(--bg-tertiary)] px-2 py-0.5 disabled:opacity-40"
            >
              ›
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export { SimpleTable };
