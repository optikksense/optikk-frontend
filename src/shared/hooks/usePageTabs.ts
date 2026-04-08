import { keepPreviousData, useQuery } from "@tanstack/react-query";

import type { DefaultConfigTab } from "@/types/dashboardConfig";

import { defaultConfigService } from "@shared/api/defaultConfigService";

import { useTeamId } from "@app/store/appStore";

interface UsePageTabsResult {
  tabs: DefaultConfigTab[];
  isLoading: boolean;
  error: Error | null;
}

/**
 *
 */
export function usePageTabs(pageId: string): UsePageTabsResult {
  const selectedTeamId = useTeamId();

  const { data, isLoading, error } = useQuery<DefaultConfigTab[], Error>({
    queryKey: ["default-config", "tabs", selectedTeamId, pageId],
    queryFn: () => defaultConfigService.listPageTabs(selectedTeamId, pageId),
    enabled: !!selectedTeamId && !!pageId,
    staleTime: 0,
    refetchOnMount: "always",
    placeholderData: keepPreviousData,
  });

  return {
    tabs: data ?? [],
    isLoading,
    error: error ?? null,
  };
}
