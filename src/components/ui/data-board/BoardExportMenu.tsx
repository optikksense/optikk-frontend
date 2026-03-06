import { Popover } from 'antd';
import { Download } from 'lucide-react';

interface BoardExportMenuProps {
  entityName: string;
  rowsLength: number;
  onExportCSV: () => void;
  onExportJSON: () => void;
}

/**
 *
 * @param root0
 * @param root0.entityName
 * @param root0.rowsLength
 * @param root0.onExportCSV
 * @param root0.onExportJSON
 */
export default function BoardExportMenu({
  entityName,
  rowsLength,
  onExportCSV,
  onExportJSON,
}: BoardExportMenuProps) {
  return (
    <Popover
      content={(
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, padding: '4px 0' }}>
          <button
            className="oboard__btn"
            onClick={onExportCSV}
            disabled={rowsLength === 0}
            style={{ width: '100%', justifyContent: 'flex-start' }}
          >
            Export as CSV
          </button>
          <button
            className="oboard__btn"
            onClick={onExportJSON}
            disabled={rowsLength === 0}
            style={{ width: '100%', justifyContent: 'flex-start' }}
          >
            Export as JSON
          </button>
        </div>
      )}
      title={`Export ${entityName}s`}
      trigger="click"
      placement="bottomRight"
    >
      <button className="oboard__btn" disabled={rowsLength === 0}>
        <Download size={13} /> Export
      </button>
    </Popover>
  );
}
