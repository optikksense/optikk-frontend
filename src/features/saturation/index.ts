import { Gauge } from "lucide-react";

import type { DomainConfig } from "@/app/registry/domainRegistry";
import { ROUTES } from "@/shared/constants/routes";

export const saturationConfig: DomainConfig = {
  key: "saturation",
  label: "Saturation",
  navigation: [
    {
      path: ROUTES.saturation,
      label: "Saturation",
      icon: Gauge,
      group: "infrastructure",
    },
  ],
};
