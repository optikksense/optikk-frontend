import { Popover } from 'antd';
import { Check, Settings2 } from 'lucide-react';

interface BoardColumnSettingsPopoverProps {
  columns: Array<{ key: string; label: string }>;
  visibleCols: Record<string, boolean>;
  onToggle: (columnKey: string) => void;
}

/**
 *
 * @param root0
 * @param root0.columns
 * @param root0.visibleCols
 * @param root0.onToggle
 */
export default function BoardColumnSettingsPopover({
  columns,
  visibleCols,
  onToggle,
}: BoardColumnSettingsPopoverProps) {
  return (
    <Popover
      content={(
        <div className="oboard__col-settings">
          {columns.map((column) => {
            const checked = Boolean(visibleCols[column.key]);
            return (
              <div
                key={column.key}
                className={`oboard__col-setting-item ${checked ? 'checked' : ''}`}
                onClick={() => onToggle(column.key)}
              >
                <span className="oboard__col-cb">{checked ? <Check size={9} /> : null}</span>
                {column.label}
              </div>
            );
          })}
        </div>
      )}
      title="Columns"
      trigger="click"
      placement="bottomRight"
    >
      <button className="oboard__btn">
        <Settings2 size={13} /> Columns
      </button>
    </Popover>
  );
}
