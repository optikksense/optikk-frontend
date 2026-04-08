import { SimpleTable, Skeleton } from "@/components/ui";
import { PageSurface } from "@shared/components/ui";

import type { SimpleTableColumn, SimpleTableProps } from "@/components/ui";

interface ExplorerResultsTableProps<RowType extends Record<string, unknown>> {
  title: string;
  subtitle?: string;
  rows: RowType[];
  columns: SimpleTableColumn<RowType>[];
  rowKey: SimpleTableProps<RowType>["rowKey"];
  isLoading?: boolean;
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  onRow?: SimpleTableProps<RowType>["onRow"];
  rowClassName?: SimpleTableProps<RowType>["rowClassName"];
  toolbar?: React.ReactNode;
  /** When false, all rows render with no pager (e.g. live tail buffer). Default true. */
  showPagination?: boolean;
}

export function ExplorerResultsTable<RowType extends Record<string, unknown>>({
  title,
  subtitle,
  rows,
  columns,
  rowKey,
  isLoading,
  page,
  pageSize,
  total,
  onPageChange,
  onPageSizeChange,
  onRow,
  rowClassName,
  toolbar,
  showPagination = true,
}: ExplorerResultsTableProps<RowType>): JSX.Element {
  return (
    <PageSurface padding="lg" className="min-h-0 w-full min-w-0">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-semibold text-[var(--text-primary)] text-sm">{title}</h3>
          {subtitle ? <p className="mt-1 text-[var(--text-muted)] text-xs">{subtitle}</p> : null}
        </div>
        {toolbar}
      </div>

      {isLoading ? (
        <Skeleton paragraph={{ rows: 8 }} />
      ) : (
        <SimpleTable
          columns={columns}
          dataSource={rows}
          rowKey={rowKey}
          pagination={
            showPagination
              ? {
                  current: page,
                  pageSize,
                  total,
                  manual: true,
                  showSizeChanger: true,
                  onChange: (nextPage, nextPageSize) => {
                    if (nextPageSize !== pageSize) {
                      onPageSizeChange(nextPageSize);
                      return;
                    }
                    onPageChange(nextPage);
                  },
                }
              : false
          }
          onRow={onRow}
          rowClassName={rowClassName}
          className="[&_td]:py-2.5 [&_td]:align-top [&_th]:py-2.5"
        />
      )}
    </PageSurface>
  );
}
