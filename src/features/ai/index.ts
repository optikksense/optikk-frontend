import { Brain } from "lucide-react";
import { lazy } from "react";

import type { DomainConfig } from "@/app/registry/domainRegistry";
import { ROUTES } from "@/shared/constants/routes";

const AiObservabilityPage = lazy(() => import("./pages/AiObservabilityPage"));

export const aiConfig: DomainConfig = {
  key: "ai",
  label: "AI",
  permissions: ["ai:read"],
  navigation: [{ path: ROUTES.ai, label: "AI", icon: Brain, group: "observe" }],
  routes: [{ path: ROUTES.ai, page: AiObservabilityPage }],
  dashboardPanels: [],
};
