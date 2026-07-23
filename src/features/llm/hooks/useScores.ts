import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useStandardQuery } from "@shared/hooks/useStandardQuery";

import {
  type CreateScoreRequest,
  createScore,
  getScoreDistribution,
  getScoreSummary,
  getScoreTimeseries,
} from "../api/scoresApi";
import { useLlmRange } from "./useLlmQueries";

export function useScoreSummary() {
  const { tenantId, refreshKey, startTime, endTime } = useLlmRange();
  return useStandardQuery({
    queryKey: ["llm", "scores", "summary", tenantId, startTime, endTime, refreshKey],
    queryFn: () => getScoreSummary({ startTime, endTime }),
  });
}

export function useScoreTimeseries(name: string | null) {
  const { tenantId, refreshKey, startTime, endTime } = useLlmRange();
  return useStandardQuery({
    queryKey: ["llm", "scores", "ts", tenantId, name, startTime, endTime, refreshKey],
    queryFn: () => getScoreTimeseries(name ?? "", { startTime, endTime }),
    enabled: Boolean(name),
  });
}

export function useScoreDistribution(name: string | null) {
  const { tenantId, refreshKey, startTime, endTime } = useLlmRange();
  return useStandardQuery({
    queryKey: ["llm", "scores", "dist", tenantId, name, startTime, endTime, refreshKey],
    queryFn: () => getScoreDistribution(name ?? "", { startTime, endTime }),
    enabled: Boolean(name),
  });
}

export function useCreateScore() {
  const queryClient = useQueryClient();
  return useMutation<void, Error, CreateScoreRequest>({
    mutationFn: createScore,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["llm", "scores"] });
      void queryClient.invalidateQueries({ queryKey: ["llm", "traceDetail"] });
    },
  });
}
