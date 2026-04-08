import { BarChart3 } from "lucide-react";

import type { DomainConfig } from "@/app/registry/domainRegistry";
import { ROUTES } from "@/shared/constants/routes";

export const metricsConfig: DomainConfig = {
  key: "metrics",
  label: "Metrics",
  permissions: ["metrics:read"],
  navigation: [
    {
      path: ROUTES.metrics,
      label: "Metrics",
      icon: BarChart3,
      group: "observe",
    },
  ],
  routes: [],
  dashboardPanels: [],
};
