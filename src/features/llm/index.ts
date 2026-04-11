import { BrainCircuit } from "lucide-react";
import { lazy } from "react";

import type { DomainConfig } from "@/app/registry/domainRegistry";
import type { AppRoutePath } from "@/shared/constants/routes";
import { ROUTES } from "@/shared/constants/routes";

const LlmHubPage = lazy(() =>
  import("./pages/LlmHubPage").then((module) => ({ default: module.default }))
);

/**
 * Register longer `/llm/...` paths before any shorter prefix that could match first via
 * `resolveRegisteredExplorerRoute` (pathname.startsWith). Do not register bare `/llm` here.
 */
const LLM_ROUTES: readonly { path: AppRoutePath; page: typeof LlmHubPage }[] = [
  { path: ROUTES.llmSettings, page: LlmHubPage },
  { path: ROUTES.llmDatasets, page: LlmHubPage },
  { path: ROUTES.llmPrompts, page: LlmHubPage },
  { path: ROUTES.llmScores, page: LlmHubPage },
  { path: ROUTES.llmSessions, page: LlmHubPage },
  { path: ROUTES.llmGenerations, page: LlmHubPage },
  { path: ROUTES.llmTraces, page: LlmHubPage },
  { path: ROUTES.llmOverview, page: LlmHubPage },
];

export const llmConfig: DomainConfig = {
  key: "llm",
  label: "LLM",
  permissions: ["llm:read", "ai:read"],
  navigation: [
    {
      path: ROUTES.llmOverview,
      label: "LLM",
      icon: BrainCircuit,
      group: "observe",
    },
  ],
  routes: [...LLM_ROUTES],
  dashboardPanels: [],
};
