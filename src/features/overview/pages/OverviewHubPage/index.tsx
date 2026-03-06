import { Tabs } from 'antd';
import { Activity, Target, AlertCircle } from 'lucide-react';
import { ErrorsTabPanel } from '@components/ui';

import { useUrlSyncedTab } from '@hooks/useUrlSyncedTab';

import OverviewPage from '../OverviewPage';
import SloSliDashboardPage from '../SloSliDashboardPage';

/**
 *
 */
export default function OverviewHubPage() {
  const { activeTab, onTabChange } = useUrlSyncedTab({
    allowedTabs: ['overview', 'slo', 'errors'] as const,
    defaultTab: 'overview',
  });

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
      children: <ErrorsTabPanel />,
    },
  ];

  return (
    <div style={{ padding: '24px', maxWidth: '1600px', margin: '0 auto' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{
          margin: 0,
          background: 'var(--gradient-text)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          fontSize: '28px',
          fontWeight: 700,
        }}>
          Overview Hub
        </h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>
          High-level observability metrics and system health at a glance.
        </p>
      </div>

      <div className="glass-panel" style={{
        background: 'var(--glass-bg)',
        backdropFilter: 'var(--glass-blur)',
        WebkitBackdropFilter: 'var(--glass-blur)',
        borderRadius: '16px',
        border: '1px solid var(--glass-border)',
        padding: '24px',
        boxShadow: 'var(--shadow-lg)',
      }}>
        <Tabs
          activeKey={activeTab}
          onChange={onTabChange}
          items={items}
          size="large"
          tabBarStyle={{ marginBottom: '24px', borderBottom: '1px solid var(--glass-border)' }}
        />
      </div>
    </div>
  );
}
