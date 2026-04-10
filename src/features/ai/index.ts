import { lazy } from "react";

import type { DomainConfig } from "@/app/registry/domainRegistry";
import { ROUTES } from "@/shared/constants/routes";

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
  key: "ai",
  label: "AI Observability",
  permissions: ["ai:read"],
  navigation: [],
  routes: [
    { path: ROUTES.aiSpanDetail as any, page: AiSpanDetailPage },
    { path: ROUTES.aiModels as any, page: AiModelCatalogPage },
    { path: ROUTES.aiModelDetail as any, page: AiModelDetailPage },
    { path: ROUTES.aiConversations as any, page: AiConversationsPage },
    { path: ROUTES.aiConversationDetail as any, page: AiConversationDetailPage },
  ],
};
