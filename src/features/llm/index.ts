import { Sparkles } from "lucide-react";
import { lazy } from "react";

import type { DomainConfig } from "@/app/registry/domainRegistry";
import { ROUTES } from "@/shared/constants/routes";

const LlmPage = lazy(() => import("./pages/LlmPage"));

export const llmConfig: DomainConfig = {
  key: "llm",
  label: "LLM",
  permissions: ["traces:read"],
  navigation: [{ path: ROUTES.llm, label: "LLM", icon: Sparkles, group: "observe" }],
  routes: [{ path: ROUTES.llm, page: LlmPage }],
  dashboardPanels: [],
};
