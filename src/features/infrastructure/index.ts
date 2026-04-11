import { HardDrive } from "lucide-react";
import { lazy } from "react";

import type { DomainConfig } from "@/app/registry/domainRegistry";
import { ROUTES } from "@/shared/constants/routes";

const InfrastructureHubPage = lazy(() =>
  import("./pages/InfrastructureHubPage").then((m) => ({ default: m.default }))
);

export const infrastructureConfig: DomainConfig = {
  key: "infrastructure",
  label: "Infrastructure",
  permissions: ["infrastructure:read"],
  navigation: [
    {
      path: ROUTES.infrastructure,
      label: "Infrastructure",
      icon: HardDrive,
      group: "operate",
    },
  ],
  routes: [],
  dashboardPages: [{ pageId: "infrastructure", page: InfrastructureHubPage }],
};
