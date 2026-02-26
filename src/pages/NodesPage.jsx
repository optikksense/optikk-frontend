import { useState } from 'react';
import { Card, Row, Col, Drawer, Descriptions, Tag } from 'antd';
import { useQuery } from '@tanstack/react-query';
import { Server, CheckCircle2, AlertTriangle, XCircle, Box } from 'lucide-react';
import { useTimeRange, useTimeRangeQuery } from '@hooks/useTimeRangeQuery';
import { v1Service } from '@services/v1Service';
import { formatNumber, formatTimestamp } from '@utils/formatters';
import PageHeader from '@components/common/PageHeader';
import FilterBar from '@components/common/FilterBar';
import StatCard from '@components/common/StatCard';
import DataTable from '@components/common/DataTable';

function deriveNodeStatus(errorRate) {
  const rate = Number(errorRate) || 0;
  if (rate > 10) return 'unhealthy';
  if (rate > 2) return 'degraded';
  return 'healthy';
}

const STATUS_CONFIG = {
  healthy: { label: 'Healthy', color: '#73C991', icon: <CheckCircle2 size={14} /> },
  degraded: { label: 'Degraded', color: '#F79009', icon: <AlertTriangle size={14} /> },
  unhealthy: { label: 'Unhealthy', color: '#F04438', icon: <XCircle size={14} /> },
};

export default function NodesPage() {
  const { selectedTeamId } = useTimeRange();
  const [hostFilter, setHostFilter] = useState('');
  const [selectedNode, setSelectedNode] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const { data: nodesData, isLoading } = useTimeRangeQuery(
    'nodes',
    (teamId, start, end) => v1Service.getNodeHealth(teamId, start, end)
  );

  const { data: nodeServicesData, isLoading: servicesLoading } = useTimeRangeQuery(
    'node-services',
    (teamId, start, end) => v1Service.getNodeServices(teamId, selectedNode.host, start, end),
    { extraKeys: [selectedNode?.host], enabled: !!selectedNode?.host && drawerOpen }
  );

  const nodes = (nodesData || []).filter((n) =>
    !hostFilter || n.host?.toLowerCase().includes(hostFilter.toLowerCase())
  );

  const stats = nodes.reduce(
    (acc, n) => {
      const status = deriveNodeStatus(n.error_rate);
      acc[status] = (acc[status] || 0) + 1;
      acc.totalPods += Number(n.pod_count) || 0;
      return acc;
    },
    { healthy: 0, degraded: 0, unhealthy: 0, totalPods: 0 }
  );

  const openNodeDetail = (node) => {
    setSelectedNode(node);
    setDrawerOpen(true);
  };

  const columns = [
    {
      title: 'Host',
      dataIndex: 'host',
      key: 'host',
      width: 200,
      render: (host, record) => (
        <a onClick={() => openNodeDetail(record)} style={{ fontWeight: 600 }}>
          {host}
        </a>
      ),
    },
    {
      title: 'Status',
      key: 'status',
      width: 110,
      render: (_, record) => {
        const status = deriveNodeStatus(record.error_rate);
        const cfg = STATUS_CONFIG[status];
        return (
          <Tag color={cfg.color} icon={cfg.icon} style={{ color: '#fff' }}>
            {cfg.label}
          </Tag>
        );
      },
    },
    {
      title: 'Pods',
      dataIndex: 'pod_count',
      key: 'pod_count',
      width: 80,
      render: (v) => formatNumber(Number(v) || 0),
    },
    {
      title: 'Containers',
      dataIndex: 'container_count',
      key: 'container_count',
      width: 100,
      render: (v) => formatNumber(Number(v) || 0),
    },
    {
      title: 'Requests',
      dataIndex: 'request_count',
      key: 'request_count',
      width: 100,
      render: (v) => formatNumber(Number(v) || 0),
    },
    {
      title: 'Error Rate',
      dataIndex: 'error_rate',
      key: 'error_rate',
      width: 100,
      render: (v) => {
        const rate = Number(v) || 0;
        const color = rate > 10 ? '#F04438' : rate > 2 ? '#F79009' : '#73C991';
        return <span style={{ color, fontWeight: 600 }}>{rate.toFixed(2)}%</span>;
      },
    },
    {
      title: 'Avg Latency',
      dataIndex: 'avg_latency_ms',
      key: 'avg_latency_ms',
      width: 110,
      render: (v) => v != null ? `${Number(v).toFixed(1)}ms` : '-',
    },
    {
      title: 'P95 Latency',
      dataIndex: 'p95_latency_ms',
      key: 'p95_latency_ms',
      width: 110,
      render: (v) => v != null ? `${Number(v).toFixed(1)}ms` : '-',
    },
    {
      title: 'Services',
      dataIndex: 'services',
      key: 'services',
      render: (services) => {
        const arr = Array.isArray(services) ? services : [];
        return arr.slice(0, 3).map((s) => (
          <Tag key={s} style={{ marginBottom: 2 }}>{s}</Tag>
        )).concat(arr.length > 3 ? [<Tag key="more">+{arr.length - 3} more</Tag>] : []);
      },
    },
    {
      title: 'Last Seen',
      dataIndex: 'last_seen',
      key: 'last_seen',
      width: 150,
      render: (v) => v ? formatTimestamp(v) : '-',
    },
  ];

  const serviceColumns = [
    { title: 'Service', dataIndex: 'service_name', key: 'service_name', width: 180 },
    {
      title: 'Requests',
      dataIndex: 'request_count',
      key: 'request_count',
      width: 100,
      render: (v) => formatNumber(Number(v) || 0),
    },
    {
      title: 'Error Rate',
      dataIndex: 'error_rate',
      key: 'error_rate',
      width: 100,
      render: (v) => {
        const rate = Number(v) || 0;
        const color = rate > 10 ? '#F04438' : rate > 2 ? '#F79009' : '#73C991';
        return <span style={{ color, fontWeight: 600 }}>{rate.toFixed(2)}%</span>;
      },
    },
    {
      title: 'Avg Latency',
      dataIndex: 'avg_latency_ms',
      key: 'avg_latency_ms',
      width: 110,
      render: (v) => v != null ? `${Number(v).toFixed(1)}ms` : '-',
    },
    {
      title: 'P95 Latency',
      dataIndex: 'p95_latency_ms',
      key: 'p95_latency_ms',
      width: 110,
      render: (v) => v != null ? `${Number(v).toFixed(1)}ms` : '-',
    },
    {
      title: 'Pods',
      dataIndex: 'pod_count',
      key: 'pod_count',
      width: 70,
      render: (v) => formatNumber(Number(v) || 0),
    },
  ];

  const nodeStatus = selectedNode ? deriveNodeStatus(selectedNode.error_rate) : 'healthy';
  const nodeStatusCfg = STATUS_CONFIG[nodeStatus];

  return (
    <div className="nodes-page">
      <PageHeader title="Nodes" icon={<Server size={24} />} />

      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Healthy Nodes"
            value={stats.healthy}
            icon={<CheckCircle2 size={20} />}
            iconColor="#73C991"
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Degraded Nodes"
            value={stats.degraded}
            icon={<AlertTriangle size={20} />}
            iconColor="#F79009"
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Unhealthy Nodes"
            value={stats.unhealthy}
            icon={<XCircle size={20} />}
            iconColor="#F04438"
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Total Pods"
            value={formatNumber(stats.totalPods)}
            icon={<Box size={20} />}
            iconColor="#5E60CE"
          />
        </Col>
      </Row>

      <FilterBar
        filters={[
          {
            type: 'input',
            key: 'host',
            placeholder: 'Search by host',
            value: hostFilter,
            onChange: setHostFilter,
            width: 240,
          },
        ]}
      />

      <Card>
        <DataTable
          columns={columns}
          data={nodes}
          loading={isLoading}
          rowKey="host"
          scroll={{ x: 1100 }}
          onRow={(record) => ({
            onClick: () => openNodeDetail(record),
            style: { cursor: 'pointer' },
          })}
          emptyText="No nodes found"
        />
      </Card>

      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={selectedNode?.host || 'Node Detail'}
        width={640}
      >
        {selectedNode && (
          <div>
            <Descriptions column={2} size="small" bordered style={{ marginBottom: 24 }}>
              <Descriptions.Item label="Host" span={2}>{selectedNode.host}</Descriptions.Item>
              <Descriptions.Item label="Status">
                <Tag color={nodeStatusCfg.color} style={{ color: '#fff' }}>
                  {nodeStatusCfg.label}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Pods">{formatNumber(Number(selectedNode.pod_count) || 0)}</Descriptions.Item>
              <Descriptions.Item label="Containers">{formatNumber(Number(selectedNode.container_count) || 0)}</Descriptions.Item>
              <Descriptions.Item label="Requests">{formatNumber(Number(selectedNode.request_count) || 0)}</Descriptions.Item>
              <Descriptions.Item label="Error Rate">
                <span style={{ color: Number(selectedNode.error_rate) > 2 ? '#F04438' : '#73C991', fontWeight: 600 }}>
                  {Number(selectedNode.error_rate || 0).toFixed(2)}%
                </span>
              </Descriptions.Item>
              <Descriptions.Item label="Avg Latency">
                {selectedNode.avg_latency_ms != null ? `${Number(selectedNode.avg_latency_ms).toFixed(1)}ms` : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="P95 Latency">
                {selectedNode.p95_latency_ms != null ? `${Number(selectedNode.p95_latency_ms).toFixed(1)}ms` : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="Last Seen" span={2}>
                {selectedNode.last_seen ? formatTimestamp(selectedNode.last_seen) : '-'}
              </Descriptions.Item>
            </Descriptions>

            <h4 style={{ marginBottom: 12, color: 'var(--text-primary)' }}>Services on this Node</h4>
            <DataTable
              columns={serviceColumns}
              data={nodeServicesData || []}
              loading={servicesLoading}
              rowKey="service_name"
              pagination={false}
              scroll={{ x: 600 }}
              emptyText="No services found"
            />
          </div>
        )}
      </Drawer>
    </div>
  );
}
