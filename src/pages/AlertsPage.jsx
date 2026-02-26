import { useState, useMemo } from 'react';
import { Card, Button, Segmented, Drawer, Descriptions, Tag, Steps, Divider, Typography } from 'antd';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Bell, Plus, List, Clock, Layers, BellOff, CheckCircle2 } from 'lucide-react';
import { alertService } from '@services/alertService';
import { ALERT_SEVERITIES, ALERT_STATUSES } from '@config/constants';
import { formatTimestamp } from '@utils/formatters';
import PageHeader from '@components/common/PageHeader';
import FilterBar from '@components/common/FilterBar';
import DataTable from '@components/common/DataTable';
import AlertActions from '@components/alerts/AlertActions';
import CreateAlertModal from '@components/alerts/CreateAlertModal';
import MuteDialog from '@components/alerts/MuteDialog';
import Timeline from '@components/common/Timeline';
import toast from 'react-hot-toast';
import './AlertsPage.css';

export default function AlertsPage() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState('table');
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [detailDrawerOpen, setDetailDrawerOpen] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [bulkMuteOpen, setBulkMuteOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['alerts', statusFilter],
    queryFn: () => alertService.getAlerts(statusFilter),
  });

  const { data: activeCount } = useQuery({
    queryKey: ['alerts-active-count'],
    queryFn: () => alertService.getActiveAlertCount(),
    refetchInterval: 30000,
  });

  const invalidateAlerts = () => {
    queryClient.invalidateQueries({ queryKey: ['alerts'] });
    queryClient.invalidateQueries({ queryKey: ['alerts-active-count'] });
  };

  const createMutation = useMutation({
    mutationFn: (data) => alertService.createAlert(data),
    onSuccess: () => { toast.success('Alert created'); setCreateModalOpen(false); invalidateAlerts(); },
    onError: (err) => toast.error(err.message || 'Failed to create alert'),
  });

  const ackMutation = useMutation({
    mutationFn: (id) => alertService.acknowledgeAlert(id),
    onSuccess: () => { toast.success('Alert acknowledged'); invalidateAlerts(); },
    onError: (err) => toast.error(err.message || 'Failed'),
  });

  const resolveMutation = useMutation({
    mutationFn: (id) => alertService.resolveAlert(id),
    onSuccess: () => { toast.success('Alert resolved'); invalidateAlerts(); },
    onError: (err) => toast.error(err.message || 'Failed'),
  });

  const muteWithReasonMutation = useMutation({
    mutationFn: ({ id, minutes, reason }) => alertService.muteAlertWithReason(id, minutes, reason),
    onSuccess: () => { toast.success('Alert muted'); invalidateAlerts(); },
    onError: (err) => toast.error(err.message || 'Failed'),
  });

  const bulkMuteMutation = useMutation({
    mutationFn: ({ ids, minutes, reason }) => alertService.bulkMuteAlerts(ids, minutes, reason),
    onSuccess: () => {
      toast.success(`${selectedRowKeys.length} alert(s) muted`);
      setSelectedRowKeys([]);
      setBulkMuteOpen(false);
      invalidateAlerts();
    },
    onError: (err) => toast.error(err.message || 'Bulk mute failed'),
  });

  const bulkResolveMutation = useMutation({
    mutationFn: (ids) => alertService.bulkResolveAlerts(ids),
    onSuccess: () => {
      toast.success(`${selectedRowKeys.length} alert(s) resolved`);
      setSelectedRowKeys([]);
      invalidateAlerts();
    },
    onError: (err) => toast.error(err.message || 'Bulk resolve failed'),
  });

  const actionLoading = ackMutation.isPending || resolveMutation.isPending || muteWithReasonMutation.isPending;

  const severityColor = (sev) => ALERT_SEVERITIES.find((s) => s.value === sev)?.color || '#98A2B3';
  const statusColor = (status) => ALERT_STATUSES.find((s) => s.value === status?.toUpperCase())?.color || '#98A2B3';

  const alerts = Array.isArray(data) ? data : data?.content || [];

  const timelineItems = useMemo(() => alerts.map((alert) => ({
    title: alert.name,
    timestamp: alert.triggeredAt,
    description: alert.condition || `${alert.metric} ${alert.operator} ${alert.threshold}`,
    color: severityColor(alert.severity),
    tags: [
      { label: alert.severity?.toUpperCase(), color: severityColor(alert.severity) },
      { label: alert.status?.toUpperCase(), color: statusColor(alert.status) },
      ...(alert.serviceName ? [{ label: alert.serviceName, color: 'var(--color-primary, #5E60CE)' }] : []),
    ],
  })), [alerts]);

  const groupedAlerts = useMemo(() => {
    const groups = { critical: [], warning: [], info: [] };
    alerts.forEach((a) => {
      const sev = a.severity?.toLowerCase();
      if (groups[sev] !== undefined) groups[sev].push(a);
      else groups.info.push(a);
    });
    return groups;
  }, [alerts]);

  const openDetail = (alert) => {
    setSelectedAlert(alert);
    setDetailDrawerOpen(true);
  };

  const getAlertStep = (status) => {
    const steps = ['ACTIVE', 'ACKNOWLEDGED', 'RESOLVED'];
    const idx = steps.indexOf(status?.toUpperCase());
    return idx >= 0 ? idx : 0;
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      width: 200,
      render: (name, record) => (
        <a onClick={() => openDetail(record)} style={{ fontWeight: 600 }}>{name}</a>
      ),
    },
    {
      title: 'Severity',
      dataIndex: 'severity',
      key: 'severity',
      width: 100,
      render: (sev) => (
        <Tag color={severityColor(sev)} style={{ color: '#fff' }}>{sev?.toUpperCase()}</Tag>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status) => (
        <Tag color={statusColor(status)} style={{ color: '#fff' }}>{status?.toUpperCase()}</Tag>
      ),
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      width: 80,
      render: (type) => <span style={{ textTransform: 'capitalize' }}>{type}</span>,
    },
    {
      title: 'Service',
      dataIndex: 'serviceName',
      key: 'serviceName',
      width: 150,
    },
    {
      title: 'Condition',
      key: 'condition',
      width: 180,
      render: (_, record) => {
        if (record.metric && record.operator && record.threshold != null) {
          return <code>{record.metric} {record.operator} {record.threshold}</code>;
        }
        return record.condition || '-';
      },
    },
    {
      title: 'Triggered',
      dataIndex: 'triggeredAt',
      key: 'triggeredAt',
      width: 160,
      render: (ts) => ts ? formatTimestamp(ts) : '-',
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 200,
      render: (_, record) => (
        <AlertActions
          alert={record}
          onAcknowledge={(id) => ackMutation.mutate(id)}
          onResolve={(id) => resolveMutation.mutate(id)}
          onMuteWithReason={(id, minutes, reason) => muteWithReasonMutation.mutate({ id, minutes, reason })}
          loading={actionLoading}
        />
      ),
    },
  ];

  const SeverityGroup = ({ severity, alerts: groupAlerts }) => {
    if (!groupAlerts.length) return null;
    const sev = ALERT_SEVERITIES.find((s) => s.value === severity);
    return (
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: sev?.color }} />
          <Typography.Text strong style={{ color: sev?.color, fontSize: 14 }}>
            {sev?.label} ({groupAlerts.length})
          </Typography.Text>
        </div>
        <DataTable
          columns={columns}
          data={groupAlerts}
          rowKey="id"
          pagination={false}
          scroll={{ x: 1100 }}
          onRow={(record) => ({ onClick: () => openDetail(record), style: { cursor: 'pointer' } })}
        />
        <Divider style={{ margin: '16px 0' }} />
      </div>
    );
  };

  return (
    <div className="alerts-page">
      <PageHeader
        title="Alerts"
        icon={<Bell size={24} />}
        badge={activeCount}
        actions={
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <Segmented
              value={viewMode}
              onChange={setViewMode}
              options={[
                { value: 'table', icon: <List size={14} />, label: 'Table' },
                { value: 'grouped', icon: <Layers size={14} />, label: 'Grouped' },
                { value: 'timeline', icon: <Clock size={14} />, label: 'Timeline' },
              ]}
            />
            <Button type="primary" icon={<Plus size={16} />} onClick={() => setCreateModalOpen(true)}>
              Create Alert
            </Button>
          </div>
        }
      />

      <FilterBar
        filters={[
          {
            type: 'select',
            key: 'status',
            placeholder: 'All statuses',
            options: ALERT_STATUSES.map((s) => ({ label: s.label, value: s.value })),
            value: statusFilter,
            onChange: setStatusFilter,
          },
        ]}
      />

      {/* Bulk actions bar */}
      {selectedRowKeys.length > 0 && (
        <div style={{
          background: 'var(--bg-secondary, #1a1a2e)',
          border: '1px solid var(--border-color, #2D2D2D)',
          borderRadius: 8,
          padding: '8px 16px',
          marginBottom: 12,
          display: 'flex',
          alignItems: 'center',
          gap: 12,
        }}>
          <span style={{ color: 'var(--text-primary)', fontSize: 14 }}>
            {selectedRowKeys.length} selected
          </span>
          <Button
            size="small"
            icon={<BellOff size={14} />}
            onClick={() => setBulkMuteOpen(true)}
            loading={bulkMuteMutation.isPending}
          >
            Mute Selected
          </Button>
          <Button
            size="small"
            icon={<CheckCircle2 size={14} />}
            onClick={() => bulkResolveMutation.mutate(selectedRowKeys)}
            loading={bulkResolveMutation.isPending}
          >
            Resolve Selected
          </Button>
          <Button size="small" onClick={() => setSelectedRowKeys([])}>Clear</Button>
        </div>
      )}

      {viewMode === 'table' && (
        <Card>
          <DataTable
            columns={columns}
            data={alerts}
            loading={isLoading}
            rowKey="id"
            scroll={{ x: 1200 }}
            rowSelection={{ selectedRowKeys, onChange: setSelectedRowKeys }}
            onRow={(record) => ({
              onClick: () => openDetail(record),
              style: { cursor: 'pointer' },
            })}
          />
        </Card>
      )}

      {viewMode === 'grouped' && (
        <Card loading={isLoading}>
          <SeverityGroup severity="critical" alerts={groupedAlerts.critical} />
          <SeverityGroup severity="warning" alerts={groupedAlerts.warning} />
          <SeverityGroup severity="info" alerts={groupedAlerts.info} />
          {alerts.length === 0 && (
            <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>No alerts found</div>
          )}
        </Card>
      )}

      {viewMode === 'timeline' && (
        <Card>
          {alerts.length > 0 ? (
            <Timeline items={timelineItems} />
          ) : (
            <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>No alerts found</div>
          )}
        </Card>
      )}

      {/* Alert Detail Drawer */}
      <Drawer
        open={detailDrawerOpen}
        onClose={() => setDetailDrawerOpen(false)}
        title={selectedAlert?.name || 'Alert Detail'}
        width={520}
      >
        {selectedAlert && (
          <div>
            <Steps
              current={getAlertStep(selectedAlert.status)}
              size="small"
              style={{ marginBottom: 24 }}
              items={[
                { title: 'Active' },
                { title: 'Acknowledged' },
                { title: 'Resolved' },
              ]}
            />

            <Descriptions column={1} size="small" bordered>
              <Descriptions.Item label="Severity">
                <Tag color={severityColor(selectedAlert.severity)} style={{ color: '#fff' }}>
                  {selectedAlert.severity?.toUpperCase()}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Status">
                <Tag color={statusColor(selectedAlert.status)} style={{ color: '#fff' }}>
                  {selectedAlert.status?.toUpperCase()}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Type">{selectedAlert.type}</Descriptions.Item>
              <Descriptions.Item label="Service">{selectedAlert.serviceName || '-'}</Descriptions.Item>
              <Descriptions.Item label="Condition">
                {selectedAlert.metric && selectedAlert.operator
                  ? <code>{selectedAlert.metric} {selectedAlert.operator} {selectedAlert.threshold}</code>
                  : selectedAlert.condition || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="Triggered">
                {selectedAlert.triggeredAt ? formatTimestamp(selectedAlert.triggeredAt) : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="Acknowledged">
                {selectedAlert.acknowledgedAt ? formatTimestamp(selectedAlert.acknowledgedAt) : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="Resolved">
                {selectedAlert.resolvedAt ? formatTimestamp(selectedAlert.resolvedAt) : '-'}
              </Descriptions.Item>
              {selectedAlert.muteReason && (
                <Descriptions.Item label="Mute Reason">{selectedAlert.muteReason}</Descriptions.Item>
              )}
              {selectedAlert.runbookUrl && (
                <Descriptions.Item label="Runbook">
                  <a href={selectedAlert.runbookUrl} target="_blank" rel="noopener noreferrer">
                    Open Runbook
                  </a>
                </Descriptions.Item>
              )}
            </Descriptions>

            <div style={{ marginTop: 16 }}>
              <AlertActions
                alert={selectedAlert}
                onAcknowledge={(id) => { ackMutation.mutate(id); setDetailDrawerOpen(false); }}
                onResolve={(id) => { resolveMutation.mutate(id); setDetailDrawerOpen(false); }}
                onMuteWithReason={(id, minutes, reason) => {
                  muteWithReasonMutation.mutate({ id, minutes, reason });
                  setDetailDrawerOpen(false);
                }}
                loading={actionLoading}
              />
            </div>
          </div>
        )}
      </Drawer>

      {/* Bulk Mute Dialog */}
      <MuteDialog
        open={bulkMuteOpen}
        onCancel={() => setBulkMuteOpen(false)}
        onConfirm={(minutes, reason) => bulkMuteMutation.mutate({ ids: selectedRowKeys, minutes, reason })}
        loading={bulkMuteMutation.isPending}
      />

      <CreateAlertModal
        open={createModalOpen}
        onCancel={() => setCreateModalOpen(false)}
        onSubmit={(values) => createMutation.mutate(values)}
        loading={createMutation.isPending}
      />
    </div>
  );
}
