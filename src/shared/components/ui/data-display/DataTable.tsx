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
import { useRef } from "react";

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
  /** Persists widths under this key; omit to keep them for the session only. */
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
  /** Presence enables drag-to-resize column headers. */
  resize?: DataTableResize;
}

// TanStack assigns this width to any column without an explicit `size`, so it
// doubles as the "author set no width" sentinel in the non-resizable layout.
const DEFAULT_COLUMN_SIZE = 150;

/**
 * Standard shadcn/ui DataTable wrapper with virtualization.
 */
export default function DataTable<TData, TValue>({
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

  if (loading) {
    return (
      <div className="py-8 text-center" style={{ color: "var(--text-muted)" }}>
        Loading...
      </div>
    );
  }

  if (rows.length === 0) {
    return <EmptyState icon={null} title="No Data" description={emptyText} action={null} />;
  }

  const virtualItems = virtualizer.getVirtualItems();
  const paddingTop = virtualItems.length > 0 ? virtualItems[0]?.start || 0 : 0;
  const paddingBottom =
    virtualItems.length > 0
      ? virtualizer.getTotalSize() - (virtualItems[virtualItems.length - 1]?.end || 0)
      : 0;

  return (
    <div
      ref={scrollRef}
      className={`relative rounded-md border ${resizable ? "overflow-auto" : "overflow-y-auto"}`}
      style={{ maxHeight: config.scroll?.y ?? "calc(100vh - 200px)" }}
    >
      {/* Fixed layout makes the header widths authoritative while dragging. */}
      <Table
        style={
          resizable ? { tableLayout: "fixed", width: table.getTotalSize(), minWidth: "100%" } : {}
        }
      >
        <TableHeader className="sticky top-0 z-10 bg-background shadow-sm">
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                const align = (header.column.columnDef.meta as { align?: string })?.align || "left";
                const width = resizable
                  ? header.getSize()
                  : header.column.columnDef.size !== DEFAULT_COLUMN_SIZE
                    ? header.column.columnDef.size
                    : undefined;
                return (
                  <TableHead
                    key={header.id}
                    style={{ width, textAlign: align as "left" | "center" | "right" }}
                    className={resizable ? "relative bg-background" : "bg-background"}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                    {resizable && header.column.getCanResize() && (
                      <button
                        type="button"
                        aria-label={`Resize ${header.column.id} column`}
                        onMouseDown={header.getResizeHandler()}
                        onTouchStart={header.getResizeHandler()}
                        className="absolute top-0 right-0 h-full w-1 cursor-col-resize touch-none select-none bg-border opacity-0 hover:opacity-100"
                        style={{ opacity: header.column.getIsResizing() ? 1 : undefined }}
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
      {/* Pagination implementation placeholder if needed in the future */}
    </div>
  );
}
