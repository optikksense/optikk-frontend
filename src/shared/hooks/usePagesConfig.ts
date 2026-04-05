import { keepPreviousData, useQuery } from '@tanstack/react-query';

import type { DefaultConfigPage } from '@/types/dashboardConfig';

import { defaultConfigService } from '@shared/api/defaultConfigService';

import { useAppStore } from '@store/appStore';

interface UsePagesConfigResult {
  pages: DefaultConfigPage[];
  isLoading: boolean;
  error: Error | null;
}

/**
 *
 */
export function usePagesConfig(): UsePagesConfigResult {
  const { selectedTeamId } = useAppStore();

  const { data, isLoading, error } = useQuery<DefaultConfigPage[], Error>({
    queryKey: ['default-config', 'pages', selectedTeamId],
    queryFn: () => defaultConfigService.listPages(selectedTeamId),
    enabled: !!selectedTeamId,
    staleTime: 0,
    refetchOnMount: 'always',
    placeholderData: keepPreviousData,
  });

  return {
    pages: data ?? [],
    isLoading,
    error: error ?? null,
  };
}
