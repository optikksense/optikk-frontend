import { DatabaseZap } from "lucide-react";

import type { DomainConfig } from "@/app/registry/domainRegistry";
import { ROUTES } from "@/shared/constants/routes";

export const ingestionConfig: DomainConfig = {
  key: "ingestion",
  label: "Ingestion",
  navigation: [
    {
      path: ROUTES.ingestion,
      label: "Ingestion",
      icon: DatabaseZap,
      group: "operate",
    },
  ],
};
