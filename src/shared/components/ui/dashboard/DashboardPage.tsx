import { Skeleton, Tabs } from 'antd';
import { useMemo } from 'react';
import { useParams } from 'react-router-dom';

import { usePageTabs } from '@shared/hooks/usePageTabs';
import { useTabComponents } from '@shared/hooks/useTabComponents';
import { useUrlSyncedTab } from '@shared/hooks/useUrlSyncedTab';

import DashboardTabContent from './DashboardTabContent';

interface DashboardPageProps {
  pageId: string;
  /** Extra path params for endpoint interpolation, e.g. { traceId: '...' } */
  pathParams?: Record<string, string>;
}

/**
 * A fully backend-driven page component.
 * Reads tabs and components from the backend JSON config hierarchy.
 */
export default function DashboardPage({ pageId, pathParams }: DashboardPageProps) {
  const { tabs, isLoading: tabsLoading } = usePageTabs(pageId);

  const tabIds = useMemo(
    () => tabs.map((tab) => tab.id),
    [tabs],
  );

  const defaultTabId = tabIds[0] ?? '';

  const { activeTab, onTabChange } = useUrlSyncedTab({
    allowedTabs: tabIds as readonly string[],
    defaultTab: defaultTabId,
  });

  const selectedTabId = activeTab || defaultTabId;
  const { components, isLoading: componentsLoading } = useTabComponents(pageId, selectedTabId);

  if ((tabsLoading || componentsLoading) && tabs.length === 0) {
    return (
      <div className="page-section">
        <Skeleton active paragraph={{ rows: 6 }} />
      </div>
    );
  }

  if (tabs.length > 1) {
    const tabItems = tabs.map((tab) => ({
      key: tab.id,
      label: tab.label,
      children: null,
    }));

    return (
      <>
        <Tabs
          activeKey={selectedTabId}
          onChange={onTabChange}
          items={tabItems}
          size="large"
          tabBarStyle={{ marginBottom: 16 }}
        />
        <DashboardTabContent components={components} pathParams={pathParams} />
      </>
    );
  }

  return <DashboardTabContent components={components} pathParams={pathParams} />;
}

/**
 * Convenience wrapper for pages that derive pathParams from route params.
 * Usage: <DashboardPageWithRoute pageId="trace-detail" routeParam="traceId" />
 */
export function DashboardPageWithRouteParam({
  pageId,
  routeParam,
}: {
  pageId: string;
  routeParam: string;
}) {
  const params = useParams();
  const pathParams = useMemo(() => {
    const value = params[routeParam];
    return value ? { [routeParam]: value } : undefined;
  }, [params, routeParam]);

  return <DashboardPage pageId={pageId} pathParams={pathParams} />;
}
