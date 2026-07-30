import { LayoutDashboard, Server } from "lucide-react";

import type { DomainConfig } from "@/app/registry/domainRegistry";
import { ROUTES } from "@/shared/constants/routes";

export const overviewConfig: DomainConfig = {
  key: "overview",
  label: "Overview",
  navigation: [
    {
      path: ROUTES.overview,
      label: "Overview",
      icon: LayoutDashboard,
      group: "pinned",
    },
    {
      path: ROUTES.services,
      label: "Service",
      icon: Server,
      group: "apm",
    },
  ],
};
