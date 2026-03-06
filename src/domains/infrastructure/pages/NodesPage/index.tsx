import { APP_COLORS } from '@config/colorLiterals';
import { Col, Row } from 'antd';
import { AlertTriangle, Box, CheckCircle2, Server, XCircle } from 'lucide-react';
import { useState } from 'react';
import type { ChangeEvent } from 'react';

import StatCard from '@components/common/cards/StatCard';
import FilterBar from '@components/common/forms/FilterBar';
import PageHeader from '@components/common/layout/PageHeader';

import { NodeDetailDrawer, NodesTable } from '../../components';
import { deriveNodeStatus } from '../../components/nodes/nodeConstants';

import { v1Service } from '@services/v1Service';

import { useTimeRangeQuery } from '@hooks/useTimeRangeQuery';

import { formatNumber } from '@utils/formatters';

/**
 *
 */
export default function NodesPage() {
  const [hostFilter, setHostFilter] = useState('');
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const { data: nodesRaw, isLoading } = useTimeRangeQuery(
    'nodes',
    (teamId, start, end) => v1Service.getNodeHealth(teamId, start, end),
  );

  const nodesData = (nodesRaw || []) as any[];

  const { data: nodeServicesRaw, isLoading: servicesLoading } = useTimeRangeQuery(
    'node-services',
    (teamId, start, end) => v1Service.getNodeServices(teamId, selectedNode?.host, start, end),
    { extraKeys: [selectedNode?.host], enabled: !!selectedNode?.host && drawerOpen },
  );

  const nodeServicesData = (nodeServicesRaw || []) as any[];

  const nodes = nodesData.filter((n) =>
    !hostFilter || n.host?.toLowerCase().includes(hostFilter.toLowerCase()),
  );

  const stats = nodes.reduce(
    (acc, n) => {
      const status = deriveNodeStatus(n.error_rate);
      acc[status] = (acc[status] || 0) + 1;
      acc.totalPods += Number(n.pod_count) || 0;
      return acc;
    },
    { healthy: 0, degraded: 0, unhealthy: 0, totalPods: 0 } as any,
  );

  const openNodeDetail = (node: any) => {
    setSelectedNode(node);
    setDrawerOpen(true);
  };

  return (
    <div className="nodes-page">
      <PageHeader title="Nodes" icon={<Server size={24} />} />

      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Healthy Nodes"
            value={stats.healthy}
            icon={<CheckCircle2 size={20} />}
            iconColor={APP_COLORS.hex_73c991}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Degraded Nodes"
            value={stats.degraded}
            icon={<AlertTriangle size={20} />}
            iconColor={APP_COLORS.hex_f79009}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Unhealthy Nodes"
            value={stats.unhealthy}
            icon={<XCircle size={20} />}
            iconColor={APP_COLORS.hex_f04438}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Total Pods"
            value={formatNumber(stats.totalPods)}
            icon={<Box size={20} />}
            iconColor={APP_COLORS.hex_5e60ce}
          />
        </Col>
      </Row>

      <FilterBar
        filters={[
          {
            type: 'search',
            key: 'host',
            placeholder: 'Search by host',
            value: hostFilter,
            onChange: (event: ChangeEvent<HTMLInputElement>) => setHostFilter(event.target.value),
            width: 240,
          },
        ]}
      />

      <NodesTable rows={nodes} isLoading={isLoading} onOpenNodeDetail={openNodeDetail} />

      <NodeDetailDrawer
        open={drawerOpen}
        selectedNode={selectedNode}
        servicesData={nodeServicesData}
        servicesLoading={servicesLoading}
        onClose={() => setDrawerOpen(false)}
      />
    </div>
  );
}
