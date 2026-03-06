import { Skeleton, Tabs } from 'antd';
import { useMemo } from 'react';
import { useParams } from 'react-router-dom';

import { useDashboardConfig } from '@hooks/useDashboardConfig';
import { useUrlSyncedTab } from '@hooks/useUrlSyncedTab';

import DashboardTabContent from './DashboardTabContent';

interface DashboardPageProps {
  pageId: string;
  /** Extra path params for endpoint interpolation, e.g. { traceId: '...' } */
  pathParams?: Record<string, string>;
}

/**
 * A fully backend-driven page component.
 * Reads tabs, dataSources, statCards, and charts from the backend YAML config
 * and renders them without any hardcoded structure.
 */
export default function DashboardPage({ pageId, pathParams }: DashboardPageProps) {
  const { config, isLoading } = useDashboardConfig(pageId);

  const tabIds = useMemo(
    () => config?.tabs?.map((t) => t.id) ?? [],
    [config?.tabs],
  );

  const defaultTabId = tabIds[0] ?? '';

  const { activeTab, onTabChange } = useUrlSyncedTab({
    allowedTabs: tabIds as readonly string[],
    defaultTab: defaultTabId,
  });

  if (isLoading && !config) {
    return (
      <div style={{ padding: 24 }}>
        <Skeleton active paragraph={{ rows: 6 }} />
      </div>
    );
  }

  if (!config) return null;

  const hasTabs = config.tabs && config.tabs.length > 0;

  if (hasTabs) {
    const tabItems = config.tabs!.map((tab) => ({
      key: tab.id,
      label: tab.label,
      children: (
        <DashboardTabContent
          tab={tab}
          pathParams={pathParams}
        />
      ),
    }));

    return (
      <Tabs
        activeKey={activeTab || defaultTabId}
        onChange={onTabChange}
        items={tabItems}
        size="large"
        tabBarStyle={{ marginBottom: 16 }}
      />
    );
  }

  // Flat page (no tabs) — treat the top-level config as a single tab-like object
  const flatTab = {
    dataSources: config.dataSources ?? [],
    statCards: config.statCards,
    charts: config.components,
  };

  return <DashboardTabContent tab={flatTab} pathParams={pathParams} />;
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
