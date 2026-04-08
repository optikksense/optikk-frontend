import type { ReactNode } from "react";

import BoardColumnSettingsPopover from "./BoardColumnSettingsPopover";
import BoardExportMenu from "./BoardExportMenu";

interface BoardActionBarProps {
  entityName: string;
  displayCount: number;
  total: number;
  extraActions?: ReactNode;
  rowsLength: number;
  columns: Array<{ key: string; label: string }>;
  visibleCols: Record<string, boolean>;
  onToggleColumn: (columnKey: string) => void;
  onExportCSV: () => void;
  onExportJSON: () => void;
}

/**
 *
 * @param root0
 * @param root0.entityName
 * @param root0.displayCount
 * @param root0.total
 * @param root0.extraActions
 * @param root0.rowsLength
 * @param root0.columns
 * @param root0.visibleCols
 * @param root0.onToggleColumn
 * @param root0.onExportCSV
 * @param root0.onExportJSON
 */
export default function BoardActionBar({
  entityName,
  displayCount,
  total,
  extraActions,
  rowsLength,
  columns,
  visibleCols,
  onToggleColumn,
  onExportCSV,
  onExportJSON,
}: BoardActionBarProps) {
  return (
    <div className="flex shrink-0 items-center justify-between gap-[10px] border-[color:var(--glass-border)] border-b bg-transparent px-4 py-[7px]">
      <div className="flex items-center gap-[7px] text-muted-foreground text-xs">
        <span className="inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-success" />
        <span className="font-medium text-[color:var(--text-secondary)]">
          {displayCount.toLocaleString()} {entityName}
          {displayCount !== 1 ? "s" : ""}
        </span>
        {total > 0 && total !== displayCount && (
          <span className="text-muted-foreground">of {total.toLocaleString()}</span>
        )}
      </div>

      <div className="ml-auto flex items-center gap-1.5">
        {extraActions}

        <BoardExportMenu
          entityName={entityName}
          rowsLength={rowsLength}
          onExportCSV={onExportCSV}
          onExportJSON={onExportJSON}
        />

        <BoardColumnSettingsPopover
          columns={columns}
          visibleCols={visibleCols}
          onToggle={onToggleColumn}
        />
      </div>
    </div>
  );
}
