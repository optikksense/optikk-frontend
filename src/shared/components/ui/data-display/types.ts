export type BoardFilterValue = string | number | boolean;

export interface BoardFilter {
  field: string;
  value: BoardFilterValue;
  operator: "equals";
}

export interface BoardColumn {
  key: string;
  label: string;
  defaultWidth?: number;
  defaultVisible?: boolean;
  flex?: boolean;
}

export type ColumnWidths = Record<string, number>;
export type VisibleColumns = Record<string, boolean>;

export interface RenderRowContext {
  colWidths: ColumnWidths;
  visibleCols: VisibleColumns;
  onAddFilter: ((filter: BoardFilter) => void) | undefined;
}

export interface BoardPaginationState {
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
  fetchNextPage?: () => void;
}
