import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Tabs } from 'antd';
import { Server, Cpu, Network, Rocket, HeartPulse } from 'lucide-react';
import InfrastructurePage from '../InfrastructurePage';
import ResourceUtilizationPage from '@features/metrics/pages/ResourceUtilizationPage';
import NodesPage from '../NodesPage';
import DeploymentTrackingPage from '../DeploymentTrackingPage';
import HealthChecksPage from '../HealthChecksPage';

export default function InfrastructureHubPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'infra');

  useEffect(() => {
    const queryTab = searchParams.get('tab') || 'infra';
    if (queryTab !== activeTab) {
      setActiveTab(queryTab);
    }
  }, [searchParams, activeTab]);

  const onTabChange = (key) => {
    setActiveTab(key);
    const next = new URLSearchParams(searchParams);
    if (key === 'infra') {
      next.delete('tab');
    } else {
      next.set('tab', key);
    }
    setSearchParams(next, { replace: true });
  };

  const items = [
    {
      key: 'infra',
      label: <span><Server size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />Infrastructure</span>,
      children: <InfrastructurePage />,
    },
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
    {
      key: 'health-checks',
      label: <span><HeartPulse size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />Health Checks</span>,
      children: <HealthChecksPage />,
    },
  ];

  return <Tabs activeKey={activeTab} onChange={onTabChange} items={items} />;
}
