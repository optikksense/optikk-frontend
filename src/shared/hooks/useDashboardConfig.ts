import type { DashboardTabDocument } from '@/types/dashboardConfig';

import { usePageTabs } from './usePageTabs';
import { useDashboardTabDocument } from './useDashboardTabDocument';

interface UseDashboardConfigResult {
  config: DashboardTabDocument | null;
  isLoading: boolean;
  error: Error | null;
}

/**
 *
 */
export function useDashboardConfig(pageId: string): UseDashboardConfigResult {
  const { tabs, isLoading: tabsLoading, error: tabsError } = usePageTabs(pageId);
  const defaultTabId = tabs[0]?.id ?? '';
  const {
    tab,
    isLoading: tabLoading,
    error: tabError,
  } = useDashboardTabDocument(pageId, defaultTabId);

  return {
    config: tab as DashboardTabDocument | null,
    isLoading: tabsLoading || tabLoading,
    error: tabsError ?? tabError ?? null,
  };
}
