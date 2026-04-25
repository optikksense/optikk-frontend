import { useVirtualizer } from "@tanstack/react-virtual";
import { memo, useEffect, useRef } from "react";

import type { ColumnConfig, ColumnDef } from "../../types/results";
import { ResultsRow } from "./ResultsRow";

interface Props<Row> {
  readonly rows: readonly Row[];
  readonly columns: readonly ColumnDef<Row>[];
  readonly config: readonly ColumnConfig[];
  readonly rowHeight?: number;
  readonly overscan?: number;
  readonly getRowId: (row: Row) => string;
  readonly selectedId?: string | null;
  readonly onRowClick?: (row: Row) => void;
  /** Key that changes whenever the filter set changes; scrolls back to 0. */
  readonly resetKey?: string;
  readonly onNearEnd?: () => void;
  readonly getRowClassName?: (row: Row) => string;
}

function ResultsVirtualListImpl<Row>(props: Props<Row>) {
  const {
    rows,
    columns,
    config,
    rowHeight = 32,
    overscan = 12,
    getRowId,
    selectedId,
    onRowClick,
    resetKey,
    onNearEnd,
    getRowClassName,
  } = props;
  const parentRef = useRef<HTMLDivElement>(null);
  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => rowHeight,
    overscan,
  });

  useEffect(() => {
    parentRef.current?.scrollTo({ top: 0 });
  }, [resetKey]);

  useEffect(() => {
    if (!onNearEnd) return;
    const items = virtualizer.getVirtualItems();
    const last = items.at(-1);
    if (last && last.index >= rows.length - 4) onNearEnd();
  }, [virtualizer, rows.length, onNearEnd]);

  return (
    <div ref={parentRef} className="relative flex-1 overflow-auto">
      <div style={{ height: virtualizer.getTotalSize(), position: "relative", width: "100%" }}>
        {virtualizer.getVirtualItems().map((item) => {
          const row = rows[item.index];
          if (!row) return null;
          const id = getRowId(row);
          return (
            <div
              key={item.key}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                transform: `translateY(${item.start}px)`,
              }}
            >
              <ResultsRow
                row={row}
                columns={columns}
                config={config}
                onClick={onRowClick}
                selected={selectedId === id}
                extraClassName={getRowClassName?.(row)}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

export const ResultsVirtualList = memo(ResultsVirtualListImpl) as <Row>(
  props: Props<Row>
) => JSX.Element;
