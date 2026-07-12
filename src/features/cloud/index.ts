import { Cloud } from "lucide-react";

import type { DomainConfig } from "@/app/registry/domainRegistry";
import { ROUTES } from "@/shared/constants/routes";

export const cloudConfig: DomainConfig = {
  key: "cloud",
  label: "Cloud",
  navigation: [
    {
      path: ROUTES.cloud,
      label: "Cloud",
      icon: Cloud,
      group: "operate",
    },
  ],
};
