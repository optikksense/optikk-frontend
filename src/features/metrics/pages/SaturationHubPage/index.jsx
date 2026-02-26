import { Tabs } from 'antd';
import { Gauge, Database, Network } from 'lucide-react';
import SaturationPage from '../SaturationPage';
import DatabaseCachePerformancePage from '../DatabaseCachePerformancePage';
import MessagingQueueMonitoringPage from '../MessagingQueueMonitoringPage';

export default function SaturationHubPage() {
  const items = [
    {
      key: 'sat',
      label: <span><Gauge size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />Saturation</span>,
      children: <SaturationPage />,
    },
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

  return <Tabs defaultActiveKey="sat" items={items} />;
}
