import { Tabs } from 'antd';
import { Database, Network } from 'lucide-react';
import DatabaseCachePerformancePage from '../DatabaseCachePerformancePage';
import MessagingQueueMonitoringPage from '../MessagingQueueMonitoringPage';

export default function SaturationHubPage() {
  const items = [
    {
      key: 'db',
      label: <span><Database size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />DB & Cache</span>,
      children: <DatabaseCachePerformancePage />,
    },
    {
      key: 'mq',
      label: <span><Network size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />Messaging Queue</span>,
      children: <MessagingQueueMonitoringPage />,
    },
  ];

  return <Tabs defaultActiveKey="db" items={items} />;
}
