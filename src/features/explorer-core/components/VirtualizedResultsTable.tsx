import { cn } from "@/lib/utils";
import type { SimpleTableColumn } from "@/components/ui";
import { forwardRef } from "react";
import { TableVirtuoso } from "react-virtuoso";

interface VirtualizedResultsTableProps<RowType extends Record<string, unknown>> {
  rows: RowType[];
  columns: SimpleTableColumn<RowType>[];
  rowKey: keyof RowType | ((record: RowType, index?: number) => string);
  onRow?: (record: RowType, index?: number) => React.HTMLAttributes<HTMLTableRowElement>;
  rowClassName?: string | ((record: RowType, index: number) => string);
  height?: number | string;
}

const TableComponent = forwardRef<HTMLTableElement, React.TableHTMLAttributes<HTMLTableElement>>(
  (props, ref) => (
    <table
      ref={ref}
      {...props}
      className={cn(
        "w-full caption-bottom border-collapse text-sm [&_td]:py-2.5 [&_td]:align-top [&_th]:py-2.5",
        props.className
      )}
    />
  )
);
TableComponent.displayName = "VirtualizedTable";

const TableHeadComponent = forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>((props, ref) => (
  <thead
    ref={ref}
    {...props}
    className={cn(
      "sticky top-0 z-10 bg-[var(--bg-secondary)] [&_tr]:border-[var(--border-color)] [&_tr]:border-b",
      props.className
    )}
  />
));
TableHeadComponent.displayName = "VirtualizedTableHead";

function resolveRowKey<RowType extends Record<string, unknown>>(
  rowKey: VirtualizedResultsTableProps<RowType>["rowKey"],
  record: RowType,
  index: number
): string {
  if (typeof rowKey === "function") return rowKey(record, index);
  return String(record[rowKey]);
}

function resolveRowClassName<RowType extends Record<string, unknown>>(
  rowClassName: VirtualizedResultsTableProps<RowType>["rowClassName"],
  record: RowType,
  index: number
): string | undefined {
  if (!rowClassName) return undefined;
  if (typeof rowClassName === "function") return rowClassName(record, index);
  return rowClassName;
}

function renderCell<RowType extends Record<string, unknown>>(
  column: SimpleTableColumn<RowType>,
  record: RowType,
  index: number
): React.ReactNode {
  const rawValue = column.dataIndex
    ? (record[column.dataIndex as keyof RowType] as unknown)
    : undefined;
  if (column.render) return column.render(rawValue, record, index);
  return rawValue as React.ReactNode;
}

export function VirtualizedResultsTable<RowType extends Record<string, unknown>>({
  rows,
  columns,
  rowKey,
  onRow,
  rowClassName,
  height = "70vh",
}: VirtualizedResultsTableProps<RowType>): JSX.Element {
  return (
    <TableVirtuoso
      style={{ height }}
      data={rows}
      components={{
        Table: TableComponent,
        TableHead: TableHeadComponent,
        TableRow: (props) => {
          const index = (props as { "data-index"?: number })["data-index"] ?? 0;
          const row = rows[index];
          const rowAttrs = row ? (onRow?.(row, index) ?? {}) : {};
          const extraClass = row ? resolveRowClassName(rowClassName, row, index) : undefined;
          return (
            <tr
              {...props}
              {...rowAttrs}
              className={cn(
                "border-[var(--border-color)] border-b transition-colors",
                extraClass,
                rowAttrs.className,
                (props as { className?: string }).className
              )}
            />
          );
        },
      }}
      fixedHeaderContent={() => (
        <tr>
          {columns.map((column) => (
            <th
              key={String(column.key ?? column.dataIndex ?? column.title)}
              className={cn(
                "px-3 text-left font-medium text-[var(--text-secondary)] text-xs uppercase tracking-wide",
                column.align === "right" && "text-right",
                column.align === "center" && "text-center",
                column.headerClassName
              )}
              style={
                column.width != null
                  ? { width: column.width, minWidth: column.width }
                  : undefined
              }
            >
              {column.title}
            </th>
          ))}
        </tr>
      )}
      itemContent={(index, row) => (
        <>
          {columns.map((column) => (
            <td
              key={`${resolveRowKey(rowKey, row as RowType, index)}-${String(column.key ?? column.dataIndex ?? column.title)}`}
              className={cn(
                "px-3 text-[var(--text-primary)]",
                column.align === "right" && "text-right",
                column.align === "center" && "text-center",
                column.ellipsis && "max-w-[280px] truncate",
                column.cellClassName ?? column.className
              )}
            >
              {renderCell(column, row as RowType, index)}
            </td>
          ))}
        </>
      )}
    />
  );
}
