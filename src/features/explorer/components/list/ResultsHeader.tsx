import { Columns3 } from "lucide-react";
import { type ReactNode, memo } from "react";

import type { ColumnConfig, ColumnDef } from "../../types/results";

interface Props<Row> {
  readonly columns: readonly ColumnDef<Row>[];
  readonly config: readonly ColumnConfig[];
  readonly onOpenPicker?: () => void;
  readonly trailing?: ReactNode;
}

function ResultsHeaderImpl<Row>({ columns, config, onOpenPicker, trailing }: Props<Row>) {
  const visibleConfig = config.filter((entry) => entry.visible);
  const columnByKey = new Map(columns.map((column) => [column.key, column]));
  return (
    <div
      role="row"
      className="sticky top-0 z-10 flex h-8 items-center gap-2 border-border border-b bg-secondary px-3 font-semibold text-[11px] text-foreground-secondary uppercase tracking-wider"
    >
      {visibleConfig.map((entry) => {
        const column = columnByKey.get(entry.key);
        const width = entry.width ?? column?.width;
        return (
          <div
            role="columnheader"
            key={entry.key}
            className="min-w-0 flex-1 truncate"
            style={width ? { flex: `0 0 ${width}px`, maxWidth: width } : undefined}
          >
            {column?.label ?? entry.key}
          </div>
        );
      })}
      <div className="ml-auto flex shrink-0 items-center gap-1">
        {trailing}
        {onOpenPicker ? (
          <button
            type="button"
            aria-label="Configure columns"
            onClick={onOpenPicker}
            className="rounded p-1 text-foreground-muted hover:text-foreground"
          >
            <Columns3 size={14} />
          </button>
        ) : null}
      </div>
    </div>
  );
}

export const ResultsHeader = memo(ResultsHeaderImpl) as <Row>(props: Props<Row>) => JSX.Element;
