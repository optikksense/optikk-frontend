import { UI_CONFIG } from "@config/constants";
import { SimpleTable } from "@shared/components/primitives/ui/simple-table";
import type {
  SimpleTableColumn,
  SimpleTableProps,
} from "@shared/components/primitives/ui/simple-table";
import { EmptyState } from "@shared/components/ui/feedback";

type TableRow = object;

export interface DataTableData<RowType extends TableRow = TableRow> {
  columns: SimpleTableColumn<RowType>[];
  rows: RowType[];
  loading?: boolean;
  rowKey?: SimpleTableProps<RowType>["rowKey"];
}

export interface DataTablePagination {
  page?: number;
  pageSize?: number;
  total?: number;
  onPageChange?: (page: number, pageSize?: number) => void;
  showPagination?: boolean;
}

export interface DataTableConfig<RowType extends TableRow = TableRow> {
  emptyText?: string;
  scroll?: { x?: number; y?: number };
  onRow?: SimpleTableProps<RowType>["onRow"];
}

export interface DataTableProps<RowType extends TableRow = TableRow> {
  data: DataTableData<RowType>;
  pagination?: DataTablePagination;
  config?: DataTableConfig<RowType>;
}

/**
 * Shared table wrapper with consistent pagination and empty states.
 */
export default function DataTable<RowType extends TableRow = TableRow>({
  data,
  pagination = {},
  config = {},
}: DataTableProps<RowType>): JSX.Element {
  const { columns, rows, loading = false, rowKey } = data;
  const { page, pageSize, total, onPageChange, showPagination = true } = pagination;
  const { emptyText = "No data found", scroll, onRow } = config;

  const paginationConfig =
    showPagination && onPageChange
      ? {
          current: page,
          pageSize: pageSize || UI_CONFIG.DEFAULT_PAGE_SIZE,
          total: total || 0,
          onChange: (newPage: number, newPageSize: number) => onPageChange(newPage, newPageSize),
        }
      : showPagination
        ? { pageSize: UI_CONFIG.DEFAULT_PAGE_SIZE }
        : false;

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
    <SimpleTable
      columns={columns}
      dataSource={rows}
      rowKey={rowKey}
      pagination={paginationConfig || false}
      scroll={scroll}
      onRow={onRow}
      size="small"
    />
  );
}
