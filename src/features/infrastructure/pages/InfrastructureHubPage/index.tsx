import { Tabs } from 'antd';
import { Cpu, Network } from 'lucide-react';
import { ResourceUtilizationTabPanel } from '@components/ui';

import { useUrlSyncedTab } from '@hooks/useUrlSyncedTab';

import NodesPage from '../NodesPage';

/**
 *
 */
export default function InfrastructureHubPage() {
  const { activeTab, onTabChange } = useUrlSyncedTab({
    allowedTabs: ['resource', 'nodes'] as const,
    defaultTab: 'resource',
  });

  const items = [
    {
      key: 'resource',
      label: <span><Cpu size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />Resource Utilization</span>,
      children: <ResourceUtilizationTabPanel />,
    },
    {
      key: 'nodes',
      label: <span><Network size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />Nodes</span>,
      children: <NodesPage />,
    },
  ];

  return <Tabs activeKey={activeTab} onChange={onTabChange} items={items} />;
}
