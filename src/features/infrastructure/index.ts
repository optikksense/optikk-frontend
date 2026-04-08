import { HardDrive } from "lucide-react";

import type { DomainConfig } from "@/app/registry/domainRegistry";
import { ROUTES } from "@/shared/constants/routes";

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
};
