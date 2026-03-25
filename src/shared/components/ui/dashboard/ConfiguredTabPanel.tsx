import { Skeleton } from '@/components/ui';

import { useDashboardTabDocument } from '@shared/hooks/useDashboardTabDocument';

import DashboardTabContent from './DashboardTabContent';

interface ConfiguredTabPanelProps {
  pageId: string;
  tabId: string;
  pathParams?: Record<string, string>;
}

export default function ConfiguredTabPanel({
  pageId,
  tabId,
  pathParams,
}: ConfiguredTabPanelProps) {
  const { tab, isLoading } = useDashboardTabDocument(pageId, tabId);

  if (isLoading && !tab) {
    return <Skeleton active paragraph={{ rows: 6 }} />;
  }

  return tab ? <DashboardTabContent tab={tab} pathParams={pathParams} /> : null;
}
