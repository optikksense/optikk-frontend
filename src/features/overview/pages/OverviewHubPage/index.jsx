import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Tabs } from 'antd';
import { Activity, Target, AlertCircle } from 'lucide-react';
import OverviewPage from '../OverviewPage';
import SloSliDashboardPage from '../SloSliDashboardPage';
import ErrorDashboardPage from '@features/errors/pages/ErrorDashboardPage';

export default function OverviewHubPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'overview');

  useEffect(() => {
    const queryTab = searchParams.get('tab') || 'overview';
    if (queryTab !== activeTab) {
      setActiveTab(queryTab);
    }
  }, [searchParams, activeTab]);

  const onTabChange = (key) => {
    setActiveTab(key);
    const next = new URLSearchParams(searchParams);
    if (key === 'overview') {
      next.delete('tab');
    } else {
      next.set('tab', key);
    }
    setSearchParams(next, { replace: true });
  };

  const items = [
    {
      key: 'overview',
      label: <span><Activity size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />Overview</span>,
      children: <OverviewPage />,
    },
    {
      key: 'slo',
      label: <span><Target size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />SLO / SLI</span>,
      children: <SloSliDashboardPage />,
    },
    {
      key: 'errors',
      label: <span><AlertCircle size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />Errors</span>,
      children: <ErrorDashboardPage />,
    },
  ];

  return <Tabs activeKey={activeTab} onChange={onTabChange} items={items} />;
}
