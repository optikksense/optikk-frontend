import { useState } from 'react';
import { Button, Space, Popconfirm } from 'antd';
import { CheckCircle2, XCircle, BellOff } from 'lucide-react';
import MuteDialog from './MuteDialog';

export default function AlertActions({ alert, onAcknowledge, onResolve, onMuteWithReason, loading }) {
  const [muteDialogOpen, setMuteDialogOpen] = useState(false);
  const status = alert.status?.toUpperCase();

  const handleMuteConfirm = (minutes, reason) => {
    setMuteDialogOpen(false);
    onMuteWithReason(alert.id, minutes, reason);
  };

  return (
    <>
      <Space size="small">
        {status === 'ACTIVE' && (
          <Button
            size="small"
            icon={<CheckCircle2 size={14} />}
            onClick={() => onAcknowledge(alert.id)}
            loading={loading}
          >
            Ack
          </Button>
        )}
        {(status === 'ACTIVE' || status === 'ACKNOWLEDGED') && (
          <Popconfirm
            title="Resolve this alert?"
            onConfirm={() => onResolve(alert.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button size="small" icon={<XCircle size={14} />} loading={loading}>
              Resolve
            </Button>
          </Popconfirm>
        )}
        {status !== 'MUTED' && status !== 'RESOLVED' && (
          <Button
            size="small"
            icon={<BellOff size={14} />}
            onClick={() => setMuteDialogOpen(true)}
            loading={loading}
          >
            Mute
          </Button>
        )}
      </Space>

      <MuteDialog
        open={muteDialogOpen}
        onCancel={() => setMuteDialogOpen(false)}
        onConfirm={handleMuteConfirm}
        loading={loading}
      />
    </>
  );
}
