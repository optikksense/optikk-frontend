import { CursorPagination, SimpleTable, Skeleton } from "@/components/ui";
import { PageSurface } from "@shared/components/ui";
import { FeatureErrorBoundary } from "@shared/components/ui/feedback";

import type { SimpleTableColumn, SimpleTableProps } from "@/components/ui";

import { VirtualizedResultsTable } from "./VirtualizedResultsTable";

export interface CursorPaginationConfig {
  hasMore: boolean;
  hasPrev: boolean;
  onNext: () => void;
  onPrev: () => void;
  pageSize: number;
  onPageSizeChange?: (size: number) => void;
}

interface ExplorerResultsTableProps<RowType extends Record<string, unknown>> {
  title: string;
  subtitle?: string;
  rows: RowType[];
  columns: SimpleTableColumn<RowType>[];
  rowKey: SimpleTableProps<RowType>["rowKey"];
  isLoading?: boolean;
  /** Cursor pagination config. Omit to disable the pager (e.g. live tail buffer). */
  pagination?: CursorPaginationConfig;
  onRow?: SimpleTableProps<RowType>["onRow"];
  rowClassName?: SimpleTableProps<RowType>["rowClassName"];
  toolbar?: React.ReactNode;
  /** Opt-in virtualization. Automatic when pager is omitted and rows exceed the threshold. */
  virtualized?: boolean;
}

const VIRTUALIZE_AUTO_THRESHOLD = 50;

export function ExplorerResultsTable<RowType extends Record<string, unknown>>({
  title,
  subtitle,
  rows,
  columns,
  rowKey,
  isLoading,
  pagination,
  onRow,
  rowClassName,
  toolbar,
  virtualized,
}: ExplorerResultsTableProps<RowType>): JSX.Element {
  const useVirtual = virtualized ?? (!pagination && rows.length > VIRTUALIZE_AUTO_THRESHOLD);

  return (
    <PageSurface padding="lg" className="min-h-0 w-full min-w-0">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-semibold text-[var(--text-primary)] text-sm">{title}</h3>
          {subtitle ? (
            <p
              aria-live={pagination ? undefined : "polite"}
              aria-atomic="true"
              className="mt-1 text-[var(--text-muted)] text-xs"
            >
              {subtitle}
            </p>
          ) : null}
        </div>
        {toolbar}
      </div>

      <FeatureErrorBoundary featureName={`explorer-results-table:${title}`}>
        {isLoading ? (
          <Skeleton paragraph={{ rows: 8 }} />
        ) : useVirtual ? (
          <VirtualizedResultsTable
            rows={rows}
            columns={columns}
            rowKey={rowKey}
            onRow={onRow}
            rowClassName={rowClassName}
          />
        ) : (
          <SimpleTable
            columns={columns}
            dataSource={rows}
            rowKey={rowKey}
            pagination={false}
            onRow={onRow}
            rowClassName={rowClassName}
            className="[&_td]:py-2.5 [&_td]:align-top [&_th]:py-2.5"
          />
        )}
      </FeatureErrorBoundary>

      {pagination ? (
        <div className="mt-3 border-[var(--border-color)] border-t px-1 pt-3">
          <CursorPagination
            hasMore={pagination.hasMore}
            hasPrev={pagination.hasPrev}
            onNext={pagination.onNext}
            onPrev={pagination.onPrev}
            pageSize={pagination.pageSize}
            onPageSizeChange={pagination.onPageSizeChange}
          />
        </div>
      ) : null}
    </PageSurface>
  );
}
