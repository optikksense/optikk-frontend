import { Skeleton, Tabs } from 'antd';
import { Activity, Cpu, Layers, Network } from 'lucide-react';
import { useMemo } from 'react';

import ConfiguredTabPanel from '@shared/components/ui/dashboard/ConfiguredTabPanel';

import { usePageTabs } from '@shared/hooks/usePageTabs';
import { useUrlSyncedTab } from '@shared/hooks/useUrlSyncedTab';

const TAB_ICONS = {
  'resource-utilization': Cpu,
  jvm: Activity,
  kubernetes: Layers,
  nodes: Network,
} as const;

/**
 *
 */
export default function InfrastructureHubPage() {
  const { tabs, isLoading } = usePageTabs('infrastructure');

  const tabIds = useMemo(
    () => tabs.map((tab) => tab.id),
    [tabs],
  );

  const defaultTabId = tabIds[0] ?? '';

  const { activeTab, onTabChange } = useUrlSyncedTab({
    allowedTabs: tabIds as readonly string[],
    defaultTab: defaultTabId,
  });

  const items = useMemo(
    () => tabs.map((tab) => {
      const Icon = TAB_ICONS[tab.id as keyof typeof TAB_ICONS];
      return {
        key: tab.id,
        label: (
          <span>
            {Icon ? <Icon size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} /> : null}
            {tab.label}
          </span>
        ),
        children: <ConfiguredTabPanel pageId="infrastructure" tabId={tab.id} />,
      };
    }),
    [tabs],
  );

  if (isLoading && tabs.length === 0) {
    return <Skeleton active paragraph={{ rows: 6 }} />;
  }

  return <Tabs activeKey={activeTab || defaultTabId} onChange={onTabChange} items={items} size="large" />;
}
