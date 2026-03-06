import { Descriptions, Drawer, Tag } from 'antd';

import { formatNumber, formatTimestamp } from '@utils/formatters';

import NodeServicesTable from './NodeServicesTable';
import { deriveNodeStatus, STATUS_CONFIG } from './nodeConstants';

interface NodeDetailDrawerProps {
  open: boolean;
  selectedNode: any;
  servicesData: any[];
  servicesLoading: boolean;
  onClose: () => void;
}

/**
 *
 * @param root0
 * @param root0.open
 * @param root0.selectedNode
 * @param root0.servicesData
 * @param root0.servicesLoading
 * @param root0.onClose
 */
export default function NodeDetailDrawer({
  open,
  selectedNode,
  servicesData,
  servicesLoading,
  onClose,
}: NodeDetailDrawerProps) {
  const nodeStatus = selectedNode ? deriveNodeStatus(selectedNode.error_rate) : 'healthy';
  const nodeStatusCfg = STATUS_CONFIG[nodeStatus];

  return (
    <Drawer
      open={open}
      onClose={onClose}
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
          <NodeServicesTable rows={servicesData} isLoading={servicesLoading} />
        </div>
      )}
    </Drawer>
  );
}
