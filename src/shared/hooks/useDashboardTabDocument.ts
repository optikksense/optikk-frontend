import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

import type { DashboardTabDocument } from '@/types/dashboardConfig';

import { defaultConfigService } from '@shared/api/defaultConfigService';

import { useAppStore } from '@store/appStore';

interface UseDashboardTabDocumentResult {
  tab: DashboardTabDocument | null;
  isLoading: boolean;
  error: Error | null;
}

export function useDashboardTabDocument(
  pageId: string,
  tabId: string
): UseDashboardTabDocumentResult {
  const { selectedTeamId } = useAppStore();

  const { data, isLoading, error } = useQuery({
    queryKey: ['default-config', 'tab-document', selectedTeamId, pageId, tabId],
    queryFn: () => defaultConfigService.getDashboardTabDocument(selectedTeamId, pageId, tabId),
    enabled: !!selectedTeamId && !!pageId && !!tabId,
    staleTime: 0,
    refetchOnMount: 'always',
    placeholderData: keepPreviousData,
  });

  const tab = useMemo<DashboardTabDocument | null>(() => {
    if (!data) {
      return null;
    }

    return {
      ...data,
      panels: (data.panels ?? []).map((panel) => ({
        ...panel,
        dataSource: panel.dataSource || panel.id,
      })),
      sections: data.sections ?? [],
    };
  }, [data]);

  return {
    tab,
    isLoading,
    error: error ?? null,
  };
}
