import { Bell } from "lucide-react";

import type { DomainConfig } from "@/app/registry/domainRegistry";
import { ROUTES } from "@/shared/constants/routes";

export const monitorsConfig: DomainConfig = {
  key: "monitors",
  label: "Monitors",
  navigation: [
    {
      path: ROUTES.monitors,
      label: "Monitors",
      icon: Bell,
      group: "operate",
    },
  ],
};
