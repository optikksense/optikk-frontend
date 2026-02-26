import { Button, Space, Tag, Tooltip } from 'antd';
import { Save, X, Plus, Undo2, History, Share2, Settings } from 'lucide-react';

export default function DashboardBuilderToolbar({
  isDirty,
  canUndo,
  saving,
  onSave,
  onDiscard,
  onAddPanel,
  onUndo,
  onVersionHistory,
  onShare,
  onSettings,
}) {
  return (
    <div className="builder-toolbar">
      <div className="builder-toolbar-left">
        <Tag color="blue" style={{ margin: 0 }}>Edit Mode</Tag>
        {isDirty && <Tag color="orange" style={{ margin: 0 }}>Unsaved changes</Tag>}
      </div>
      <div className="builder-toolbar-right">
        <Space size="small">
          {onSettings && (
            <Tooltip title="Dashboard Settings">
              <Button icon={<Settings size={14} />} onClick={onSettings} size="small">
                Settings
              </Button>
            </Tooltip>
          )}
          {onVersionHistory && (
            <Tooltip title="Version History">
              <Button icon={<History size={14} />} onClick={onVersionHistory} size="small">
                History
              </Button>
            </Tooltip>
          )}
          {onShare && (
            <Tooltip title="Share Dashboard">
              <Button icon={<Share2 size={14} />} onClick={onShare} size="small">
                Share
              </Button>
            </Tooltip>
          )}
          <Tooltip title="Undo">
            <Button
              icon={<Undo2 size={14} />}
              onClick={onUndo}
              disabled={!canUndo}
              size="small"
            />
          </Tooltip>
          <Button icon={<Plus size={14} />} onClick={onAddPanel} size="small">
            Add Panel
          </Button>
          <Button icon={<X size={14} />} onClick={onDiscard} size="small">
            Discard
          </Button>
          <Button
            type="primary"
            icon={<Save size={14} />}
            onClick={onSave}
            loading={saving}
            disabled={!isDirty}
            size="small"
          >
            Save
          </Button>
        </Space>
      </div>
    </div>
  );
}
