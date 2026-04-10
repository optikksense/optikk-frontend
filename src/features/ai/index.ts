import { Brain } from "lucide-react";
import { lazy } from "react";

import type { DomainConfig } from "@/app/registry/domainRegistry";
import { ROUTES } from "@/shared/constants/routes";

<<<<<<< HEAD
const AiRunDetailPage = lazy(() =>
  import("./pages/AiRunDetailPage").then((module) => ({ default: module.default }))
=======
const AiOverviewPage = lazy(() =>
  import("./pages/AiOverviewPage").then((module) => ({ default: module.default }))
);
const AiExplorerPage = lazy(() =>
  import("./pages/AiExplorerPage").then((module) => ({ default: module.default }))
>>>>>>> 76a839da9603ecf184bc042dcce9a69f9ba0ba3d
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
<<<<<<< HEAD

const AiLineRenderer = lazy(() =>
  import("./dashboard/renderers/AiLineRenderer").then((module) => ({
    default: module.AiLineRenderer,
  }))
);

const AiBarRenderer = lazy(() =>
  import("./dashboard/renderers/AiBarRenderer").then((module) => ({
    default: module.AiBarRenderer,
  }))
);
=======
>>>>>>> 76a839da9603ecf184bc042dcce9a69f9ba0ba3d

export const aiConfig: DomainConfig = {
  key: "ai-observability",
  label: "AI Observability",
  permissions: ["ai:read"],
<<<<<<< HEAD
  navigation: [],
  routes: [
    { path: ROUTES.aiRunDetail, page: AiRunDetailPage },
    { path: ROUTES.aiTraceDetail, page: AiTraceDetailPage },
=======
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
>>>>>>> 76a839da9603ecf184bc042dcce9a69f9ba0ba3d
    { path: ROUTES.aiConversations, page: AiConversationsPage },
    { path: ROUTES.aiConversationDetail, page: AiConversationDetailPage },
  ],
};
