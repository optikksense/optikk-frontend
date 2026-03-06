import { Table, type TableProps } from 'antd';

import { EmptyState } from '@components/common';

import { UI_CONFIG } from '@config/constants';

/**
 * Wrapper around Ant Design Table with consistent pagination, loading, and empty state.
 * Replaces the 5+ Table usages with inconsistent pagination configs.
 */
interface DataTableProps {
  columns: NonNullable<TableProps<Record<string, unknown>>['columns']>;
  data: Record<string, unknown>[];
  loading?: boolean;
  rowKey?: TableProps<Record<string, unknown>>['rowKey'];
  page?: number;
  pageSize?: number;
  total?: number;
  onPageChange?: (page: number, pageSize?: number) => void;
  emptyText?: string;
  scroll?: TableProps<Record<string, unknown>>['scroll'];
  onRow?: TableProps<Record<string, unknown>>['onRow'];
  showPagination?: boolean;
  expandable?: TableProps<Record<string, unknown>>['expandable'];
}

/**
 * Shared table wrapper with consistent pagination and empty states.
 * @param props Component props.
 * @returns Ant Design table with project defaults.
 */
export default function DataTable({
  columns,
  data,
  loading = false,
  rowKey = 'id',
  page,
  pageSize,
  total,
  onPageChange,
  emptyText = 'No data found',
  scroll,
  onRow,
  showPagination = true,
  expandable,
}: DataTableProps): JSX.Element {
  const paginationConfig: TableProps<Record<string, unknown>>['pagination'] =
    showPagination && onPageChange
    ? {
      current: page,
      pageSize: pageSize || UI_CONFIG.DEFAULT_PAGE_SIZE,
      total: total || 0,
      onChange: (newPage: number, newPageSize: number) => onPageChange(newPage, newPageSize),
      showSizeChanger: true,
      showTotal: (totalCount: number) => `Total ${totalCount} records`,
      pageSizeOptions: UI_CONFIG.PAGE_SIZES.map(String),
    }
    : showPagination
      ? { pageSize: UI_CONFIG.DEFAULT_PAGE_SIZE, showSizeChanger: true }
      : false;

  return (
    <Table
      columns={columns}
      dataSource={data}
      loading={loading}
      rowKey={rowKey}
      pagination={paginationConfig}
      scroll={scroll}
      onRow={onRow}
      expandable={expandable}
      locale={{ emptyText: <EmptyState icon={null} title="No Data" description={emptyText} action={null} /> }}
    />
  );
}
