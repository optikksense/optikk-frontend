import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Tabs } from 'antd';
import { Bell, AlertTriangle } from 'lucide-react';
import AlertsPage from './AlertsPage';
import IncidentsPage from './IncidentsPage';

export default function AlertsHubPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'alerts');

  useEffect(() => {
    const queryTab = searchParams.get('tab') || 'alerts';
    if (queryTab !== activeTab) {
      setActiveTab(queryTab);
    }
  }, [searchParams, activeTab]);

  const onTabChange = (key) => {
    setActiveTab(key);
    const next = new URLSearchParams(searchParams);
    if (key === 'alerts') {
      next.delete('tab');
    } else {
      next.set('tab', key);
    }
    setSearchParams(next, { replace: true });
  };

  const items = [
    {
      key: 'alerts',
      label: <span><Bell size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />Alerts</span>,
      children: <AlertsPage />,
    },
    {
      key: 'incidents',
      label: <span><AlertTriangle size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />Incidents</span>,
      children: <IncidentsPage />,
    },
  ];

  return <Tabs activeKey={activeTab} onChange={onTabChange} items={items} />;
}
