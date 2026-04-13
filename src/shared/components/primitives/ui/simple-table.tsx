import {
  type ColumnDef,
  type PaginationState,
  type Row,
  type SortingFn,
  type SortingState,
  type Updater,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useEffect, useMemo, useState } from "react";

import { cn } from "@/lib/utils";
import { type ColumnWidthMap, useResizableColumns } from "@shared/hooks/useResizableColumns";

import { Pagination } from "./pagination";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./table";

type TableRowData = object;

function asRowRecord(value: TableRowData): Record<string, unknown> {
  return value as Record<string, unknown>;
}

export interface SimpleTableColumn<RowType extends TableRowData = TableRowData> {
  title: React.ReactNode;
  dataIndex?: keyof RowType | string;
  key?: string;
  width?: number | string;
  align?: "left" | "center" | "right";
  ellipsis?: boolean;
  sticky?: "left" | "right";
  className?: string;
  headerClassName?: string;
  cellClassName?: string;
  render?: (value: unknown, record: RowType, index: number) => React.ReactNode;
  sorter?: ((left: RowType, right: RowType) => number) | boolean;
  defaultSortOrder?: "ascend" | "descend";
  filters?: Array<{ text: string; value: unknown }>;
  onFilter?: (value: unknown, record: RowType) => boolean;
}

export interface SimpleTablePagination {
  pageSize?: number;
  current?: number;
  total?: number;
  manual?: boolean;
  pageCount?: number;
  showSizeChanger?: boolean;
  onChange?: (page: number, pageSize: number) => void;
}

export interface SimpleTableProps<RowType extends TableRowData = TableRowData> {
  columns: SimpleTableColumn<RowType>[];
  dataSource: RowType[];
  rowKey?: keyof RowType | ((record: RowType, index?: number) => string);
  size?: "small" | "middle" | "large";
  pagination?: false | SimpleTablePagination;
  scroll?: { x?: number | string; y?: number | string };
  className?: string;
  rowClassName?: string | ((record: RowType, index: number) => string);
  onRow?: (record: RowType, index?: number) => React.HTMLAttributes<HTMLTableRowElement>;
  sorting?: SortingState;
  onSortingChange?: (sorting: SortingState) => void;
}

interface ColumnMeta {
  align?: "left" | "center" | "right";
  ellipsis?: boolean;
  width?: number | string;
  columnId?: string;
  sticky?: "left" | "right";
  stickyOffset?: number;
  className?: string;
  headerClassName?: string;
  cellClassName?: string;
}

type SortableRow<RowType extends TableRowData> = Row<RowType>;

function createSortingFn<RowType extends TableRowData>(
  sorter?: SimpleTableColumn<RowType>["sorter"]
): SortingFn<RowType> | "auto" {
  if (typeof sorter !== "function") {
    return "auto";
  }

  return (rowA: SortableRow<RowType>, rowB: SortableRow<RowType>) =>
    sorter(rowA.original, rowB.original);
}

function toColumnId<RowType extends TableRowData>(column: SimpleTableColumn<RowType>): string {
  return String(column.key ?? column.dataIndex ?? "");
}

function resolveUpdater<T>(updater: Updater<T>, previous: T): T {
  if (typeof updater === "function") {
    return (updater as (old: T) => T)(previous);
  }

  return updater;
}

function resolveColumnWidth<RowType extends TableRowData>(
  column: SimpleTableColumn<RowType>,
  columnWidths: ColumnWidthMap,
  defaultWidth: number
): number {
  const id = toColumnId(column);
  const width = columnWidths[id] ?? column.width;
  return typeof width === "number" ? width : defaultWidth;
}

function SimpleTable<RowType extends TableRowData = TableRowData>({
  columns: incomingColumns,
  dataSource,
  rowKey,
  size = "middle",
  pagination = false,
  scroll,
  className,
  rowClassName,
  onRow,
  sorting: controlledSorting,
  onSortingChange,
}: SimpleTableProps<RowType>) {
  const initialSorting = useMemo<SortingState>(() => {
    for (const column of incomingColumns) {
      if (column.defaultSortOrder) {
        return [
          {
            id: toColumnId(column),
            desc: column.defaultSortOrder === "descend",
          },
        ];
      }
    }
    return [];
  }, [incomingColumns]);

  const [uncontrolledSorting, setUncontrolledSorting] = useState<SortingState>(initialSorting);
  const sorting = controlledSorting ?? uncontrolledSorting;

  useEffect(() => {
    if (!controlledSorting) {
      setUncontrolledSorting(initialSorting);
    }
  }, [controlledSorting, initialSorting]);

  const resolvedPagination = pagination && typeof pagination === "object" ? pagination : null;
  const [paginationState, setPaginationState] = useState<PaginationState>({
    pageIndex: Math.max((resolvedPagination?.current ?? 1) - 1, 0),
    pageSize: resolvedPagination?.pageSize ?? 10,
  });

  useEffect(() => {
    if (!resolvedPagination) {
      return;
    }

    setPaginationState((previous) => {
      const nextPageIndex = Math.max((resolvedPagination.current ?? 1) - 1, 0);
      const nextPageSize = resolvedPagination.pageSize ?? previous.pageSize;

      if (previous.pageIndex === nextPageIndex && previous.pageSize === nextPageSize) {
        return previous;
      }

      return {
        pageIndex: nextPageIndex,
        pageSize: nextPageSize,
      };
    });
  }, [resolvedPagination?.current, resolvedPagination?.pageSize, resolvedPagination]);

  // Build initial widths from column definitions
  const initialWidths = useMemo<ColumnWidthMap>(() => {
    const widths: ColumnWidthMap = {};
    for (const col of incomingColumns) {
      const id = toColumnId(col);
      if (id && typeof col.width === "number") {
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

  const stickyOffsets = useMemo(() => {
    const leftOffsets: Record<string, number> = {};
    const rightOffsets: Record<string, number> = {};

    let currentLeft = 0;
    for (const column of incomingColumns) {
      const id = toColumnId(column);
      if (column.sticky === "left") {
        leftOffsets[id] = currentLeft;
        currentLeft += resolveColumnWidth(column, columnWidths, 160);
      }
    }

    let currentRight = 0;
    for (const column of [...incomingColumns].reverse()) {
      const id = toColumnId(column);
      if (column.sticky === "right") {
        rightOffsets[id] = currentRight;
        currentRight += resolveColumnWidth(column, columnWidths, 160);
      }
    }

    return { leftOffsets, rightOffsets };
  }, [incomingColumns, columnWidths]);

  const columns = useMemo<ColumnDef<RowType>[]>(
    () =>
      incomingColumns.map((column) => {
        const id = toColumnId(column);

        return {
          id,
          accessorFn: (row: RowType) =>
            column.dataIndex ? asRowRecord(row)[String(column.dataIndex)] : undefined,
          header: () => column.title,
          size: typeof column.width === "number" ? column.width : undefined,
          enableSorting: Boolean(column.sorter),
          sortingFn: createSortingFn(column.sorter),
          cell: (info) => {
            const value = column.dataIndex
              ? asRowRecord(info.row.original)[String(column.dataIndex)]
              : undefined;

            if (column.render) {
              return column.render(value, info.row.original, info.row.index);
            }

            return value ?? "-";
          },
          meta: {
            align: column.align,
            ellipsis: column.ellipsis,
            width: column.width,
            columnId: id,
            sticky: column.sticky,
            stickyOffset:
              column.sticky === "left"
                ? stickyOffsets.leftOffsets[id]
                : column.sticky === "right"
                  ? stickyOffsets.rightOffsets[id]
                  : undefined,
            className: column.className,
            headerClassName: column.headerClassName,
            cellClassName: column.cellClassName,
          } satisfies ColumnMeta,
        };
      }),
    [incomingColumns, stickyOffsets]
  );

  const getRowId = useMemo(() => {
    if (typeof rowKey === "function") {
      return (row: RowType, index: number) => rowKey(row, index);
    }

    if (typeof rowKey === "string") {
      return (row: RowType, index: number) => String(asRowRecord(row)[rowKey] ?? index);
    }

    return (row: RowType, index: number) => String(asRowRecord(row).key ?? index);
  }, [rowKey]);

  const totalRows = resolvedPagination?.total ?? dataSource.length;
  const pageCount = resolvedPagination
    ? (resolvedPagination.pageCount ??
      Math.max(1, Math.ceil(totalRows / Math.max(paginationState.pageSize, 1))))
    : Math.max(1, Math.ceil(dataSource.length / Math.max(paginationState.pageSize, 1)));

  const handleSortingStateChange = (updater: Updater<SortingState>) => {
    const next = resolveUpdater(updater, sorting);
    onSortingChange?.(next);
    if (!controlledSorting) {
      setUncontrolledSorting(next);
    }
  };

  const handlePaginationStateChange = (updater: Updater<PaginationState>) => {
    setPaginationState((previous) => {
      const next = resolveUpdater(updater, previous);
      resolvedPagination?.onChange?.(next.pageIndex + 1, next.pageSize);
      return next;
    });
  };

  const tableState = pagination ? { sorting, pagination: paginationState } : { sorting };

  const table = useReactTable({
    data: dataSource,
    columns,
    state: tableState,
    onSortingChange: handleSortingStateChange,
    onPaginationChange: pagination ? handlePaginationStateChange : undefined,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel:
      pagination && !resolvedPagination?.manual ? getPaginationRowModel() : undefined,
    getRowId,
    manualPagination: resolvedPagination?.manual ?? false,
    pageCount: pagination ? pageCount : undefined,
    rowCount: pagination ? totalRows : undefined,
  });

  const sizeClasses = {
    small: "text-[12px]",
    middle: "text-[12px]",
    large: "text-[14px]",
  };

  const headRowClasses = {
    small: "h-8",
    middle: "h-9",
    large: "h-10",
  };

  const cellPadClasses = {
    small: "py-1.5",
    middle: "py-2",
    large: "py-2.5",
  };

  const rows = table.getRowModel().rows;

  return (
    <div className={cn("w-full overflow-auto", className)}>
      <div style={scroll?.y ? { maxHeight: scroll.y, overflowY: "auto" } : undefined}>
        <Table
          className={cn(
            "table-fixed border-collapse overflow-hidden rounded-[var(--card-radius)] bg-[var(--bg-secondary)]",
            sizeClasses[size]
          )}
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
                        "relative min-w-0 overflow-hidden border-[var(--border-color)] border-b bg-[rgba(255,255,255,0.015)] font-medium text-[11px] text-[var(--text-secondary)] normal-case tracking-[0.01em]",
                        headRowClasses[size],
                        header.column.getCanSort() && "cursor-pointer select-none",
                        meta?.sticky && "z-[11] bg-[var(--bg-secondary)]",
                        meta?.headerClassName
                      )}
                      style={{
                        width: resolvedWidth,
                        textAlign: meta?.align ?? "left",
                        ...(meta?.sticky === "left"
                          ? { position: "sticky", left: meta.stickyOffset ?? 0 }
                          : {}),
                        ...(meta?.sticky === "right"
                          ? { position: "sticky", right: meta.stickyOffset ?? 0 }
                          : {}),
                      }}
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      <div
                        className={cn(
                          "min-w-0 pr-4",
                          meta?.ellipsis
                            ? "truncate"
                            : "overflow-hidden text-ellipsis whitespace-nowrap"
                        )}
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {{
                          asc: " ↑",
                          desc: " ↓",
                        }[header.column.getIsSorted() as string] ?? ""}
                      </div>

                      {/* Resize handle */}
                      <div
                        className="-right-1 absolute top-0 z-[12] h-full w-2 cursor-col-resize hover:bg-[var(--color-primary-subtle-18)]"
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
                typeof rowClassName === "function"
                  ? rowClassName(row.original, row.index)
                  : (rowClassName ?? "");
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
                        className={cn(
                          cellPadClasses[size],
                          "min-w-0 overflow-hidden",
                          meta?.ellipsis && "max-w-0",
                          meta?.sticky && "z-[6] bg-[var(--bg-secondary)]",
                          meta?.className,
                          meta?.cellClassName
                        )}
                        style={{
                          textAlign: meta?.align ?? "left",
                          width: resolvedWidth,
                          maxWidth: resolvedWidth,
                          ...(meta?.sticky === "left"
                            ? { position: "sticky", left: meta.stickyOffset ?? 0 }
                            : {}),
                          ...(meta?.sticky === "right"
                            ? { position: "sticky", right: meta.stickyOffset ?? 0 }
                            : {}),
                        }}
                      >
                        <div
                          className={cn(
                            "min-w-0",
                            meta?.ellipsis ? "truncate" : "overflow-x-hidden"
                          )}
                        >
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </div>
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
      {pagination ? (
        <div className="border-[var(--border-color)] border-t px-3 py-2.5">
          <Pagination
            page={table.getState().pagination.pageIndex + 1}
            pageSize={table.getState().pagination.pageSize}
            total={totalRows}
            onPageChange={(page) => table.setPageIndex(Math.max(page - 1, 0))}
            onPageSizeChange={
              typeof pagination === "object" && pagination.showSizeChanger
                ? (pageSize) => table.setPageSize(pageSize)
                : undefined
            }
            pageSizeOptions={[10, 20, 50, 100]}
          />
        </div>
      ) : null}
    </div>
  );
}

export { SimpleTable };
