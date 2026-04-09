import { queryOptions } from "@tanstack/react-query";

import { aiDatasetsApi } from "./aiDatasetsApi";
import { aiEvalsApi } from "./aiEvalsApi";
import { aiExperimentsApi } from "./aiExperimentsApi";
import { aiFeedbackApi } from "./aiFeedbackApi";
import { aiPromptsApi } from "./aiPromptsApi";

export const aiPlatformKeys = {
  prompts: ["ai-platform", "prompts"] as const,
  prompt: (promptId: string) => [...aiPlatformKeys.prompts, promptId] as const,
  promptVersions: (promptId: string) => [...aiPlatformKeys.prompt(promptId), "versions"] as const,
  datasets: ["ai-platform", "datasets"] as const,
  dataset: (datasetId: string) => [...aiPlatformKeys.datasets, datasetId] as const,
  datasetItems: (datasetId: string) => [...aiPlatformKeys.dataset(datasetId), "items"] as const,
  feedback: (targetType?: string, targetId?: string) =>
    ["ai-platform", "feedback", { targetType, targetId }] as const,
  evals: ["ai-platform", "evals"] as const,
  eval: (evalId: string) => [...aiPlatformKeys.evals, evalId] as const,
  evalRuns: (evalId: string) => [...aiPlatformKeys.eval(evalId), "runs"] as const,
  evalScores: (evalId: string, evalRunId: string) =>
    [...aiPlatformKeys.evalRuns(evalId), evalRunId, "scores"] as const,
  experiments: ["ai-platform", "experiments"] as const,
  experiment: (experimentId: string) => [...aiPlatformKeys.experiments, experimentId] as const,
  experimentVariants: (experimentId: string) =>
    [...aiPlatformKeys.experiment(experimentId), "variants"] as const,
  experimentRuns: (experimentId: string) =>
    [...aiPlatformKeys.experiment(experimentId), "runs"] as const,
};

export const aiPlatformQueries = {
  prompts: () =>
    queryOptions({
      queryKey: aiPlatformKeys.prompts,
      queryFn: () => aiPromptsApi.list(),
      staleTime: 15_000,
    }),
  prompt: (promptId: string) =>
    queryOptions({
      queryKey: aiPlatformKeys.prompt(promptId),
      queryFn: () => aiPromptsApi.get(promptId),
      enabled: Boolean(promptId),
      staleTime: 15_000,
    }),
  promptVersions: (promptId: string) =>
    queryOptions({
      queryKey: aiPlatformKeys.promptVersions(promptId),
      queryFn: () => aiPromptsApi.listVersions(promptId),
      enabled: Boolean(promptId),
      staleTime: 15_000,
    }),
  datasets: () =>
    queryOptions({
      queryKey: aiPlatformKeys.datasets,
      queryFn: () => aiDatasetsApi.list(),
      staleTime: 15_000,
    }),
  dataset: (datasetId: string) =>
    queryOptions({
      queryKey: aiPlatformKeys.dataset(datasetId),
      queryFn: () => aiDatasetsApi.get(datasetId),
      enabled: Boolean(datasetId),
      staleTime: 15_000,
    }),
  datasetItems: (datasetId: string) =>
    queryOptions({
      queryKey: aiPlatformKeys.datasetItems(datasetId),
      queryFn: () => aiDatasetsApi.listItems(datasetId),
      enabled: Boolean(datasetId),
      staleTime: 15_000,
    }),
  feedback: (targetType?: string, targetId?: string) =>
    queryOptions({
      queryKey: aiPlatformKeys.feedback(targetType, targetId),
      queryFn: () => aiFeedbackApi.list(targetType, targetId),
      enabled: Boolean(targetType && targetId),
      staleTime: 15_000,
    }),
  evals: () =>
    queryOptions({
      queryKey: aiPlatformKeys.evals,
      queryFn: () => aiEvalsApi.list(),
      staleTime: 15_000,
    }),
  eval: (evalId: string) =>
    queryOptions({
      queryKey: aiPlatformKeys.eval(evalId),
      queryFn: () => aiEvalsApi.get(evalId),
      enabled: Boolean(evalId),
      staleTime: 15_000,
    }),
  evalRuns: (evalId: string) =>
    queryOptions({
      queryKey: aiPlatformKeys.evalRuns(evalId),
      queryFn: () => aiEvalsApi.listRuns(evalId),
      enabled: Boolean(evalId),
      staleTime: 15_000,
      refetchInterval: 10_000,
    }),
  evalScores: (evalId: string, evalRunId: string) =>
    queryOptions({
      queryKey: aiPlatformKeys.evalScores(evalId, evalRunId),
      queryFn: () => aiEvalsApi.listScores(evalId, evalRunId),
      enabled: Boolean(evalId && evalRunId),
      staleTime: 15_000,
    }),
  experiments: () =>
    queryOptions({
      queryKey: aiPlatformKeys.experiments,
      queryFn: () => aiExperimentsApi.list(),
      staleTime: 15_000,
    }),
  experiment: (experimentId: string) =>
    queryOptions({
      queryKey: aiPlatformKeys.experiment(experimentId),
      queryFn: () => aiExperimentsApi.get(experimentId),
      enabled: Boolean(experimentId),
      staleTime: 15_000,
    }),
  experimentVariants: (experimentId: string) =>
    queryOptions({
      queryKey: aiPlatformKeys.experimentVariants(experimentId),
      queryFn: () => aiExperimentsApi.listVariants(experimentId),
      enabled: Boolean(experimentId),
      staleTime: 15_000,
    }),
  experimentRuns: (experimentId: string) =>
    queryOptions({
      queryKey: aiPlatformKeys.experimentRuns(experimentId),
      queryFn: () => aiExperimentsApi.listRuns(experimentId),
      enabled: Boolean(experimentId),
      staleTime: 15_000,
      refetchInterval: 10_000,
    }),
};
