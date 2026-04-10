import { Brain } from "lucide-react";
import { lazy } from "react";

import type { DomainConfig } from "@/app/registry/domainRegistry";
import { ROUTES } from "@/shared/constants/routes";

const AiOverviewPage = lazy(() =>
  import("./pages/AiOverviewPage").then((module) => ({ default: module.default }))
);
const AiExplorerPage = lazy(() =>
  import("./pages/AiExplorerPage").then((module) => ({ default: module.default }))
);
const AiSpanDetailPage = lazy(() =>
  import("./pages/AiSpanDetailPage").then((module) => ({ default: module.default }))
);
const AiModelCatalogPage = lazy(() =>
  import("./pages/AiModelCatalogPage").then((module) => ({ default: module.default }))
);
const AiModelDetailPage = lazy(() =>
  import("./pages/AiModelDetailPage").then((module) => ({ default: module.default }))
);
const AiConversationsPage = lazy(() =>
  import("./pages/AiConversationsPage").then((module) => ({ default: module.default }))
);
const AiConversationDetailPage = lazy(() =>
  import("./pages/AiConversationDetailPage").then((module) => ({ default: module.default }))
);

export const aiConfig: DomainConfig = {
  key: "ai-observability",
  label: "AI Observability",
  permissions: ["ai:read"],
  navigation: [
    {
      path: ROUTES.aiObservability,
      label: "LLM Monitoring",
      icon: Brain,
      group: "observe",
    },
  ],
  routes: [
    { path: ROUTES.aiObservability, page: AiOverviewPage },
    { path: ROUTES.aiExplorer, page: AiExplorerPage },
    { path: ROUTES.aiSpanDetail, page: AiSpanDetailPage },
    { path: ROUTES.aiModels, page: AiModelCatalogPage },
    { path: ROUTES.aiModelDetail, page: AiModelDetailPage },
    { path: ROUTES.aiConversations, page: AiConversationsPage },
    { path: ROUTES.aiConversationDetail, page: AiConversationDetailPage },
  ],
};
