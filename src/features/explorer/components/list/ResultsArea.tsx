import { Button } from "@shared/components/primitives/ui";
import { AlertCircle, Columns3 } from "lucide-react";
import { memo } from "react";

import type { ColumnConfig, ColumnDef } from "../../types/results";
import { ResultsColumnPicker } from "./ResultsColumnPicker";
import { ResultsEmptyState } from "./ResultsEmptyState";
import { ResultsHeader } from "./ResultsHeader";
import { ResultsLoadingRows } from "./ResultsLoadingRows";
import { ResultsVirtualList } from "./ResultsVirtualList";

interface Props<Row> {
  readonly rows: readonly Row[];
  readonly columns: readonly ColumnDef<Row>[];
  readonly config: readonly ColumnConfig[];
  readonly onConfigChange: (next: readonly ColumnConfig[]) => void;
  readonly getRowId: (row: Row) => string;
  readonly selectedId?: string | null;
  readonly onRowClick?: (row: Row) => void;
  readonly resetKey?: string;
  readonly loading?: boolean;
  readonly emptyTitle?: string;
  readonly emptyDescription?: string;
  /** When set (e.g. React Query error), show an error panel instead of the generic empty state. */
  readonly queryError?: string | null;
  readonly onRetry?: () => void;
}

/**
 * Sticky column header + embedded column-picker popover + virtualized row
 * body. Header is purely presentational; the picker icon sits in the
 * `trailing` slot so Radix Popover.Trigger anchors on a single <button>
 * (no nested-button issues).
 */
function ResultsAreaImpl<Row>(props: Props<Row>) {
  const {
    rows,
    columns,
    config,
    onConfigChange,
    getRowId,
    selectedId,
    onRowClick,
    resetKey,
    loading,
    emptyTitle,
    emptyDescription,
    queryError,
    onRetry,
  } = props;
  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <ResultsHeader
        columns={columns}
        config={config}
        trailing={
          <ResultsColumnPicker
            columns={columns}
            config={config}
            onChange={onConfigChange}
            trigger={
              <button
                type="button"
                aria-label="Configure columns"
                className="rounded p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              >
                <Columns3 size={14} />
              </button>
            }
          />
        }
      />
      {queryError && !loading && rows.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 px-4 py-8 text-center">
          <AlertCircle className="text-[var(--color-error,#ef4444)]" size={28} />
          <span className="font-medium text-[13px] text-[var(--color-error,#ef4444)]">
            Could not load results
          </span>
          <span className="max-w-lg whitespace-pre-wrap break-words font-mono text-[11px] text-[var(--text-muted)]">
            {queryError}
          </span>
          {onRetry ? (
            <Button type="button" variant="secondary" onClick={onRetry}>
              Retry
            </Button>
          ) : null}
        </div>
      ) : loading && rows.length === 0 ? (
        <ResultsLoadingRows />
      ) : rows.length === 0 ? (
        <ResultsEmptyState title={emptyTitle} description={emptyDescription} />
      ) : (
        <ResultsVirtualList<Row>
          rows={rows}
          columns={columns}
          config={config}
          getRowId={getRowId}
          selectedId={selectedId}
          onRowClick={onRowClick}
          resetKey={resetKey}
        />
      )}
    </div>
  );
}

export const ResultsArea = memo(ResultsAreaImpl) as <Row>(props: Props<Row>) => JSX.Element;
