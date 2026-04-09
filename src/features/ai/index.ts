import { Brain, Database, FlaskConical, MessagesSquare, Play, ScrollText } from "lucide-react";
import { lazy } from "react";

import type { DomainConfig } from "@/app/registry/domainRegistry";
import { ROUTES } from "@/shared/constants/routes";

const AiRunsPage = lazy(() =>
  import("./pages/AiRunsExplorerPage").then((module) => ({ default: module.default }))
);

const AiObservabilityPage = lazy(() =>
  import("./pages/AiObservabilityPage").then((module) => ({ default: module.default }))
);

const AiRunDetailPage = lazy(() =>
  import("./pages/AiRunDetailPage").then((module) => ({ default: module.default }))
);

const AiTraceDetailPage = lazy(() =>
  import("./pages/AiTraceDetailPage").then((module) => ({ default: module.default }))
);

const AiConversationsPage = lazy(() =>
  import("./pages/AiConversationsPage").then((module) => ({ default: module.default }))
);

const AiConversationDetailPage = lazy(() =>
  import("./pages/AiConversationDetailPage").then((module) => ({ default: module.default }))
);

const AiPromptsPage = lazy(() =>
  import("./pages/AiPromptsPage").then((module) => ({ default: module.default }))
);

const AiPromptDetailPage = lazy(() =>
  import("./pages/AiPromptDetailPage").then((module) => ({ default: module.default }))
);

const AiDatasetsPage = lazy(() =>
  import("./pages/AiDatasetsPage").then((module) => ({ default: module.default }))
);

const AiDatasetDetailPage = lazy(() =>
  import("./pages/AiDatasetDetailPage").then((module) => ({ default: module.default }))
);

const AiEvalsPage = lazy(() =>
  import("./pages/AiEvalsPage").then((module) => ({ default: module.default }))
);

const AiEvalDetailPage = lazy(() =>
  import("./pages/AiEvalDetailPage").then((module) => ({ default: module.default }))
);

const AiExperimentsPage = lazy(() =>
  import("./pages/AiExperimentsPage").then((module) => ({ default: module.default }))
);

const AiExperimentDetailPage = lazy(() =>
  import("./pages/AiExperimentDetailPage").then((module) => ({ default: module.default }))
);

export const aiConfig: DomainConfig = {
  key: "ai",
  label: "AI Observability",
  permissions: ["ai:read"],
  navigation: [
    {
      path: ROUTES.aiObservability,
      label: "AI Observability",
      icon: Brain,
      group: "operate",
    },
    {
      path: ROUTES.aiRuns,
      label: "LLM Runs",
      icon: Play,
      group: "operate",
    },
    {
      path: ROUTES.aiPrompts,
      label: "Prompts",
      icon: ScrollText,
      group: "operate",
    },
    {
      path: ROUTES.aiDatasets,
      label: "Datasets",
      icon: Database,
      group: "operate",
    },
    {
      path: ROUTES.aiEvals,
      label: "Evaluations",
      icon: MessagesSquare,
      group: "operate",
    },
    {
      path: ROUTES.aiExperiments,
      label: "Experiments",
      icon: FlaskConical,
      group: "operate",
    },
  ],
  routes: [
    { path: ROUTES.aiObservability, page: AiObservabilityPage },
    { path: ROUTES.aiRuns, page: AiRunsPage },
    { path: ROUTES.aiRunDetail, page: AiRunDetailPage },
    { path: ROUTES.aiTraceDetail, page: AiTraceDetailPage },
    { path: ROUTES.aiConversations, page: AiConversationsPage },
    { path: ROUTES.aiConversationDetail, page: AiConversationDetailPage },
    { path: ROUTES.aiPrompts, page: AiPromptsPage },
    { path: ROUTES.aiPromptDetail, page: AiPromptDetailPage },
    { path: ROUTES.aiDatasets, page: AiDatasetsPage },
    { path: ROUTES.aiDatasetDetail, page: AiDatasetDetailPage },
    { path: ROUTES.aiEvals, page: AiEvalsPage },
    { path: ROUTES.aiEvalDetail, page: AiEvalDetailPage },
    { path: ROUTES.aiExperiments, page: AiExperimentsPage },
    { path: ROUTES.aiExperimentDetail, page: AiExperimentDetailPage },
  ],
};
