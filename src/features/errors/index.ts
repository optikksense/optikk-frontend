import { Bug } from "lucide-react";

import type { DomainConfig } from "@/app/registry/domainRegistry";
import { ROUTES } from "@/shared/constants/routes";

export const errorsConfig: DomainConfig = {
  key: "errors",
  label: "Errors",
  navigation: [{ path: ROUTES.errors, label: "Errors", icon: Bug, group: "observe" }],
};
