import { useState } from 'react';
import { Row, Col, Drawer, Descriptions, Tag } from 'antd';
import { Server, CheckCircle2, AlertTriangle, XCircle, Box } from 'lucide-react';
import { useTimeRangeQuery } from '@hooks/useTimeRangeQuery';
import { v1Service } from '@services/v1Service';
import { formatNumber, formatTimestamp } from '@utils/formatters';
import PageHeader from '@components/common/layout/PageHeader';
import FilterBar from '@components/common/forms/FilterBar';
import StatCard from '@components/common/cards/StatCard';
import ObservabilityDataBoard, { boardHeight } from '@components/common/data-display/ObservabilityDataBoard';


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

const NODE_COLUMNS = [
  { key: 'host',            label: 'Host',        defaultWidth: 200 },
  { key: 'status',          label: 'Status',      defaultWidth: 110 },
  { key: 'pod_count',       label: 'Pods',        defaultWidth: 80 },
  { key: 'container_count', label: 'Containers',  defaultWidth: 100 },
  { key: 'request_count',   label: 'Requests',    defaultWidth: 100 },
  { key: 'error_rate',      label: 'Error Rate',  defaultWidth: 100 },
  { key: 'avg_latency_ms',  label: 'Avg Latency', defaultWidth: 110 },
  { key: 'p95_latency_ms',  label: 'P95 Latency', defaultWidth: 110 },
  { key: 'services',        label: 'Services',    defaultWidth: 180 },
  { key: 'last_seen',       label: 'Last Seen',   defaultWidth: 150, flex: true },
];

export default function NodesPage() {
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

      <div style={{ height: boardHeight(20) }}>
        <ObservabilityDataBoard
          columns={NODE_COLUMNS}
          rows={nodes}
          rowKey={(row) => row.host}
          entityName="node"
          storageKey="nodes-board-cols"
          isLoading={isLoading}
          renderRow={(row, { colWidths, visibleCols }) => {
            const status = deriveNodeStatus(row.error_rate);
            const cfg = STATUS_CONFIG[status];
            const errorRate = Number(row.error_rate) || 0;
            const errorColor = errorRate > 10 ? '#F04438' : errorRate > 2 ? '#F79009' : '#73C991';
            const services = Array.isArray(row.services) ? row.services : [];
            return (
              <>
                {visibleCols.host && (
                  <div
                    style={{ width: colWidths.host, flexShrink: 0, fontWeight: 600, cursor: 'pointer', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--color-primary, #5E60CE)' }}
                    onClick={() => openNodeDetail(row)}
                  >
                    {row.host}
                  </div>
                )}
                {visibleCols.status && (
                  <div style={{ width: colWidths.status, flexShrink: 0 }}>
                    <Tag color={cfg.color} icon={cfg.icon} style={{ color: '#fff' }}>{cfg.label}</Tag>
                  </div>
                )}
                {visibleCols.pod_count && (
                  <div style={{ width: colWidths.pod_count, flexShrink: 0 }}>
                    {formatNumber(Number(row.pod_count) || 0)}
                  </div>
                )}
                {visibleCols.container_count && (
                  <div style={{ width: colWidths.container_count, flexShrink: 0 }}>
                    {formatNumber(Number(row.container_count) || 0)}
                  </div>
                )}
                {visibleCols.request_count && (
                  <div style={{ width: colWidths.request_count, flexShrink: 0 }}>
                    {formatNumber(Number(row.request_count) || 0)}
                  </div>
                )}
                {visibleCols.error_rate && (
                  <div style={{ width: colWidths.error_rate, flexShrink: 0, color: errorColor, fontWeight: 600 }}>
                    {errorRate.toFixed(2)}%
                  </div>
                )}
                {visibleCols.avg_latency_ms && (
                  <div style={{ width: colWidths.avg_latency_ms, flexShrink: 0 }}>
                    {row.avg_latency_ms != null ? `${Number(row.avg_latency_ms).toFixed(1)}ms` : '-'}
                  </div>
                )}
                {visibleCols.p95_latency_ms && (
                  <div style={{ width: colWidths.p95_latency_ms, flexShrink: 0 }}>
                    {row.p95_latency_ms != null ? `${Number(row.p95_latency_ms).toFixed(1)}ms` : '-'}
                  </div>
                )}
                {visibleCols.services && (
                  <div style={{ width: colWidths.services, flexShrink: 0, overflow: 'hidden' }}>
                    {services.slice(0, 2).map((s) => (
                      <Tag key={s} style={{ marginBottom: 0, marginRight: 4 }}>{s}</Tag>
                    ))}
                    {services.length > 2 && <Tag>+{services.length - 2}</Tag>}
                  </div>
                )}
                {visibleCols.last_seen && (
                  <div style={{ flex: 1, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {row.last_seen ? formatTimestamp(row.last_seen) : '-'}
                  </div>
                )}
              </>
            );
          }}
          emptyTips={[
            { num: 1, text: <>Widen the <strong>time range</strong> in the top bar</> },
            { num: 2, text: <>Clear the <strong>host filter</strong> above</> },
            { num: 3, text: <>Ensure your agents are reporting <strong>node metrics</strong></> },
          ]}
        />
      </div>

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
            <div style={{ height: boardHeight(10) }}>
              <ObservabilityDataBoard
                columns={[
                  { key: 'service_name', label: 'Service',    defaultWidth: 180 },
                  { key: 'request_count', label: 'Requests',  defaultWidth: 100 },
                  { key: 'error_rate',   label: 'Error Rate', defaultWidth: 100 },
                  { key: 'avg_latency_ms', label: 'Avg Latency', defaultWidth: 110 },
                  { key: 'p95_latency_ms', label: 'P95 Latency', defaultWidth: 110 },
                  { key: 'pod_count',    label: 'Pods',       defaultWidth: 70, flex: true },
                ]}
                rows={nodeServicesData || []}
                rowKey={(row) => row.service_name}
                entityName="service"
                isLoading={servicesLoading}
                renderRow={(row, { colWidths, visibleCols }) => {
                  const rate = Number(row.error_rate) || 0;
                  const errColor = rate > 10 ? '#F04438' : rate > 2 ? '#F79009' : '#73C991';
                  return (
                    <>
                      {visibleCols.service_name && (
                        <div style={{ width: colWidths.service_name, flexShrink: 0, fontWeight: 600 }}>{row.service_name}</div>
                      )}
                      {visibleCols.request_count && (
                        <div style={{ width: colWidths.request_count, flexShrink: 0 }}>{formatNumber(Number(row.request_count) || 0)}</div>
                      )}
                      {visibleCols.error_rate && (
                        <div style={{ width: colWidths.error_rate, flexShrink: 0, color: errColor, fontWeight: 600 }}>{rate.toFixed(2)}%</div>
                      )}
                      {visibleCols.avg_latency_ms && (
                        <div style={{ width: colWidths.avg_latency_ms, flexShrink: 0 }}>
                          {row.avg_latency_ms != null ? `${Number(row.avg_latency_ms).toFixed(1)}ms` : '-'}
                        </div>
                      )}
                      {visibleCols.p95_latency_ms && (
                        <div style={{ width: colWidths.p95_latency_ms, flexShrink: 0 }}>
                          {row.p95_latency_ms != null ? `${Number(row.p95_latency_ms).toFixed(1)}ms` : '-'}
                        </div>
                      )}
                      {visibleCols.pod_count && (
                        <div style={{ flex: 1 }}>{formatNumber(Number(row.pod_count) || 0)}</div>
                      )}
                    </>
                  );
                }}
              />
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
}
