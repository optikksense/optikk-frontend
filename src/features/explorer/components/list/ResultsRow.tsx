import { type ReactNode, memo } from "react";

import type { ColumnConfig, ColumnDef } from "../../types/results";

interface Props<Row> {
  readonly row: Row;
  readonly columns: readonly ColumnDef<Row>[];
  readonly config: readonly ColumnConfig[];
  readonly onClick?: (row: Row) => void;
  readonly onContextMenu?: (row: Row, x: number, y: number) => void;
  readonly selected?: boolean;
  readonly extraClassName?: string;
  readonly extraStyle?: React.CSSProperties;
  readonly heightPx?: number;
}

function cellContent<Row>(column: ColumnDef<Row> | undefined, row: Row): ReactNode {
  if (!column) return null;
  return column.render(row);
}

function ResultsRowImpl<Row>({
  row,
  columns,
  config,
  onClick,
  onContextMenu,
  selected,
  extraClassName,
  extraStyle,
  heightPx,
}: Props<Row>) {
  const visibleConfig = config.filter((entry) => entry.visible);
  const columnByKey = new Map(columns.map((column) => [column.key, column]));
  return (
    <div
      role="row"
      aria-selected={selected}
      onClick={onClick ? () => onClick(row) : undefined}
      onContextMenu={
        onContextMenu
          ? (event) => {
              event.preventDefault();
              onContextMenu(row, event.clientX, event.clientY);
            }
          : undefined
      }
      onKeyDown={
        onClick
          ? (event) => {
              if (event.key === "Enter") onClick(row);
            }
          : undefined
      }
      tabIndex={onClick ? 0 : -1}
      style={{ ...extraStyle, ...(heightPx ? { height: heightPx } : undefined) }}
      className={`flex h-7 cursor-pointer items-center gap-2 border-[var(--border-color)] border-b px-3 text-[12px] hover:bg-[var(--bg-hover)] ${
        selected ? "bg-[var(--color-primary-subtle-12)]" : ""
      } ${extraClassName ?? ""}`}
    >
      {visibleConfig.map((entry) => {
        const column = columnByKey.get(entry.key);
        const width = entry.width ?? column?.width;
        return (
          <div
            role="cell"
            key={entry.key}
            className="min-w-0 flex-1 truncate"
            style={width ? { flex: `0 0 ${width}px`, maxWidth: width } : undefined}
          >
            {cellContent(column, row)}
          </div>
        );
      })}
    </div>
  );
}

export const ResultsRow = memo(ResultsRowImpl) as <Row>(props: Props<Row>) => JSX.Element;
