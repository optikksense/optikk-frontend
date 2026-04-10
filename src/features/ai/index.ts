import { Brain, Play } from "lucide-react";
import { lazy } from "react";

import type { DomainConfig } from "@/app/registry/domainRegistry";
import { ROUTES } from "@/shared/constants/routes";

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

export const aiConfig: DomainConfig = {
  key: "ai",
  label: "AI Observability",
  permissions: ["ai:read"],
  navigation: [],
  routes: [
    { path: ROUTES.aiRunDetail, page: AiRunDetailPage },
    { path: ROUTES.aiTraceDetail, page: AiTraceDetailPage },
    { path: ROUTES.aiConversations, page: AiConversationsPage },
    { path: ROUTES.aiConversationDetail, page: AiConversationDetailPage },
  ],
  dashboardPanels: [
    { panelType: "ai-line", kind: "specialized", component: AiLineRenderer },
    { panelType: "ai-bar", kind: "specialized", component: AiBarRenderer },
  ],
};
