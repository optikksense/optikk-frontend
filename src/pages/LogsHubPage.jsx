import { Tabs } from 'antd';
import { FileText, Activity } from 'lucide-react';
import LogsPage from './LogsPage';
import LogsAnalyticsPage from './LogsAnalyticsPage';

export default function LogsHubPage() {
  const items = [
    {
      key: 'logs',
      label: <span><FileText size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />Logs</span>,
      children: <LogsPage />,
    },
    {
      key: 'analytics',
      label: <span><Activity size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />Aggregates</span>,
      children: <LogsAnalyticsPage />,
    },
  ];

  return <Tabs defaultActiveKey="logs" items={items} />;
}
