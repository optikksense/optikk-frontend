import { keepPreviousData, useQuery } from '@tanstack/react-query';

import { API_CONFIG } from '@config/apiConfig';
import type { AnomalyEvent } from '@shared/components/ui/calm/AiNarrationCard';
import api from '@shared/api/api';

import { useAppStore } from '@store/appStore';

const BASE = API_CONFIG.ENDPOINTS.V1_BASE;

/**
 *
 */
export function useAnomalyNarration() {
  const { selectedTeamId, timeRange, refreshKey } = useAppStore();

  return useQuery<AnomalyEvent | null, Error>({
    queryKey: [
      'anomaly-narration',
      selectedTeamId,
      timeRange.kind === 'relative' ? timeRange.preset : `${timeRange.startMs}-${timeRange.endMs}`,
      refreshKey,
    ],
    queryFn: async (): Promise<AnomalyEvent | null> => {
      try {
        const data = await api.get<AnomalyEvent>(`${BASE}/ai/anomaly-narration`);
        return data ?? null;
      } catch {
        // Endpoint not yet available — degrade gracefully
        return null;
      }
    },
    enabled: Boolean(selectedTeamId),
    staleTime: 60_000,
    gcTime: 120_000,
    retry: false,
    placeholderData: keepPreviousData,
  });
}
