import { Bell } from "lucide-react";
import { lazy } from "react";

import type { DomainConfig } from "@/app/registry/domainRegistry";
import { ROUTES } from "@/shared/constants/routes";

const AlertsHubPage = lazy(() =>
  import("./pages/AlertsHubPage").then((module) => ({ default: module.default }))
);

const AlertRuleBuilderPage = lazy(() =>
  import("./pages/AlertRuleBuilderPage").then((module) => ({
    default: module.default,
  }))
);

const AlertRuleDetailPage = lazy(() =>
  import("./pages/AlertRuleDetailPage").then((module) => ({ default: module.default }))
);

export const alertsConfig: DomainConfig = {
  key: "alerts",
  label: "Alerts & Monitors",
  permissions: ["alerts:read"],
  navigation: [
    {
      path: ROUTES.alerts,
      label: "Alerts",
      icon: Bell,
      group: "operate",
    },
  ],
  routes: [
    { path: ROUTES.alerts, page: AlertsHubPage },
    { path: ROUTES.alertRuleNew, page: AlertRuleBuilderPage },
    { path: ROUTES.alertRuleDetail, page: AlertRuleDetailPage },
    { path: ROUTES.alertRuleEdit, page: AlertRuleBuilderPage },
  ],
};
