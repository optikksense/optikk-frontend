import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Tabs } from 'antd';
import { Cpu, Network, Rocket } from 'lucide-react';
import ResourceUtilizationPage from '@features/metrics/pages/ResourceUtilizationPage';
import NodesPage from '../NodesPage';
import DeploymentTrackingPage from '../DeploymentTrackingPage';

export default function InfrastructureHubPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'resource');

  useEffect(() => {
    const queryTab = searchParams.get('tab') || 'resource';
    if (queryTab !== activeTab) {
      setActiveTab(queryTab);
    }
  }, [searchParams, activeTab]);

  const onTabChange = (key) => {
    setActiveTab(key);
    const next = new URLSearchParams(searchParams);
    if (key === 'resource') {
      next.delete('tab');
    } else {
      next.set('tab', key);
    }
    setSearchParams(next, { replace: true });
  };

  const items = [
    {
      key: 'resource',
      label: <span><Cpu size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />Resource Utilization</span>,
      children: <ResourceUtilizationPage />,
    },
    {
      key: 'nodes',
      label: <span><Network size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />Nodes</span>,
      children: <NodesPage />,
    },
    {
      key: 'deployments',
      label: <span><Rocket size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />Deployments</span>,
      children: <DeploymentTrackingPage />,
    },
  ];

  return <Tabs activeKey={activeTab} onChange={onTabChange} items={items} />;
}
