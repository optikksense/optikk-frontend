import { useState, useMemo } from 'react';
import {
  Card, Row, Col, Button, Segmented, Drawer, Descriptions, Tag, Steps,
  Modal, Form, Input, Select, Popconfirm, Divider, Statistic, Space,
} from 'antd';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Rocket, GitCommit, CheckCircle, XCircle, List, Clock, Plus, ExternalLink } from 'lucide-react';
import { useTimeRangeQuery, useTimeRange } from '@hooks/useTimeRangeQuery';
import { v1Service } from '@services/v1Service';
import { DEPLOYMENT_STATUSES, DEPLOYMENT_ENVIRONMENTS } from '@config/constants';
import { formatTimestamp, formatRelativeTime } from '@utils/formatters';
import { PageHeader, FilterBar, StatCard, StatCardsGrid, DataTable, Timeline } from '@components/common';
import toast from 'react-hot-toast';

const statusColor = (status) => {
  const found = DEPLOYMENT_STATUSES.find((s) => s.value === status?.toLowerCase());
  return found?.color || '#98A2B3';
};

export default function DeploymentTrackingPage() {
  const queryClient = useQueryClient();
  const { selectedTeamId, timeRange } = useTimeRange();
  const [serviceFilter, setServiceFilter] = useState(null);
  const [envFilter, setEnvFilter] = useState(null);
  const [statusFilter, setStatusFilter] = useState(null);
  const [viewMode, setViewMode] = useState('table');
  const [selectedDeploy, setSelectedDeploy] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [diffData, setDiffData] = useState(null);
  const [diffLoading, setDiffLoading] = useState(false);
  const [form] = Form.useForm();

  const { data, isLoading } = useTimeRangeQuery(
    'deployments',
    (teamId, startTime, endTime) =>
      v1Service.getDeployments(teamId, startTime, endTime, {
        serviceName: serviceFilter,
        environment: envFilter,
        status: statusFilter,
        limit: 100,
      }),
    { extraKeys: [serviceFilter, envFilter, statusFilter] }
  );

  const deployments = data?.deployments || [];

  const stats = useMemo(() => {
    const total = deployments.length;
    const successful = deployments.filter((d) => d.status === 'success').length;
    const failed = deployments.filter((d) => d.status === 'failed').length;
    const avgDuration = deployments.length
      ? Math.round(deployments.reduce((s, d) => s + (d.duration_seconds || 0), 0) / deployments.length)
      : 0;
    return { total, successful, failed, avgDuration };
  }, [deployments]);

  const createMutation = useMutation({
    mutationFn: (values) => v1Service.createDeployment(selectedTeamId, values),
    onSuccess: () => {
      toast.success('Deployment recorded');
      setCreateModalOpen(false);
      form.resetFields();
      queryClient.invalidateQueries({ queryKey: ['deployments'] });
    },
    onError: () => toast.error('Failed to record deployment'),
  });

  const openDetail = async (deploy) => {
    setSelectedDeploy(deploy);
    setDrawerOpen(true);
    setDiffData(null);
    setDiffLoading(true);
    try {
      const diff = await v1Service.getDeployDiff(selectedTeamId, deploy.deploy_id, 30);
      setDiffData(diff);
    } catch {
      setDiffData(null);
    } finally {
      setDiffLoading(false);
    }
  };

  const columns = [
    {
      title: 'Deploy Time',
      dataIndex: 'deploy_time',
      key: 'deploy_time',
      width: 160,
      render: (ts) => formatTimestamp(ts),
      sorter: (a, b) => new Date(a.deploy_time) - new Date(b.deploy_time),
      defaultSortOrder: 'descend',
    },
    {
      title: 'Service',
      dataIndex: 'service_name',
      key: 'service_name',
      width: 150,
      render: (name, record) => (
        <a onClick={() => openDetail(record)} style={{ fontWeight: 600 }}>{name}</a>
      ),
    },
    {
      title: 'Version',
      dataIndex: 'version',
      key: 'version',
      width: 120,
    },
    {
      title: 'Environment',
      dataIndex: 'environment',
      key: 'environment',
      width: 110,
      render: (env) => <Tag>{env?.toUpperCase()}</Tag>,
    },
    {
      title: 'Deployed By',
      dataIndex: 'deployed_by',
      key: 'deployed_by',
      width: 130,
    },
    {
      title: 'Commit',
      dataIndex: 'commit_sha',
      key: 'commit_sha',
      width: 100,
      render: (sha) => sha ? (
        <code style={{ fontSize: 12 }}>{sha.substring(0, 8)}</code>
      ) : '-',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 110,
      render: (status) => (
        <Tag color={statusColor(status)} style={{ color: '#fff' }}>
          {status?.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Duration',
      dataIndex: 'duration_seconds',
      key: 'duration_seconds',
      width: 100,
      render: (secs) => secs ? `${secs}s` : '-',
    },
  ];

  const timelineItems = useMemo(() =>
    deployments.map((d) => ({
      title: `${d.service_name} @ ${d.version}`,
      timestamp: d.deploy_time,
      description: `${d.environment} • ${d.deployed_by}`,
      color: statusColor(d.status),
      tags: [
        { label: d.status?.toUpperCase(), color: statusColor(d.status) },
        { label: d.environment, color: '#5E60CE' },
      ],
    })),
    [deployments]
  );

  const diffChange = (before, after) => {
    if (!before || !after) return null;
    const diff = after - before;
    const pct = before !== 0 ? ((diff / before) * 100).toFixed(1) : '∞';
    const color = diff > 0 ? '#F04438' : '#73C991';
    return <span style={{ color }}>{diff > 0 ? '+' : ''}{pct}%</span>;
  };

  return (
    <div>
      <PageHeader
        title="Deployments"
        icon={<Rocket size={24} />}
        actions={
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <Segmented
              value={viewMode}
              onChange={setViewMode}
              options={[
                { value: 'table', icon: <List size={14} /> },
                { value: 'timeline', icon: <Clock size={14} /> },
              ]}
            />
            <Button type="primary" icon={<Plus size={16} />} onClick={() => setCreateModalOpen(true)}>
              Record Deploy
            </Button>
          </div>
        }
      />

      <FilterBar
        filters={[
          {
            type: 'search',
            key: 'service',
            placeholder: 'Filter by service...',
            value: serviceFilter,
            onChange: (e) => setServiceFilter(e.target.value || null),
          },
          {
            type: 'select',
            key: 'environment',
            placeholder: 'All environments',
            options: DEPLOYMENT_ENVIRONMENTS,
            value: envFilter,
            onChange: setEnvFilter,
          },
          {
            type: 'select',
            key: 'status',
            placeholder: 'All statuses',
            options: DEPLOYMENT_STATUSES.map((s) => ({ label: s.label, value: s.value })),
            value: statusFilter,
            onChange: setStatusFilter,
          },
        ]}
      />

      <StatCardsGrid
        style={{ marginBottom: 16 }}
        defaultColProps={{ xs: 12, sm: 6 }}
        stats={[
          { title: "Total Deploys", value: stats.total, icon: <Rocket size={20} /> },
          { title: "Successful", value: stats.successful, icon: <CheckCircle size={20} />, valueStyle: { color: '#73C991' } },
          { title: "Failed", value: stats.failed, icon: <XCircle size={20} />, valueStyle: { color: '#F04438' } },
          { title: "Avg Duration", value: stats.avgDuration ? `${stats.avgDuration}s` : '-', icon: <Clock size={20} /> }
        ]}
      />

      {viewMode === 'table' ? (
        <Card>
          <DataTable
            columns={columns}
            data={deployments}
            loading={isLoading}
            rowKey="deploy_id"
            scroll={{ x: 1000 }}
            onRow={(record) => ({
              onClick: () => openDetail(record),
              style: { cursor: 'pointer' },
            })}
          />
        </Card>
      ) : (
        <Card>
          {deployments.length > 0 ? (
            <Timeline items={timelineItems} />
          ) : (
            <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
              No deployments found
            </div>
          )}
        </Card>
      )}

      {/* Deploy Detail Drawer */}
      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={selectedDeploy ? `${selectedDeploy.service_name} @ ${selectedDeploy.version}` : 'Deploy Detail'}
        width={580}
      >
        {selectedDeploy && (
          <div>
            <Steps
              current={selectedDeploy.status === 'success' ? 2 : selectedDeploy.status === 'in_progress' ? 1 : selectedDeploy.status === 'failed' ? -1 : 2}
              size="small"
              style={{ marginBottom: 24 }}
              items={[
                { title: 'Triggered' },
                { title: 'In Progress' },
                { title: selectedDeploy.status === 'failed' ? 'Failed' : 'Complete' },
              ]}
            />

            <Descriptions column={1} size="small" bordered style={{ marginBottom: 24 }}>
              <Descriptions.Item label="Status">
                <Tag color={statusColor(selectedDeploy.status)} style={{ color: '#fff' }}>
                  {selectedDeploy.status?.toUpperCase()}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Service">{selectedDeploy.service_name}</Descriptions.Item>
              <Descriptions.Item label="Version">{selectedDeploy.version}</Descriptions.Item>
              <Descriptions.Item label="Environment">
                <Tag>{selectedDeploy.environment?.toUpperCase()}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Deployed By">{selectedDeploy.deployed_by}</Descriptions.Item>
              <Descriptions.Item label="Commit SHA">
                {selectedDeploy.commit_sha ? (
                  <code>{selectedDeploy.commit_sha.substring(0, 12)}</code>
                ) : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="Duration">
                {selectedDeploy.duration_seconds ? `${selectedDeploy.duration_seconds}s` : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="Deploy Time">
                {formatTimestamp(selectedDeploy.deploy_time)}
              </Descriptions.Item>
            </Descriptions>

            <Divider>Pre/Post Impact (±30min)</Divider>

            {diffLoading ? (
              <div style={{ textAlign: 'center', padding: 24, color: 'var(--text-muted)' }}>
                Loading impact analysis...
              </div>
            ) : diffData ? (
              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <Card size="small" title="Before Deploy" styles={{ header: { background: 'var(--bg-secondary)' } }}>
                    <Statistic title="Avg Latency" value={`${(diffData.avg_latency_before || 0).toFixed(1)}ms`} />
                    <Statistic title="P95 Latency" value={`${(diffData.p95_latency_before || 0).toFixed(1)}ms`} />
                    <Statistic title="Error Rate" value={`${(diffData.error_rate_before || 0).toFixed(2)}%`} />
                    <Statistic title="Requests" value={diffData.request_count_before || 0} />
                  </Card>
                </Col>
                <Col span={12}>
                  <Card size="small" title="After Deploy" styles={{ header: { background: 'var(--bg-secondary)' } }}>
                    <Statistic
                      title="Avg Latency"
                      value={`${(diffData.avg_latency_after || 0).toFixed(1)}ms`}
                      suffix={diffChange(diffData.avg_latency_before, diffData.avg_latency_after)}
                    />
                    <Statistic
                      title="P95 Latency"
                      value={`${(diffData.p95_latency_after || 0).toFixed(1)}ms`}
                      suffix={diffChange(diffData.p95_latency_before, diffData.p95_latency_after)}
                    />
                    <Statistic
                      title="Error Rate"
                      value={`${(diffData.error_rate_after || 0).toFixed(2)}%`}
                      suffix={diffChange(diffData.error_rate_before, diffData.error_rate_after)}
                    />
                    <Statistic title="Requests" value={diffData.request_count_after || 0} />
                  </Card>
                </Col>
              </Row>
            ) : (
              <div style={{ textAlign: 'center', padding: 16, color: 'var(--text-muted)' }}>
                No span data available for impact analysis
              </div>
            )}
          </div>
        )}
      </Drawer>

      {/* Create Deployment Modal */}
      <Modal
        title="Record Deployment"
        open={createModalOpen}
        onCancel={() => { setCreateModalOpen(false); form.resetFields(); }}
        onOk={() => form.validateFields().then((values) => createMutation.mutate(values))}
        confirmLoading={createMutation.isPending}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="service_name" label="Service Name" rules={[{ required: true }]}>
            <Input placeholder="e.g. payment-service" />
          </Form.Item>
          <Form.Item name="version" label="Version / Tag" rules={[{ required: true }]}>
            <Input placeholder="e.g. v1.4.2 or abc123" />
          </Form.Item>
          <Form.Item name="environment" label="Environment" initialValue="production">
            <Select options={DEPLOYMENT_ENVIRONMENTS} />
          </Form.Item>
          <Form.Item name="deployed_by" label="Deployed By">
            <Input placeholder="e.g. github-actions or your name" />
          </Form.Item>
          <Form.Item name="commit_sha" label="Commit SHA">
            <Input placeholder="Full or short commit hash" />
          </Form.Item>
          <Form.Item name="status" label="Status" initialValue="success">
            <Select options={DEPLOYMENT_STATUSES.map((s) => ({ label: s.label, value: s.value }))} />
          </Form.Item>
          <Form.Item name="duration_seconds" label="Duration (seconds)">
            <Input type="number" placeholder="e.g. 120" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
