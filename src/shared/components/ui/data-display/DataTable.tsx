import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@shared/components/primitives/ui/table";
import { EmptyState } from "@shared/components/ui/feedback";
import { type ColumnDef, flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { useVirtualizer } from "@tanstack/react-virtual";
import { memo, useRef } from "react";

import { useColumnSizing } from "./useColumnSizing";

interface DataTablePagination {
  page?: number;
  pageSize?: number;
  total?: number;
  onPageChange?: (page: number, pageSize?: number) => void;
  showPagination?: boolean;
}

interface DataTableConfig<TData> {
  emptyText?: string;
  scroll?: { x?: number; y?: number | string };
  onRow?: (record: TData, index?: number) => React.HTMLAttributes<HTMLTableRowElement>;
}

interface DataTableResize {
                                                                                
  storageKey?: string;
}

export interface DataTableProps<TData, TValue> {
  data: {
    columns: ColumnDef<TData, TValue>[];
    rows: TData[];
    loading?: boolean;
  };
  pagination?: DataTablePagination;
  config?: DataTableConfig<TData>;
                                                        
  resize?: DataTableResize;
}

                                                                              
                                                                             
const DEFAULT_COLUMN_SIZE = 150;

   
                                                            
   
function DataTableInner<TData, TValue>({
  data,
  config = {},
  resize,
}: DataTableProps<TData, TValue>): JSX.Element {
  const { columns, rows, loading = false } = data;
  const { emptyText = "No data found", onRow } = config;
  const resizable = resize !== undefined;
  const { columnSizing, onColumnSizingChange } = useColumnSizing(resize?.storageKey);

  const table = useReactTable({
    data: rows,
    columns,
    getCoreRowModel: getCoreRowModel(),
    enableColumnResizing: resizable,
    columnResizeMode: "onChange",
    state: resizable ? { columnSizing } : {},
    onColumnSizingChange,
  });

  const { rows: tableRows } = table.getRowModel();
  const scrollRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: tableRows.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => 48,
    overscan: 10,
  });

  const virtualItems = virtualizer.getVirtualItems();
  const paddingTop = virtualItems.length > 0 ? virtualItems[0].start : 0;
  const paddingBottom =
    virtualItems.length > 0
      ? virtualizer.getTotalSize() - virtualItems[virtualItems.length - 1].end
      : 0;

  if (loading) {
    return (
      <div className="flex h-64 w-full items-center justify-center rounded-md border border-border bg-surface/50">
        <div className="flex flex-col items-center gap-2">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <span className="text-foreground-muted text-sm">Loading data...</span>
        </div>
      </div>
    );
  }

  if (rows.length === 0) {
    return <EmptyState title="No Data" description={emptyText} />;
  }

  return (
    <div
      ref={scrollRef}
      className="relative max-h-[600px] w-full overflow-auto rounded-md border border-border bg-surface"
    >
      <Table className="relative w-full border-collapse text-left text-sm">
        <TableHeader className="sticky top-0 z-15 bg-surface-elevated shadow-sm">
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id} className="border-border border-b hover:bg-transparent">
              {headerGroup.headers.map((header) => {
                const align = (header.column.columnDef.meta as { align?: string })?.align || "left";
                const isCustomWidth =
                  resizable &&
                  header.column.columnDef.size !== undefined &&
                  header.column.columnDef.size !== DEFAULT_COLUMN_SIZE;
                const widthStyle = resizable
                  ? isCustomWidth
                    ? { width: `${header.getSize()}px` }
                    : { width: `${header.getSize()}px`, flex: "1 1 0%" }
                  : undefined;
                return (
                  <TableHead
                    key={header.id}
                    style={{ textAlign: align as "left" | "center" | "right", ...widthStyle }}
                    className={
                      resizable ? "group/col relative select-none overflow-hidden" : undefined
                    }
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                    {resizable && (
                      <div
                        onMouseDown={header.getResizeHandler()}
                        onTouchStart={header.getResizeHandler()}
                        className={`absolute top-0 right-0 h-full w-1 cursor-col-resize touch-none bg-border-light opacity-0 transition-opacity group-hover/col:opacity-100 ${
                          header.column.getIsResizing() ? "bg-primary opacity-100" : ""
                        }`}
                      />
                    )}
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {paddingTop > 0 && (
            <tr>
              <td style={{ height: `${paddingTop}px` }} />
            </tr>
          )}
          {virtualItems.map((virtualRow) => {
            const row = tableRows[virtualRow.index];
            const rowProps = onRow ? onRow(row.original, virtualRow.index) : {};
            return (
              <TableRow key={row.id} data-state={row.getIsSelected() && "selected"} {...rowProps}>
                {row.getVisibleCells().map((cell) => {
                  const align = (cell.column.columnDef.meta as { align?: string })?.align || "left";
                  return (
                    <TableCell
                      key={cell.id}
                      style={{ textAlign: align as "left" | "center" | "right" }}
                      className={resizable ? "overflow-hidden" : undefined}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  );
                })}
              </TableRow>
            );
          })}
          {paddingBottom > 0 && (
            <tr>
              <td style={{ height: `${paddingBottom}px` }} />
            </tr>
          )}
        </TableBody>
      </Table>
    </div>
  );
}

export default memo(DataTableInner) as typeof DataTableInner;
