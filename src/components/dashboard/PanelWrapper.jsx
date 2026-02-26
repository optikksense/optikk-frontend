import { Button, Tooltip, Popconfirm } from 'antd';
import { GripHorizontal, Pencil, Trash2, Copy } from 'lucide-react';

/**
 * Wraps a panel in edit mode with a drag handle and action buttons.
 * The drag handle class "panel-drag-handle" is referenced by react-grid-layout's draggableHandle.
 */
export default function PanelWrapper({ children, panelId, title, onEdit, onDelete, onDuplicate }) {
  return (
    <div className="panel-wrapper">
      <div className="panel-drag-handle">
        <GripHorizontal size={14} />
        <span className="panel-drag-title">{title}</span>
        <div className="panel-actions" onMouseDown={(e) => e.stopPropagation()}>
          <Tooltip title="Duplicate">
            <Button
              type="text"
              size="small"
              icon={<Copy size={13} />}
              onClick={() => onDuplicate?.(panelId)}
              className="panel-action-btn"
            />
          </Tooltip>
          <Tooltip title="Edit">
            <Button
              type="text"
              size="small"
              icon={<Pencil size={13} />}
              onClick={() => onEdit?.(panelId)}
              className="panel-action-btn"
            />
          </Tooltip>
          <Popconfirm
            title="Delete this panel?"
            onConfirm={() => onDelete?.(panelId)}
            okText="Delete"
            okType="danger"
            placement="topRight"
          >
            <Tooltip title="Delete">
              <Button
                type="text"
                size="small"
                icon={<Trash2 size={13} />}
                className="panel-action-btn panel-action-btn-danger"
              />
            </Tooltip>
          </Popconfirm>
        </div>
      </div>
      <div className="panel-content">
        {children}
      </div>
    </div>
  );
}
