import { Tabs, Skeleton } from '@/components/ui';
import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { AlertCircle, LayoutDashboard } from 'lucide-react';

import { usePageTabs } from '@shared/hooks/usePageTabs';
import { useDashboardTabDocument } from '@shared/hooks/useDashboardTabDocument';
import { useUrlSyncedTab } from '@shared/hooks/useUrlSyncedTab';
import { EmptyState } from '@shared/components/ui/feedback';

import DashboardTabContent from './DashboardTabContent';

interface DashboardPageProps {
  pageId: string;
  /** Extra path params for endpoint interpolation, e.g. { traceId: '...' } */
  pathParams?: Record<string, string>;
}

/**
 * A fully backend-driven page component.
 * Reads tabs and sectioned panels from the backend JSON config hierarchy.
 */
export default function DashboardPage({ pageId, pathParams }: DashboardPageProps) {
  const { tabs, isLoading: tabsLoading, error: tabsError } = usePageTabs(pageId);

  const tabIds = useMemo(() => tabs.map((tab) => tab.id), [tabs]);

  const defaultTabId = tabIds[0] ?? '';

  const { activeTab, onTabChange } = useUrlSyncedTab({
    allowedTabs: tabIds as readonly string[],
    defaultTab: defaultTabId,
  });

  const selectedTabId = tabIds.includes(activeTab) ? activeTab : defaultTabId;
  const {
    tab,
    isLoading: tabLoading,
    error: tabError,
  } = useDashboardTabDocument(pageId, selectedTabId);

  if ((tabsLoading || tabLoading) && tabs.length === 0) {
    return (
      <div className="page-section">
        <Skeleton active paragraph={{ rows: 6 }} />
      </div>
    );
  }

  if (tabsError) {
    return (
      <EmptyState
        icon={<AlertCircle size={40} className="text-[var(--color-error)]" />}
        title="Dashboard unavailable"
        description={import.meta.env.DEV ? tabsError.message : 'Failed to load dashboard tabs.'}
      />
    );
  }

  if (tabs.length === 0) {
    return (
      <EmptyState
        icon={<LayoutDashboard size={40} className="text-[var(--text-muted)]" />}
        title="No dashboard tabs available"
        description="This page has no tabs configured yet."
      />
    );
  }

  if (!selectedTabId) {
    return (
      <EmptyState
        icon={<LayoutDashboard size={40} className="text-[var(--text-muted)]" />}
        title="Dashboard tab unavailable"
        description="No valid dashboard tab could be selected."
      />
    );
  }

  if (tabError && !tab) {
    return (
      <EmptyState
        icon={<AlertCircle size={40} className="text-[var(--color-error)]" />}
        title="Dashboard tab unavailable"
        description={import.meta.env.DEV ? tabError.message : 'Failed to load dashboard tab.'}
      />
    );
  }

  if (!tab) {
    return (
      <EmptyState
        icon={<LayoutDashboard size={40} className="text-[var(--text-muted)]" />}
        title="Dashboard tab unavailable"
        description="No dashboard tab document could be loaded."
      />
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
        <div className="sticky top-0 z-10 bg-[var(--bg-primary,var(--literal-hex-0a0a0a-2))] pb-1">
          <Tabs activeKey={selectedTabId} onChange={onTabChange} items={tabItems} size="large" />
        </div>
        <DashboardTabContent tab={tab} pathParams={pathParams} />
      </>
    );
  }

  return <DashboardTabContent tab={tab} pathParams={pathParams} />;
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
