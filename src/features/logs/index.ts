import { FileText } from "lucide-react";

import type { DomainConfig } from "@/app/registry/domainRegistry";
import { ROUTES } from "@/shared/constants/routes";

export const logsConfig: DomainConfig = {
  key: "logs",
  label: "Logs",
  navigation: [{ path: ROUTES.logs, label: "Logs", icon: FileText, group: "observe" }],
};
