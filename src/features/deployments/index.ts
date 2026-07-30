import { Rocket } from "lucide-react";

import type { DomainConfig } from "@/app/registry/domainRegistry";
import { ROUTES } from "@/shared/constants/routes";

export const deploymentsConfig: DomainConfig = {
  key: "deployments",
  label: "Deployments",
  navigation: [
    {
      path: ROUTES.deployments,
      label: "Deployments",
      icon: Rocket,
      group: "apm",
    },
  ],
};
