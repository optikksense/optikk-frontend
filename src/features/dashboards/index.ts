import { LayoutGrid } from "lucide-react";

import type { DomainConfig } from "@/app/registry/domainRegistry";
import { ROUTES } from "@/shared/constants/routes";

export const dashboardsConfig: DomainConfig = {
  key: "dashboards",
  label: "Dashboards",
  navigation: [
    {
      path: ROUTES.dashboards,
      label: "Dashboards",
      icon: LayoutGrid,
      group: "operate",
    },
  ],
};
