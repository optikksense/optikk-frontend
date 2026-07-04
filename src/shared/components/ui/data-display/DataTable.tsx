import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { EmptyState } from "@shared/components/ui/feedback";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@shared/components/primitives/ui/table";

interface DataTablePagination {
  page?: number;
  pageSize?: number;
  total?: number;
  onPageChange?: (page: number, pageSize?: number) => void;
  showPagination?: boolean;
}

interface DataTableConfig<TData> {
  emptyText?: string;
  scroll?: { x?: number; y?: number };
  onRow?: (record: TData, index?: number) => React.HTMLAttributes<HTMLTableRowElement>;
}

export interface DataTableProps<TData, TValue> {
  data: {
    columns: ColumnDef<TData, TValue>[];
    rows: TData[];
    loading?: boolean;
  };
  pagination?: DataTablePagination;
  config?: DataTableConfig<TData>;
}

/**
 * Standard shadcn/ui DataTable wrapper.
 */
export default function DataTable<TData, TValue>({
  data,
  config = {},
}: DataTableProps<TData, TValue>): JSX.Element {
  const { columns, rows, loading = false } = data;
  const { emptyText = "No data found", onRow } = config;

  const table = useReactTable({
    data: rows,
    columns,
    getCoreRowModel: getCoreRowModel(),
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

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                const align = (header.column.columnDef.meta as any)?.align || "left";
                const width = header.column.columnDef.size !== 150 ? header.column.columnDef.size : undefined;
                return (
                  <TableHead 
                    key={header.id} 
                    style={{ width, textAlign: align }}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.map((row, index) => {
            const rowProps = onRow ? onRow(row.original, index) : {};
            return (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
                {...rowProps}
              >
                {row.getVisibleCells().map((cell) => {
                  const align = (cell.column.columnDef.meta as any)?.align || "left";
                  return (
                    <TableCell key={cell.id} style={{ textAlign: align }}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  );
                })}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
      {/* Pagination implementation placeholder if needed in the future */}
    </div>
  );
}
