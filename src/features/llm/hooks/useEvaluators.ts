import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useStandardQuery } from "@shared/hooks/useStandardQuery";

import {
  type EvaluatorUpsertRequest,
  createEvaluator,
  deleteEvaluator,
  listEvaluators,
  updateEvaluator,
} from "../api/evaluatorsApi";
import { useLlmRange } from "./useLlmQueries";

export function useEvaluators() {
  const { tenantId, refreshKey, startTime, endTime } = useLlmRange();
  return useStandardQuery({
    queryKey: ["llm", "evaluators", "list", tenantId, startTime, endTime, refreshKey],
    queryFn: () => listEvaluators({ startTime, endTime }),
  });
}

export function useEvaluatorMutations() {
  const queryClient = useQueryClient();
  const invalidate = () =>
    void queryClient.invalidateQueries({ queryKey: ["llm", "evaluators", "list"] });
  const create = useMutation({
    mutationFn: (req: EvaluatorUpsertRequest) => createEvaluator(req),
    onSuccess: invalidate,
  });
  const update = useMutation({
    mutationFn: (args: { id: number; req: Partial<EvaluatorUpsertRequest> }) =>
      updateEvaluator(args.id, args.req),
    onSuccess: invalidate,
  });
  const remove = useMutation({
    mutationFn: (id: number) => deleteEvaluator(id),
    onSuccess: invalidate,
  });
  return { create, update, remove };
}
