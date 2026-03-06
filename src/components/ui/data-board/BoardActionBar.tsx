import { ReactNode } from 'react';

import BoardColumnSettingsPopover from './BoardColumnSettingsPopover';
import BoardExportMenu from './BoardExportMenu';

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
    <div className="oboard__action-bar">
      <div className="oboard__count">
        <span className="oboard__count-dot" />
        <span className="oboard__count-label">
          {displayCount.toLocaleString()} {entityName}{displayCount !== 1 ? 's' : ''}
        </span>
        {total > 0 && total !== displayCount && (
          <span className="oboard__count-total">of {total.toLocaleString()}</span>
        )}
      </div>

      <div className="oboard__actions">
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
