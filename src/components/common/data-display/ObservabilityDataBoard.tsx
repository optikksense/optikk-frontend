import {
  Check,
  Clock,
  Copy,
  Filter,
  X,
} from 'lucide-react';
import {
  useCallback,
  useMemo,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react';

import { usePersistedColumns } from '@hooks/usePersistedColumns';
import { useResizableColumns } from '@hooks/useResizableColumns';
import {
  BoardActionBar,
  BoardEmptyState,
  BoardLoadMoreFooter,
  BoardSkeleton,
} from '@components/ui/data-board';

import './ObservabilityDataBoard.css';

const BOARD_ROW_HEIGHT = 32;
const BOARD_CHROME_HEIGHT = 72;
const DEFAULT_COLUMN_WIDTH = 160;
const MIN_COLUMN_WIDTH = 60;
const SKELETON_ROW_COUNT = 10;
const COPY_CONFIRMATION_DURATION_MS = 1500;
const EMPTY_VALUE_PLACEHOLDER = '—';
const SKELETON_BASE_WIDTH_PERCENT = 50;
const SKELETON_WIDTH_RANGE_PERCENT = 40;
const SKELETON_FLEX_BASE_WIDTH_PERCENT = 55;
const SKELETON_FLEX_WIDTH_RANGE_PERCENT = 35;

type BoardFilterValue = string | number | boolean;

type BoardFilterOperator = 'equals';

interface BoardFilter {
  field: string;
  value: BoardFilterValue;
  operator: BoardFilterOperator;
}

interface BoardColumn {
  key: string;
  label: string;
  defaultWidth?: number;
  defaultVisible?: boolean;
  flex?: boolean;
}

type ColumnWidths = Record<string, number>;

type VisibleColumns = Record<string, boolean>;

interface EmptyTip {
  num?: number;
  text: ReactNode;
}

interface RenderRowContext {
  colWidths: ColumnWidths;
  visibleCols: VisibleColumns;
  onAddFilter?: (filter: BoardFilter) => void;
}

/**
 * Calculates board height for a fixed number of data rows.
 * @param pageSize Number of rows shown in one page.
 * @returns Board height in pixels.
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

function isFilterValue(value: unknown): value is BoardFilterValue {
  return typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean';
}

function randomSkeletonWidth(basePercent: number, rangePercent: number): string {
  return `${basePercent + Math.random() * rangePercent}%`;
}

function downloadFile(content: string, filename: string, type: string): void {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const anchorElement = document.createElement('a');
  anchorElement.href = url;
  anchorElement.download = filename;
  anchorElement.click();
  URL.revokeObjectURL(url);
}

export interface BoardClickableCellProps {
  field: string;
  value?: BoardFilterValue | null;
  onAddFilter?: (filter: BoardFilter) => void;
  children: ReactNode;
  style?: CSSProperties;
}

/**
 * Clickable cell wrapper that emits an equals filter for the wrapped value.
 * @param props Cell props.
 * @returns Filterable or plain cell wrapper.
 */
export function BoardClickableCell({
  field,
  value,
  onAddFilter,
  children,
  style = {},
}: BoardClickableCellProps): JSX.Element {
  if (!onAddFilter || !isFilterValue(value) || value === '' || value === '-') {
    return <span style={style}>{children}</span>;
  }

  return (
    <span
      className="oboard__clickable-cell"
      style={style}
      onClick={(event) => {
        event.stopPropagation();
        onAddFilter({ field, value, operator: 'equals' });
      }}
      title={`Filter: ${field} = "${String(value)}"`}
    >
      {children}
      <Filter size={10} className="oboard__filter-icon" />
    </span>
  );
}

interface CopyableValueProps {
  value: unknown;
}

function CopyableValue({ value }: CopyableValueProps): JSX.Element {
  const [copied, setCopied] = useState(false);

  if (value === null || value === undefined || value === '') {
    return <span style={{ color: 'var(--text-muted)' }}>{EMPTY_VALUE_PLACEHOLDER}</span>;
  }

  const handleCopy = (): void => {
    if (!navigator.clipboard) return;

    // Clipboard copy is intentionally fire-and-forget for responsive UI.
    void navigator.clipboard
      .writeText(String(value))
      .then(() => {
        setCopied(true);
        window.setTimeout(() => {
          setCopied(false);
        }, COPY_CONFIRMATION_DURATION_MS);
      })
      .catch(() => undefined);
  };

  return (
    <div className="oboard__detail-field-value" onClick={handleCopy} title="Click to copy">
      <span>{String(value)}</span>
      {copied ? (
        <Check size={10} style={{ marginLeft: 6, color: 'var(--color-success)' }} />
      ) : (
        <Copy size={10} style={{ marginLeft: 6, opacity: 0.35 }} />
      )}
    </div>
  );
}

/**
 * Field metadata shown in the detail panel.
 */
export interface DetailPanelField {
  key: string;
  label: string;
  value: unknown;
  filterable?: boolean;
}

interface ObservabilityDetailPanelProps {
  title?: string;
  titleBadge?: ReactNode;
  metaLine?: string;
  metaRight?: string;
  summary?: string;
  summaryNode?: ReactNode;
  fields?: DetailPanelField[];
  actions?: ReactNode;
  rawData?: unknown;
  onClose: () => void;
  onAddFilter?: (filter: BoardFilter) => void;
}

/**
 * Side detail panel for an observability row.
 * @param props Detail panel props.
 * @returns Detail panel UI.
 */
export function ObservabilityDetailPanel({
  title = 'Detail',
  titleBadge,
  metaLine,
  metaRight,
  summary,
  summaryNode,
  fields = [],
  actions,
  rawData,
  onClose,
  onAddFilter,
}: ObservabilityDetailPanelProps): JSX.Element {
  const [tab, setTab] = useState<'fields' | 'json'>('fields');

  return (
    <div className="oboard__detail-overlay" onClick={(event) => event.stopPropagation()}>
      <div className="oboard__detail-header">
        <div className="oboard__detail-title">
          {title}
          {titleBadge}
        </div>
        <button className="oboard__detail-close" onClick={onClose}>
          <X size={18} />
        </button>
      </div>

      {metaLine && (
        <div className="oboard__detail-meta">
          <Clock size={12} />
          <span>{metaLine}</span>
          {metaRight && <span className="oboard__detail-meta-right">{metaRight}</span>}
        </div>
      )}

      {(summary || summaryNode) && <div className="oboard__detail-summary">{summaryNode || summary}</div>}

      {actions && <div className="oboard__detail-actions">{actions}</div>}

      <div className="oboard__detail-tabs">
        {(['fields', 'json'] as const).map((tabKey) => (
          <button
            key={tabKey}
            className={`oboard__detail-tab ${tab === tabKey ? 'oboard__detail-tab--active' : ''}`}
            onClick={() => setTab(tabKey)}
          >
            {tabKey === 'fields' ? 'Fields' : 'JSON'}
          </button>
        ))}
      </div>

      <div className="oboard__detail-body">
        {tab === 'fields' && (
          <div className="oboard__detail-fields">
            {fields.map(({ key, label, value, filterable }) => {
              const canFilter = Boolean(filterable && onAddFilter && isFilterValue(value));

              return (
                <div key={key} className="oboard__detail-field">
                  <div className="oboard__detail-field-label">
                    {label}
                    {canFilter && (
                      <button
                        className="oboard__detail-filter-btn"
                        onClick={() => {
                          if (onAddFilter && isFilterValue(value)) {
                            onAddFilter({ field: key, value, operator: 'equals' });
                          }
                        }}
                        title={`Filter by ${label} = "${String(value)}"`}
                      >
                        <Filter size={10} />
                      </button>
                    )}
                  </div>
                  <CopyableValue value={value} />
                </div>
              );
            })}
          </div>
        )}

        {tab === 'json' && <pre className="oboard__detail-json">{JSON.stringify(rawData, null, 2)}</pre>}
      </div>
    </div>
  );
}

interface ObservabilityDataBoardProps<
  RowType extends Record<string, unknown> = Record<string, unknown>,
> {
  columns?: BoardColumn[];
  rows?: RowType[];
  rowKey?: (row: RowType, index: number) => string | number;
  renderRow: (row: RowType, context: RenderRowContext) => ReactNode;
  entityName?: string;
  storageKey?: string;
  isLoading?: boolean;
  serverTotal?: number;
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
  fetchNextPage?: () => void;
  exportRowsAsCSV?: (rows: RowType[]) => void;
  emptyTips?: EmptyTip[];
  onAddFilter?: (filter: BoardFilter) => void;
  extraActions?: ReactNode;
}

/**
 * Generic observability data board with column controls, export, and incremental loading.
 * @param props Board props.
 * @returns Enterprise table UI for logs/traces/services/infrastructure pages.
 */
export default function ObservabilityDataBoard<
  RowType extends Record<string, unknown> = Record<string, unknown>,
>({
  columns = [],
  rows = [],
  rowKey = (_row: RowType, index: number) => index,
  renderRow,
  entityName = 'item',
  storageKey,
  isLoading = false,
  serverTotal,
  hasNextPage = false,
  isFetchingNextPage = false,
  fetchNextPage,
  exportRowsAsCSV,
  emptyTips,
  onAddFilter,
  extraActions,
}: ObservabilityDataBoardProps<RowType>): JSX.Element {
  const defaultWidths = useMemo(() => createDefaultWidths(columns), [columns]);
  const {
    columnWidths: colWidths,
    handleResizeMouseDown,
  } = useResizableColumns({
    initialWidths: defaultWidths,
    defaultWidth: DEFAULT_COLUMN_WIDTH,
    minWidth: MIN_COLUMN_WIDTH,
  });

  const defaultVisible = useMemo(() => createDefaultVisibleColumns(columns), [columns]);
  const [visibleCols, updateVisibleCols] = usePersistedColumns(
    defaultVisible,
    storageKey,
  );

  const handleExportCSV = useCallback((): void => {
    if (rows.length === 0) return;

    if (exportRowsAsCSV) {
      exportRowsAsCSV(rows);
      return;
    }

    const visibleKeys = columns
      .filter((column) => visibleCols[column.key])
      .map((column) => column.key);
    const header = visibleKeys.join(',');
    const csvRows = rows.map((row) =>
      visibleKeys
        .map((columnKey) => `"${String(row[columnKey] ?? '').replace(/"/g, '""')}"`)
        .join(','),
    );

    downloadFile([
      header,
      ...csvRows,
    ].join('\n'), `${entityName}-${Date.now()}.csv`, 'text/csv');
  }, [rows, exportRowsAsCSV, columns, visibleCols, entityName]);

  const handleExportJSON = useCallback((): void => {
    if (rows.length === 0) return;

    downloadFile(
      JSON.stringify(rows, null, 2),
      `${entityName}-${Date.now()}.json`,
      'application/json',
    );
  }, [rows, entityName]);

  const visibleColumns = columns.filter((column) => visibleCols[column.key]);
  const fixedColumns = visibleColumns.filter((column) => !column.flex);
  const flexColumn = visibleColumns.find((column) => column.flex);

  const displayCount = rows.length;
  const total = serverTotal ?? displayCount;

  const defaultEmptyTips: EmptyTip[] = [
    { num: 1, text: <>Widen the <strong>time range</strong> in the top bar</> },
    { num: 2, text: <>Remove active <strong>filters</strong> from the query bar</> },
    {
      num: 3,
      text: <>Ensure your services are sending telemetry via <strong>OTLP</strong></>,
    },
  ];

  const tips = emptyTips ?? defaultEmptyTips;

  return (
    <div className="oboard">
      <BoardActionBar
        entityName={entityName}
        displayCount={displayCount}
        total={total}
        extraActions={extraActions}
        rowsLength={rows.length}
        columns={columns}
        visibleCols={visibleCols}
        onToggleColumn={(columnKey) =>
          updateVisibleCols((previous) => ({
            ...previous,
            [columnKey]: !previous[columnKey],
          }))
        }
        onExportCSV={handleExportCSV}
        onExportJSON={handleExportJSON}
      />

      <div className="oboard__table">
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
          <div className="oboard__tbody">
            <div className="oboard__thead">
              {fixedColumns.map((column) => (
                <div key={column.key} className="oboard__th" style={{ width: colWidths[column.key] }}>
                  {column.label}
                  <div
                    className="oboard__resizer"
                    onMouseDown={(event) => handleResizeMouseDown(event, column.key)}
                  />
                </div>
              ))}
              {flexColumn && <div className="oboard__th oboard__th--flex">{flexColumn.label}</div>}
            </div>

            {rows.map((row, index) => (
              <div key={rowKey(row, index)} className="oboard__row">
                {renderRow(row, { colWidths, visibleCols, onAddFilter })}
              </div>
            ))}

            <BoardLoadMoreFooter
              entityName={entityName}
              hasNextPage={hasNextPage}
              isFetchingNextPage={isFetchingNextPage}
              onFetchNextPage={fetchNextPage}
            />
          </div>
        )}
      </div>
    </div>
  );
}
