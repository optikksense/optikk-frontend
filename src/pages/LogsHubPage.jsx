import { Tabs } from 'antd';
import { FileText, BarChart2 } from 'lucide-react';
import LogsPage from './LogsPage';
import LogsAnalyticsPage from './LogsAnalyticsPage';

export default function LogsHubPage() {
  const items = [
    {
      key: 'logs',
      label: (
        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <FileText size={13} /> Logs
        </span>
      ),
      children: (
        // Give the log stream full viewport height minus the tab header
        <div style={{ height: 'calc(100vh - 130px)', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          <LogsPage />
        </div>
      ),
    },
    {
      key: 'analytics',
      label: (
        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <BarChart2 size={13} /> Aggregates
        </span>
      ),
      children: <LogsAnalyticsPage />,
    },
  ];

  return (
    <Tabs
      defaultActiveKey="logs"
      items={items}
      style={{ height: '100%' }}
    />
  );
}
