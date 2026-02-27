import { useState, useMemo } from 'react';
import {
  Button, Drawer, Descriptions, Tag, Switch, Popconfirm, Modal, Form,
  Input, Select, InputNumber, Row, Col,
} from 'antd';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { HeartPulse, Plus, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';
import { useTimeRange } from '@hooks/useTimeRangeQuery';
import { v1Service } from '@services/v1Service';
import { HEALTH_CHECK_TYPES, HEALTH_CHECK_STATUSES } from '@config/constants';
import { formatNumber, formatTimestamp } from '@utils/formatters';
import { PageHeader, StatCard, StatCardsGrid } from '@components/common';
import ObservabilityDataBoard, { boardHeight } from '@components/common/data-display/ObservabilityDataBoard';
import toast from 'react-hot-toast';

const STATUS_COLOR = {
  up: '#73C991',
  down: '#F04438',
  degraded: '#F79009',
};

const CHECK_COLUMNS = [
  { key: 'name',        label: 'Name',         defaultWidth: 200 },
  { key: 'type',        label: 'Type',         defaultWidth: 90 },
  { key: 'targetUrl',   label: 'Target URL',   defaultWidth: 220 },
  { key: 'intervalSeconds', label: 'Interval', defaultWidth: 90 },
  { key: 'status',      label: 'Status',       defaultWidth: 100 },
  { key: 'uptime',      label: 'Uptime %',     defaultWidth: 90 },
  { key: 'avgResponse', label: 'Avg Response', defaultWidth: 110 },
  { key: 'enabled',     label: 'Enabled',      defaultWidth: 80 },
  { key: 'actions',     label: 'Actions',      defaultWidth: 100, flex: true },
];

const RESULT_COLUMNS = [
  { key: 'timestamp',        label: 'Time',          defaultWidth: 160 },
  { key: 'status',           label: 'Status',        defaultWidth: 90 },
  { key: 'response_time_ms', label: 'Response Time', defaultWidth: 120 },
  { key: 'http_status_code', label: 'HTTP Status',   defaultWidth: 100 },
  { key: 'error_message',    label: 'Error',         defaultWidth: 200, flex: true },
];

function CreateCheckModal({ open, onCancel, onSubmit, loading }) {
  const [form] = Form.useForm();
  const [checkType, setCheckType] = useState('http');

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      onSubmit(values);
      form.resetFields();
    } catch {
      // validation failed
    }
  };

  return (
    <Modal
      title="Add Health Check"
      open={open}
      onOk={handleOk}
      onCancel={() => { form.resetFields(); onCancel(); }}
      confirmLoading={loading}
      destroyOnClose
    >
      <Form form={form} layout="vertical" preserve={false} initialValues={{ intervalSeconds: 60, timeoutMs: 5000, expectedStatus: 200, type: 'http' }}>
        <Form.Item name="name" label="Name" rules={[{ required: true }]}>
          <Input placeholder="e.g., API Gateway Health" />
        </Form.Item>

        <Form.Item name="type" label="Type" rules={[{ required: true }]}>
          <Select
            options={HEALTH_CHECK_TYPES}
            onChange={(v) => setCheckType(v)}
          />
        </Form.Item>

        <Form.Item name="targetUrl" label="Target URL" rules={[{ required: true }, { type: 'url', message: 'Enter a valid URL' }]}>
          <Input placeholder="https://api.example.com/health" />
        </Form.Item>

        <Row gutter={[16, 16]}>
          <Col span={12}>
            <Form.Item name="intervalSeconds" label="Interval (seconds)" rules={[{ required: true }]}>
              <InputNumber style={{ width: '100%' }} min={10} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="timeoutMs" label="Timeout (ms)" rules={[{ required: true }]}>
              <InputNumber style={{ width: '100%' }} min={100} />
            </Form.Item>
          </Col>
        </Row>

        {checkType === 'http' && (
          <Form.Item name="expectedStatus" label="Expected HTTP Status">
            <InputNumber style={{ width: '100%' }} min={100} max={599} />
          </Form.Item>
        )}

        <Form.Item name="tags" label="Tags">
          <Input placeholder="e.g., production, critical" />
        </Form.Item>
      </Form>
    </Modal>
  );
}

export default function HealthChecksPage() {
  const queryClient = useQueryClient();
  const { selectedTeamId, startTime, endTime, refreshKey } = useTimeRange();
  const [selectedCheck, setSelectedCheck] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const { data: checksData, isLoading: checksLoading } = useQuery({
    queryKey: ['health-checks', selectedTeamId],
    queryFn: () => v1Service.getHealthChecks(selectedTeamId),
    enabled: !!selectedTeamId,
  });

  const { data: statusData, isLoading: statusLoading } = useQuery({
    queryKey: ['health-checks-status', selectedTeamId, startTime, endTime, refreshKey],
    queryFn: () => v1Service.getHealthCheckStatus(selectedTeamId, startTime, endTime),
    enabled: !!selectedTeamId,
  });

  const { data: resultsData, isLoading: resultsLoading } = useQuery({
    queryKey: ['health-check-results', selectedTeamId, selectedCheck?.checkId, startTime, endTime],
    queryFn: () =>
      v1Service.getHealthCheckResults(selectedTeamId, selectedCheck.checkId, startTime, endTime, { limit: 50 }),
    enabled: !!selectedTeamId && !!selectedCheck?.checkId && drawerOpen,
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['health-checks'] });
    queryClient.invalidateQueries({ queryKey: ['health-checks-status'] });
  };

  const createMutation = useMutation({
    mutationFn: (data) => v1Service.createHealthCheck(selectedTeamId, data),
    onSuccess: () => { toast.success('Health check created'); setCreateModalOpen(false); invalidate(); },
    onError: (err) => toast.error(err.message || 'Failed to create'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => v1Service.deleteHealthCheck(selectedTeamId, id),
    onSuccess: () => { toast.success('Health check deleted'); invalidate(); },
    onError: (err) => toast.error(err.message || 'Failed to delete'),
  });

  const toggleMutation = useMutation({
    mutationFn: (id) => v1Service.toggleHealthCheck(selectedTeamId, id),
    onSuccess: () => { invalidate(); },
    onError: (err) => toast.error(err.message || 'Failed to toggle'),
  });

  const checks = checksData?.data ?? checksData ?? [];
  const statusMap = useMemo(() => {
    const map = {};
    const statusList = statusData?.data ?? statusData ?? [];
    statusList.forEach((s) => { map[s.check_id] = s; });
    return map;
  }, [statusData]);

  const stats = useMemo(() => {
    const statusList = statusData?.data ?? statusData ?? [];
    const up = statusList.filter((s) => s.current_status === 'up').length;
    const down = statusList.filter((s) => s.current_status === 'down').length;
    const degraded = statusList.filter((s) => s.current_status === 'degraded').length;
    const total = statusList.length;
    const uptime = total > 0
      ? (statusList.reduce((sum, s) => sum + (Number(s.uptime_pct) || 0), 0) / total).toFixed(1)
      : 'N/A';
    return { up, down, degraded, uptime };
  }, [statusData]);

  const openDetail = (check) => {
    setSelectedCheck({ ...check, checkId: String(check.id) });
    setDrawerOpen(true);
  };

  const drawerCheck = selectedCheck;
  const drawerStatus = drawerCheck ? statusMap[String(drawerCheck.id)] : null;
  const results = resultsData?.data ?? resultsData ?? [];

  return (
    <div className="health-checks-page">
      <PageHeader
        title="Health Checks"
        icon={<HeartPulse size={24} />}
        actions={
          <Button type="primary" icon={<Plus size={16} />} onClick={() => setCreateModalOpen(true)}>
            Add Check
          </Button>
        }
      />

      <StatCardsGrid
        style={{ marginBottom: 16 }}
        stats={[
          { title: "Up", value: stats.up, icon: <CheckCircle2 size={20} />, iconColor: "#73C991" },
          { title: "Down", value: stats.down, icon: <XCircle size={20} />, iconColor: "#F04438" },
          { title: "Degraded", value: stats.degraded, icon: <AlertTriangle size={20} />, iconColor: "#F79009" },
          { title: "Overall Uptime", value: stats.uptime !== 'N/A' ? `${stats.uptime}%` : 'N/A', icon: <HeartPulse size={20} />, iconColor: "#5E60CE", description: "Average across all checks" }
        ]}
      />

      <div style={{ height: boardHeight(20) }}>
        <ObservabilityDataBoard
          columns={CHECK_COLUMNS}
          rows={checks}
          rowKey={(row) => String(row.id)}
          entityName="health check"
          storageKey="health-checks-board-cols"
          isLoading={checksLoading || statusLoading}
          renderRow={(row, { colWidths, visibleCols }) => {
            const s = statusMap[String(row.id)];
            const status = s?.current_status || 'unknown';
            const statusClr = STATUS_COLOR[status] || '#98A2B3';
            return (
              <>
                {visibleCols.name && (
                  <div
                    style={{ width: colWidths.name, flexShrink: 0, fontWeight: 600, cursor: 'pointer', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--color-primary, #5E60CE)' }}
                    onClick={() => openDetail(row)}
                  >
                    {row.name}
                  </div>
                )}
                {visibleCols.type && (
                  <div style={{ width: colWidths.type, flexShrink: 0 }}>
                    <Tag>{row.type?.toUpperCase()}</Tag>
                  </div>
                )}
                {visibleCols.targetUrl && (
                  <div style={{ width: colWidths.targetUrl, flexShrink: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    <a href={row.targetUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12 }} onClick={(e) => e.stopPropagation()}>
                      {row.targetUrl}
                    </a>
                  </div>
                )}
                {visibleCols.intervalSeconds && (
                  <div style={{ width: colWidths.intervalSeconds, flexShrink: 0 }}>
                    {row.intervalSeconds}s
                  </div>
                )}
                {visibleCols.status && (
                  <div style={{ width: colWidths.status, flexShrink: 0 }}>
                    <Tag color={statusClr} style={{ color: '#fff' }}>{status.toUpperCase()}</Tag>
                  </div>
                )}
                {visibleCols.uptime && (
                  <div style={{ width: colWidths.uptime, flexShrink: 0 }}>
                    {s?.uptime_pct != null ? `${Number(s.uptime_pct).toFixed(1)}%` : '-'}
                  </div>
                )}
                {visibleCols.avgResponse && (
                  <div style={{ width: colWidths.avgResponse, flexShrink: 0 }}>
                    {s?.avg_response_ms != null ? `${Number(s.avg_response_ms).toFixed(0)}ms` : '-'}
                  </div>
                )}
                {visibleCols.enabled && (
                  <div style={{ width: colWidths.enabled, flexShrink: 0 }} onClick={(e) => e.stopPropagation()}>
                    <Switch
                      checked={row.enabled}
                      size="small"
                      loading={toggleMutation.isPending}
                      onChange={() => toggleMutation.mutate(row.id)}
                    />
                  </div>
                )}
                {visibleCols.actions && (
                  <div style={{ flex: 1 }} onClick={(e) => e.stopPropagation()}>
                    <Popconfirm
                      title="Delete this health check?"
                      onConfirm={() => deleteMutation.mutate(row.id)}
                      okText="Delete"
                      okButtonProps={{ danger: true }}
                    >
                      <Button
                        size="small"
                        danger
                        loading={deleteMutation.isPending}
                      >
                        Delete
                      </Button>
                    </Popconfirm>
                  </div>
                )}
              </>
            );
          }}
          emptyTips={[
            { num: 1, text: <>Click <strong>Add Check</strong> to create your first health check</> },
            { num: 2, text: <>Health checks run on a configurable <strong>interval</strong></> },
            { num: 3, text: <>Supports <strong>HTTP, TCP</strong> and other check types</> },
          ]}
        />
      </div>

      {/* Detail Drawer */}
      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={drawerCheck?.name || 'Health Check Detail'}
        width={640}
      >
        {drawerCheck && (
          <div>
            <Descriptions column={2} size="small" bordered style={{ marginBottom: 24 }}>
              <Descriptions.Item label="Type" span={1}>{drawerCheck.type?.toUpperCase()}</Descriptions.Item>
              <Descriptions.Item label="Status" span={1}>
                {drawerStatus ? (
                  <Tag color={STATUS_COLOR[drawerStatus.current_status] || '#98A2B3'} style={{ color: '#fff' }}>
                    {drawerStatus.current_status?.toUpperCase()}
                  </Tag>
                ) : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="Target URL" span={2}>
                <a href={drawerCheck.targetUrl} target="_blank" rel="noopener noreferrer">
                  {drawerCheck.targetUrl}
                </a>
              </Descriptions.Item>
              <Descriptions.Item label="Interval">{drawerCheck.intervalSeconds}s</Descriptions.Item>
              <Descriptions.Item label="Timeout">{drawerCheck.timeoutMs}ms</Descriptions.Item>
              <Descriptions.Item label="Uptime">
                {drawerStatus?.uptime_pct != null ? `${Number(drawerStatus.uptime_pct).toFixed(1)}%` : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="Avg Response">
                {drawerStatus?.avg_response_ms != null ? `${Number(drawerStatus.avg_response_ms).toFixed(0)}ms` : '-'}
              </Descriptions.Item>
              {drawerCheck.tags && (
                <Descriptions.Item label="Tags" span={2}>{drawerCheck.tags}</Descriptions.Item>
              )}
            </Descriptions>

            <h4 style={{ marginBottom: 12, color: 'var(--text-primary)' }}>Result History</h4>
            <div style={{ height: boardHeight(10) }}>
              <ObservabilityDataBoard
                columns={RESULT_COLUMNS}
                rows={results}
                rowKey={(r, i) => `${r.timestamp}-${i}`}
                entityName="result"
                isLoading={resultsLoading}
                renderRow={(row, { colWidths, visibleCols }) => {
                  const clr = STATUS_COLOR[row.status] || '#98A2B3';
                  return (
                    <>
                      {visibleCols.timestamp && (
                        <div style={{ width: colWidths.timestamp, flexShrink: 0, color: 'var(--text-muted)' }}>
                          {row.timestamp ? formatTimestamp(row.timestamp) : '-'}
                        </div>
                      )}
                      {visibleCols.status && (
                        <div style={{ width: colWidths.status, flexShrink: 0 }}>
                          <Tag color={clr} style={{ color: '#fff' }}>{row.status?.toUpperCase()}</Tag>
                        </div>
                      )}
                      {visibleCols.response_time_ms && (
                        <div style={{ width: colWidths.response_time_ms, flexShrink: 0 }}>
                          {row.response_time_ms != null ? `${Number(row.response_time_ms).toFixed(0)}ms` : '-'}
                        </div>
                      )}
                      {visibleCols.http_status_code && (
                        <div style={{ width: colWidths.http_status_code, flexShrink: 0 }}>
                          {row.http_status_code || '-'}
                        </div>
                      )}
                      {visibleCols.error_message && (
                        <div style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--text-muted)' }}>
                          {row.error_message || '-'}
                        </div>
                      )}
                    </>
                  );
                }}
              />
            </div>
          </div>
        )}
      </Drawer>

      <CreateCheckModal
        open={createModalOpen}
        onCancel={() => setCreateModalOpen(false)}
        onSubmit={(values) => createMutation.mutate(values)}
        loading={createMutation.isPending}
      />
    </div>
  );
}
