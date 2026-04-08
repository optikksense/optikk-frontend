import { type ReactNode, useCallback, useMemo } from "react";

import { BoardActionBar, BoardEmptyState, BoardSkeleton } from "./index";

import { usePersistedColumns } from "@shared/hooks/usePersistedColumns";
import { useResizableColumns } from "@shared/hooks/useResizableColumns";

import { BoardClickableCell, type BoardClickableCellProps } from "./BoardClickableCell";
import { BoardTable } from "./BoardTable";
import { type DetailPanelField, ObservabilityDetailPanel } from "./ObservabilityDetailPanel";

const BOARD_ROW_HEIGHT = 32;
const BOARD_CHROME_HEIGHT = 72;
const DEFAULT_COLUMN_WIDTH = 160;
const MIN_COLUMN_WIDTH = 60;
const SKELETON_ROW_COUNT = 10;
const SKELETON_BASE_WIDTH_PERCENT = 50;
const SKELETON_WIDTH_RANGE_PERCENT = 40;
const SKELETON_FLEX_BASE_WIDTH_PERCENT = 55;
const SKELETON_FLEX_WIDTH_RANGE_PERCENT = 35;

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

type ColumnWidths = Record<string, number>;
type VisibleColumns = Record<string, boolean>;

export interface EmptyTip {
  num?: number;
  text: ReactNode;
}

export interface RenderRowContext {
  colWidths: ColumnWidths;
  visibleCols: VisibleColumns;
  onAddFilter: ((filter: BoardFilter) => void) | undefined;
}

/**
 * Calculates board height for a fixed number of data rows.
 */
export function boardHeight(pageSize: number): number {
  return pageSize * BOARD_ROW_HEIGHT + BOARD_CHROME_HEIGHT;
}

function createDefaultWidths(columns: BoardColumn[]): ColumnWidths {
  const widths: ColumnWidths = {};
  for (const column of columns) {
    widths[column.key] = column.defaultWidth ?? DEFAULT_COLUMN_WIDTH;
  }
  return widths;
}

function createDefaultVisibleColumns(columns: BoardColumn[]): VisibleColumns {
  const visibility: VisibleColumns = {};
  for (const column of columns) {
    visibility[column.key] = column.defaultVisible !== false;
  }
  return visibility;
}

function randomSkeletonWidth(basePercent: number, rangePercent: number): string {
  return `${basePercent + Math.random() * rangePercent}%`;
}

function downloadFile(content: string, filename: string, type: string): void {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const anchorElement = document.createElement("a");
  anchorElement.href = url;
  anchorElement.download = filename;
  anchorElement.click();
  URL.revokeObjectURL(url);
}

export interface BoardDataState<RowType> {
  rows?: RowType[];
  isLoading?: boolean;
  serverTotal?: number;
}

export interface BoardPaginationState {
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
  fetchNextPage?: () => void;
}

export interface BoardConfig<RowType> {
  columns?: BoardColumn[];
  rowKey?: (row: RowType, index: number) => string | number;
  renderRow: (row: RowType, context: RenderRowContext) => ReactNode;
  entityName?: string;
  storageKey?: string;
  emptyTips?: EmptyTip[];
}

export interface BoardActions<RowType> {
  exportRowsAsCSV?: (rows: RowType[]) => void;
  onAddFilter?: (filter: BoardFilter) => void;
  extraActions?: ReactNode;
}

export interface ObservabilityDataBoardProps<
  RowType extends Record<string, unknown> = Record<string, unknown>,
> {
  data?: BoardDataState<RowType>;
  pagination?: BoardPaginationState;
  config: BoardConfig<RowType>;
  actions?: BoardActions<RowType>;
}

/**
 * Generic observability data board with column controls, export, and incremental loading.
 */
export default function ObservabilityDataBoard<
  RowType extends Record<string, unknown> = Record<string, unknown>,
>({
  data = {},
  pagination = {},
  config,
  actions = {},
}: ObservabilityDataBoardProps<RowType>): JSX.Element {
  const { rows = [], isLoading = false, serverTotal } = data;
  const {
    columns = [],
    rowKey = (_row: RowType, index: number) => index,
    renderRow,
    entityName = "item",
    storageKey,
    emptyTips,
  } = config;
  const { exportRowsAsCSV, onAddFilter, extraActions } = actions;

  const defaultWidths = useMemo(() => createDefaultWidths(columns), [columns]);
  const { columnWidths: colWidths, handleResizeMouseDown } = useResizableColumns({
    initialWidths: defaultWidths,
    defaultWidth: DEFAULT_COLUMN_WIDTH,
    minWidth: MIN_COLUMN_WIDTH,
  });

  const defaultVisible = useMemo(() => createDefaultVisibleColumns(columns), [columns]);
  const [visibleCols, updateVisibleCols] = usePersistedColumns(defaultVisible, storageKey);

  const handleExportCSV = useCallback((): void => {
    if (rows.length === 0) return;

    if (exportRowsAsCSV) {
      exportRowsAsCSV(rows);
      return;
    }

    const visibleKeys = columns
      .filter((column) => visibleCols[column.key])
      .map((column) => column.key);
    const header = visibleKeys.join(",");
    const csvRows = rows.map((row) =>
      visibleKeys
        .map((columnKey) => `"${String(row[columnKey] ?? "").replace(/"/g, '""')}"`)
        .join(",")
    );

    downloadFile([header, ...csvRows].join("\n"), `${entityName}-${Date.now()}.csv`, "text/csv");
  }, [rows, exportRowsAsCSV, columns, visibleCols, entityName]);

  const handleExportJSON = useCallback((): void => {
    if (rows.length === 0) return;

    downloadFile(
      JSON.stringify(rows, null, 2),
      `${entityName}-${Date.now()}.json`,
      "application/json"
    );
  }, [rows, entityName]);

  const visibleColumns = columns.filter((column) => visibleCols[column.key]);
  const fixedColumns = visibleColumns.filter((column) => !column.flex);
  const flexColumn = visibleColumns.find((column) => column.flex);

  const displayCount = rows.length;
  const total = serverTotal ?? displayCount;

  const defaultEmptyTips: EmptyTip[] = [
    {
      num: 1,
      text: (
        <>
          Widen the <strong>time range</strong> in the top bar
        </>
      ),
    },
    {
      num: 2,
      text: (
        <>
          Remove active <strong>filters</strong> from the query bar
        </>
      ),
    },
    {
      num: 3,
      text: (
        <>
          Ensure your services are sending telemetry via <strong>OTLP</strong>
        </>
      ),
    },
  ];

  const tips = emptyTips ?? defaultEmptyTips;

  return (
    <div
      className="relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-xl border border-[color:var(--glass-border)] bg-[color:var(--glass-bg)]"
      style={{ backdropFilter: "var(--glass-blur)", WebkitBackdropFilter: "var(--glass-blur)" }}
    >
      <BoardActionBar
        entityName={entityName}
        displayCount={displayCount}
        total={total}
        extraActions={extraActions}
        rowsLength={rows.length}
        columns={columns}
        visibleCols={visibleCols}
        onToggleColumn={(columnKey: string) =>
          updateVisibleCols((previous) => ({
            ...previous,
            [columnKey]: !previous[columnKey],
          }))
        }
        onExportCSV={handleExportCSV}
        onExportJSON={handleExportJSON}
      />

      <div className="flex flex-1 flex-col overflow-hidden">
        {isLoading && rows.length === 0 ? (
          <BoardSkeleton
            fixedColumns={fixedColumns}
            flexColumn={flexColumn}
            colWidths={colWidths}
            rowCount={SKELETON_ROW_COUNT}
            randomWidth={randomSkeletonWidth}
            skeletonBaseWidth={SKELETON_BASE_WIDTH_PERCENT}
            skeletonWidthRange={SKELETON_WIDTH_RANGE_PERCENT}
            skeletonFlexBaseWidth={SKELETON_FLEX_BASE_WIDTH_PERCENT}
            skeletonFlexWidthRange={SKELETON_FLEX_WIDTH_RANGE_PERCENT}
          />
        ) : rows.length === 0 ? (
          <BoardEmptyState entityName={entityName} tips={tips} />
        ) : (
          <BoardTable
            rows={rows}
            fixedColumns={fixedColumns}
            flexColumn={flexColumn}
            colWidths={colWidths}
            rowKey={rowKey}
            renderRow={renderRow}
            visibleCols={visibleCols}
            onAddFilter={onAddFilter}
            handleResizeMouseDown={handleResizeMouseDown}
            entityName={entityName}
            pagination={pagination}
          />
        )}
      </div>
    </div>
  );
}

export {
  ObservabilityDetailPanel,
  type DetailPanelField,
  BoardClickableCell,
  type BoardClickableCellProps,
};
